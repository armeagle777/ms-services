import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUTH_REQUEST_LOG_MODEL } from 'src/Infrustructure/Database/database.tokens';
import { RequestLogEntity } from 'src/Infrustructure/Database/Entities/RequestLog.entity';

export type CreateRequestLogInput = {
   username: string | null;
   method: string;
   path: string;
   statusCode: number;
   ip: string | null;
   body: unknown;
   query: unknown;
   error: string | null;
};

@Injectable()
export class RequestLoggingService {
   private readonly logger = new Logger(RequestLoggingService.name);

   constructor(
      @Inject(AUTH_REQUEST_LOG_MODEL)
      private readonly requestLogModel: typeof RequestLogEntity,
   ) {}

   async createLog(input: CreateRequestLogInput): Promise<void> {
      try {
         await this.requestLogModel.create({
            username: input.username,
            method: input.method,
            path: input.path,
            statusCode: input.statusCode,
            ip: input.ip,
            body: this.safeStringify(input.body),
            query: this.safeStringify(input.query),
            error: input.error,
         });
      } catch (error) {
         this.logger.error(
            'Failed to persist request log',
            error instanceof Error ? error.stack : String(error),
         );
      }
   }

   private safeStringify(value: unknown): string | null {
      if (value === undefined || value === null) {
         return null;
      }

      try {
         return JSON.stringify(value);
      } catch {
         return String(value);
      }
   }
}
