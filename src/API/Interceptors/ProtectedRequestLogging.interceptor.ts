import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { RequestContext, UpstreamCallRecord } from 'src/Core/Logging/RequestContext';
import { RequestLoggingService } from 'src/Core/Logging/RequestLogging.service';

type AuthenticatedRequest = Request & {
   authUsername?: string;
};

/** Swagger and health traffic would only add noise to the log table. */
const IGNORED_PATH_PATTERNS = [/\/docs(\/|$|-json)/i, /\/health$/i, /favicon\.ico$/i];

@Injectable()
export class ProtectedRequestLoggingInterceptor implements NestInterceptor {
   private readonly logger = new Logger('InboundHttp');
   private readonly slowRequestWarnMs: number;

   constructor(
      private readonly requestLoggingService: RequestLoggingService,
      private readonly configService: ConfigService,
   ) {
      const raw = Number(this.configService.get<string>('SLOW_REQUEST_WARN_MS'));
      this.slowRequestWarnMs = Number.isFinite(raw) && raw > 0 ? raw : 5_000;
   }

   intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
      if (context.getType() !== 'http') {
         return next.handle();
      }

      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest<AuthenticatedRequest>();
      const response = httpContext.getResponse<Response>();

      const method = request.method;
      const path = request.originalUrl || request.url;

      if (IGNORED_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
         return next.handle();
      }

      const username = request.authUsername || this.extractUsernameFromAuthHeader(request) || null;
      const ip = request.ip || null;
      const requestId = RequestContext.getRequestId();
      const startedAt = Date.now();

      RequestContext.setUsername(username);

      return next.handle().pipe(
         tap(() => {
            this.record({
               requestId,
               username,
               method,
               path,
               statusCode: response.statusCode,
               ip,
               request,
               error: null,
               startedAt,
            });
         }),
         catchError((error) => {
            this.record({
               requestId,
               username,
               method,
               path,
               statusCode: (error?.status as number) || response.statusCode || 500,
               ip,
               request,
               error: error?.message ? String(error.message) : 'Unhandled error',
               startedAt,
            });

            return throwError(() => error);
         }),
      );
   }

   private record(input: {
      requestId: string | null;
      username: string | null;
      method: string;
      path: string;
      statusCode: number;
      ip: string | null;
      request: AuthenticatedRequest;
      error: string | null;
      startedAt: number;
   }): void {
      const durationMs = Date.now() - input.startedAt;
      const upstreamCalls = RequestContext.getUpstreamCalls();
      const upstreamMs = upstreamCalls.reduce((total, call) => total + call.durationMs, 0);

      const payload = JSON.stringify({
         event: 'inbound_request',
         requestId: input.requestId,
         username: input.username,
         method: input.method,
         path: input.path.split('?')[0],
         statusCode: input.statusCode,
         durationMs,
         upstreamMs,
         // Time not explained by third party calls: our own parsing, DB and mapping.
         selfMs: Math.max(durationMs - upstreamMs, 0),
         upstreamCalls: upstreamCalls.length,
         slowest: this.slowestCall(upstreamCalls),
         error: input.error || undefined,
      });

      if (input.error) {
         this.logger.error(payload);
      } else if (durationMs >= this.slowRequestWarnMs) {
         this.logger.warn(payload);
      } else {
         this.logger.log(payload);
      }

      void this.requestLoggingService.createLog({
         requestId: input.requestId,
         username: input.username,
         method: input.method,
         path: input.path,
         statusCode: input.statusCode,
         ip: input.ip,
         body: input.request.body,
         query: input.request.query,
         error: input.error,
         durationMs,
         upstreamMs,
         upstreamCalls,
      });
   }

   private slowestCall(calls: UpstreamCallRecord[]): string | undefined {
      if (!calls.length) {
         return undefined;
      }

      const slowest = calls.reduce((worst, call) =>
         call.durationMs > worst.durationMs ? call : worst,
      );

      return `${slowest.integration}:${slowest.durationMs}ms`;
   }

   private extractUsernameFromAuthHeader(request: Request): string | null {
      const authHeader = request.headers.authorization || '';
      if (!authHeader.startsWith('Basic ')) {
         return null;
      }

      const base64Credentials = authHeader.slice('Basic '.length).trim();
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const separatorIndex = decoded.indexOf(':');

      if (separatorIndex < 0) {
         return null;
      }

      return decoded.slice(0, separatorIndex).trim() || null;
   }
}
