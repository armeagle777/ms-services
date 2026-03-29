import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { MigrationCitizenService } from 'src/Core/MigrationCitizenService/MigrationCitizenService.service';
import { McsAddressQueryDto, McsSearchPersonsDto } from 'src/API/DTO/Mcs/mcs.dto';

@Controller('mcs')
export class McsController {
   constructor(private readonly mcsService: MigrationCitizenService) {}

   @Get('options/communities')
   getCommunities(@Query() query: McsAddressQueryDto) {
      return this.mcsService.getCommunities(query.region);
   }

   @Get('options/residences')
   getResidences(@Query() query: McsAddressQueryDto) {
      return this.mcsService.getResidences(query.region, query.community);
   }

   @Get('options/streets')
   getStreets(@Query() query: McsAddressQueryDto) {
      return this.mcsService.getStreets(query.region, query.community, query.residence);
   }

   @Post('persons/search')
   searchPersons(@Body() body: McsSearchPersonsDto) {
      return this.mcsService.searchPersons(body);
   }
}
