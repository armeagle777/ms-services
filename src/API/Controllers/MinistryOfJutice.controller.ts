import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { MojCesDebtorRequestDto } from 'src/API/DTO/MojCes/moj-ces.dto';
import { MinistryOfJusticeService } from 'src/Core/MinistryOfJustice/MinistryOfJustice.service';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('ministry-of-justice')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class MinistryOfJusticeController {
   constructor(private readonly ministryOfJusticeService: MinistryOfJusticeService) {}

   @Post('debtor-data')
   getDebtorData(@Body() body: MojCesDebtorRequestDto) {
      return this.ministryOfJusticeService.getDebtorData(body);
   }
}
