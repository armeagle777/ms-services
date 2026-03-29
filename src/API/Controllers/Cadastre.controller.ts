import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CadastreService } from 'src/Core/Cadastre/Cadastre.service';
import { PropertyByCertificateDto } from 'src/API/DTO/Cadastre/property-by-certificate.dto';

@Controller('cadastre')
export class CadastreController {
   constructor(private readonly cadastreService: CadastreService) {}

   @Get('properties-by-ssn/:ssn')
   getPropertiesBySsn(@Param() params: any) {
      return this.cadastreService.getPropertiesBySsn(params.ssn);
   }

   @Post('property-by-certificate')
   getPropertyByCertificate(@Body() dto: PropertyByCertificateDto) {
      return this.cadastreService.getPropertyByCertificate(dto.certificateNumber, dto.searchBase);
   }
}
