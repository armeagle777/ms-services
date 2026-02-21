import { Controller, Get, Param, Query } from '@nestjs/common';

import { KadastrService } from './kadastr.service';
import { CertificateParamDto, SsnParamDto } from './dto/params.dto';
import { PropertySearchQueryDto } from './dto/property-search.dto';

@Controller('api/kadastr')
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
