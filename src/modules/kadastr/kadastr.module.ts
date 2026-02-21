import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { KadastrController } from './kadastr.controller';
import { KadastrService } from './kadastr.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [KadastrController],
  providers: [KadastrService],
  exports: [KadastrService],
})
export class KadastrModule {}
