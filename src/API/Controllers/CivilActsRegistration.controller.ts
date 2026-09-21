import {
   Controller,
   Post,
   Body,
   UseGuards,
   // UseInterceptors
} from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';

import { CivilActsRegistrationService } from 'src/Core/CivilActsRegistration/CivilActsRegistration.service';
import { QkagInfoRequestDto } from 'src/API/DTO/Persons/qkag-info.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
// import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('civil-acts-registration')
@UseGuards(BasicAuthGuard)
// @UseInterceptors(ProtectedRequestLoggingInterceptor)
export class CivilActsRegistrationController {
   constructor(private readonly civilActsService: CivilActsRegistrationService) {}

   @Post('documents/ssn')
   @ApiConsumes('application/x-www-form-urlencoded')
   getCivilActsInfoBySsn(@Body() body: QkagInfoRequestDto) {
      return this.civilActsService.getCivilActsInfoBySsn(body.ssn, body.first_name, body.last_name);
   }
}
