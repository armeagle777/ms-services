import type { ResultCodeMeta } from 'src/Infrustructure/Services/InterpolIntegration/Models/interpol.types';
import type { WisdmFunctionalErrorKey } from 'src/Core/Wisdm/Constants/wisdm.rules.constants';
import type { WisdmReferenceTable, WisdmStatisticsAction } from 'src/Core/Wisdm/Enums/wisdm.enums';

/** Raw outcome of a WISDM SOAP round trip. */
export type WisdmSoapCallResult = {
   status: number;
   xml: string;
   requestXml: string;
};

/**
 * Shared envelope of every WISDM response. Mirrors the shape already used by the FIND
 * integration (`BaseResponse`) so consumers can handle both services the same way, with
 * one addition: `functionalError`, which carries the §3.1.1 functional error catalogue.
 */
export type WisdmBaseResponse = {
   ok: boolean;
   httpStatus: number;
   fault: string | null;
   resultCode: string | null;
   resultOtherCode: string | null;
   resultCodeMeta: ResultCodeMeta;
   /** Populated when upstream rejected the request for a documented functional reason. */
   functionalError: {
      key: WisdmFunctionalErrorKey;
      message: string;
   } | null;
};

/* -------------------------------------------------------------------------- */
/*  Record management (§3.1)                                                   */
/* -------------------------------------------------------------------------- */

/** Normalized payload handed to the integration layer by the Core service. */
export type WisdmRecordParams = {
   /** Cleaned DIN: uppercased, non-alphanumeric characters stripped. */
   din: string;
   typeOfDocument: string;
   fraudType?: string;
   stolenBatchIdentifier?: string;
   countryOfTheft?: string;
   /** `YYYYMMDD`. */
   dateOfTheft?: string;
   /** `YYYYMMDD`. */
   documentIssuanceDate?: string;
   /** `YYYYMMDD`. */
   documentExpiryDate?: string;
   nationalReferenceNumber?: string;
   ncbReferenceNumber?: string;
   additionalInformation?: string;
   /** `YYYYMMDD`. Omitted means "let INTERPOL apply the default retention rules". */
   recordRetentionDate?: string;
   extensionReason?: string;
};

/** Identity of a single record: DIN plus type of document (§3.1.3). */
export type WisdmRecordIdentifier = {
   din: string;
   typeOfDocument: string;
};

/** Retention-date change (§3.1.2, administrative part). */
export type WisdmRetentionParams = WisdmRecordIdentifier & {
   /** `YYYYMMDD`, must be in the future. */
   recordRetentionDate: string;
   extensionReason: string;
};

/** Result of create/update/delete/extend — the manual guarantees an immediate answer. */
export type WisdmMutationResponse = WisdmBaseResponse & {
   din: string;
   typeOfDocument: string;
   /** Echo of the retention date applied by INTERPOL, when returned. */
   recordRetentionDate: string | null;
   xmlData: Record<string, unknown> | null;
};

/* -------------------------------------------------------------------------- */
/*  Data management (§3.2)                                                     */
/* -------------------------------------------------------------------------- */

/** Full properties of one record (§3.2.1). */
export type WisdmDocumentProperties = {
   din: string;
   countryOfRegistration: string;
   typeOfDocument: string;
   fraudType: string;
   stolenBatchIdentifier: string;
   countryOfTheft: string;
   dateOfTheft: string;
   documentIssuanceDate: string;
   documentExpiryDate: string;
   nationalReferenceNumber: string;
   ncbReferenceNumber: string;
   additionalInformation: string;
   recordRetentionDate: string;
};

export type WisdmDocumentResponse = WisdmBaseResponse & {
   document: WisdmDocumentProperties | null;
   xmlData: Record<string, unknown> | null;
};

/** Total number of records held for one document type (§3.2.2). */
export type WisdmCountResponse = WisdmBaseResponse & {
   typeOfDocument: string;
   total: number | null;
   /** When INTERPOL computed the figure — statistics are recalculated once a day. */
   computedAt: string | null;
};

/** One month of data-management activity for one document type (§3.2.3). */
export type WisdmActivityEntry = {
   /** `YYYYMM`. */
   period: string;
   typeOfDocument: string;
   action: WisdmStatisticsAction;
   total: number;
};

export type WisdmActivityResponse = WisdmBaseResponse & {
   entries: WisdmActivityEntry[];
};

/** One row of an INTERPOL reference table (§5.3.1). */
export type WisdmReferenceEntry = {
   code: string;
   label: string;
   /** Any additional columns the table carries, kept verbatim. */
   attributes: Record<string, string>;
};

export type WisdmReferenceTableResponse = WisdmBaseResponse & {
   table: WisdmReferenceTable;
   entries: WisdmReferenceEntry[];
};

/** Record approaching (or past) its retention date (§3.2.5). */
export type WisdmExpiringRecord = {
   din: string;
   typeOfDocument: string;
   /** `YYYYMMDD`. */
   recordRetentionDate: string;
   /** True when INTERPOL has already removed the record for retention expiry. */
   alreadyDeleted: boolean;
};

export type WisdmExpiryAlertsResponse = WisdmBaseResponse & {
   monthsAhead: number;
   records: WisdmExpiringRecord[];
   /** The alarm text returned alongside the list, when present. */
   alarmMessage: string | null;
};

/* -------------------------------------------------------------------------- */
/*  Initialization sequence (§3.2.4)                                           */
/* -------------------------------------------------------------------------- */

export type WisdmInitStepResponse = WisdmBaseResponse & {
   xmlData: Record<string, unknown> | null;
};

/** Outcome of the orchestrated init → bulk insert → finalize run. */
export type WisdmInitializationResult = {
   ok: boolean;
   started: WisdmInitStepResponse;
   inserted: {
      total: number;
      succeeded: number;
      failed: number;
      failures: Array<{ din: string; typeOfDocument: string; reason: string }>;
   };
   finalized: WisdmInitStepResponse | null;
   /**
    * Set when the run stopped before `FinalizeInit`. Until finalize is called the
    * previous records stay searchable, so an aborted run is recoverable.
    */
   abortedReason: string | null;
};
