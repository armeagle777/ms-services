import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

import { WisdmInfosDocumentedSchemaOperation } from 'src/Core/Wisdm/Enums/wisdm.enums';
import { WisdmIntegration } from './Wisdm.integration';

const SLTD_ENDPOINT = 'http://102.28.110.3:9248/v2/wisdm/sltd/1.0/sltd.asmx';
const INFOS_ENDPOINT = 'http://102.28.110.3:9248/v2/wisdm/sltd/1.0/infos.asmx';

const responseXml = `
<soap:Envelope>
   <soap:Body>
      <resultCode>NO_ERROR</resultCode>
      <xmlData>
         <statistics xmlns="urn:application:ws:sltd:statistics">
            <indicator type="TOTAL_FOR_PAS" date="2026-08-14T00:00:00" value="12" />
         </statistics>
      </xmlData>
   </soap:Body>
</soap:Envelope>`;

const statisticsSchemaResponseXml = `
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
      <GetSLTDStatisticsSchemaResponse xmlns="http://tempuri.org/">
         <GetSLTDStatisticsSchemaResult>
            <resultCode>NO_ERROR</resultCode>
            <resultOtherCode>0</resultOtherCode>
            <requestId>request-1</requestId>
            <xmlData>
               <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                          targetNamespace="urn:application:ws:sltd:statistics">
                  <xs:element name="statistics">
                     <xs:complexType>
                        <xs:sequence>
                           <xs:element name="indicator" maxOccurs="unbounded" />
                        </xs:sequence>
                     </xs:complexType>
                  </xs:element>
               </xs:schema>
            </xmlData>
         </GetSLTDStatisticsSchemaResult>
      </GetSLTDStatisticsSchemaResponse>
   </soap:Body>
</soap:Envelope>`;

const createIntegration = (
   overrides: Record<string, string> = {},
   upstreamResponseXml = responseXml,
) => {
   const config: Record<string, string> = {
      INTERPOL_WISDM_SLTD_ENDPOINT: SLTD_ENDPOINT,
      INTERPOL_WISDM_INFOS_ENDPOINT: INFOS_ENDPOINT,
      INTERPOL_WISDM_USERNAME: 'username',
      INTERPOL_WISDM_PASSWORD: 'password',
      ...overrides,
   };
   const post = jest.fn().mockReturnValue(of({ status: 200, data: upstreamResponseXml }));
   const httpService = { post };
   const configService = { get: jest.fn((key: string) => config[key]) };
   const integration = new WisdmIntegration(
      httpService as never,
      configService as unknown as ConfigService,
   );

   return { integration, post };
};

describe('WisdmIntegration SOAP routing', () => {
   it('sends the no-argument GetStatistics request using the exact SLTD WSDL action', async () => {
      const { integration, post } = createIntegration();

      await integration.getDocumentCount('PAS');

      expect(post).toHaveBeenCalledWith(
         SLTD_ENDPOINT,
         expect.stringContaining('<tns:GetStatistics>'),
         expect.objectContaining({
            headers: expect.objectContaining({
               SOAPAction: '"urn:interpol:ws:wisdm:sltd/GetStatistics"',
            }),
         }),
      );
      expect(post.mock.calls[0][1]).not.toContain('<tns:TypeOfDocument>');
   });

   it('uses CreateOrUpdateSLTDRecord and places one application record inside XMLDatas', async () => {
      const { integration, post } = createIntegration();

      await integration.createRecord({
         din: 'ARMTEST202600001',
         typeOfDocument: 'P',
         fraudType: 'LOST',
      });

      const requestXml = post.mock.calls[0][1] as string;
      expect(requestXml).toContain('<tns:CreateOrUpdateSLTDRecord>');
      expect(requestXml).toContain('<tns:XMLDatas>');
      expect(requestXml).toContain('<record:record xmlns:record="urn:application:ws:sltd:record">');
      expect(requestXml).toContain('<record:DIN>ARMTEST202600001</record:DIN>');
      expect(post.mock.calls[0][2]).toEqual(
         expect.objectContaining({
            headers: expect.objectContaining({
               SOAPAction: '"urn:interpol:ws:wisdm:sltd/CreateOrUpdateSLTDRecord"',
            }),
         }),
      );
   });

   it('uses the exact Infos WSDL action for schema discovery', async () => {
      const { integration, post } = createIntegration({}, statisticsSchemaResponseXml);

      const response = await integration.getDocumentedSchema(
         WisdmInfosDocumentedSchemaOperation.STATISTICS,
         true,
      );

      expect(post).toHaveBeenCalledWith(
         INFOS_ENDPOINT,
         expect.stringContaining('<tns:GetSLTDStatisticsSchema>'),
         expect.objectContaining({
            headers: expect.objectContaining({
               SOAPAction: '"http://tempuri.org/GetSLTDStatisticsSchema"',
            }),
         }),
      );
      expect(response.payload).toEqual({
         schema: {
            element: {
               complexType: {
                  sequence: {
                     element: {
                        '@_name': 'indicator',
                        '@_maxOccurs': 'unbounded',
                     },
                  },
               },
               '@_name': 'statistics',
            },
            '@_targetNamespace': 'urn:application:ws:sltd:statistics',
         },
      });
      expect(response).not.toHaveProperty('xmlData');
   });

   it('rejects infos.asmx when configured as the SLTD business endpoint', async () => {
      const { integration, post } = createIntegration({
         INTERPOL_WISDM_SLTD_ENDPOINT: INFOS_ENDPOINT,
      });

      await expect(integration.getDocumentCount('PAS')).rejects.toThrow(
         new InternalServerErrorException(
            'INTERPOL_WISDM_SLTD_ENDPOINT must point to the SLTD business service, not infos.asmx',
         ),
      );
      expect(post).not.toHaveBeenCalled();
   });
});
