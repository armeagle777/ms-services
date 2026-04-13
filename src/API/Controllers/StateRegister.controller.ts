import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { StateRegisterService } from 'src/Core/StateRegister/StateRegister.service';
import { BasicAuthGuard } from 'src/modules/auth/guards/basic-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('state-register')
@UseGuards(BasicAuthGuard, PermissionGuard)
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
