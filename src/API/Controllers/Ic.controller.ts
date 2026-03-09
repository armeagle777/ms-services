import {
   Body,
   Controller,
   // Get,
   // Query,
   Post,
} from '@nestjs/common';

import { SearchWantedDto } from 'src/API/DTO/Ic/search-wanted.dto';
import { IcService } from 'src/Core/Ic/Ic.service';

@Controller('ic')
export class IcController {
   constructor(private readonly icService: IcService) {}

   @Post('persons/search')
   searchPersons(@Body() body: SearchWantedDto) {
      return this.icService.searchWantedPersons(body);
   }
}
