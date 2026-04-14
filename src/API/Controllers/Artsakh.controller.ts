import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';

import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { ArtsakhService } from 'src/Core/Artsakh/Artsakh.service';
import { GetDisplacementDataDto } from '../DTO/Artsakh/GetDisplacementData.dto';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('artsakh')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class ArtsakhController {
   constructor(private readonly artsakhService: ArtsakhService) {}

   @Get('displacements/:ssn')
   getDisplacementData(@Param() params: GetDisplacementDataDto) {
      return this.artsakhService.getDisplacementData(params.ssn);
   }
}
