import {
   WISDM_DATE_PATTERN,
   WISDM_DIN_MAX_LENGTH,
   WISDM_DIN_MIN_LENGTH,
   WISDM_RETENTION_YEARS,
} from 'src/Core/Wisdm/Constants/wisdm.rules.constants';
import { WisdmDocumentClass, WisdmFraudType } from 'src/Core/Wisdm/Enums/wisdm.enums';

/**
 * Pure helpers for the WISDM slice. No Nest dependencies and no exceptions thrown here —
 * callers decide whether a `false` result is a `BadRequestException` or a soft skip, which
 * keeps these usable from both the Core service and the class-validator constraints.
 */

/**
 * Applies INTERPOL's DIN cleaning rule (§3.1.1): lower-case letters are upper-cased and
 * every character that is not alphanumeric is removed. The cleaned DIN is what INTERPOL
 * stores and what uniqueness is checked against, so we clean before sending rather than
 * letting the country and INTERPOL disagree about what was recorded.
 */
export const cleanDin = (value: string | undefined | null): string =>
   (value || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

/** True when the cleaned DIN satisfies the 5–25 valid-character rule. */
export const isValidDin = (value: string | undefined | null): boolean => {
   const cleaned = cleanDin(value);
   return cleaned.length >= WISDM_DIN_MIN_LENGTH && cleaned.length <= WISDM_DIN_MAX_LENGTH;
};

/**
 * Validates a `YYYYMMDD` string and rejects impossible calendar dates (e.g. `20250230`),
 * which a plain regex would happily accept.
 */
export const isValidWisdmDate = (value: string | undefined | null): boolean =>
   parseWisdmDate(value) !== null;

/** Parses `YYYYMMDD` into a UTC Date, or `null` when the value is not a real date. */
export const parseWisdmDate = (value: string | undefined | null): Date | null => {
   const raw = (value || '').trim();
   if (!WISDM_DATE_PATTERN.test(raw)) return null;

   const year = Number(raw.slice(0, 4));
   const month = Number(raw.slice(4, 6));
   const day = Number(raw.slice(6, 8));
   const date = new Date(Date.UTC(year, month - 1, day));

   const isRoundTrip =
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;

   return isRoundTrip ? date : null;
};

/** Formats a Date as `YYYYMMDD` in UTC. */
export const formatWisdmDate = (date: Date): string => {
   const year = String(date.getUTCFullYear()).padStart(4, '0');
   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
   const day = String(date.getUTCDate()).padStart(2, '0');
   return `${year}${month}${day}`;
};

/** Today at 00:00 UTC — the reference point for all past/future comparisons. */
export const startOfTodayUtc = (): Date => {
   const now = new Date();
   return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

/** True when the date is strictly before today (§3.1.1 "must be in the past"). */
export const isPastWisdmDate = (value: string | undefined | null): boolean => {
   const date = parseWisdmDate(value);
   return date !== null && date.getTime() < startOfTodayUtc().getTime();
};

/** True when the date is strictly after today (§3.1.1 "should be in the future"). */
export const isFutureWisdmDate = (value: string | undefined | null): boolean => {
   const date = parseWisdmDate(value);
   return date !== null && date.getTime() > startOfTodayUtc().getTime();
};

/** Compares two `YYYYMMDD` values; returns `null` when either one is unparseable. */
export const compareWisdmDates = (
   left: string | undefined | null,
   right: string | undefined | null,
): number | null => {
   const leftDate = parseWisdmDate(left);
   const rightDate = parseWisdmDate(right);
   if (!leftDate || !rightDate) return null;
   return leftDate.getTime() - rightDate.getTime();
};

/** Adds whole years to a date, staying in UTC. */
export const addYears = (date: Date, years: number): Date =>
   new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate()));

/** Adds whole months to a date, staying in UTC. */
export const addMonths = (date: Date, months: number): Date =>
   new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));

/**
 * Initial retention period in years for a record, per the 5/30/10 rule.
 * Returns `null` when the document class is unknown — in that case we do not second-guess
 * INTERPOL and let the upstream service apply its own retention rules.
 */
export const resolveRetentionYears = (
   documentClass: WisdmDocumentClass | undefined,
   fraudType: WisdmFraudType | undefined,
): number | null => {
   if (!documentClass) return null;

   const periods = WISDM_RETENTION_YEARS[documentClass];
   if (!periods) return null;

   const byFraudType = fraudType ? periods[fraudType] : undefined;
   return byFraudType ?? periods.default;
};

/**
 * Latest retention date a record may carry, as `YYYYMMDD`, or `null` when it cannot be
 * determined locally. Computed from the date of insertion (today), matching the manual's
 * "date of insertion + N years".
 */
export const resolveMaxRetentionDate = (
   documentClass: WisdmDocumentClass | undefined,
   fraudType: WisdmFraudType | undefined,
): string | null => {
   const years = resolveRetentionYears(documentClass, fraudType);
   if (years === null) return null;
   return formatWisdmDate(addYears(startOfTodayUtc(), years));
};

/** Trims a value and returns `undefined` for empty strings, so optional XML nodes are skipped. */
export const normalizeOptional = (value: string | undefined | null): string | undefined => {
   const trimmed = (value || '').trim();
   return trimmed === '' ? undefined : trimmed;
};

/** Normalizes an ICPO country code to the upper-case form INTERPOL expects. */
export const normalizeCountryCode = (value: string | undefined | null): string | undefined =>
   normalizeOptional(value)?.toUpperCase();

/** `YYYYMM` for a given date, used by the activity statistics operation. */
export const formatWisdmMonth = (date: Date): string =>
   `${String(date.getUTCFullYear()).padStart(4, '0')}${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

/** True when the value is a valid `YYYYMM` period. */
export const isValidWisdmMonth = (value: string | undefined | null): boolean => {
   const raw = (value || '').trim();
   if (!/^\d{6}$/.test(raw)) return false;
   const month = Number(raw.slice(4, 6));
   return month >= 1 && month <= 12;
};
