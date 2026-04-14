import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { SearchWantedPersonsDto } from 'src/API/DTO/InvestigativeCommittee/SearchWantedPersons.dto.ts';
import { InvestigativeCommitteeService } from 'src/Core/InvestigativeCommittee/InvestigativeCommittee.service';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('investigative-committee')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class InvestigativeCommitteeController {
   constructor(private readonly icService: InvestigativeCommitteeService) {}

   @Post('persons/search')
   searchWantedPersons(@Body() body: SearchWantedPersonsDto) {
      return this.icService.searchWantedPersons(body);
   }
}
