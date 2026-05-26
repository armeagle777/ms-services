import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { RevokeEsignProfileDto } from 'src/API/DTO/Esign/esign.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { EsignService } from 'src/Core/Esign/Esign.service';

@Controller('esign')
@UseGuards(BasicAuthGuard)
export class EsignController {
   constructor(private readonly esignService: EsignService) {}

   @Post('revoke-profile/ejbcaws')
   revokeProfile(@Body() body: RevokeEsignProfileDto) {
      return this.esignService.revokeProfile(body);
   }
}
