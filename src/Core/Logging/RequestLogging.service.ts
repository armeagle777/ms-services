import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
   AUTH_INTEGRATION_CALL_LOG_MODEL,
   AUTH_REQUEST_LOG_MODEL,
} from 'src/Infrustructure/Database/database.tokens';
import { IntegrationCallLogEntity } from 'src/Infrustructure/Database/Entities/IntegrationCallLog.entity';
import { RequestLogEntity } from 'src/Infrustructure/Database/Entities/RequestLog.entity';
import { UpstreamCallRecord } from './RequestContext';

export type CreateRequestLogInput = {
   requestId: string | null;
   username: string | null;
   method: string;
   path: string;
   statusCode: number;
   ip: string | null;
   body: unknown;
   query: unknown;
   error: string | null;
   durationMs: number | null;
   upstreamMs: number | null;
   upstreamCalls: UpstreamCallRecord[];
};

export type CreateIntegrationLogInput = {
   requestId: string | null;
   integration: string;
   method: string;
   url: string;
   statusCode: number | null;
   durationMs: number;
   attempts: number;
   timedOut: boolean;
   error: string | null;
};

/** Payloads are truncated so a large upstream body cannot bloat the log table. */
const MAX_PAYLOAD_LENGTH = 8_000;

@Injectable()
export class RequestLoggingService {
   private readonly logger = new Logger(RequestLoggingService.name);
   private readonly logPayloads: boolean;

   constructor(
      @Inject(AUTH_REQUEST_LOG_MODEL)
      private readonly requestLogModel: typeof RequestLogEntity,
      @Inject(AUTH_INTEGRATION_CALL_LOG_MODEL)
      private readonly integrationCallLogModel: typeof IntegrationCallLogEntity,
      private readonly configService: ConfigService,
   ) {
      const raw = this.configService.get<string>('LOG_REQUEST_BODIES');
      this.logPayloads = raw === undefined || raw === '' ? true : raw.toLowerCase() === 'true';
   }

   async createLog(input: CreateRequestLogInput): Promise<void> {
      try {
         await this.requestLogModel.create({
            requestId: input.requestId,
            username: input.username,
            method: input.method,
            path: input.path,
            statusCode: input.statusCode,
            ip: input.ip,
            body: this.logPayloads ? this.safeStringify(input.body) : null,
            query: this.logPayloads ? this.safeStringify(input.query) : null,
            error: input.error,
            durationMs: input.durationMs,
            upstreamMs: input.upstreamMs,
            upstreamCalls: this.summarizeUpstreamCalls(input.upstreamCalls),
         });
      } catch (error) {
         this.logger.error(
            'Failed to persist request log',
            error instanceof Error ? error.stack : String(error),
         );
      }
   }

   async createIntegrationLog(input: CreateIntegrationLogInput): Promise<void> {
      try {
         await this.integrationCallLogModel.create({
            requestId: input.requestId,
            integration: input.integration,
            method: input.method,
            url: input.url,
            statusCode: input.statusCode,
            durationMs: input.durationMs,
            attempts: input.attempts,
            timedOut: input.timedOut,
            error: input.error ? input.error.slice(0, MAX_PAYLOAD_LENGTH) : null,
         });
      } catch (error) {
         this.logger.error(
            'Failed to persist integration call log',
            error instanceof Error ? error.stack : String(error),
         );
      }
   }

   /** Compact per-request breakdown: which upstream took how long. */
   private summarizeUpstreamCalls(calls: UpstreamCallRecord[]): string | null {
      if (!calls || calls.length === 0) {
         return null;
      }

      return this.safeStringify(
         calls.map((call) => ({
            integration: call.integration,
            durationMs: call.durationMs,
            statusCode: call.statusCode,
            attempts: call.attempts,
            timedOut: call.timedOut || undefined,
            error: call.error || undefined,
         })),
      );
   }

   private safeStringify(value: unknown): string | null {
      if (value === undefined || value === null) {
         return null;
      }

      try {
         const serialized = JSON.stringify(value);
         if (serialized === undefined) {
            return null;
         }
         return serialized.length > MAX_PAYLOAD_LENGTH
            ? `${serialized.slice(0, MAX_PAYLOAD_LENGTH)}...[truncated]`
            : serialized;
      } catch {
         return String(value).slice(0, MAX_PAYLOAD_LENGTH);
      }
   }
}
