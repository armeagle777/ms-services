import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';

import { RevenueCommitteeService } from 'src/Core/RevenueCommittee/RevenueCommittee.service';
import { SsnParamDto, TinParamDto } from 'src/API/DTO/Tax/params.dto';
import { CompanyObligationsQueryDto } from 'src/API/DTO/Tax/tax.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('revenue-committee')
@UseGuards(BasicAuthGuard)
// @UseInterceptors(ProtectedRequestLoggingInterceptor)
export class RevenueCommitteeController {
   constructor(private readonly revenueCommittee: RevenueCommitteeService) {}

   @Get('company/:tin/obligations')
   getCompanyObligations(@Param() params: TinParamDto, @Query() query: CompanyObligationsQueryDto) {
      return this.revenueCommittee.getCompanyObligations(params.tin, query);
   }

   @Get('person/:ssn/obligations')
   getPersonObligations(@Param() params: SsnParamDto) {
      return this.revenueCommittee.getPersonObligations(params.ssn);
   }

   @Get('employment-contracts/:ssn')
   getEmploymentContracts(@Param() params: SsnParamDto) {
      return this.revenueCommittee.getEmploymentContracts(params.ssn);
   }
}
