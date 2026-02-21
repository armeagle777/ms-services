import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PersonsController],
  providers: [PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
