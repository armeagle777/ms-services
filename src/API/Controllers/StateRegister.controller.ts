import { Controller, Get, Param } from '@nestjs/common';
import { StateRegisterService } from 'src/Core/StateRegister/StateRegister.service';

@Controller('state-register')
export class StateRegisterController {
   constructor(private readonly stateRegisterService: StateRegisterService) {}

   @Get('legal-entities/:ssn')
   getLegalEntitiesBySsn(@Param() params: { ssn: string }) {
      return this.stateRegisterService.getLegalEntitiesBySsn(params.ssn);
   }

   @Get('companies/:taxId')
   getCompanyByTaxId(@Param() params: { taxId: string }) {
      return this.stateRegisterService.getCompanyByTaxId(params.taxId);
   }
}
