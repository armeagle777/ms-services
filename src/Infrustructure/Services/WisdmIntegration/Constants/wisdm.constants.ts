import { WisdmReferenceTable } from 'src/Core/Wisdm/Enums/wisdm.enums';

/**
 * WISDM SOAP protocol constants.
 *
 * ── IMPORTANT ────────────────────────────────────────────────────────────────────────
 * The operation names, XML element names and namespaces below are derived from the
 * *functional* description (use-case titles in §3 and §5.3/§7.x cross-references) because
 * the technical reference manual `CV01700_WISDM_SLTD_technical_services_reference` and
 * the SOAPUI mockups (http://i247.ip/publitec/) were not available when this integration
 * was written. They are deliberately isolated in this one file: once the WSDL is on hand,
 * correcting the values here is sufficient — no other file needs to change.
 * ─────────────────────────────────────────────────────────────────────────────────────
 */

/** XML prefix used for WISDM elements when none is configured. */
export const WISDM_XML_PREFIX_DEFAULT = 'tns';

export const SOAP_ENVELOPE_NAMESPACE = 'http://schemas.xmlsoap.org/soap/envelope/';
export const XSI_NAMESPACE = 'http://www.w3.org/2001/XMLSchema-instance';
export const XSD_NAMESPACE = 'http://www.w3.org/2001/XMLSchema';

/** Default `UsernameToken` version attribute. */
export const WISDM_USERNAME_TOKEN_VERSION_DEFAULT = '1.0';

/** Exact namespace published by the supplied `infos.asmx?WSDL`. */
export const WISDM_INFOS_NAMESPACE = 'http://tempuri.org/';

/** Which upstream `.asmx` service an operation belongs to. */
export enum WisdmService {
   SLTD = 'SLTD',
   INFOS = 'INFOS',
}

/**
 * SOAP operation names, one per functional feature.
 * The comment on each entry points at the section of the functional description it
 * implements, so the mapping can be re-checked against the WSDL later.
 */
export const WISDM_OPERATIONS = {
   GET_REFERENCE_TABLE: 'ReferenceTable',
   /** §3.1.1 / 5.3.2 — Create a new SLTD record. */
   CREATE_RECORD: 'Create',
   /** §3.1.2 / 5.3.3 — Update an existing SLTD record. */
   UPDATE_RECORD: 'Update',
   /** §3.1.2 — Update the retention date (update carrying an extension reason). */
   EXTEND_RETENTION: 'ExtendRetentionDate',
   /** §3.1.3 / 5.3.4 — Delete an SLTD record. */
   DELETE_RECORD: 'Delete',
   /** §3.2.1 / 7.5 — Retrieve the properties of a particular document. */
   SEARCH_DOCUMENT: 'SearchDocument',
   GET_STATISTICS: 'Statistics',
   GET_ACTIONS: 'Actions',
   /** §3.2.4 / 5.3.5 — Start the re-initialization of all national records. */
   INIT_ALL_RECORDS: 'InitAllRecords',
   /** §3.2.4 / 5.3.5 — Commit the re-initialization; unreinserted records are removed. */
   FINALIZE_INIT: 'FinalizeInit',
   GET_EXPIRY_ALERTS: 'ExpiringRecords',
} as const;

export type WisdmOperation = (typeof WISDM_OPERATIONS)[keyof typeof WISDM_OPERATIONS];

/**
 * Business operations use `sltd.asmx`. The supplied `infos.asmx` WSDL exposes only
 * schema-discovery methods and rejects actions such as `Statistics`.
 */
export const WISDM_OPERATION_SERVICE: Record<WisdmOperation, WisdmService> = {
   [WISDM_OPERATIONS.GET_REFERENCE_TABLE]: WisdmService.SLTD,
   [WISDM_OPERATIONS.GET_STATISTICS]: WisdmService.SLTD,
   [WISDM_OPERATIONS.GET_ACTIONS]: WisdmService.SLTD,
   [WISDM_OPERATIONS.GET_EXPIRY_ALERTS]: WisdmService.SLTD,
   [WISDM_OPERATIONS.CREATE_RECORD]: WisdmService.SLTD,
   [WISDM_OPERATIONS.UPDATE_RECORD]: WisdmService.SLTD,
   [WISDM_OPERATIONS.EXTEND_RETENTION]: WisdmService.SLTD,
   [WISDM_OPERATIONS.DELETE_RECORD]: WisdmService.SLTD,
   [WISDM_OPERATIONS.SEARCH_DOCUMENT]: WisdmService.SLTD,
   [WISDM_OPERATIONS.INIT_ALL_RECORDS]: WisdmService.SLTD,
   [WISDM_OPERATIONS.FINALIZE_INIT]: WisdmService.SLTD,
};

/** Exact operations published by the supplied `infos.asmx?WSDL`. */
export const WISDM_INFOS_OPERATIONS = {
   GET_SEARCH_SCHEMA: 'GetSLTDSearchSchema',
   GET_SEARCH_RESULT_SCHEMA: 'GetSLTDSearchResultSchema',
   GET_RECORD_SCHEMA: 'GetSLTDRecordSchema',
   GET_REVIEW_DATE_SCHEMA: 'GetSLTDReviewDateSchema',
   GET_STATISTICS_SCHEMA: 'GetSLTDStatisticsSchema',
   GET_ACTIONS_SCHEMA: 'GetSLTDActionsSchema',
   LIST_SCHEMAS: 'ListOfSchema',
   GET_HTML_SCHEMA: 'GetHtmlSchema',
   GET_SCHEMA: 'GetSchema',
   GET_SCHEMA_2: 'GetSchema2',
} as const;

export type WisdmInfosOperation =
   (typeof WISDM_INFOS_OPERATIONS)[keyof typeof WISDM_INFOS_OPERATIONS];

/** SOAP 1.1 actions are explicit in the WSDL and must not be guessed. */
export const WISDM_INFOS_SOAP_ACTIONS: Record<WisdmInfosOperation, string> = Object.fromEntries(
   Object.values(WISDM_INFOS_OPERATIONS).map((operation) => [
      operation,
      `${WISDM_INFOS_NAMESPACE}${operation}`,
   ]),
) as Record<WisdmInfosOperation, string>;

/**
 * XML element names for the record payload. Kept separate from the DTO field names so the
 * public API stays stable if INTERPOL renames something in the schema.
 */
export const WISDM_RECORD_ELEMENTS = {
   din: 'DIN',
   typeOfDocument: 'TypeOfDocument',
   fraudType: 'TypeOfFraud',
   stolenBatchIdentifier: 'StolenBatchIdentifier',
   countryOfTheft: 'CountryOfTheft',
   dateOfTheft: 'DateOfTheft',
   documentIssuanceDate: 'DocumentIssuanceDate',
   documentExpiryDate: 'DocumentExpiryDate',
   nationalReferenceNumber: 'NationalReferenceNumber',
   ncbReferenceNumber: 'NCBReferenceNumber',
   additionalInformation: 'AdditionalInformation',
   recordRetentionDate: 'RecordRetentionDate',
   extensionReason: 'ReasonForExtension',
} as const;

/** Element names used by the legacy read/statistics operations. */
export const WISDM_QUERY_ELEMENTS = {
   referenceTableName: 'TableName',
   yearMonthFrom: 'FromMonth',
   yearMonthTo: 'ToMonth',
} as const;

export const WISDM_REFERENCE_TABLE_CODES: Record<WisdmReferenceTable, string> = {
   [WisdmReferenceTable.DOCUMENT_TYPE]: 'IPSGT_Document_Type',
   [WisdmReferenceTable.THEFT_TYPE]: 'IPSGT_Theft_Type',
   [WisdmReferenceTable.COUNTRIES]: 'IPSGT_ICPO_Countries',
   [WisdmReferenceTable.EXTENSION_REASON]: 'IPSGT_Extension_Reason',
};

/** Request timeouts, in milliseconds. */
export const WISDM_TIMEOUT_DEFAULT_MS = 60_000;
export const WISDM_TIMEOUT_BULK_MS = 180_000;

/** Environment variable names consumed by the integration. */
export const WISDM_ENV = {
   SLTD_ENDPOINT: 'INTERPOL_WISDM_SLTD_ENDPOINT',
   INFOS_ENDPOINT: 'INTERPOL_WISDM_INFOS_ENDPOINT',
   USERNAME: 'INTERPOL_WISDM_USERNAME',
   PASSWORD: 'INTERPOL_WISDM_PASSWORD',
   WS_USERINFO_USERNAME: 'INTERPOL_WISDM_WS_USERINFO_USERNAME',
   USERNAME_TOKEN_VERSION: 'INTERPOL_WISDM_WS_USERNAME_VERSION',
   SLTD_NAMESPACE: 'INTERPOL_WISDM_SLTD_NAMESPACE',
   XML_PREFIX: 'INTERPOL_WISDM_XML_PREFIX',
} as const;
