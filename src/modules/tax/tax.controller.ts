import { Controller, Get, Param, Query } from '@nestjs/common';

import { TaxService } from './tax.service';
import { SsnParamDto, TinParamDto } from './dto/params.dto';
import { CompanyObligationsQueryDto } from './dto/tax.dto';

@Controller('api/tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get('company/:tin/obligations')
  getCompanyObligations(
    @Param() params: TinParamDto,
    @Query() query: CompanyObligationsQueryDto,
  ) {
    return this.taxService.getCompanyObligations(params.tin, query);
  }

  @Get('person/:ssn/obligations')
  getPersonObligations(@Param() params: SsnParamDto) {
    return this.taxService.getPersonObligations(params.ssn);
  }
}
