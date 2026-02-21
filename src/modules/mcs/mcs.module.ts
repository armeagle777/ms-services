import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { McsController } from './mcs.controller';
import { McsService } from './mcs.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [McsController],
  providers: [McsService],
  exports: [McsService],
})
export class McsModule {}
