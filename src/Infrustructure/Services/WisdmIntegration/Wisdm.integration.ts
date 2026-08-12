import { HttpService } from '@nestjs/axios';
import {
   Injectable,
   InternalServerErrorException,
   Logger,
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
   WISDM_OPERATION_SERVICE,
   WISDM_OPERATIONS,
   WISDM_QUERY_ELEMENTS,
   WISDM_RECORD_ELEMENTS,
   WISDM_REFERENCE_TABLE_CODES,
   WISDM_TIMEOUT_DEFAULT_MS,
   WISDM_USERNAME_TOKEN_VERSION_DEFAULT,
   WISDM_XML_PREFIX_DEFAULT,
   WisdmInfosOperation,
   WisdmOperation,
   WisdmService,
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
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.CREATE_RECORD,
         this.buildRecordElements(params, { includeFraudType: true }),
      );

      const { status, xml } = await this.call(WISDM_OPERATIONS.CREATE_RECORD, body);
      return this.mapMutationResponse(status, xml, params);
   }

   /** §3.1.2 — update the non-identifying fields of an existing record. */
   async updateRecord(params: WisdmRecordParams): Promise<WisdmMutationResponse> {
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.UPDATE_RECORD,
         this.buildRecordElements(params, { includeFraudType: false }),
      );

      const { status, xml } = await this.call(WISDM_OPERATIONS.UPDATE_RECORD, body);
      return this.mapMutationResponse(status, xml, params);
   }

   /** §3.1.2 (administrative part) — change only the retention date, with a reason. */
   async extendRetention(params: WisdmRetentionParams): Promise<WisdmMutationResponse> {
      const prefix = this.getXmlPrefix();
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.EXTEND_RETENTION,
         buildElements([
            buildElement(prefix, WISDM_RECORD_ELEMENTS.din, params.din),
            buildElement(prefix, WISDM_RECORD_ELEMENTS.typeOfDocument, params.typeOfDocument),
            buildElement(
               prefix,
               WISDM_RECORD_ELEMENTS.recordRetentionDate,
               params.recordRetentionDate,
            ),
            buildElement(prefix, WISDM_RECORD_ELEMENTS.extensionReason, params.extensionReason),
         ]),
      );

      const { status, xml } = await this.call(WISDM_OPERATIONS.EXTEND_RETENTION, body);
      return this.mapMutationResponse(status, xml, params);
   }

   /** §3.1.3 — delete one of the country's own records. */
   async deleteRecord(params: WisdmRecordIdentifier): Promise<WisdmMutationResponse> {
      const prefix = this.getXmlPrefix();
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.DELETE_RECORD,
         buildElements([
            buildElement(prefix, WISDM_RECORD_ELEMENTS.din, params.din),
            buildElement(prefix, WISDM_RECORD_ELEMENTS.typeOfDocument, params.typeOfDocument),
         ]),
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
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.SEARCH_DOCUMENT,
         buildElements([
            buildElement(prefix, WISDM_RECORD_ELEMENTS.din, params.din),
            buildElement(prefix, WISDM_RECORD_ELEMENTS.typeOfDocument, params.typeOfDocument),
         ]),
      );

      const { status, xml } = await this.call(WISDM_OPERATIONS.SEARCH_DOCUMENT, body);
      const base = this.mapBaseResponse(status, xml);

      return {
         ...base,
         document: base.ok ? this.parseDocumentProperties(xml) : null,
         xmlData: parseXmlDataToJson(xml),
      };
   }

   /** Legacy count call retained until its schema is retrieved and implemented. */
   async getDocumentCount(typeOfDocument: string): Promise<WisdmCountResponse> {
      const prefix = this.getXmlPrefix();
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.GET_STATISTICS,
         buildElement(prefix, WISDM_RECORD_ELEMENTS.typeOfDocument, typeOfDocument),
      );
      const { status, xml } = await this.call(WISDM_OPERATIONS.GET_STATISTICS, body);
      const base = this.mapBaseResponse(status, xml);

      return {
         ...base,
         typeOfDocument,
         total: toNumberOrNull(
            firstTagValue(xml, 'Total') ??
               firstTagValue(xml, 'NbRecord') ??
               firstTagValue(xml, 'Value'),
         ),
         computedAt:
            firstTagValue(xml, 'ComputationDate') ??
            firstTagValue(xml, 'ComputedAt') ??
            firstTagValue(xml, 'Timestamp'),
      };
   }

   /** Legacy activity call retained until its schema is retrieved and implemented. */
   async getActivity(query: {
      typeOfDocument?: string;
      from?: string;
      to?: string;
   }): Promise<WisdmActivityResponse> {
      const prefix = this.getXmlPrefix();
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.GET_ACTIONS,
         buildElements([
            buildElement(prefix, WISDM_RECORD_ELEMENTS.typeOfDocument, query.typeOfDocument),
            buildElement(prefix, WISDM_QUERY_ELEMENTS.yearMonthFrom, query.from),
            buildElement(prefix, WISDM_QUERY_ELEMENTS.yearMonthTo, query.to),
         ]),
      );
      const { status, xml } = await this.call(WISDM_OPERATIONS.GET_ACTIONS, body);
      const base = this.mapBaseResponse(status, xml);

      return { ...base, entries: base.ok ? this.parseActivityEntries(xml) : [] };
   }

   /** Legacy reference-table call retained until its schema is retrieved and implemented. */
   async getReferenceTable(table: WisdmReferenceTable): Promise<WisdmReferenceTableResponse> {
      const prefix = this.getXmlPrefix();
      const body = this.buildOperationBody(
         WISDM_OPERATIONS.GET_REFERENCE_TABLE,
         buildElement(prefix, WISDM_QUERY_ELEMENTS.referenceTableName, this.toTableCode(table)),
      );
      const { status, xml } = await this.call(WISDM_OPERATIONS.GET_REFERENCE_TABLE, body);
      const base = this.mapBaseResponse(status, xml);

      return { ...base, table, entries: base.ok ? this.parseReferenceEntries(xml) : [] };
   }

   /** Legacy expiry call retained until its schema is retrieved and implemented. */
   async getExpiryAlerts(): Promise<WisdmExpiryAlertsResponse> {
      const body = this.buildOperationBody(WISDM_OPERATIONS.GET_EXPIRY_ALERTS, '');
      const { status, xml } = await this.call(WISDM_OPERATIONS.GET_EXPIRY_ALERTS, body);
      const base = this.mapBaseResponse(status, xml);

      return {
         ...base,
         monthsAhead: WISDM_EXPIRY_ALERT_WINDOW_MONTHS,
         records: base.ok ? this.parseExpiringRecords(xml) : [],
         alarmMessage: firstTagValue(xml, 'AlarmMessage') ?? firstTagValue(xml, 'Alarm'),
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
      const body = this.buildOperationBody(WISDM_OPERATIONS.INIT_ALL_RECORDS, '');
      const { status, xml } = await this.call(WISDM_OPERATIONS.INIT_ALL_RECORDS, body);

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
      options: { includeFraudType: boolean },
   ): string {
      const prefix = this.getXmlPrefix();

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

   private async call(
      operation: WisdmOperation,
      bodyXml: string,
      timeoutMs = WISDM_TIMEOUT_DEFAULT_MS,
   ): Promise<WisdmSoapCallResult> {
      const service = WISDM_OPERATION_SERVICE[operation];
      const endpoint = this.getEndpoint(service);
      const namespace = this.getNamespace(service);
      const envelope = this.buildEnvelope(bodyXml, service);

      const headers = {
         'Content-Type': 'text/xml; charset=utf-8',
         Accept: 'text/xml; charset=utf-8',
         SOAPAction: `"${namespace.replace(/\/$/, '')}/${operation}"`,
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

   private buildEnvelope(bodyXml: string, service: WisdmService): string {
      const username = this.getRequiredConfig(WISDM_ENV.USERNAME);
      const password = this.getRequiredConfig(WISDM_ENV.PASSWORD);
      const userInfoUsername = this.getConfig(WISDM_ENV.WS_USERINFO_USERNAME) || username;

      return buildWisdmEnvelope({
         prefix: this.getXmlPrefix(),
         namespace: this.getNamespace(service),
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
         payload: rawPayload ? decodeXmlEntities(rawPayload) : null,
         xmlData: parseXmlDataToJson(xml),
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

   private mapBaseResponse(status: number, xml: string): WisdmBaseResponse {
      const fault = extractSoapFault(xml);
      const resultCode = firstTagValue(xml, 'resultCode');
      const resultOtherCode = firstTagValue(xml, 'resultOtherCode');
      const resultCodeMeta = evaluateResultCode(resultCode);
      const errorText =
         firstTagValue(xml, 'ErrorMessage') ??
         firstTagValue(xml, 'errorMessage') ??
         firstTagValue(xml, 'Reason');

      const functionalError = matchFunctionalError(fault, resultOtherCode, errorText);
      const ok =
         status < 400 &&
         !fault &&
         !functionalError &&
         (resultCodeMeta.key === 'NO_ERROR' || resultCodeMeta.key === 'NO_ANSWER');

      return {
         ok,
         httpStatus: status,
         fault,
         resultCode,
         resultOtherCode,
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

   private getEndpoint(service: WisdmService): string {
      return this.getRequiredConfig(
         service === WisdmService.INFOS ? WISDM_ENV.INFOS_ENDPOINT : WISDM_ENV.SLTD_ENDPOINT,
      );
   }

   private getNamespace(service: WisdmService): string {
      return service === WisdmService.INFOS
         ? WISDM_INFOS_NAMESPACE
         : this.getRequiredConfig(WISDM_ENV.SLTD_NAMESPACE);
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

   private toTableCode(table: WisdmReferenceTable): string {
      return WISDM_REFERENCE_TABLE_CODES[table];
   }
}
