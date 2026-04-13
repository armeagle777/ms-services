import { Controller, Get, Post, Param, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { CadastreService } from 'src/Core/Cadastre/Cadastre.service';
import { PropertyByCertificateDto } from 'src/API/DTO/Cadastre/property-by-certificate.dto';
import { BasicAuthGuard } from 'src/modules/auth/guards/basic-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('cadastre')
@UseGuards(BasicAuthGuard, PermissionGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
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
