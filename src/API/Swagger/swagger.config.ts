import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { OPENAPI_JSON_PATH, SWAGGER_PATH } from './swagger.constants';

export function setupSwagger(app: INestApplication) {
   const config = new DocumentBuilder()
      .setTitle('MS Services API')
      .setDescription('OpenAPI documentation for the MS Services Nest API.')
      .setVersion('1.0')
      .addBasicAuth(
         {
            type: 'http',
            scheme: 'basic',
            description: 'HTTP Basic authentication',
         },
         'basic',
      )
      .build();

   const document = SwaggerModule.createDocument(app, config);
   document.security = [{ basic: [] }];

   SwaggerModule.setup(SWAGGER_PATH, app, document, {
      jsonDocumentUrl: OPENAPI_JSON_PATH,
      swaggerOptions: {
         persistAuthorization: true,
      },
      customSiteTitle: 'MS Services API Docs',
   });
}
