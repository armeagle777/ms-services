import type {
   KnownResultCodeKey,
   ResultCodeKey,
   ResultCodeMeta,
} from 'src/Infrustructure/Services/InterpolIntegration/Models/interpol.types';

/**
 * INTERPOL result codes, shared by the FIND (search) and WISDM (data management)
 * integrations — both services return the same `resultCode` vocabulary in the SOAP body.
 *
 * Extracted from `Interpol.integration.ts` so WISDM does not have to duplicate the table.
 */

const RESULT_CODE_VALUES: Record<KnownResultCodeKey, number> = {
   NO_ERROR: 0,
   NO_ANSWER: 1,
   INVALID_SEARCH_ERROR: 2,
   UNEXPECTED_ERROR: 3,
   TOO_MANY_ANSWER: 4,
   ACCESS_DENIED: 5,
   OTHER_ERROR_CODE: 6,
   TIME_OUT: 7,
};

const RESULT_CODE_KEYS: Record<number, KnownResultCodeKey> = {
   0: 'NO_ERROR',
   1: 'NO_ANSWER',
   2: 'INVALID_SEARCH_ERROR',
   3: 'UNEXPECTED_ERROR',
   4: 'TOO_MANY_ANSWER',
   5: 'ACCESS_DENIED',
   6: 'OTHER_ERROR_CODE',
   7: 'TIME_OUT',
};

const DESCRIPTIONS: Record<
   ResultCodeKey,
   Omit<ResultCodeMeta, 'key' | 'numericValue' | 'isKnown'>
> = {
   NO_ERROR: {
      description: 'No error, request succeeded and result is not empty.',
      retryable: false,
      requiresQueryRefinement: false,
      accessDenied: false,
   },
   NO_ANSWER: {
      description: 'No error, request succeeded and result is empty.',
      retryable: false,
      requiresQueryRefinement: false,
      accessDenied: false,
   },
   INVALID_SEARCH_ERROR: {
      description:
         'Invalid search parameters were provided. Use requestId and timestamp for IPSG traceability.',
      retryable: false,
      requiresQueryRefinement: true,
      accessDenied: false,
   },
   UNEXPECTED_ERROR: {
      description:
         'Unexpected server-side error. Use requestId and timestamp to investigate with IPSG.',
      retryable: true,
      requiresQueryRefinement: false,
      accessDenied: false,
   },
   TOO_MANY_ANSWER: {
      description: 'Too many answers. Narrow search parameters to reduce result size.',
      retryable: false,
      requiresQueryRefinement: true,
      accessDenied: false,
   },
   ACCESS_DENIED: {
      description:
         'Access denied for this web service or data. Verify credentials and permissions.',
      retryable: false,
      requiresQueryRefinement: false,
      accessDenied: true,
   },
   OTHER_ERROR_CODE: {
      description:
         'Source database returned an error. Inspect resultOtherCode for additional details.',
      retryable: false,
      requiresQueryRefinement: false,
      accessDenied: false,
   },
   TIME_OUT: {
      description: 'Execution timed out while processing the request.',
      retryable: true,
      requiresQueryRefinement: false,
      accessDenied: false,
   },
   UNKNOWN: {
      description: 'Unknown resultCode returned by upstream service.',
      retryable: false,
      requiresQueryRefinement: false,
      accessDenied: false,
   },
};

/** Resolves a raw `resultCode` (numeric or symbolic) into structured metadata. */
export const evaluateResultCode = (resultCode: string | null): ResultCodeMeta => {
   const normalized = (resultCode || '').trim().toUpperCase();

   const numericCandidate = Number(normalized);
   const keyFromNumber =
      normalized !== '' && Number.isFinite(numericCandidate)
         ? RESULT_CODE_KEYS[numericCandidate]
         : undefined;
   const keyFromString = normalized as KnownResultCodeKey;
   const key: ResultCodeKey =
      keyFromNumber ||
      (Object.prototype.hasOwnProperty.call(RESULT_CODE_VALUES, keyFromString)
         ? keyFromString
         : 'UNKNOWN');

   return {
      key,
      numericValue: key === 'UNKNOWN' ? null : RESULT_CODE_VALUES[key],
      isKnown: key !== 'UNKNOWN',
      ...DESCRIPTIONS[key],
   };
};
