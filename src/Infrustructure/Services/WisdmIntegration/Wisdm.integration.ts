import { HttpService } from '@nestjs/axios';
import {
   BadGatewayException,
   Injectable,
   InternalServerErrorException,
   Logger,
   NotFoundException,
   NotImplementedException,
   ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';

import { WISDM_EXPIRY_ALERT_WINDOW_MONTHS } from 'src/Core/Wisdm/Constants/wisdm.rules.constants';
import {
   WisdmInfosDocumentedSchemaOperation,
   WisdmInfosSchemaFormat,
   WisdmReferenceTable,
   WisdmStatisticsAction,
} from 'src/Core/Wisdm/Enums/wisdm.enums';
import { evaluateResultCode } from 'src/Infrustructure/Services/InterpolIntegration/Helpers/resultCode.helper';
import {
   WISDM_ENV,
   WISDM_INFOS_NAMESPACE,
   WISDM_INFOS_OPERATIONS,
   WISDM_INFOS_SOAP_ACTIONS,
   WISDM_OPERATIONS,
   WISDM_RECORD_ELEMENTS,
   WISDM_SLTD_NAMESPACE,
   WISDM_SLTD_RECORD_NAMESPACE,
   WISDM_SLTD_RECORD_ROOT,
   WISDM_SLTD_SOAP_ACTIONS,
   WISDM_TIMEOUT_DEFAULT_MS,
   WISDM_USERNAME_TOKEN_VERSION_DEFAULT,
   WISDM_XML_PREFIX_DEFAULT,
   WisdmInfosOperation,
   WisdmOperation,
} from './Constants/wisdm.constants';
import {
   allTagBlocks,
   buildElement,
   buildElements,
   buildWisdmEnvelope,
   buildWisdmInfosEnvelope,
   decodeXmlEntities,
   extractSoapFault,
   extractXmlDataRaw,
   firstTagInner,
   firstTagValue,
   matchFunctionalError,
   parseXmlDataToJson,
   toNumberOrNull,
} from './Helpers/wisdm.soap.helper';
import type {
   WisdmActivityEntry,
   WisdmActivityResponse,
   WisdmBaseResponse,
   WisdmCountResponse,
   WisdmDocumentProperties,
   WisdmDocumentResponse,
   WisdmExpiringRecord,
   WisdmExpiryAlertsResponse,
   WisdmInfosSchemaDescriptor,
   WisdmInfosSchemaResponse,
   WisdmInitStepResponse,
   WisdmMutationResponse,
   WisdmRecordIdentifier,
   WisdmRecordParams,
   WisdmReferenceEntry,
   WisdmReferenceTableResponse,
   WisdmRetentionParams,
   WisdmSoapCallResult,
} from './Models/wisdm.types';

/**
 * Outbound SOAP calls to the WISDM SLTD/SAD data-management service.
 *
 * This class owns protocol concerns only: envelope construction, transport, and mapping
 * the XML answer onto typed objects. All business rules (which fields are mandatory,
 * retention arithmetic, the ordering of the initialization sequence) live in
 * `src/Core/Wisdm/Wisdm.service.ts`.
 *
 * Every operation name and element name comes from `Constants/wisdm.constants.ts` — see
 * the warning at the top of that file about the missing technical reference manual.
 */
@Injectable()
export class WisdmIntegration {
   private readonly logger = new Logger(WisdmIntegration.name);

   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
   ) {}

   /* ---------------------------------------------------------------------- */
   /*  §3.1 Document management                                              */
   /* ---------------------------------------------------------------------- */

   /** §3.1.1 — insert a stolen/lost/revoked travel document or a stolen administrative document. */
   async createRecord(params: WisdmRecordParams): Promise<WisdmMutationResponse> {
      const operation = WISDM_OPERATIONS.CREATE_OR_UPDATE_RECORD;
      const body = this.buildCreateOrUpdateBody(params, true);

      const { status, xml } = await this.call(operation, body);
      return this.mapMutationResponse(status, xml, params);
   }

   /** §3.1.2 — update the non-identifying fields of an existing record. */
   async updateRecord(params: WisdmRecordParams): Promise<WisdmMutationResponse> {
      const operation = WISDM_OPERATIONS.CREATE_OR_UPDATE_RECORD;
      const body = this.buildCreateOrUpdateBody(params, false);

      const { status, xml } = await this.call(operation, body);
      return this.mapMutationResponse(status, xml, params);
   }

   /** §3.1.2 (administrative part) — change only the retention date, with a reason. */
   async extendRetention(params: WisdmRetentionParams): Promise<WisdmMutationResponse> {
      const prefix = this.getXmlPrefix();
      const documentId = await this.resolveDocumentId(params);
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.CHANGE_RETENTION_DATE,
         buildElements([
            buildElement(prefix, 'DocumentId', documentId),
            buildElement(
               prefix,
               'NewRetentionDate',
               this.toSoapDateTime(params.recordRetentionDate),
            ),
            buildElement(prefix, 'Reason', params.extensionReason),
         ]),
      );

      const { status, xml } = await this.call(WISDM_OPERATIONS.CHANGE_RETENTION_DATE, body);
      return this.mapMutationResponse(status, xml, params);
   }

   /** §3.1.3 — delete one of the country's own records. */
   async deleteRecord(params: WisdmRecordIdentifier): Promise<WisdmMutationResponse> {
      const prefix = this.getXmlPrefix();
      const documentId = await this.resolveDocumentId(params);
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.DELETE_RECORD,
         buildElement(prefix, 'DocumentId', documentId),
      );

      const { status, xml } = await this.call(WISDM_OPERATIONS.DELETE_RECORD, body);
      return this.mapMutationResponse(status, xml, params);
   }

   /* ---------------------------------------------------------------------- */
   /*  §3.2 Data management                                                  */
   /* ---------------------------------------------------------------------- */

   /** §3.2.1 — full properties of one record the country manages. */
   async getDocument(params: WisdmRecordIdentifier): Promise<WisdmDocumentResponse> {
      const prefix = this.getXmlPrefix();
      const documentId = await this.resolveDocumentId(params);
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.RETRIEVE_RECORD,
         buildElement(prefix, 'DocumentId', documentId),
      );

      const { status, xml } = await this.call(WISDM_OPERATIONS.RETRIEVE_RECORD, body);
      const base = this.mapBaseResponse(status, xml);

      return {
         ...base,
         document: base.ok ? this.parseDocumentProperties(xml) : null,
         xmlData: parseXmlDataToJson(xml),
      };
   }

   /** Deletes every record owned by the country authenticated at WISDM. */
   async clearAllRecords(): Promise<WisdmInitStepResponse> {
      const body = this.buildOperationBody(WISDM_OPERATIONS.CLEAR, '');
      const { status, xml } = await this.call(WISDM_OPERATIONS.CLEAR, body);

      return { ...this.mapBaseResponse(status, xml), xmlData: parseXmlDataToJson(xml) };
   }

   /** Reads the no-argument `GetStatistics` payload and selects the requested document type. */
   async getDocumentCount(typeOfDocument: string): Promise<WisdmCountResponse> {
      const body = this.buildOperationBody(WISDM_OPERATIONS.GET_STATISTICS, '');
      const { status, xml } = await this.call(WISDM_OPERATIONS.GET_STATISTICS, body);
      const base = this.mapBaseResponse(status, xml, true);
      const indicator = this.parseStatisticsIndicators(xml).find(({ type }) => {
         const normalized = type.toUpperCase();
         const documentType = typeOfDocument.toUpperCase();
         return (
            !normalized.startsWith('ACTIONS_') &&
            (normalized === documentType ||
               normalized.endsWith(`_FOR_${documentType}`) ||
               normalized.endsWith(`_${documentType}`))
         );
      });

      return {
         ...base,
         typeOfDocument,
         total: indicator?.value ?? null,
         computedAt: indicator?.date ?? null,
      };
   }

   /** Filters `ACTIONS_<action>_FOR_<document type>` indicators returned by GetStatistics. */
   async getActivity(query: {
      typeOfDocument?: string;
      from?: string;
      to?: string;
   }): Promise<WisdmActivityResponse> {
      const body = this.buildOperationBody(WISDM_OPERATIONS.GET_STATISTICS, '');
      const { status, xml } = await this.call(WISDM_OPERATIONS.GET_STATISTICS, body);
      const base = this.mapBaseResponse(status, xml, true);
      const entries = base.ok
         ? this.parseStatisticsIndicators(xml)
              .map((indicator) => this.toActivityEntry(indicator))
              .filter((entry): entry is WisdmActivityEntry => entry !== null)
              .filter(
                 (entry) =>
                    (!query.typeOfDocument ||
                       entry.typeOfDocument === query.typeOfDocument.toUpperCase()) &&
                    (!query.from || entry.period >= query.from) &&
                    (!query.to || entry.period <= query.to),
              )
         : [];

      return { ...base, entries };
   }

   /** Legacy reference-table call retained until its schema is retrieved and implemented. */
   async getReferenceTable(table: WisdmReferenceTable): Promise<WisdmReferenceTableResponse> {
      throw new NotImplementedException(
         `The supplied SLTD WSDL has no reference-table operation (${table}). Retrieve the published application schema/reference-table service contract before enabling this endpoint.`,
      );
   }

   /** §3.2.5 / §7.9 — retrieve expiry alerts through the WSDL's Actions(MovementId) call. */
   async getExpiryAlerts(movementId: string): Promise<WisdmExpiryAlertsResponse> {
      const prefix = this.getXmlPrefix();
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.ACTIONS,
         buildElement(prefix, 'MovementId', movementId),
      );
      const { status, xml } = await this.call(WISDM_OPERATIONS.ACTIONS, body);
      const base = this.mapBaseResponse(status, xml, true);

      return {
         ...base,
         movementId,
         monthsAhead: WISDM_EXPIRY_ALERT_WINDOW_MONTHS,
         records: base.ok ? this.parseExpiringRecords(xml) : [],
         alarmMessage: firstTagValue(xml, 'AlarmMessage') ?? firstTagValue(xml, 'Alarm'),
         xmlData: parseXmlDataToJson(xml),
      };
   }

   /* ---------------------------------------------------------------------- */
   /*  Exact Infos schema-discovery contract                                 */
   /* ---------------------------------------------------------------------- */

   /** Calls one of the six `GetSLTD*Schema` operations published by Infos WSDL. */
   async getDocumentedSchema(
      operation: WisdmInfosDocumentedSchemaOperation,
      documentation = true,
   ): Promise<WisdmInfosSchemaResponse> {
      const prefix = this.getXmlPrefix();
      const body = this.buildInfosOperationBody(
         operation,
         buildElement(prefix, 'Documentation', documentation ? 'true' : 'false'),
      );

      return this.callAndMapInfos(operation, body);
   }

   /** Calls the exact `ListOfSchema` operation from Infos WSDL. */
   async listSchemas(): Promise<WisdmInfosSchemaResponse> {
      const operation = WISDM_INFOS_OPERATIONS.LIST_SCHEMAS;
      return this.callAndMapInfos(operation, this.buildInfosOperationBody(operation, ''));
   }

   /** Calls `GetSchema`, `GetSchema2`, or `GetHtmlSchema` with the optional WSDL `sKey`. */
   async getSchemaByKey(
      key?: string,
      format: WisdmInfosSchemaFormat = WisdmInfosSchemaFormat.XML,
   ): Promise<WisdmInfosSchemaResponse> {
      const operation = this.getSchemaOperationForFormat(format);
      const prefix = this.getXmlPrefix();
      const body = this.buildInfosOperationBody(operation, buildElement(prefix, 'sKey', key));

      return this.callAndMapInfos(operation, body);
   }

   /* ---------------------------------------------------------------------- */
   /*  §3.2.4 Initialization sequence                                        */
   /* ---------------------------------------------------------------------- */

   /**
    * §3.2.4 step 1 — marks every national record for removal. Previous records stay
    * searchable until {@link finalizeInit} is called, so this step alone is reversible by
    * simply not finalizing.
    */
   async initAllRecords(): Promise<WisdmInitStepResponse> {
      const body = this.buildOperationBody(WISDM_OPERATIONS.START_INIT, '');
      const { status, xml } = await this.call(WISDM_OPERATIONS.START_INIT, body);

      return { ...this.mapBaseResponse(status, xml), xmlData: parseXmlDataToJson(xml) };
   }

   /** §3.2.4 step 3 — commits the re-initialization; records not re-inserted are removed. */
   async finalizeInit(): Promise<WisdmInitStepResponse> {
      const body = this.buildOperationBody(WISDM_OPERATIONS.FINALIZE_INIT, '');
      const { status, xml } = await this.call(WISDM_OPERATIONS.FINALIZE_INIT, body);

      return { ...this.mapBaseResponse(status, xml), xmlData: parseXmlDataToJson(xml) };
   }

   /* ---------------------------------------------------------------------- */
   /*  Request building                                                      */
   /* ---------------------------------------------------------------------- */

   private buildOperationBody(operation: WisdmOperation, innerXml: string): string {
      const prefix = this.getXmlPrefix();
      return `        <${prefix}:${operation}>
            ${innerXml}
        </${prefix}:${operation}>`;
   }

   private buildInfosOperationBody(operation: WisdmInfosOperation, innerXml: string): string {
      const prefix = this.getXmlPrefix();
      return `        <${prefix}:${operation}>
            ${innerXml}
        </${prefix}:${operation}>`;
   }

   private buildRecordElements(
      params: WisdmRecordParams,
      options: { includeFraudType: boolean; prefix?: string },
   ): string {
      const prefix = options.prefix ?? this.getXmlPrefix();

      return buildElements([
         buildElement(prefix, WISDM_RECORD_ELEMENTS.din, params.din),
         buildElement(prefix, WISDM_RECORD_ELEMENTS.typeOfDocument, params.typeOfDocument),
         options.includeFraudType
            ? buildElement(prefix, WISDM_RECORD_ELEMENTS.fraudType, params.fraudType)
            : '',
         buildElement(
            prefix,
            WISDM_RECORD_ELEMENTS.stolenBatchIdentifier,
            params.stolenBatchIdentifier,
         ),
         buildElement(prefix, WISDM_RECORD_ELEMENTS.countryOfTheft, params.countryOfTheft),
         buildElement(prefix, WISDM_RECORD_ELEMENTS.dateOfTheft, params.dateOfTheft),
         buildElement(
            prefix,
            WISDM_RECORD_ELEMENTS.documentIssuanceDate,
            params.documentIssuanceDate,
         ),
         buildElement(prefix, WISDM_RECORD_ELEMENTS.documentExpiryDate, params.documentExpiryDate),
         buildElement(
            prefix,
            WISDM_RECORD_ELEMENTS.nationalReferenceNumber,
            params.nationalReferenceNumber,
         ),
         buildElement(prefix, WISDM_RECORD_ELEMENTS.ncbReferenceNumber, params.ncbReferenceNumber),
         buildElement(
            prefix,
            WISDM_RECORD_ELEMENTS.additionalInformation,
            params.additionalInformation,
         ),
         buildElement(
            prefix,
            WISDM_RECORD_ELEMENTS.recordRetentionDate,
            params.recordRetentionDate,
         ),
         buildElement(prefix, WISDM_RECORD_ELEMENTS.extensionReason, params.extensionReason),
      ]);
   }

   /** Builds the WSDL's single `XMLDatas/xs:any` application record. */
   private buildCreateOrUpdateBody(params: WisdmRecordParams, includeFraudType: boolean): string {
      const soapPrefix = this.getXmlPrefix();
      const recordPrefix = 'record';
      const recordXml = `<${recordPrefix}:${WISDM_SLTD_RECORD_ROOT} xmlns:${recordPrefix}="${WISDM_SLTD_RECORD_NAMESPACE}">${this.buildRecordElements(
         params,
         { includeFraudType, prefix: recordPrefix },
      )}</${recordPrefix}:${WISDM_SLTD_RECORD_ROOT}>`;

      return this.buildOperationBody(
         WISDM_OPERATIONS.CREATE_OR_UPDATE_RECORD,
         `<${soapPrefix}:XMLDatas>${recordXml}</${soapPrefix}:XMLDatas>`,
      );
   }

   /** SearchDocument returns the unique ID required by retrieve/delete/retention calls. */
   private async resolveDocumentId(params: WisdmRecordIdentifier): Promise<string> {
      const prefix = this.getXmlPrefix();
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.SEARCH_DOCUMENT,
         buildElements([
            buildElement(prefix, 'DIN', params.din),
            buildElement(prefix, 'TypeOfDocument', params.typeOfDocument),
         ]),
      );
      const { status, xml } = await this.call(WISDM_OPERATIONS.SEARCH_DOCUMENT, body);
      const base = this.mapBaseResponse(status, xml, true);

      if (base.resultCodeMeta.key === 'NO_ANSWER') {
         throw new NotFoundException(
            `WISDM record ${params.din}/${params.typeOfDocument} was not found.`,
         );
      }

      if (!base.ok) {
         throw new BadGatewayException(
            base.functionalError?.message ??
               base.fault ??
               `WISDM SearchDocument failed with resultCode ${base.resultCode ?? 'UNKNOWN'}.`,
         );
      }

      const payload = extractXmlDataRaw(xml) || xml;
      const documentId =
         firstTagValue(payload, 'DocumentId') ??
         firstTagValue(payload, 'DocumentID') ??
         this.firstXmlAttribute(payload, ['DocumentId', 'DocumentID', 'documentId', 'id']);

      if (!documentId) {
         throw new BadGatewayException(
            'WISDM SearchDocument succeeded but returned no DocumentId. Retrieve the search_sltd_result schema and verify its ID field mapping.',
         );
      }

      return documentId;
   }

   private async call(
      operation: WisdmOperation,
      bodyXml: string,
      timeoutMs = WISDM_TIMEOUT_DEFAULT_MS,
   ): Promise<WisdmSoapCallResult> {
      const endpoint = this.getSltdEndpoint();
      const envelope = this.buildEnvelope(bodyXml);

      const headers = {
         'Content-Type': 'text/xml; charset=utf-8',
         Accept: 'text/xml; charset=utf-8',
         SOAPAction: `"${WISDM_SLTD_SOAP_ACTIONS[operation]}"`,
      };

      try {
         const response = await firstValueFrom(
            this.httpService.post(endpoint, envelope, {
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
         this.logger.error(`WISDM ${operation} transport failure: ${message}`);
         throw new ServiceUnavailableException(`WISDM ${operation} is unavailable: ${message}`);
      }
   }

   private async callInfos(
      operation: WisdmInfosOperation,
      bodyXml: string,
   ): Promise<WisdmSoapCallResult> {
      const endpoint = this.getRequiredConfig(WISDM_ENV.INFOS_ENDPOINT);
      const envelope = buildWisdmInfosEnvelope({
         prefix: this.getXmlPrefix(),
         namespace: WISDM_INFOS_NAMESPACE,
         bodyXml,
         username: this.getRequiredConfig(WISDM_ENV.USERNAME),
         password: this.getRequiredConfig(WISDM_ENV.PASSWORD),
         usernameTokenVersion:
            this.getConfig(WISDM_ENV.USERNAME_TOKEN_VERSION) ||
            WISDM_USERNAME_TOKEN_VERSION_DEFAULT,
      });

      const headers = {
         'Content-Type': 'text/xml; charset=utf-8',
         Accept: 'text/xml; charset=utf-8',
         SOAPAction: `"${WISDM_INFOS_SOAP_ACTIONS[operation]}"`,
      };

      try {
         const response = await firstValueFrom(
            this.httpService.post(endpoint, envelope, {
               headers,
               timeout: WISDM_TIMEOUT_DEFAULT_MS,
               validateStatus: () => true,
            }),
         );

         const xml =
            typeof response.data === 'string' ? response.data : JSON.stringify(response.data || {});

         return { status: response.status, xml, requestXml: envelope };
      } catch (err) {
         const message = err instanceof Error ? err.message : String(err);
         this.logger.error(`WISDM Infos ${operation} transport failure: ${message}`);
         throw new ServiceUnavailableException(
            `WISDM Infos ${operation} is unavailable: ${message}`,
         );
      }
   }

   private buildEnvelope(bodyXml: string): string {
      const username = this.getRequiredConfig(WISDM_ENV.USERNAME);
      const password = this.getRequiredConfig(WISDM_ENV.PASSWORD);
      const userInfoUsername = this.getConfig(WISDM_ENV.WS_USERINFO_USERNAME) || username;

      return buildWisdmEnvelope({
         prefix: this.getXmlPrefix(),
         namespace: WISDM_SLTD_NAMESPACE,
         bodyXml,
         userInfoUsername,
         referenceInCountry: this.generateRequestIdentifier(),
         username,
         password,
         usernameTokenVersion:
            this.getConfig(WISDM_ENV.USERNAME_TOKEN_VERSION) ||
            WISDM_USERNAME_TOKEN_VERSION_DEFAULT,
      });
   }

   /* ---------------------------------------------------------------------- */
   /*  Response mapping                                                      */
   /* ---------------------------------------------------------------------- */

   private async callAndMapInfos(
      operation: WisdmInfosOperation,
      bodyXml: string,
   ): Promise<WisdmInfosSchemaResponse> {
      const { status, xml } = await this.callInfos(operation, bodyXml);
      const fault = extractSoapFault(xml);
      const resultCode = firstTagValue(xml, 'resultCode');
      const resultCodeMeta = resultCode ? evaluateResultCode(resultCode) : null;
      const responseElement = `${operation}Result`;
      const rawPayload = firstTagValue(xml, 'data') ?? firstTagInner(xml, responseElement);
      const parsedPayload = parseXmlDataToJson(xml);

      return {
         ok:
            status < 400 &&
            !fault &&
            (!resultCodeMeta ||
               resultCodeMeta.key === 'NO_ERROR' ||
               resultCodeMeta.key === 'NO_ANSWER'),
         httpStatus: status,
         fault,
         operation,
         resultCode,
         resultOtherCode: firstTagValue(xml, 'resultOtherCode'),
         requestId: firstTagValue(xml, 'requestId'),
         referenceInCountry: firstTagValue(xml, 'referenceInCountry'),
         payload: parsedPayload ?? (rawPayload ? decodeXmlEntities(rawPayload) : null),
         schemas: this.parseSchemaDescriptors(xml),
      };
   }

   private parseSchemaDescriptors(xml: string): WisdmInfosSchemaDescriptor[] {
      const exactBlocks = allTagBlocks(xml, 'SChemaDesc');
      const blocks = exactBlocks.length > 0 ? exactBlocks : allTagBlocks(xml, 'SchemaDesc');

      return blocks.map((block) => ({
         key: firstTagValue(block, 'Key') ?? '',
         description: firstTagValue(block, 'Description') ?? '',
         direction: firstTagValue(block, 'Direction') ?? '',
         method: firstTagValue(block, 'Method') ?? '',
      }));
   }

   private getSchemaOperationForFormat(format: WisdmInfosSchemaFormat): WisdmInfosOperation {
      if (format === WisdmInfosSchemaFormat.HTML) {
         return WISDM_INFOS_OPERATIONS.GET_HTML_SCHEMA;
      }
      if (format === WisdmInfosSchemaFormat.XML_2) {
         return WISDM_INFOS_OPERATIONS.GET_SCHEMA_2;
      }
      return WISDM_INFOS_OPERATIONS.GET_SCHEMA;
   }

   private mapBaseResponse(status: number, xml: string, allowNoAnswer = false): WisdmBaseResponse {
      const fault = extractSoapFault(xml);
      const resultCode = firstTagValue(xml, 'resultCode');
      const resultOtherCode = firstTagValue(xml, 'resultOtherCode');
      const resultCodeMeta = evaluateResultCode(resultCode);
      const xmlDataRaw = extractXmlDataRaw(xml);
      const upstreamMessage =
         firstTagValue(xml, 'ErrorMessage') ??
         firstTagValue(xml, 'errorMessage') ??
         firstTagValue(xml, 'Reason') ??
         firstTagValue(xmlDataRaw, 'ErrorMessage') ??
         firstTagValue(xmlDataRaw, 'errorMessage') ??
         firstTagValue(xmlDataRaw, 'Message') ??
         firstTagValue(xmlDataRaw, 'Reason');

      const functionalError = matchFunctionalError(
         fault,
         resultOtherCode,
         upstreamMessage,
         xmlDataRaw,
      );
      const ok =
         status < 400 &&
         !fault &&
         !functionalError &&
         (resultCodeMeta.key === 'NO_ERROR' ||
            (allowNoAnswer && resultCodeMeta.key === 'NO_ANSWER'));

      return {
         ok,
         httpStatus: status,
         fault,
         resultCode,
         resultOtherCode,
         requestId: firstTagValue(xml, 'requestId'),
         referenceInCountry: firstTagValue(xml, 'referenceInCountry'),
         timestamp:
            firstTagValue(xml, 'timestamp') ??
            firstTagValue(xml, 'Timestamp') ??
            firstTagValue(xml, 'requestTimestamp'),
         upstreamMessage,
         resultCodeMeta,
         functionalError,
      };
   }

   private mapMutationResponse(
      status: number,
      xml: string,
      params: WisdmRecordIdentifier,
   ): WisdmMutationResponse {
      const base = this.mapBaseResponse(status, xml);

      return {
         ...base,
         din: params.din,
         typeOfDocument: params.typeOfDocument,
         recordRetentionDate:
            firstTagValue(xml, WISDM_RECORD_ELEMENTS.recordRetentionDate) ??
            firstTagValue(xml, 'RetentionDate'),
         xmlData: parseXmlDataToJson(xml),
      };
   }

   private parseDocumentProperties(xml: string): WisdmDocumentProperties | null {
      const payload = extractXmlDataRaw(xml) || xml;
      const read = (tag: string) => firstTagValue(payload, tag) ?? '';

      const din = read(WISDM_RECORD_ELEMENTS.din);
      if (!din) return null;

      return {
         din,
         countryOfRegistration: read('CountryOfRegistration'),
         typeOfDocument: read(WISDM_RECORD_ELEMENTS.typeOfDocument),
         fraudType: read(WISDM_RECORD_ELEMENTS.fraudType),
         stolenBatchIdentifier: read(WISDM_RECORD_ELEMENTS.stolenBatchIdentifier),
         countryOfTheft: read(WISDM_RECORD_ELEMENTS.countryOfTheft),
         dateOfTheft: read(WISDM_RECORD_ELEMENTS.dateOfTheft),
         documentIssuanceDate: read(WISDM_RECORD_ELEMENTS.documentIssuanceDate),
         documentExpiryDate: read(WISDM_RECORD_ELEMENTS.documentExpiryDate),
         nationalReferenceNumber: read(WISDM_RECORD_ELEMENTS.nationalReferenceNumber),
         ncbReferenceNumber: read(WISDM_RECORD_ELEMENTS.ncbReferenceNumber),
         additionalInformation: read(WISDM_RECORD_ELEMENTS.additionalInformation),
         recordRetentionDate: read(WISDM_RECORD_ELEMENTS.recordRetentionDate),
      };
   }

   private parseStatisticsIndicators(
      xml: string,
   ): Array<{ type: string; date: string; value: number | null }> {
      const payload = extractXmlDataRaw(xml) || xml;
      const indicators: Array<{ type: string; date: string; value: number | null }> = [];
      const pattern = /<(?:\w+:)?indicator\b([^>]*)>/gi;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(payload)) !== null) {
         const attributes = match[1];
         const type = this.firstXmlAttribute(attributes, ['type']);
         if (!type) continue;

         indicators.push({
            type,
            date: this.firstXmlAttribute(attributes, ['date']) ?? '',
            value: toNumberOrNull(this.firstXmlAttribute(attributes, ['value'])),
         });
      }

      return indicators;
   }

   private toActivityEntry(indicator: {
      type: string;
      date: string;
      value: number | null;
   }): WisdmActivityEntry | null {
      const match = indicator.type.toUpperCase().match(/^ACTIONS_(ADD|UPD|DEL|ERD)_FOR_(.+)$/);
      if (!match) return null;

      return {
         period: indicator.date.replace(/\D/g, '').slice(0, 6),
         typeOfDocument: match[2],
         action: match[1] as WisdmStatisticsAction,
         total: indicator.value ?? 0,
      };
   }

   private firstXmlAttribute(xml: string, names: string[]): string | null {
      for (const name of names) {
         const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
         const match = xml.match(new RegExp(`\\b${escapedName}\\s*=\\s*["']([^"']+)["']`, 'i'));
         if (match?.[1]) return decodeXmlEntities(match[1]);
      }
      return null;
   }

   private toSoapDateTime(value: string): string {
      const compact = value.replace(/\D/g, '');
      if (compact.length !== 8) return value;
      return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}T00:00:00`;
   }

   private parseActivityEntries(xml: string): WisdmActivityEntry[] {
      const payload = extractXmlDataRaw(xml) || xml;
      const entries: WisdmActivityEntry[] = [];
      const keyPattern =
         /<(?:\w+:)?(?:Key|Name)>\s*ACTIONS_(ADD|UPD|DEL|ERD)_FOR_(\w+)\s*<\/(?:\w+:)?(?:Key|Name)>[\s\S]*?<(?:\w+:)?(?:Value|Total|Count)>\s*(\d+)\s*<\/(?:\w+:)?(?:Value|Total|Count)>/gi;

      let match: RegExpExecArray | null;
      while ((match = keyPattern.exec(payload)) !== null) {
         entries.push({
            period: firstTagValue(payload, 'Period') ?? '',
            typeOfDocument: match[2].toUpperCase(),
            action: match[1].toUpperCase() as WisdmStatisticsAction,
            total: Number(match[3]),
         });
      }

      if (entries.length > 0) return entries;

      for (const block of allTagBlocks(payload, 'Action')) {
         const action = (firstTagValue(block, 'Type') ?? '').toUpperCase();
         if (!Object.values(WisdmStatisticsAction).includes(action as WisdmStatisticsAction)) {
            continue;
         }
         entries.push({
            period: firstTagValue(block, 'Period') ?? firstTagValue(block, 'Month') ?? '',
            typeOfDocument: (
               firstTagValue(block, WISDM_RECORD_ELEMENTS.typeOfDocument) ?? ''
            ).toUpperCase(),
            action: action as WisdmStatisticsAction,
            total: toNumberOrNull(firstTagValue(block, 'Total')) ?? 0,
         });
      }

      return entries;
   }

   private parseReferenceEntries(xml: string): WisdmReferenceEntry[] {
      const payload = extractXmlDataRaw(xml) || xml;
      const entries: WisdmReferenceEntry[] = [];
      const blocks = [
         ...allTagBlocks(payload, 'Row'),
         ...allTagBlocks(payload, 'Entry'),
         ...allTagBlocks(payload, 'Item'),
      ];

      for (const block of blocks) {
         const code =
            firstTagValue(block, 'Code') ??
            firstTagValue(block, 'Id') ??
            firstTagValue(block, 'Value');
         if (!code) continue;

         const attributes: Record<string, string> = {};
         const attributePattern = /<(?:\w+:)?(\w+)[^>]*>([^<]*)<\/(?:\w+:)?\1>/g;
         let attributeMatch: RegExpExecArray | null;
         while ((attributeMatch = attributePattern.exec(block)) !== null) {
            attributes[attributeMatch[1]] = attributeMatch[2].trim();
         }

         entries.push({
            code,
            label:
               firstTagValue(block, 'Label') ??
               firstTagValue(block, 'Description') ??
               firstTagValue(block, 'Name') ??
               '',
            attributes,
         });
      }

      return entries;
   }

   private parseExpiringRecords(xml: string): WisdmExpiringRecord[] {
      const payload = extractXmlDataRaw(xml) || xml;
      const records: WisdmExpiringRecord[] = [];
      const blocks = [
         ...allTagBlocks(payload, 'Record'),
         ...allTagBlocks(payload, 'Document'),
         ...allTagBlocks(payload, 'Alert'),
      ];

      for (const block of blocks) {
         const din = firstTagValue(block, WISDM_RECORD_ELEMENTS.din);
         if (!din) continue;
         const deletedFlag = (
            firstTagValue(block, 'Deleted') ??
            firstTagValue(block, 'IsDeleted') ??
            ''
         ).toLowerCase();

         records.push({
            din,
            typeOfDocument: firstTagValue(block, WISDM_RECORD_ELEMENTS.typeOfDocument) ?? '',
            recordRetentionDate:
               firstTagValue(block, WISDM_RECORD_ELEMENTS.recordRetentionDate) ??
               firstTagValue(block, 'RetentionDate') ??
               '',
            alreadyDeleted: deletedFlag === 'true' || deletedFlag === '1' || deletedFlag === 'y',
         });
      }

      return records;
   }

   /* ---------------------------------------------------------------------- */
   /*  Configuration                                                         */
   /* ---------------------------------------------------------------------- */

   private getSltdEndpoint(): string {
      const endpoint = this.getRequiredConfig(WISDM_ENV.SLTD_ENDPOINT);

      if (/\/infos\.asmx(?:[/?#]|$)/i.test(endpoint)) {
         throw new InternalServerErrorException(
            `${WISDM_ENV.SLTD_ENDPOINT} must point to the SLTD business service, not infos.asmx`,
         );
      }

      return endpoint;
   }

   private getXmlPrefix(): string {
      return this.getConfig(WISDM_ENV.XML_PREFIX) || WISDM_XML_PREFIX_DEFAULT;
   }

   private generateRequestIdentifier(): string {
      return `ARM-${randomUUID()}`;
   }

   private getConfig(key: string): string {
      return (this.configService.get<string>(key) || '').trim();
   }

   private getRequiredConfig(key: string): string {
      const value = this.getConfig(key);
      if (!value) {
         throw new InternalServerErrorException(`${key} is missing in environment variables`);
      }
      return value;
   }
}
