import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { MojCesController } from './moj-ces.controller';
import { MojCesService } from './moj-ces.service';
import { EkengIntegration } from '../shared/ekeng.integration';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [MojCesController],
  providers: [MojCesService, EkengIntegration],
  exports: [MojCesService],
})
export class MojCesModule {}
