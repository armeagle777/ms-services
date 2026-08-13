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
      <resultCode>0</resultCode>
      <Total>12</Total>
   </soap:Body>
</soap:Envelope>`;

const createIntegration = (overrides: Record<string, string> = {}) => {
   const config: Record<string, string> = {
      INTERPOL_WISDM_SLTD_ENDPOINT: SLTD_ENDPOINT,
      INTERPOL_WISDM_INFOS_ENDPOINT: INFOS_ENDPOINT,
      INTERPOL_WISDM_SLTD_NAMESPACE: 'http://tempuri.org///',
      INTERPOL_WISDM_USERNAME: 'username',
      INTERPOL_WISDM_PASSWORD: 'password',
      ...overrides,
   };
   const post = jest.fn().mockReturnValue(of({ status: 200, data: responseXml }));
   const httpService = { post };
   const configService = { get: jest.fn((key: string) => config[key]) };
   const integration = new WisdmIntegration(
      httpService as never,
      configService as unknown as ConfigService,
   );

   return { integration, post };
};

describe('WisdmIntegration SOAP routing', () => {
   it('sends Statistics to sltd.asmx with one SOAPAction separator', async () => {
      const { integration, post } = createIntegration();

      await integration.getDocumentCount('PAS');

      expect(post).toHaveBeenCalledWith(
         SLTD_ENDPOINT,
         expect.stringContaining('<tns:Statistics>'),
         expect.objectContaining({
            headers: expect.objectContaining({
               SOAPAction: '"http://tempuri.org/Statistics"',
            }),
         }),
      );
   });

   it('uses the exact Infos WSDL action for schema discovery', async () => {
      const { integration, post } = createIntegration();

      await integration.getDocumentedSchema(WisdmInfosDocumentedSchemaOperation.STATISTICS, true);

      expect(post).toHaveBeenCalledWith(
         INFOS_ENDPOINT,
         expect.stringContaining('<tns:GetSLTDStatisticsSchema>'),
         expect.objectContaining({
            headers: expect.objectContaining({
               SOAPAction: '"http://tempuri.org/GetSLTDStatisticsSchema"',
            }),
         }),
      );
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
