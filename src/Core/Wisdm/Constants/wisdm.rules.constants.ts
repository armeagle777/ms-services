import { WisdmDocumentClass, WisdmFraudType } from 'src/Core/Wisdm/Enums/wisdm.enums';

/**
 * Business rules taken from "WISDM SLTD/SAD Functional description" (v1.2, 17/08/2016),
 * section 3. Everything that is a *rule* (lengths, formats, retention periods) lives
 * here; everything that is *protocol* (SOAP operation names, namespaces) lives in
 * `src/Infrustructure/Services/WisdmIntegration/Constants/wisdm.constants.ts`.
 */

/** §3.1.1 — "Must be at least 5 valid characters [A-Z, a-z, 0-9]. Maximum 25 characters." */
export const WISDM_DIN_MIN_LENGTH = 5;
export const WISDM_DIN_MAX_LENGTH = 25;

/** Characters kept by the DIN cleaning routine; everything else is stripped. */
export const WISDM_DIN_ALLOWED_PATTERN = /^[A-Z0-9]+$/;

/** §3.1.1 — free-text field limits (character counts, not bytes). */
export const WISDM_STOLEN_BATCH_IDENTIFIER_MAX_LENGTH = 25;
export const WISDM_NATIONAL_REFERENCE_MAX_LENGTH = 25;
export const WISDM_NCB_REFERENCE_MAX_LENGTH = 25;
export const WISDM_ADDITIONAL_INFORMATION_MAX_LENGTH = 40;

/** Type of document codes are short mnemonics from `IPSGT_Document_Type` (e.g. `PAS`). */
export const WISDM_DOCUMENT_TYPE_MAX_LENGTH = 10;

/** ICPO country codes from `IPSGT_ICPO_Countries` (e.g. `ARM`, `FRA`). */
export const WISDM_COUNTRY_CODE_PATTERN = /^[A-Z]{2,3}$/;

/** §3.1.1 — "Date format is YYYYMMDD." */
export const WISDM_DATE_FORMAT = 'YYYYMMDD';
export const WISDM_DATE_PATTERN = /^\d{8}$/;

/**
 * Initial retention periods, in years, per the IPSG letter of 19/02/2026 and §3.2.5:
 * 5 years for stolen/lost/revoked travel documents, 30 years for stolen blank travel
 * documents, 10 years for stolen administrative documents.
 *
 * Note: §3.1.1 of the functional description also mentions a flat "date of insertion +
 * 10 years" default. Where the two disagree we follow the 5/30/10 split, which is the
 * rule repeated in both the 2026 letter and §3.2.5.
 */
export const WISDM_RETENTION_YEARS_TRAVEL_DOCUMENT = 5;
export const WISDM_RETENTION_YEARS_STOLEN_BLANK = 30;
export const WISDM_RETENTION_YEARS_ADMINISTRATIVE = 10;

/**
 * Retention period lookup used to reject a `recordRetentionDate` that exceeds the
 * country/initial retention period before the request ever leaves us.
 * Only applied when the caller tells us the document class — otherwise INTERPOL decides.
 */
export const WISDM_RETENTION_YEARS: Record<
   WisdmDocumentClass,
   Partial<Record<WisdmFraudType, number>> & { default: number }
> = {
   [WisdmDocumentClass.STD]: {
      default: WISDM_RETENTION_YEARS_TRAVEL_DOCUMENT,
      [WisdmFraudType.STOLEN]: WISDM_RETENTION_YEARS_TRAVEL_DOCUMENT,
      [WisdmFraudType.LOST]: WISDM_RETENTION_YEARS_TRAVEL_DOCUMENT,
      [WisdmFraudType.REVOKED]: WISDM_RETENTION_YEARS_TRAVEL_DOCUMENT,
      [WisdmFraudType.STOLEN_BLANK]: WISDM_RETENTION_YEARS_STOLEN_BLANK,
   },
   [WisdmDocumentClass.SAD]: {
      default: WISDM_RETENTION_YEARS_ADMINISTRATIVE,
   },
};

/** §3.2.5 — the alert window for records approaching their retention date. */
export const WISDM_EXPIRY_ALERT_WINDOW_MONTHS = 6;

/** Guard rail for the bulk insert used by the initialization sequence. */
export const WISDM_BULK_MAX_RECORDS = 500;

/**
 * Functional error catalogue (§3.1.1, §3.1.3, §3.2.1). Upstream returns a code; we map it
 * to a stable key plus a human-readable explanation so callers do not have to parse text.
 * `appliesTo` mirrors the "Creation (C) / Update (U)" column of the manual.
 */
export type WisdmFunctionalErrorKey =
   | 'DIN_ALREADY_PRESENT'
   | 'DIN_FORMAT_INVALID'
   | 'DOCUMENT_TYPE_INVALID'
   | 'FRAUD_TYPE_INVALID'
   | 'COUNTRY_OF_THEFT_INVALID'
   | 'COUNTRY_OF_THEFT_MISSING'
   | 'STOLEN_BATCH_IDENTIFIER_NOT_ALLOWED'
   | 'DATE_FORMAT_INVALID'
   | 'DATE_OF_THEFT_NOT_IN_PAST'
   | 'ISSUANCE_DATE_NOT_IN_PAST'
   | 'RETENTION_DATE_NOT_IN_FUTURE'
   | 'RETENTION_DATE_EXCEEDS_PERIOD'
   | 'EXTENSION_REASON_INVALID'
   | 'FIELD_TOO_LONG'
   | 'RECORD_NOT_FOUND';

export type WisdmFunctionalError = {
   key: WisdmFunctionalErrorKey;
   /** `C` = creation, `U` = update, `D` = delete/search. */
   appliesTo: Array<'C' | 'U' | 'D'>;
   message: string;
};

export const WISDM_FUNCTIONAL_ERRORS: Record<WisdmFunctionalErrorKey, WisdmFunctionalError> = {
   DIN_ALREADY_PRESENT: {
      key: 'DIN_ALREADY_PRESENT',
      appliesTo: ['C'],
      message: 'The document with this cleaned DIN is already in the database.',
   },
   DIN_FORMAT_INVALID: {
      key: 'DIN_FORMAT_INVALID',
      appliesTo: ['C', 'U', 'D'],
      message: `The DIN is either less than ${WISDM_DIN_MIN_LENGTH} or more than ${WISDM_DIN_MAX_LENGTH} valid characters.`,
   },
   DOCUMENT_TYPE_INVALID: {
      key: 'DOCUMENT_TYPE_INVALID',
      appliesTo: ['C', 'U', 'D'],
      message: 'The type of document does not belong to the authorized values.',
   },
   FRAUD_TYPE_INVALID: {
      key: 'FRAUD_TYPE_INVALID',
      appliesTo: ['C'],
      message: 'The type of fraud does not belong to the authorized values.',
   },
   COUNTRY_OF_THEFT_INVALID: {
      key: 'COUNTRY_OF_THEFT_INVALID',
      appliesTo: ['C', 'U'],
      message: 'The country of theft does not belong to the authorized values.',
   },
   COUNTRY_OF_THEFT_MISSING: {
      key: 'COUNTRY_OF_THEFT_MISSING',
      appliesTo: ['C', 'U'],
      message: 'The country of theft is missing.',
   },
   STOLEN_BATCH_IDENTIFIER_NOT_ALLOWED: {
      key: 'STOLEN_BATCH_IDENTIFIER_NOT_ALLOWED',
      appliesTo: ['C', 'U'],
      message: 'Stolen batch identifier is only accepted when the type of fraud is stolen blank.',
   },
   DATE_FORMAT_INVALID: {
      key: 'DATE_FORMAT_INVALID',
      appliesTo: ['C', 'U'],
      message: `Date of theft, issuance date, expiry date and retention date must be ${WISDM_DATE_FORMAT}.`,
   },
   DATE_OF_THEFT_NOT_IN_PAST: {
      key: 'DATE_OF_THEFT_NOT_IN_PAST',
      appliesTo: ['C', 'U'],
      message: 'The date of theft must be in the past.',
   },
   ISSUANCE_DATE_NOT_IN_PAST: {
      key: 'ISSUANCE_DATE_NOT_IN_PAST',
      appliesTo: ['C', 'U'],
      message: 'The document issuance date must be in the past.',
   },
   RETENTION_DATE_NOT_IN_FUTURE: {
      key: 'RETENTION_DATE_NOT_IN_FUTURE',
      appliesTo: ['C', 'U'],
      message: 'The record retention date must be in the future.',
   },
   RETENTION_DATE_EXCEEDS_PERIOD: {
      key: 'RETENTION_DATE_EXCEEDS_PERIOD',
      appliesTo: ['C', 'U'],
      message: 'The record retention date exceeds the initial or country retention period.',
   },
   EXTENSION_REASON_INVALID: {
      key: 'EXTENSION_REASON_INVALID',
      appliesTo: ['U'],
      message: 'The reason for extension does not belong to the authorized values.',
   },
   FIELD_TOO_LONG: {
      key: 'FIELD_TOO_LONG',
      appliesTo: ['C', 'U'],
      message:
         'Stolen batch identifier, national reference, NCB reference or additional information is longer than allowed.',
   },
   RECORD_NOT_FOUND: {
      key: 'RECORD_NOT_FOUND',
      appliesTo: ['U', 'D'],
      message: 'The record could not be found in the database.',
   },
};
