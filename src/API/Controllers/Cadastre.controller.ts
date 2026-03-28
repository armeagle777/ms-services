import { Controller, Get, Param } from '@nestjs/common';
import { CadastreService } from 'src/Core/Cadastre/Cadastre.service';

@Controller('cadastre')
export class CadastreController {
   constructor(private readonly cadastreService: CadastreService) {}

   @Get('properties-by-ssn/:ssn')
   getPropertiesBySsn(@Param() params: any) {
      return this.cadastreService.getPropertiesBySsn(params.ssn);
   }

   @Get('property-by-certificate/:certificateNumber')
   getPropertyByCertificate(@Param() params: any) {
      const certificateNumber = params.certificateNumber;
      return this.cadastreService.getPropertyByCertificate(certificateNumber);
   }
}
