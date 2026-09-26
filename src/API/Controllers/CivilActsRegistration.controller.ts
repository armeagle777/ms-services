import { Controller, Param, Post, Body, UseGuards } from '@nestjs/common';
import { CivilActsRegistrationService } from 'src/Core/CivilActsRegistration/CivilActsRegistration.service';
import { QkagInfoBodyRequestDto, QkagInfoRequestDto } from 'src/API/DTO/Persons/qkag-info.dto';
import { SsnParamDto } from 'src/API/DTO/Tax/params.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';

@Controller('civil-acts-registration')
@UseGuards(BasicAuthGuard)
export class CivilActsRegistrationController {
   constructor(private readonly civilActsService: CivilActsRegistrationService) {}

   @Post('documents/ssn/:ssn')
   getCivilActsInfoBySsn(@Param() params: SsnParamDto, @Body() body: QkagInfoRequestDto) {
      return this.civilActsService.getCivilActsInfoBySsn(params.ssn, body.firstName, body.lastName);
   }

   @Post('documents/ssn')
   getCivilActsInfoBySsnFromBody(@Body() body: QkagInfoBodyRequestDto) {
      return this.civilActsService.getCivilActsInfoBySsnRaw(
         body.ssn,
         body.first_name,
         body.last_name,
      );
   }
}
