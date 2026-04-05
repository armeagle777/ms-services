import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { PersonsService } from 'src/Core/Persons/Persons.service';
import { BordercrossRequestDto, VehicleSearchQueryDto } from 'src/API/DTO/Persons';
import {
   HvhhParamDto,
   PoliceSearchQueryDto,
   PnumParamDto,
   SsnParamDto,
   VehicleParamDto,
} from 'src/API/DTO/Persons/params.dto';

@Controller('persons')
export class PersonsController {
   constructor(private readonly personsService: PersonsService) {}

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
   getPoliceByPnum(@Param() params: PnumParamDto, @Query() query: PoliceSearchQueryDto) {
      return this.personsService.getPoliceByPnum(params.pnum, query);
   }

   @Get(':hvhh/petregistr')
   getCompanyByHvhh(@Param() params: HvhhParamDto) {
      return this.personsService.getCompanyByHvhh(params.hvhh);
   }
}
