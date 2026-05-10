import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';

import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { StateRegisterService } from 'src/Core/StateRegister/StateRegister.service';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('state-register')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
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
