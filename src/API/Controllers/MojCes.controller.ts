import { Body, Controller, Post } from '@nestjs/common';

// import { MojCesService } from 'src/Core/MojCes/MojCes.service';
import { MojCesDebtorRequestDto } from 'src/API/DTO/MojCes/moj-ces.dto';

@Controller('moj-ces')
export class MojCesController {
   // constructor(private readonly mojCesService: MojCesService) {}

   @Post('debtor-info')
   getDebtorData(@Body() body: MojCesDebtorRequestDto) {
      // return this.mojCesService.getDebtorData(body);
   }
}
