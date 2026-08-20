import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { REQUEST_ID_HEADER, RequestContext } from 'src/Core/Logging/RequestContext';

/**
 * Opens an AsyncLocalStorage scope for every inbound request so that guards,
 * services, integrations and the outbound HTTP instrumentation all share the
 * same correlation id and timing bucket.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
   use(request: Request, response: Response, next: NextFunction): void {
      const incomingId = request.headers[REQUEST_ID_HEADER];
      const requestId = Array.isArray(incomingId) ? incomingId[0] : incomingId;

      const store = RequestContext.create(requestId || undefined);
      response.setHeader(REQUEST_ID_HEADER, store.requestId);

      RequestContext.run(store, () => next());
   }
}
