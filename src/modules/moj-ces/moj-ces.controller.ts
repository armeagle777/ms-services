import { Body, Controller, Post } from '@nestjs/common';

import { MojCesService } from './moj-ces.service';
import { MojCesDebtorRequestDto } from './dto/moj-ces.dto';

@Controller('api/moj-ces')
export class MojCesController {
  constructor(private readonly mojCesService: MojCesService) {}

  @Post('debtor-info')
  getDebtorData(@Body() body: MojCesDebtorRequestDto) {
    return this.mojCesService.getDebtorData(body);
  }
}
