import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { McsService } from './mcs.service';
import { McsAddressQueryDto, McsSearchPersonsDto } from './dto/mcs.dto';

@Controller('api/mcs')
export class McsController {
  constructor(private readonly mcsService: McsService) {}

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
