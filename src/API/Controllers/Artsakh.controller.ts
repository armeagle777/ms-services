import {
   Controller,
   Get,
   Param,
   UseGuards,
   // UseInterceptors
} from '@nestjs/common';

import { ArtsakhService } from 'src/Core/Artsakh/Artsakh.service';
import { PnumParamDto } from 'src/API/DTO/Artsakh/params.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
// import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('artsakh')
@UseGuards(BasicAuthGuard)
// @UseInterceptors(ProtectedRequestLoggingInterceptor)
export class ArtsakhController {
   constructor(private readonly artsakhService: ArtsakhService) {}

   @Get('displacements/:pnum')
   getDisplacementData(@Param() params: PnumParamDto) {
      return this.artsakhService.getDisplacementData(params.pnum);
   }
}
