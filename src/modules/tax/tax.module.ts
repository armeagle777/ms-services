import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';
import { EkengIntegration } from '../shared/ekeng.integration';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TaxController],
  providers: [TaxService, EkengIntegration],
  exports: [TaxService],
})
export class TaxModule {}
