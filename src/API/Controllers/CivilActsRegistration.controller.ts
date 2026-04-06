import { Controller, Param, Post, Body } from '@nestjs/common';

import { CivilActsRegistrationService } from 'src/Core/CivilActsRegistration/CivilActsRegistration.service';
import { SsnParamDto } from 'src/API/DTO/Tax/params.dto';
import { QkagInfoRequestDto } from 'src/API/DTO/Persons/qkag-info.dto';

@Controller('civil-acts-registration')
export class CivilActsRegistrationController {
   constructor(private readonly civilActsService: CivilActsRegistrationService) {}

   @Post('documents/ssn/:ssn')
   getCivilActsInfoBySsn(@Param() params: SsnParamDto, @Body() body: QkagInfoRequestDto) {
      return this.civilActsService.getCivilActsInfoBySsn(params.ssn, body.firstName, body.lastName);
   }
}
