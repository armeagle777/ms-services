import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';

import { TaxService } from 'src/Core/TaxService/TaxService.service';
import { SsnParamDto } from 'src/API/DTO/Tax/params.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('tax-service')
@UseGuards(BasicAuthGuard)
// @UseInterceptors(ProtectedRequestLoggingInterceptor)
export class TaxServiceController {
   constructor(private readonly taxService: TaxService) {}

   @Get('ssn/:ssn')
   getTaxBySsn(@Param() params: SsnParamDto) {
      return this.taxService.getTaxBySsnDb(params.ssn);
   }
}
