import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';

import { CivilActsRegistrationService } from 'src/Core/CivilActsRegistration/CivilActsRegistration.service';
import { SsnParamDto } from 'src/API/DTO/Tax/params.dto';
import { QkagInfoRequestDto } from 'src/API/DTO/Persons/qkag-info.dto';
import { BasicAuthGuard } from 'src/modules/auth/guards/basic-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('civil-acts-registration')
@UseGuards(BasicAuthGuard, PermissionGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class CivilActsRegistrationController {
   constructor(private readonly civilActsService: CivilActsRegistrationService) {}

   @Post('documents/ssn/:ssn')
   getCivilActsInfoBySsn(@Param() params: SsnParamDto, @Body() body: QkagInfoRequestDto) {
      return this.civilActsService.getCivilActsInfoBySsn(params.ssn, body.firstName, body.lastName);
   }
}
