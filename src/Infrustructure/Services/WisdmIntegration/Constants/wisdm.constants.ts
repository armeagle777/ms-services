/**
 * WISDM SOAP protocol constants.
 *
 * ── IMPORTANT ────────────────────────────────────────────────────────────────────────
 * The service namespaces, operation names, SOAP actions and outer request elements below
 * come from the supplied `infos.asmx?WSDL` and `sltd.asmx?WSDL`. XML nested inside the
 * SLTD `XMLDatas` element is governed by the separately published `sltd_record` schema.
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

/** Exact target namespace published by the supplied `sltd.asmx?WSDL`. */
export const WISDM_SLTD_NAMESPACE = 'urn:interpol:ws:wisdm:sltd';

/** Application namespace used by the separately published `sltd_record` schema. */
export const WISDM_SLTD_RECORD_NAMESPACE = 'urn:application:ws:sltd:record';

/** Single application element carried by the WSDL's `XMLDatas/xs:any` slot. */
export const WISDM_SLTD_RECORD_ROOT = 'record';

/**
 * SOAP operation names, one per functional feature.
 * The comment on each entry points at the section of the functional description it
 * implements, so the mapping can be re-checked against the WSDL later.
 */
export const WISDM_OPERATIONS = {
   /** §3.2 — delete every record owned by the authenticated country. */
   CLEAR: 'Clear',
   /** §3.1.1 / 5.3.2 — Create a new SLTD record. */
   CREATE_OR_UPDATE_RECORD: 'CreateOrUpdateSLTDRecord',
   /** §3.1.2 / 5.3.3 — Update an existing SLTD record. */
   RETRIEVE_RECORD: 'RetrieveSLTDRecord',
   /** §3.1.2 — Update the retention date (update carrying an extension reason). */
   CHANGE_RETENTION_DATE: 'ChangeRetentionDate',
   /** §3.1.3 / 5.3.4 — Delete an SLTD record. */
   DELETE_RECORD: 'DeleteSLTDRecord',
   /** §3.2.1 / 7.5 — Retrieve the properties of a particular document. */
   SEARCH_DOCUMENT: 'SearchDocument',
   GET_STATISTICS: 'GetStatistics',
   /** §3.2.5 / technical reference §7.9 — retrieve an Actions result by movement ID. */
   ACTIONS: 'Actions',
   /** §3.2.4 / 5.3.5 — Start the re-initialization of all national records. */
   START_INIT: 'StartInit',
   /** §3.2.4 / 5.3.5 — Commit the re-initialization; unreinserted records are removed. */
   FINALIZE_INIT: 'FinalizeInit',
} as const;

export type WisdmOperation = (typeof WISDM_OPERATIONS)[keyof typeof WISDM_OPERATIONS];

/** Exact SOAP 1.1 actions published by `sltd.asmx?WSDL`. */
export const WISDM_SLTD_SOAP_ACTIONS: Record<WisdmOperation, string> = Object.fromEntries(
   Object.values(WISDM_OPERATIONS).map((operation) => [
      operation,
      `${WISDM_SLTD_NAMESPACE}/${operation}`,
   ]),
) as Record<WisdmOperation, string>;

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
   XML_PREFIX: 'INTERPOL_WISDM_XML_PREFIX',
} as const;
