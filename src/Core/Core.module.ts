import { Module } from '@nestjs/common';
import { AsylumService } from './Asylum/Asylum.service';
import { WorkPermitService } from './WorkPermit/WorkPermit.service';
import { CountryService } from './Country/Country.service';
import { PersonService } from './Person/Person.service';
import { BuildWpQueries } from './Person/Helpers';

@Module({
   imports: [],
   providers: [AsylumService, WorkPermitService, CountryService, PersonService, BuildWpQueries],
   exports: [WorkPermitService, PersonService],
})
export class CoreModule {}
