import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { EsignService } from 'src/Core/Esign/Esign.service';
import { SsnParamDto } from 'src/API/DTO/Esign/params.dto';
import { CreateEsignProfileDto, RevokeEsignProfileDto } from 'src/API/DTO/Esign/esign.dto';

@Controller('esign')
export class EsignController {
   constructor(private readonly esignService: EsignService) {}

   @Get('search-ssn/:ssn/ejbcaws')
   getESignDataBySsn(@Param() params: SsnParamDto) {
      return this.esignService.getESignDataBySsn(params.ssn);
   }

   @Post('generate-profile/ejbcaws')
   createESignProfile(@Body() body: CreateEsignProfileDto) {
      return this.esignService.createESignProfile(body);
   }

   @Post('revoke-profile/ejbcaws')
   revokeESignProfile(@Body() body: RevokeEsignProfileDto) {
      return this.esignService.revokeESignProfile(body);
   }
}
