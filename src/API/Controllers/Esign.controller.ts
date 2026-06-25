import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CreateEsignProfileDto, RevokeEsignProfileDto } from 'src/API/DTO/Esign/esign.dto';
import { SsnParamDto } from 'src/API/DTO/Esign/params.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { EsignService } from 'src/Core/Esign/Esign.service';

@Controller('esign')
@UseGuards(BasicAuthGuard)
export class EsignController {
   constructor(private readonly esignService: EsignService) {}

   @Post('create-profile/ejbcaws')
   createProfile(@Body() body: CreateEsignProfileDto) {
      return this.esignService.createProfile(body);
   }

   @Get('find-profile/ejbcaws/:ssn')
   findProfile(@Param() params: SsnParamDto) {
      return this.esignService.findProfile(params.ssn);
   }

   @Post('revoke-profile/ejbcaws')
   revokeProfile(@Body() body: RevokeEsignProfileDto) {
      return this.esignService.revokeProfile(body);
   }
}
