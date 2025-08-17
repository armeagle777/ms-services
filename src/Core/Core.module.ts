import { Module } from '@nestjs/common';

import { BuildWpQueries } from './Worker/Helpers';
import { AsylumService } from './Asylum/Asylum.service';
import { WorkerService } from './Worker/Worker.service';
import { RefugeeService } from './Refugee/Refugee.service';
import { CountryService } from './Country/Country.service';
import { WorkPermitService } from './WorkPermit/WorkPermit.service';
import { IntegrationModule } from 'src/Infrustructure/Services/Integration.module';

const services = [WorkerService, RefugeeService, AsylumService, WorkPermitService, CountryService];

const helpers = [BuildWpQueries];

@Module({
   imports: [IntegrationModule],
   providers: [...services, ...helpers],
   exports: [WorkPermitService, AsylumService],
})
export class CoreModule {}
