import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { MinistryOfJusticeService } from 'src/Core/MinistryOfJustice/MinistryOfJustice.service';
import { MojCesDebtorRequestDto } from 'src/API/DTO/MojCes/moj-ces.dto';
import { BasicAuthGuard } from 'src/modules/auth/guards/basic-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('ministry-of-justice')
@UseGuards(BasicAuthGuard, PermissionGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class MinistryOfJusticeController {
   constructor(private readonly ministryOfJusticeService: MinistryOfJusticeService) {}

   @Post('debtor-data')
   getDebtorData(@Body() body: MojCesDebtorRequestDto) {
      return this.ministryOfJusticeService.getDebtorData(body);
   }
}
