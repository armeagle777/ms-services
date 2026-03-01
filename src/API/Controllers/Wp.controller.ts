import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { WpService } from 'src/Core/Wp/Wp.service';
import { FilterWpPersonsDto, WpPersonFullInfoDto } from 'src/API/DTO/Wp/wp.dto';
import { IdParamDto, PnumParamDto } from 'src/API/DTO/Wp/params.dto';

@Controller('wp')
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
