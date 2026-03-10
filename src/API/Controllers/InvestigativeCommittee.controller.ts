import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { SearchWantedDto } from 'src/API/DTO/Ic/search-wanted.dto';
import { InvestigativeCommitteeService } from 'src/Core/InvestigativeCommittee/InvestigativeCommittee.service';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';

@Controller('investigative-committee')
@UseGuards(BasicAuthGuard)
export class InvestigativeCommitteeController {
   constructor(private readonly icService: InvestigativeCommitteeService) {}

   @Post('persons/search')
   searchPersons(@Body() body: SearchWantedDto) {
      return this.icService.searchWantedPersons(body);
   }
}
