import { Controller, Get, Param } from '@nestjs/common';

import { TaxService } from 'src/Core/TaxService/TaxService.service';
import { SsnParamDto } from 'src/API/DTO/Tax/params.dto';

@Controller('tax-service')
export class TaxServiceController {
   constructor(private readonly taxService: TaxService) {}

   @Get('ssn/:ssn')
   getTaxBySsn(@Param() params: SsnParamDto) {
      return this.taxService.getTaxBySsnDb(params.ssn);
   }
}
