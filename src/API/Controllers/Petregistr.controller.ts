import { Controller, Get, Param } from '@nestjs/common';

import { PetregistrService } from 'src/Core/Petregistr/Petregistr.service';
import { SsnParamDto } from 'src/API/DTO/Petregistr/params.dto';

@Controller('petregistr')
export class PetregistrController {
   constructor(private readonly petregistrService: PetregistrService) {}

   @Get(':ssn/person')
   getCompaniesBySsn(@Param() params: SsnParamDto) {
      return this.petregistrService.getCompaniesBySsn(params.ssn);
   }
}
