import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { StatePopulationRegisterService } from 'src/Core/StatePopulationRegister/StatePopulationRegister.service';
import { SearchPersonsRequestDto } from 'src/API/DTO/Persons';
import { SsnParamDto } from 'src/API/DTO/Persons/params.dto';

/**
 * Controller for State Population Register API endpoints
 * Provides endpoints for:
 * - Getting person by SSN
 * - Searching persons by various criteria
 */
@Controller('state-population-register')
export class StatePopulationRegisterController {
   constructor(private readonly statePopulationRegisterService: StatePopulationRegisterService) {}

   /**
    * Get person by Social Security Number (SSN)
    * @param params - SSN parameter
    * @returns Person data or empty array
    */
   @Get(':ssn')
   getPersonBySsn(@Param() params: SsnParamDto) {
      return this.statePopulationRegisterService.getPersonBySsn(params.ssn);
   }

   /**
    * Search persons by various criteria
    * @param body - Search parameters (firstName, lastName, patronomicName, birthDate, documentNumber, ssn)
    * @returns Array of person records
    */
   @Post('search')
   getSearchedPersons(@Body() body: SearchPersonsRequestDto) {
      return this.statePopulationRegisterService.getSearchedPersons(body);
   }
}
