import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WorkPermitService } from 'src/Core/WorkPermit/WorkPermit.service';
import { IdValidator, PersonWpDataValidator } from '../Validators';
import { PersonFilterWpDataValidator } from '../Validators/Person/PersonFilterWpData.validator';

@Controller('work-permit')
export class WorkPermitController {
   constructor(private readonly wpService: WorkPermitService) {}
   @Get('countries')
   getCountries() {
      return this.wpService.getCountries();
   }

   @Get('persons/:pnum')
   getPersonWpData(@Param() params: PersonWpDataValidator) {
      return this.wpService.getPersonWpData(params.pnum);
   }

   @Post('persons/filter')
   filterPersonWpData(@Body() filterData: PersonFilterWpDataValidator) {
      return this.wpService.filterPersonWpData(filterData);
   }

   @Get('persons/detail/:id')
   getPersonDetailData(@Param() params: IdValidator, @Body() body) {
      return this.wpService.getPersonDetailData(params.id, body);
   }
}
