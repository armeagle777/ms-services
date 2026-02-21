import { Controller, Get, Param } from '@nestjs/common';

import { ArtsakhService } from './artsakh.service';
import { PnumParamDto } from './dto/params.dto';

@Controller('api/artsakh')
export class ArtsakhController {
  constructor(private readonly artsakhService: ArtsakhService) {}

  @Get('displacements/:pnum')
  getDisplacementData(@Param() params: PnumParamDto) {
    return this.artsakhService.getDisplacementData(params.pnum);
  }
}
