import { Body, Controller, Post } from '@nestjs/common';

import { MinistryOfJusticeService } from 'src/Core/MinistryOfJustice/MinistryOfJustice.service';
import { MojCesDebtorRequestDto } from 'src/API/DTO/MojCes/moj-ces.dto';

@Controller('ministry-of-justice')
export class MinistryOfJusticeController {
   constructor(private readonly ministryOfJusticeService: MinistryOfJusticeService) {}

   @Post('debtor-data')
   getDebtorData(@Body() body: MojCesDebtorRequestDto) {
      return this.ministryOfJusticeService.getDebtorData(body);
   }
}
