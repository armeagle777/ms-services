import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AsylumService } from 'src/Core/Asylum/Asylum.service';
import { IdValidator, PersonFilterAsylumDataValidator } from '../Validators';

@Controller('asylum')
export class AsylumController {
   constructor(private readonly asylumService: AsylumService) {}

   @Get('countries')
   getCountries() {
      return this.asylumService.getCountries();
   }

   // @Post('persons/filter')
   // filterPersonWpData(@Body() filterData: PersonFilterAsylumDataValidator) {
   //    return this.asylumService.filterPersonData(filterData);
   // }

   // @Post('persons/detail/:id')
   // getPersonDetailData(@Param() params: IdValidator) {
   //    return this.asylumService.getPersonDetailData(params.id);
   // }
}
