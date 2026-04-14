import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { SsnParamDto } from 'src/API/DTO/Persons/params.dto';
import { SearchPersonsRequestDto } from 'src/API/DTO/Persons';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';
import { StatePopulationRegisterService } from 'src/Core/StatePopulationRegister/StatePopulationRegister.service';

@Controller('state-population-register')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class StatePopulationRegisterController {
   constructor(private readonly statePopulationRegisterService: StatePopulationRegisterService) {}

   @Get(':ssn')
   getPersonBySsn(@Param() params: SsnParamDto) {
      return this.statePopulationRegisterService.getPersonBySsn(params.ssn);
   }

   @Post('search')
   getSearchedPersons(@Body() body: SearchPersonsRequestDto) {
      return this.statePopulationRegisterService.getSearchedPersons(body);
   }
}
