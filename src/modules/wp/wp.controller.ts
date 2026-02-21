import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { WpService } from './wp.service';
import { FilterWpPersonsDto, WpPersonFullInfoDto } from './dto/wp.dto';
import { IdParamDto, PnumParamDto } from './dto/params.dto';

@Controller('api/wp')
export class WpController {
  constructor(private readonly wpService: WpService) {}

  @Get(':pnum')
  getWpData(@Param() params: PnumParamDto) {
    return this.wpService.getWpData(params.pnum);
  }

  @Get('countries/all')
  getWpCountries() {
    return this.wpService.getWpCountries();
  }

  @Post('person/filter')
  filterWpPersons(@Body() body: FilterWpPersonsDto) {
    return this.wpService.filterWpPersons(body);
  }

  @Post('person/:id/detail')
  getWpPersonFullInfo(@Param() params: IdParamDto, @Body() body: WpPersonFullInfoDto) {
    return this.wpService.getWpPersonFullInfo(params.id, body);
  }
}
