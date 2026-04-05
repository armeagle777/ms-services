import { Controller, Get, Param, Query } from '@nestjs/common';

import { VehicleSearchQueryDto } from 'src/API/DTO/Persons';
import {
   PnumParamDto,
   PoliceSearchQueryDto,
   SsnParamDto,
   VehicleParamDto,
} from 'src/API/DTO/Persons/params.dto';
import { PersonsService } from 'src/Core/Persons/Persons.service';

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

   @Get(':pnum/police')
   getPoliceByPnum(@Param() params: PnumParamDto, @Query() query: PoliceSearchQueryDto) {
      return this.personsService.getPoliceByPnum(params.pnum, query);
   }
}
