import { Controller, Get, Param } from '@nestjs/common';

import { ArtsakhService } from 'src/Core/Artsakh/Artsakh.service';
import { PnumParamDto } from 'src/API/DTO/Artsakh/params.dto';

@Controller('artsakh')
export class ArtsakhController {
   constructor(private readonly artsakhService: ArtsakhService) {}

   @Get('displacements/:pnum')
   getDisplacementData(@Param() params: PnumParamDto) {
      return this.artsakhService.getDisplacementData(params.pnum);
   }
}
