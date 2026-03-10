import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { SearchWantedDto } from 'src/API/DTO/Ic/search-wanted.dto';
import { InvestigativeCommitteeService } from 'src/Core/InvestigativeCommittee/InvestigativeCommittee.service';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('investigative-committee')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class InvestigativeCommitteeController {
   constructor(private readonly icService: InvestigativeCommitteeService) {}

   @Post('persons/search')
   searchPersons(@Body() body: SearchWantedDto) {
      return this.icService.searchWantedPersons(body);
   }
}
