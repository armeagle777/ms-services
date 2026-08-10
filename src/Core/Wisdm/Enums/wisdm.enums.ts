/**
 * Client-facing enumerations for the WISDM SLTD/SAD data-management service.
 *
 * These are *our* stable API vocabulary. The values actually accepted by INTERPOL come
 * from the IPSGT_* reference tables and may differ; the translation happens in
 * `src/Infrustructure/Services/WisdmIntegration/Constants/wisdm.constants.ts`
 * (`WISDM_FRAUD_TYPE_CODES`). Never send these enum members on the wire directly.
 */

/**
 * Reason why the document is recorded in the INTERPOL database.
 * Source reference table: `IPSGT_Theft_Type`.
 */
export enum WisdmFraudType {
   STOLEN = 'STOLEN',
   LOST = 'LOST',
   STOLEN_BLANK = 'STOLEN_BLANK',
   REVOKED = 'REVOKED',
}

/**
 * Class of the record. Travel documents and administrative documents share one
 * repository; the class is derived from the type of document (`IPSGT_Document_Type`).
 */
export enum WisdmDocumentClass {
   /** Stolen/lost travel document. */
   STD = 'STD',
   /** Stolen administrative document. */
   SAD = 'SAD',
}

/**
 * Reason for extending the retention period of a record.
 * Source reference table: `IPSGT_Extension_Reason` — currently a single allowed value.
 */
export enum WisdmExtensionReason {
   PURPOSE_NOT_ACHIEVED = 'PURPOSE_NOT_ACHIEVED',
}

/**
 * Data-management action counters returned by the statistics service.
 * Statistics keys are shaped `ACTIONS_<action>_FOR_<documentType>`.
 */
export enum WisdmStatisticsAction {
   /** Creation of a new record. */
   ADD = 'ADD',
   /** Update of an existing record. */
   UPD = 'UPD',
   /** Deletion of an SLTD record. */
   DEL = 'DEL',
   /** Update of a retention date. */
   ERD = 'ERD',
}

/**
 * INTERPOL reference tables exposed through the `infos` service. Clients pull these to
 * keep a local copy of the allowed values (document types, fraud types, countries...).
 */
export enum WisdmReferenceTable {
   DOCUMENT_TYPE = 'IPSGT_Document_Type',
   THEFT_TYPE = 'IPSGT_Theft_Type',
   COUNTRIES = 'IPSGT_ICPO_Countries',
   EXTENSION_REASON = 'IPSGT_Extension_Reason',
}
