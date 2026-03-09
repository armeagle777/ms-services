import { Body, Controller, Post } from '@nestjs/common';

import { SearchWantedDto } from 'src/API/DTO/Ic/search-wanted.dto';
import { InvestigativeCommitteeService } from 'src/Core/InvestigativeCommittee/InvestigativeCommittee.service';

@Controller('investigative-committee')
export class InvestigativeCommitteeController {
   constructor(private readonly icService: InvestigativeCommitteeService) {}

   @Post('persons/search')
   searchPersons(@Body() body: SearchWantedDto) {
      return this.icService.searchWantedPersons(body);
   }
}
