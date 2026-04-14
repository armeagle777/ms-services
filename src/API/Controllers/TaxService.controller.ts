import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';

import { SsnParamDto } from 'src/API/DTO/Tax/params.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { TaxService } from 'src/Core/TaxService/TaxService.service';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('tax-service')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class TaxServiceController {
   constructor(private readonly taxService: TaxService) {}

   @Get('ssn/:ssn')
   getTaxBySsn(@Param() params: SsnParamDto) {
      return this.taxService.getTaxBySsnDb(params.ssn);
   }
}
