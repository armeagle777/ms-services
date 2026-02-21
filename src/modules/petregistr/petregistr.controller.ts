import { Controller, Get, Param } from '@nestjs/common';

import { PetregistrService } from './petregistr.service';
import { SsnParamDto } from './dto/params.dto';

@Controller('api/petregistr')
export class PetregistrController {
  constructor(private readonly petregistrService: PetregistrService) {}

  @Get(':ssn/person')
  getCompaniesBySsn(@Param() params: SsnParamDto) {
    return this.petregistrService.getCompaniesBySsn(params.ssn);
  }
}
