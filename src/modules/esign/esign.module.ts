import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { EsignController } from './esign.controller';
import { EsignService } from './esign.service';
import { PkiClientService } from './pki-client.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [EsignController],
  providers: [EsignService, PkiClientService],
  exports: [EsignService],
})
export class EsignModule {}
