import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { McsService } from 'src/Core/Mcs/Mcs.service';
import { McsAddressQueryDto, McsSearchPersonsDto } from 'src/API/DTO/Mcs/mcs.dto';

@Controller('ic')
export class IcController {
   constructor(private readonly mcsService: McsService) {}

   @Post('persons/search')
   searchPersons(@Body() body: McsSearchPersonsDto) {
      return this.mcsService.searchPersons(body);
   }
}
