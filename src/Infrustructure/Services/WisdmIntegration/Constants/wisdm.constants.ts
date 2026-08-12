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

/** Which upstream `.asmx` service an operation belongs to. */
export enum WisdmService {
   /** `.../wisdm/sltd/1.0/sltd.asmx` — record management. */
   SLTD = 'SLTD',
   /** `.../wisdm/sltd/1.0/infos.asmx` — reference tables and statistics. */
   INFOS = 'INFOS',
}

/**
 * SOAP operation names, one per functional feature.
 * The comment on each entry points at the section of the functional description it
 * implements, so the mapping can be re-checked against the WSDL later.
 */
export const WISDM_OPERATIONS = {
   /** §3.2 / 5.3.1 — Get INTERPOL reference table. */
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
   /** §3.2.2 / 5.3.8 — Total number of existing documents by document type. */
   GET_STATISTICS: 'Statistics',
   /** §3.2.3 / 7.9 — Data-management activity per document type and month. */
   GET_ACTIONS: 'Actions',
   /** §3.2.4 / 5.3.5 — Start the re-initialization of all national records. */
   INIT_ALL_RECORDS: 'InitAllRecords',
   /** §3.2.4 / 5.3.5 — Commit the re-initialization; unreinserted records are removed. */
   FINALIZE_INIT: 'FinalizeInit',
   /** §3.2.5 / 7.9 — Records due to expire within six months; verify name against WSDL. */
   GET_EXPIRY_ALERTS: 'ExpiringRecords',
} as const;

export type WisdmOperation = (typeof WISDM_OPERATIONS)[keyof typeof WISDM_OPERATIONS];

/** Routes each operation to the `.asmx` service that exposes it. */
export const WISDM_OPERATION_SERVICE: Record<WisdmOperation, WisdmService> = {
   [WISDM_OPERATIONS.GET_REFERENCE_TABLE]: WisdmService.INFOS,
   [WISDM_OPERATIONS.GET_STATISTICS]: WisdmService.INFOS,
   [WISDM_OPERATIONS.GET_ACTIONS]: WisdmService.INFOS,
   [WISDM_OPERATIONS.GET_EXPIRY_ALERTS]: WisdmService.INFOS,
   [WISDM_OPERATIONS.CREATE_RECORD]: WisdmService.SLTD,
   [WISDM_OPERATIONS.UPDATE_RECORD]: WisdmService.SLTD,
   [WISDM_OPERATIONS.EXTEND_RETENTION]: WisdmService.SLTD,
   [WISDM_OPERATIONS.DELETE_RECORD]: WisdmService.SLTD,
   [WISDM_OPERATIONS.SEARCH_DOCUMENT]: WisdmService.SLTD,
   [WISDM_OPERATIONS.INIT_ALL_RECORDS]: WisdmService.SLTD,
   [WISDM_OPERATIONS.FINALIZE_INIT]: WisdmService.SLTD,
};

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

/** Element names used by the read/statistics operations. */
export const WISDM_QUERY_ELEMENTS = {
   referenceTableName: 'TableName',
   yearMonthFrom: 'FromMonth',
   yearMonthTo: 'ToMonth',
} as const;

/** Wire names of the reference tables exposed by the `infos` service. */
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
   INFOS_NAMESPACE: 'INTERPOL_WISDM_INFOS_NAMESPACE',
   XML_PREFIX: 'INTERPOL_WISDM_XML_PREFIX',
} as const;
