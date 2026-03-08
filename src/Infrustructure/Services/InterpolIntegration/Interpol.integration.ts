import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type {
   BasicFields,
   DetailFields,
   DetailRef,
   DetailsPayload,
   InterpolDetailsResponse,
   InterpolFile,
   InterpolFileResponse,
   InterpolSearchResponse,
   InterpolSltdDetailsResponse,
   InterpolSltdSearchResponse,
   KnownResultCodeKey,
   ResultCodeKey,
   ResultCodeMeta,
   SearchHit,
   SoapCallResult,
} from './interpol.types';

const SOAP_NS = 'http://schemas.xmlsoap.org/soap/envelope/';
const XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance';
const XSD_NS = 'http://www.w3.org/2001/XMLSchema';
const TNS_NS = 'urn:interpol:ws:find:nominal';
const SLTD_TNS_NS = 'urn:interpol:ws:wsp:sltd';

@Injectable()
export class InterpolIntegration {
   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
   ) {}

   async search({
      name,
      forename,
      dobDdMmYyyy,
      nbRecord,
   }: {
      name: string;
      forename: string;
      dobDdMmYyyy?: string;
      nbRecord: number;
   }): Promise<InterpolSearchResponse> {
      const parts = [];
      if (name) parts.push(`<tns:Name>${this.xmlEscape(name)}</tns:Name>`);
      if (forename) parts.push(`<tns:Forename>${this.xmlEscape(forename)}</tns:Forename>`);
      if (dobDdMmYyyy)
         parts.push(`<tns:DateOfBirth>${this.xmlEscape(dobDdMmYyyy)}</tns:DateOfBirth>`);
      parts.push(`<tns:NbRecord>${Number(nbRecord)}</tns:NbRecord>`);

      const body = `        <tns:Search>
            ${parts.join('')}
        </tns:Search>`;

      const { status, xml, requestXml } = await this.soapCall('Search', body, true, 60000);
      const fault = this.extractSoapFault(xml);
      const basicFields = this.parseBasicFields(xml);
      const resultCodeMeta = this.evaluateResultCode(basicFields.resultCode);

      if (status >= 400 || fault) {
         return {
            ok: false,
            httpStatus: status,
            fault,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            hits: [],
         };
      }

      if (resultCodeMeta.key === 'NO_ANSWER') {
         return {
            ok: true,
            httpStatus: status,
            fault: null,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            hits: [],
         };
      }

      if (resultCodeMeta.key !== 'NO_ERROR') {
         return {
            ok: false,
            httpStatus: status,
            fault: null,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            hits: [],
         };
      }

      return {
         ok: true,
         httpStatus: status,
         fault: null,
         ...basicFields,
         resultCodeMeta,
         raw: xml,
         request: requestXml,
         hits: this.parseSearchHits(xml),
      };
   }

   async sltdSearch({
      din,
      countryOfRegistration,
      typeOfDocument,
      nbRecord,
   }: {
      din: string;
      countryOfRegistration: string;
      typeOfDocument: string;
      nbRecord: number;
   }): Promise<InterpolSltdSearchResponse> {
      const body = `        <tns:Search>
            <tns:DIN>${this.xmlEscape(din)}</tns:DIN>
            <tns:CountryOfRegistration>${this.xmlEscape(countryOfRegistration)}</tns:CountryOfRegistration>
            <tns:TypeOfDocument>${this.xmlEscape(typeOfDocument)}</tns:TypeOfDocument>
            <tns:NbRecord>${Number(nbRecord)}</tns:NbRecord>
        </tns:Search>`;

      const { status, xml, requestXml } = await this.soapCallSltd('Search', body, true, 60000);
      const fault = this.extractSoapFault(xml);
      const basicFields = this.parseBasicFields(xml);
      const resultCodeMeta = this.evaluateResultCode(basicFields.resultCode);

      if (status >= 400 || fault) {
         return {
            ok: false,
            httpStatus: status,
            fault,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            xmlData: this.extractXmlDataInner(xml),
         };
      }

      if (resultCodeMeta.key === 'NO_ANSWER') {
         return {
            ok: true,
            httpStatus: status,
            fault: null,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            xmlData: '',
         };
      }

      if (resultCodeMeta.key !== 'NO_ERROR') {
         return {
            ok: false,
            httpStatus: status,
            fault: null,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            xmlData: this.extractXmlDataInner(xml),
         };
      }

      return {
         ok: true,
         httpStatus: status,
         fault: null,
         ...basicFields,
         resultCodeMeta,
         raw: xml,
         request: requestXml,
         xmlData: this.extractXmlDataInner(xml),
      };
   }

   async sltdDetails(id: string): Promise<InterpolSltdDetailsResponse> {
      const body = `        <tns:Details>
            <tns:Id>${this.xmlEscape(id)}</tns:Id>
        </tns:Details>`;

      const { status, xml, requestXml } = await this.soapCallSltd('Details', body, true, 60000);
      const fault = this.extractSoapFault(xml);
      const basicFields = this.parseBasicFields(xml);
      const resultCodeMeta = this.evaluateResultCode(basicFields.resultCode);

      if (status >= 400 || fault) {
         return {
            ok: false,
            httpStatus: status,
            fault,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            xmlData: this.extractXmlDataInner(xml),
         };
      }

      if (resultCodeMeta.key === 'NO_ANSWER') {
         return {
            ok: true,
            httpStatus: status,
            fault: null,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            xmlData: '',
         };
      }

      if (resultCodeMeta.key !== 'NO_ERROR') {
         return {
            ok: false,
            httpStatus: status,
            fault: null,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            xmlData: this.extractXmlDataInner(xml),
         };
      }

      return {
         ok: true,
         httpStatus: status,
         fault: null,
         ...basicFields,
         resultCodeMeta,
         raw: xml,
         request: requestXml,
         xmlData: this.extractXmlDataInner(xml),
      };
   }

   async details(nominalSearchItemId: string): Promise<InterpolDetailsResponse> {
      const body = `        <tns:Details>
            <tns:NominalSearchItemId>${this.xmlEscape(nominalSearchItemId)}</tns:NominalSearchItemId>
        </tns:Details>`;

      const { status, xml, requestXml } = await this.soapCall('Details', body, true, 60000);
      const fault = this.extractSoapFault(xml);
      const basicFields = this.parseBasicFields(xml);
      const resultCodeMeta = this.evaluateResultCode(basicFields.resultCode);

      if (status >= 400 || fault) {
         return {
            ok: false,
            httpStatus: status,
            fault,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            details: null,
         };
      }

      if (resultCodeMeta.key !== 'NO_ERROR') {
         return {
            ok: false,
            httpStatus: status,
            fault: null,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            details: null,
         };
      }

      return {
         ok: true,
         httpStatus: status,
         fault: null,
         ...basicFields,
         resultCodeMeta,
         raw: xml,
         request: requestXml,
         details: this.parseDetails(xml),
      };
   }

   async getNoticePdfFile(pathToNotice: string): Promise<InterpolFileResponse> {
      const body = `        <tns:GetNoticePDFFile>
            <tns:PathToNotice>${this.xmlEscape(pathToNotice)}</tns:PathToNotice>
        </tns:GetNoticePDFFile>`;

      const { status, xml, requestXml } = await this.soapCall(
         'GetNoticePDFFile',
         body,
         false,
         120000,
      );
      return this.mapFileResponse(status, xml, requestXml);
   }

   async imageFile(nominalItemId: string, imagePath: string): Promise<InterpolFileResponse> {
      const body = `        <tns:ImageFile>
            <tns:NominalItemId>${this.xmlEscape(nominalItemId)}</tns:NominalItemId>
            <tns:ImagePath>${this.xmlEscape(imagePath)}</tns:ImagePath>
        </tns:ImageFile>`;

      const { status, xml, requestXml } = await this.soapCall('ImageFile', body, false, 120000);
      return this.mapFileResponse(status, xml, requestXml);
   }

   private mapFileResponse(status: number, xml: string, requestXml: string): InterpolFileResponse {
      const fault = this.extractSoapFault(xml);
      const basicFields = this.parseBasicFields(xml);
      const resultCodeMeta = this.evaluateResultCode(basicFields.resultCode);

      if (status >= 400 || fault || resultCodeMeta.key !== 'NO_ERROR') {
         return {
            ok: false,
            httpStatus: status,
            fault,
            ...basicFields,
            resultCodeMeta,
            raw: xml,
            request: requestXml,
            files: [],
         };
      }

      return {
         ok: true,
         httpStatus: status,
         fault: null,
         ...basicFields,
         resultCodeMeta,
         raw: xml,
         request: requestXml,
         files: this.extractBinFilesFromAnswer(xml),
      };
   }

   private evaluateResultCode(resultCode: string | null): ResultCodeMeta {
      const normalized = (resultCode || '').trim().toUpperCase();

      const byString: Record<KnownResultCodeKey, number> = {
         NO_ERROR: 0,
         NO_ANSWER: 1,
         INVALID_SEARCH_ERROR: 2,
         UNEXPECTED_ERROR: 3,
         TOO_MANY_ANSWER: 4,
         ACCESS_DENIED: 5,
         OTHER_ERROR_CODE: 6,
         TIME_OUT: 7,
      };

      const byNumber: Record<number, KnownResultCodeKey> = {
         0: 'NO_ERROR',
         1: 'NO_ANSWER',
         2: 'INVALID_SEARCH_ERROR',
         3: 'UNEXPECTED_ERROR',
         4: 'TOO_MANY_ANSWER',
         5: 'ACCESS_DENIED',
         6: 'OTHER_ERROR_CODE',
         7: 'TIME_OUT',
      };

      const numericCandidate = Number(normalized);
      const keyFromNumber =
         normalized !== '' && Number.isFinite(numericCandidate)
            ? byNumber[numericCandidate]
            : undefined;
      const keyFromString = normalized as KnownResultCodeKey;
      const key: ResultCodeKey =
         keyFromNumber ||
         (Object.prototype.hasOwnProperty.call(byString, keyFromString)
            ? keyFromString
            : 'UNKNOWN');

      const numericValue = key === 'UNKNOWN' ? null : byString[key];

      switch (key) {
         case 'NO_ERROR':
            return {
               key,
               numericValue,
               description: 'No error, request succeeded and result is not empty.',
               retryable: false,
               requiresQueryRefinement: false,
               accessDenied: false,
               isKnown: true,
            };
         case 'NO_ANSWER':
            return {
               key,
               numericValue,
               description: 'No error, request succeeded and result is empty.',
               retryable: false,
               requiresQueryRefinement: false,
               accessDenied: false,
               isKnown: true,
            };
         case 'INVALID_SEARCH_ERROR':
            return {
               key,
               numericValue,
               description:
                  'Invalid search parameters were provided. Use requestId and timestamp for IPSG traceability.',
               retryable: false,
               requiresQueryRefinement: true,
               accessDenied: false,
               isKnown: true,
            };
         case 'UNEXPECTED_ERROR':
            return {
               key,
               numericValue,
               description:
                  'Unexpected server-side error. Use requestId and timestamp to investigate with IPSG.',
               retryable: true,
               requiresQueryRefinement: false,
               accessDenied: false,
               isKnown: true,
            };
         case 'TOO_MANY_ANSWER':
            return {
               key,
               numericValue,
               description: 'Too many answers. Narrow search parameters to reduce result size.',
               retryable: false,
               requiresQueryRefinement: true,
               accessDenied: false,
               isKnown: true,
            };
         case 'ACCESS_DENIED':
            return {
               key,
               numericValue,
               description:
                  'Access denied for this web service or data. Verify credentials and permissions.',
               retryable: false,
               requiresQueryRefinement: false,
               accessDenied: true,
               isKnown: true,
            };
         case 'OTHER_ERROR_CODE':
            return {
               key,
               numericValue,
               description:
                  'Source database returned an error. Inspect resultOtherCode for additional details.',
               retryable: false,
               requiresQueryRefinement: false,
               accessDenied: false,
               isKnown: true,
            };
         case 'TIME_OUT':
            return {
               key,
               numericValue,
               description: 'Execution timed out while processing the request.',
               retryable: true,
               requiresQueryRefinement: false,
               accessDenied: false,
               isKnown: true,
            };
         default:
            return {
               key: 'UNKNOWN',
               numericValue: null,
               description: 'Unknown resultCode returned by upstream service.',
               retryable: false,
               requiresQueryRefinement: false,
               accessDenied: false,
               isKnown: false,
            };
      }
   }

   private async soapCall(
      action: string,
      bodyXml: string,
      includeAdminToken: boolean,
      timeoutMs: number,
   ): Promise<SoapCallResult> {
      const endpoint = this.configService.get<string>('INTERPOL_NOMINALS_ENDPOINT');
      if (!endpoint?.trim()) {
         throw new InternalServerErrorException(
            'INTERPOL_NOMINALS_ENDPOINT is missing in environment variables',
         );
      }

      const envelope = this.buildEnvelope(bodyXml, includeAdminToken);
      const headers = {
         'Content-Type': 'text/xml; charset=utf-8',
         Accept: 'text/xml',
         SOAPAction: `"${TNS_NS}/${action}"`,
      };

      try {
         const response = await firstValueFrom(
            this.httpService.post(endpoint.trim(), envelope, {
               headers,
               timeout: timeoutMs,
               validateStatus: () => true,
            }),
         );

         const xml =
            typeof response.data === 'string' ? response.data : JSON.stringify(response.data || {});

         return { status: response.status, xml, requestXml: envelope };
      } catch (err) {
         const message = err instanceof Error ? err.message : String(err);
         return {
            status: 599,
            xml: `<faultstring>${this.xmlEscape(message)}</faultstring>`,
            requestXml: envelope,
         };
      }
   }

   private async soapCallSltd(
      action: string,
      bodyXml: string,
      includeAdminToken: boolean,
      timeoutMs: number,
   ): Promise<SoapCallResult> {
      const endpoint = this.configService.get<string>('INTERPOL_SLTD_ENDPOINT');

      if (!endpoint?.trim()) {
         throw new InternalServerErrorException(
            'INTERPOL_SLTD_ENDPOINT is missing in environment variables',
         );
      }

      const envelope = this.buildSltdEnvelope(bodyXml, includeAdminToken);
      const headers = {
         'Content-Type': 'text/xml; charset=utf-8',
         Accept: 'text/xml; charset=utf-8',
         SOAPAction: `"${SLTD_TNS_NS}/${action}"`,
      };

      try {
         const response = await firstValueFrom(
            this.httpService.post(endpoint.trim(), envelope, {
               headers,
               timeout: timeoutMs,
               validateStatus: () => true,
            }),
         );

         const xml =
            typeof response.data === 'string' ? response.data : JSON.stringify(response.data || {});

         return { status: response.status, xml, requestXml: envelope };
      } catch (err) {
         const message = err instanceof Error ? err.message : String(err);
         return {
            status: 599,
            xml: `<faultstring>${this.xmlEscape(message)}</faultstring>`,
            requestXml: envelope,
         };
      }
   }

   private buildEnvelope(bodyXml: string, includeAdminToken: boolean) {
      const wsUserInfoUsername = (
         this.configService.get<string>('INTERPOL_WS_USERINFO_USERNAME') || ''
      ).trim();
      const referenceInCountry = (
         this.configService.get<string>('INTERPOL_REFERENCE_IN_COUNTRY') || 'ARM-TEST-001'
      ).trim();
      const wsUsernameVersion = (
         this.configService.get<string>('INTERPOL_WS_USERNAME_VERSION') || '1.0'
      ).trim();
      const findUsername = (
         this.configService.get<string>('INTERPOL_NOMINAL_USERNAME') || ''
      ).trim();
      const findPassword = (
         this.configService.get<string>('INTERPOL_NOMINAL_PASSWORD') || ''
      ).trim();
      const enquiriesReference = (
         this.configService.get<string>('INTERPOL_ENQUIRIES_REFERENCE') || ''
      ).trim();

      const adminBlock = includeAdminToken
         ? `\n        <tns:AdministrativeToken>\n            <tns:EnquiriesReference>${this.xmlEscape(enquiriesReference)}</tns:EnquiriesReference>\n        </tns:AdministrativeToken>`
         : '';

      return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="${SOAP_NS}"
               xmlns:xsi="${XSI_NS}"
               xmlns:xsd="${XSD_NS}"
               xmlns:tns="${TNS_NS}">
    <soap:Header>
        <tns:UserInformation>
            <tns:Username>${this.xmlEscape(wsUserInfoUsername)}</tns:Username>
            <tns:ReferenceInCountry>${this.xmlEscape(referenceInCountry)}</tns:ReferenceInCountry>
        </tns:UserInformation>

        <tns:UsernameToken Version="${this.xmlEscape(wsUsernameVersion)}">
            <tns:Username>${this.xmlEscape(findUsername)}</tns:Username>
            <tns:Password>${this.xmlEscape(findPassword)}</tns:Password>
        </tns:UsernameToken>${adminBlock}
    </soap:Header>

    <soap:Body>
${bodyXml}
    </soap:Body>
</soap:Envelope>
`;
   }

   private buildSltdEnvelope(bodyXml: string, includeAdminToken: boolean) {
      const wsUserInfoUsername = (
         this.configService.get<string>('INTERPOL_SLTD_WS_USERINFO_USERNAME') ||
         this.configService.get<string>('INTERPOL_SLTD_USERNAME') ||
         ''
      ).trim();
      const referenceInCountry = (
         this.configService.get<string>('INTERPOL_SLTD_REFERENCE_IN_COUNTRY') || 'YEREVAN'
      ).trim();
      const wsUsernameVersion = (
         this.configService.get<string>('INTERPOL_SLTD_WS_USERNAME_VERSION') || '1.0'
      ).trim();
      const username = (this.configService.get<string>('INTERPOL_SLTD_USERNAME') || '').trim();
      const password = (this.configService.get<string>('INTERPOL_SLTD_PASSWORD') || '').trim();
      const enquiriesReference = (
         this.configService.get<string>('INTERPOL_SLTD_ENQUIRIES_REFERENCE') || 'POSTMAN-001'
      ).trim();

      if (!wsUserInfoUsername || !username || !password) {
         throw new InternalServerErrorException(
            'INTERPOL_SLTD_WS_USERINFO_USERNAME, INTERPOL_SLTD_USERNAME and INTERPOL_SLTD_PASSWORD are required for SLTD requests',
         );
      }

      const adminBlock = includeAdminToken
         ? `\n        <tns:AdministrativeToken>\n            <tns:EnquiriesReference>${this.xmlEscape(enquiriesReference)}</tns:EnquiriesReference>\n        </tns:AdministrativeToken>`
         : '';

      return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="${SOAP_NS}"
               xmlns:xsi="${XSI_NS}"
               xmlns:xsd="${XSD_NS}"
               xmlns:tns="${SLTD_TNS_NS}">
    <soap:Header>${adminBlock}
        <tns:UserInformation>
            <tns:Username>${this.xmlEscape(wsUserInfoUsername)}</tns:Username>
            <tns:ReferenceInCountry>${this.xmlEscape(referenceInCountry)}</tns:ReferenceInCountry>
        </tns:UserInformation>

        <tns:UsernameToken Version="${this.xmlEscape(wsUsernameVersion)}">
            <tns:Username>${this.xmlEscape(username)}</tns:Username>
            <tns:Password>${this.xmlEscape(password)}</tns:Password>
        </tns:UsernameToken>
    </soap:Header>

    <soap:Body>
${bodyXml}
    </soap:Body>
</soap:Envelope>
`;
   }

   private xmlEscape(value: unknown) {
      if (value === null || value === undefined) return '';
      return String(value)
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&apos;');
   }

   private extractSoapFault(xml: string) {
      const match = xml.match(/<faultstring>([\s\S]*?)<\/faultstring>/i);
      return match ? match[1].trim() : null;
   }

   private parseBasicFields(responseXml: string): BasicFields {
      return {
         resultCode: this.firstTagValue(responseXml, 'resultCode'),
         resultOtherCode: this.firstTagValue(responseXml, 'resultOtherCode'),
         requestId: this.firstTagValue(responseXml, 'requestId'),
      };
   }

   private firstTagValue(xml: string, tagName: string) {
      const pattern = new RegExp(`<${tagName}>([^<]+)<\\/${tagName}>`, 'i');
      const match = xml.match(pattern);
      return match ? match[1].trim() : null;
   }

   private extractXmlDataInner(responseXml: string) {
      const match = responseXml.match(/<xmlData>([\s\S]*?)<\/xmlData>/i);
      return match ? match[1].trim() : '';
   }

   private parseSearchHits(responseXml: string): SearchHit[] {
      const xmlData = this.extractXmlDataInner(responseXml);
      if (!xmlData) return [];

      const nominalRegex = /<i:nominal\b[^>]*\bitem_id="([^"]+)"[^>]*>([\s\S]*?)<\/i:nominal>/g;
      const hits: SearchHit[] = [];
      let match: RegExpExecArray | null;

      while ((match = nominalRegex.exec(xmlData)) !== null) {
         const itemId = match[1].trim();
         const block = match[2];

         const grab = (tag: string) => {
            const valueMatch = block.match(new RegExp(`<i:${tag}>([^<]*)<\\/i:${tag}>`));
            return valueMatch ? valueMatch[1].trim() : '';
         };

         const cautionMatch = block.match(/<i:caution_id>([^<]+)<\/i:caution_id>/);
         const scoreMatch = block.match(/<i:query_score>[\s\S]*?<i:value>([^<]+)<\/i:value>/);

         hits.push({
            item_id: itemId,
            name: grab('name'),
            forename: grab('forename'),
            dob: grab('date_of_birth'),
            caution: cautionMatch ? cautionMatch[1].trim() : '',
            score: scoreMatch ? scoreMatch[1].trim() : '',
            owner_office_id: grab('owner_office_id'),
         });
      }

      return hits;
   }

   private parseDetails(responseXml: string): DetailsPayload {
      const xmlData = this.extractXmlDataInner(responseXml);
      if (!xmlData) return { fields: {}, refs: [] };

      const nominalMatch = xmlData.match(
         /<i:nominal\b[^>]*\bitem_id="([^"]+)"[^>]*>([\s\S]*?)<\/i:nominal>/,
      );
      if (!nominalMatch) return { fields: {}, refs: [] };

      const itemIdShort = nominalMatch[1].trim();
      const block = nominalMatch[2];

      const grab = (tag: string) => {
         const valueMatch = block.match(new RegExp(`<i:${tag}>([^<]*)<\\/i:${tag}>`));
         return valueMatch ? valueMatch[1].trim() : '';
      };

      const cautionMatch = block.match(/<i:caution_id>([^<]+)<\/i:caution_id>/);

      const fields: DetailFields = {
         item_id_short: itemIdShort,
         name: grab('name'),
         forename: grab('forename'),
         dob: grab('date_of_birth'),
         sex_id: grab('sex_id'),
         owner_office_id: grab('owner_office_id'),
         db_last_updated_on: grab('db_last_updated_on'),
         caution_id: cautionMatch ? cautionMatch[1].trim() : '',
      };

      const refs: DetailRef[] = [];
      const fileRegex = /<i:file\b[\s\S]*?<\/i:file>/g;
      let fileMatch: RegExpExecArray | null;

      while ((fileMatch = fileRegex.exec(block)) !== null) {
         const fileBlock = fileMatch[0];
         const type = fileBlock.match(/<i:type_id>([^<]+)<\/i:type_id>/);
         const ref = fileBlock.match(/<i:ref>([^<]+)<\/i:ref>/);
         const lang = fileBlock.match(/<i:language_id>([^<]+)<\/i:language_id>/);

         const typeId = type ? type[1].trim() : '';
         const refValue = ref ? ref[1].trim() : '';
         const languageId = lang ? lang[1].trim() : '';

         if (typeId || refValue) {
            refs.push({ type_id: typeId, ref: refValue, language_id: languageId });
         }
      }

      return { fields, refs };
   }

   private extractBinFilesFromAnswer(responseXml: string): InterpolFile[] {
      const out: InterpolFile[] = [];
      const fileRegex = /<File>[\s\S]*?<\/File>/g;
      let match: RegExpExecArray | null;

      while ((match = fileRegex.exec(responseXml)) !== null) {
         const block = match[0];
         const fileName = (block.match(/<fileName>([^<]+)<\/fileName>/) || [null, ''])[1].trim();
         const type = (block.match(/<type>([^<]+)<\/type>/) || [null, ''])[1].trim();
         const binData = (block.match(/<binData>([\s\S]*?)<\/binData>/) || [null, ''])[1].trim();

         if (binData) {
            out.push({ fileName, type, binData });
         }
      }

      return out;
   }
}
