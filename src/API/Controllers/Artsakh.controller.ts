import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';

import { ArtsakhService } from 'src/Core/Artsakh/Artsakh.service';
import { PnumParamDto } from 'src/API/DTO/Artsakh/params.dto';
import { BasicAuthGuard } from 'src/modules/auth/guards/basic-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('artsakh')
@UseGuards(BasicAuthGuard, PermissionGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class ArtsakhController {
   constructor(private readonly artsakhService: ArtsakhService) {}

   @Get('displacements/:pnum')
   getDisplacementData(@Param() params: PnumParamDto) {
      return this.artsakhService.getDisplacementData(params.pnum);
   }
}
