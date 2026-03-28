import { Controller, Get } from '@nestjs/common';
import { CadastreService } from 'src/Core/Cadastre/Cadastre.service';

@Controller('cadastre')
export class CadastreController {
   constructor(private readonly cadastreService: CadastreService) {}

   @Get('properties-by-ssn/:ssn')
   getPropertiesBySsn() {}

   @Get('property-by-certificate/:certificateNumber')
   getPropertyByCertificate() {}
}
