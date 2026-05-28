import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { API_GLOBAL_PREFIX } from './API/Swagger/swagger.constants';
import { setupSwagger } from './API/Swagger/swagger.config';

async function bootstrap() {
   const PORT = process.env.PORT || 3000;
   const app = await NestFactory.create(AppModule);
   app.setGlobalPrefix(API_GLOBAL_PREFIX);
   app.useGlobalPipes(new ValidationPipe({}));
   app.use(morgan('combined'));
   setupSwagger(app);

   await app.listen(PORT, () => {
      console.log('Application started on PORT:', PORT);
      console.log(`Swagger UI available at /${API_GLOBAL_PREFIX}/docs`);
      console.log(`OpenAPI JSON available at /${API_GLOBAL_PREFIX}/docs-json`);
   });
}
bootstrap();
