import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { PetregistrController } from './petregistr.controller';
import { PetregistrService } from './petregistr.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PetregistrController],
  providers: [PetregistrService],
  exports: [PetregistrService],
})
export class PetregistrModule {}
