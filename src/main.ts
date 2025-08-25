import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
   const PORT = process.env.PORT || 3000;
   const HOST = process.env.host || '0.0.0.0';
   const app = await NestFactory.create(AppModule);
   app.setGlobalPrefix('api');
   app.useGlobalPipes(new ValidationPipe({}));
   app.use(morgan('combined'));

   await app.listen(PORT, HOST);
}
bootstrap();
