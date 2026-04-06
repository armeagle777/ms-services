import { Controller, Get, Param, Query } from '@nestjs/common';

import { PnumParamDto, PoliceSearchQueryDto } from 'src/API/DTO/Persons/params.dto';
import { PersonsService } from 'src/Core/Persons/Persons.service';

@Controller('persons')
export class PersonsController {
   constructor(private readonly personsService: PersonsService) {}

   @Get(':pnum/police')
   getPoliceByPnum(@Param() params: PnumParamDto, @Query() query: PoliceSearchQueryDto) {
      return this.personsService.getPoliceByPnum(params.pnum, query);
   }
}
