import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { PersonsService } from 'src/Core/Persons/Persons.service';
import {
   BordercrossRequestDto,
   QkagInfoRequestDto,
   SearchPersonsRequestDto,
   VehicleSearchQueryDto,
} from 'src/API/DTO/Persons';
import {
   HvhhParamDto,
   PnumParamDto,
   SsnParamDto,
   VehicleParamDto,
} from 'src/API/DTO/Persons/params.dto';

@Controller('persons')
export class PersonsController {
   constructor(private readonly personsService: PersonsService) {}

   @Get(':ssn/bpr')
   getPersonBySsn(@Param() params: SsnParamDto) {
      return this.personsService.getPersonBySsn(params.ssn);
   }

   @Post('download')
   downloadBprInfo(@Body() body: Record<string, unknown>) {
      return this.personsService.downloadBprInfo(body);
   }

   @Post('bpr')
   getSearchedPersons(@Body() body: SearchPersonsRequestDto) {
      return this.personsService.getSearchedPersons(body);
   }

   @Get(':ssn/tax')
   getTaxBySsn(@Param() params: SsnParamDto) {
      return this.personsService.getTaxBySsn(params.ssn);
   }

   @Get(':ssn/roadpolice')
   getRoadpoliceBySsn(@Param() params: SsnParamDto) {
      return this.personsService.getRoadpoliceBySsn(params.ssn);
   }

   @Get(':paramValue/vehicle')
   searchVehicle(@Param() params: VehicleParamDto, @Query() query: VehicleSearchQueryDto) {
      return this.personsService.searchVehicle(params.paramValue, query.searchBase);
   }

   @Post('bordercross')
   getBordercrossBySsn(@Body() body: BordercrossRequestDto) {
      return this.personsService.getBordercrossBySsn(body);
   }

   @Get(':pnum/police')
   getPoliceByPnum(@Param() params: PnumParamDto) {
      return this.personsService.getPoliceByPnum(params.pnum);
   }

   @Post(':ssn/qkag')
   getQkagInfoBySsn(@Param() params: SsnParamDto, @Body() body: QkagInfoRequestDto) {
      return this.personsService.getQkagInfoBySsn(params.ssn, body);
   }

   @Get(':hvhh/petregistr')
   getCompanyByHvhh(@Param() params: HvhhParamDto) {
      return this.personsService.getCompanyByHvhh(params.hvhh);
   }
}
