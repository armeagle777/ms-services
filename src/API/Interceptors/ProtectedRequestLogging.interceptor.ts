import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { RequestLoggingService } from 'src/Core/Logging/RequestLogging.service';

type AuthenticatedRequest = Request & {
   authUsername?: string;
};

@Injectable()
export class ProtectedRequestLoggingInterceptor implements NestInterceptor {
   constructor(private readonly requestLoggingService: RequestLoggingService) {}

   intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest<AuthenticatedRequest>();
      const response = httpContext.getResponse<Response>();

      const username = request.authUsername || this.extractUsernameFromAuthHeader(request) || null;
      const method = request.method;
      const path = request.originalUrl || request.url;
      const ip = request.ip || null;

      return next.handle().pipe(
         tap(() => {
            void this.requestLoggingService.createLog({
               username,
               method,
               path,
               statusCode: response.statusCode,
               ip,
               body: request.body,
               query: request.query,
               error: null,
            });
         }),
         catchError((error) => {
            void this.requestLoggingService.createLog({
               username,
               method,
               path,
               statusCode: (error?.status as number) || response.statusCode || 500,
               ip,
               body: request.body,
               query: request.query,
               error: error?.message ? String(error.message) : 'Unhandled error',
            });

            return throwError(() => error);
         }),
      );
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
