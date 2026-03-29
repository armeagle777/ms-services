import { Controller, Get, Param, Query } from '@nestjs/common';

import { RevenueCommitteeService } from 'src/Core/RevenueCommittee/RevenueCommittee.service';
import { SsnParamDto, TinParamDto } from 'src/API/DTO/Tax/params.dto';
import { CompanyObligationsQueryDto } from 'src/API/DTO/Tax/tax.dto';

@Controller('tax')
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
}
