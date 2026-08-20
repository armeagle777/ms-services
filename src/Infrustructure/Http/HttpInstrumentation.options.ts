import { ConfigService } from '@nestjs/config';

/**
 * How aggressively non-idempotent requests (POST/PUT/PATCH/DELETE) may be retried.
 * Most upstreams here are read-only lookups exposed over POST, but retrying a
 * request that may already have been processed is a business decision, so the
 * conservative default only retries when the connection never produced a response.
 */
export type UnsafeRetryMode = 'never' | 'connection-errors-only' | 'always';

export type HttpInstrumentationOptions = {
   /** Applied to any outbound request that does not set its own timeout. */
   defaultTimeoutMs: number;
   /** Number of *extra* attempts after the first one. 0 disables retries. */
   retryAttempts: number;
   retryBaseDelayMs: number;
   retryMaxDelayMs: number;
   unsafeRetryMode: UnsafeRetryMode;
   keepAlive: boolean;
   maxSockets: number;
   maxFreeSockets: number;
   /** Outbound calls slower than this are logged at warn level. */
   slowUpstreamWarnMs: number;
   /** Persist one row per outbound call into integration_call_logs. */
   persistUpstreamCalls: boolean;
   /** Query strings often carry personal data (SSN, document numbers). Off by default. */
   logUpstreamQuery: boolean;
};

const toNumber = (value: string | undefined, fallback: number): number => {
   const parsed = Number(value);
   return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
   if (value === undefined || value === '') {
      return fallback;
   }
   return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const toUnsafeRetryMode = (value: string | undefined): UnsafeRetryMode => {
   if (value === 'never' || value === 'always' || value === 'connection-errors-only') {
      return value;
   }
   return 'connection-errors-only';
};

export const resolveHttpInstrumentationOptions = (
   configService: ConfigService,
): HttpInstrumentationOptions => ({
   defaultTimeoutMs: toNumber(configService.get<string>('HTTP_DEFAULT_TIMEOUT_MS'), 15_000),
   retryAttempts: toNumber(configService.get<string>('HTTP_RETRY_ATTEMPTS'), 2),
   retryBaseDelayMs: toNumber(configService.get<string>('HTTP_RETRY_BASE_DELAY_MS'), 200),
   retryMaxDelayMs: toNumber(configService.get<string>('HTTP_RETRY_MAX_DELAY_MS'), 2_000),
   unsafeRetryMode: toUnsafeRetryMode(configService.get<string>('HTTP_RETRY_UNSAFE_METHODS')),
   keepAlive: toBoolean(configService.get<string>('HTTP_KEEP_ALIVE'), true),
   maxSockets: toNumber(configService.get<string>('HTTP_MAX_SOCKETS'), 64),
   maxFreeSockets: toNumber(configService.get<string>('HTTP_MAX_FREE_SOCKETS'), 16),
   slowUpstreamWarnMs: toNumber(configService.get<string>('SLOW_UPSTREAM_WARN_MS'), 3_000),
   persistUpstreamCalls: toBoolean(configService.get<string>('LOG_UPSTREAM_CALLS_TO_DB'), true),
   logUpstreamQuery: toBoolean(configService.get<string>('LOG_UPSTREAM_QUERY'), false),
});
