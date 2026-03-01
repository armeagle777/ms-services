import { Controller, Get, Param, Query } from '@nestjs/common';

import { KadastrService } from 'src/Core/Kadastr/Kadastr.service';
import { CertificateParamDto, SsnParamDto } from 'src/API/DTO/Kadastr/params.dto';
import { PropertySearchQueryDto } from 'src/API/DTO/Kadastr/property-search.dto';

@Controller('kadastr')
export class KadastrController {
   constructor(private readonly kadastrService: KadastrService) {}

   @Get(':ssn/person')
   getPropertiesBySsn(@Param() params: SsnParamDto) {
      return this.kadastrService.getPropertiesBySsn(params.ssn);
   }

   @Get(':certificateNumber/document')
   getPropertyByCertificate(
      @Param() params: CertificateParamDto,
      @Query() query: PropertySearchQueryDto,
   ) {
      return this.kadastrService.getPropertyByCertificate(
         params.certificateNumber,
         query.searchBase,
      );
   }
}
