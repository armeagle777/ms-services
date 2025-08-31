import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { IdValidator, PersonWpDataValidator, PersonFilterWpDataValidator } from '../Validators';
import { WorkPermitService } from 'src/Core/WorkPermit/WorkPermit.service';
import { PersonDetailWpData } from '../Validators/Person/PersonDetailWpData.validator';
import { GetDiagnosis } from '../Validators/Person/GetDiagnosis.validator';

@Controller('work-permit')
export class WorkPermitController {
   constructor(private readonly wpService: WorkPermitService) {}

   @Get('countries')
   getCountries() {
      return this.wpService.getCountries();
   }

   @Post('persons/detail/pnum')
   getPersonWpData(@Body() body: PersonWpDataValidator) {
      return this.wpService.getPersonWpData(body.pnum);
   }

   @Post('persons/filter')
   filterPersonWpData(@Body() filterData: PersonFilterWpDataValidator) {
      return this.wpService.filterPersonWpData(filterData);
   }

   @Post('persons/detail/:id')
   getPersonDetailData(@Param() params: IdValidator, @Body() body: PersonDetailWpData) {
      return this.wpService.getPersonDetailData(params.id, body);
   }

   @Get('diagnosis')
   getDiagnosis(@Query() query: GetDiagnosis) {
      return this.wpService.getPersonDiagnosis(query);
   }
}
