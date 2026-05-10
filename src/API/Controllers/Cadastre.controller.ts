import { Controller, Get, Post, Param, Body, UseGuards, UseInterceptors } from '@nestjs/common';

import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { CadastreService } from 'src/Core/Cadastre/Cadastre.service';
import { GetPropertiesBySsnDto } from '../DTO/Cadastre/GetPropertiesBySsn.dto';
import { GetPropertyByCertificateDto } from 'src/API/DTO/Cadastre/GetPropertyByCertificate.dto';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('cadastre')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class CadastreController {
   constructor(private readonly cadastreService: CadastreService) {}

   @Get('properties-by-ssn/:ssn')
   getPropertiesBySsn(@Param() params: GetPropertiesBySsnDto) {
      return this.cadastreService.getPropertiesBySsn(params.ssn);
   }

   @Post('property-by-certificate')
   getPropertyByCertificate(@Body() body: GetPropertyByCertificateDto) {
      return this.cadastreService.getPropertyByCertificate(body.certificateNumber, body.searchBase);
   }
}
