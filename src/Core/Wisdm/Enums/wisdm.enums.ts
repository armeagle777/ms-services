/**
 * Client-facing enumerations for the WISDM SLTD/SAD data-management service.
 *
 * Fixed public enumerations used where the functional manual publishes the exact wire
 * vocabulary. Fraud and extension-reason values are intentionally not enums: callers must
 * send the current codes obtained from the corresponding `IPSGT_*` reference tables.
 */

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
