import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { API_GLOBAL_PREFIX } from './API/Swagger/swagger.constants';
import { setupSwagger } from './API/Swagger/swagger.config';
import { REQUEST_ID_HEADER } from './Core/Logging/RequestContext';

const toNumber = (value: string | undefined, fallback: number): number => {
   const parsed = Number(value);
   return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

async function bootstrap() {
   const PORT = process.env.PORT || 3000;
   const app = await NestFactory.create(AppModule);
   app.setGlobalPrefix(API_GLOBAL_PREFIX);
   app.useGlobalPipes(new ValidationPipe({ transform: true }));

   morgan.token('request-id', (_req, res: any) => {
      const value = res.getHeader ? res.getHeader(REQUEST_ID_HEADER) : null;
      return value ? String(value) : '-';
   });

   app.use(
      morgan(
         ':remote-addr :method :url :status :res[content-length] - :response-time ms ' +
            'request-id=:request-id',
      ),
   );
   setupSwagger(app);

   const server = await app.listen(PORT, () => {
      console.log('Application started on PORT:', PORT);
      console.log(`Swagger UI available at /${API_GLOBAL_PREFIX}/docs`);
      console.log(`OpenAPI JSON available at /${API_GLOBAL_PREFIX}/docs-json`);
   });

   // Keep-alive must outlive the proxy/load balancer idle timeout, otherwise
   // clients see sporadic ECONNRESET that look like slow requests.
   server.keepAliveTimeout = toNumber(process.env.SERVER_KEEP_ALIVE_TIMEOUT_MS, 65_000);
   server.headersTimeout = server.keepAliveTimeout + 1_000;
   // Absolute ceiling for a single inbound request; 0 disables it.
   server.requestTimeout = toNumber(process.env.SERVER_REQUEST_TIMEOUT_MS, 60_000);
}
bootstrap();
