import {
   Controller,
   Get,
   // Param,
   // Query
} from '@nestjs/common';

// import { TaxService } from 'src/Core/Tax/Tax.service';
// import { SsnParamDto, TinParamDto } from 'src/API/DTO/Tax/params.dto';
// import { CompanyObligationsQueryDto } from 'src/API/DTO/Tax/tax.dto';

@Controller('tax')
export class TaxController {
   // constructor(private readonly taxService: TaxService) {}

   @Get('company/:tin/obligations')
   getCompanyObligations() {
      // @Param() params: TinParamDto, @Query() query: CompanyObligationsQueryDto
      // return this.taxService.getCompanyObligations(params.tin, query);
   }

   @Get('person/:ssn/obligations')
   getPersonObligations() {
      // @Param() params: SsnParamDto
      // return this.taxService.getPersonObligations(params.ssn);
   }
}
