import { Body, Controller, Get, Post } from '@nestjs/common';
import { AsylumService } from 'src/Core/Asylum/Asylum.service';

@Controller('asylum')
export class AsylumController {
   constructor(private readonly asylumService: AsylumService) {}

   @Get('countries')
   getCountries() {
      return this.asylumService.getCountries();
   }

   // @Post('persons/filter')
   // filterPersonAsylumData(@Body() filterData: PersonFilterWpDataValidator) {
   //    return this.asylumService.filterPersonWpData(filterData);
   // }

   //    @Post('persons/detail/:id')
   //    getPersonDetailData(@Param() params: IdValidator, @Body() body: PersonDetailWpData) {
   //       return this.wpService.getPersonDetailData(params.id, body);
   //    }
}
