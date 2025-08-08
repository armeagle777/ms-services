import { Module } from '@nestjs/common';

import { BuildWpQueries } from './Worker/Helpers';
import { AsylumService } from './Asylum/Asylum.service';
import { WorkerService } from './Worker/Worker.service';
import { RefugeeService } from './Refugee/Refugee.service';
import { CountryService } from './Country/Country.service';
import { WorkPermitService } from './WorkPermit/WorkPermit.service';

const services = [WorkerService, RefugeeService, AsylumService, WorkPermitService, CountryService];

const helpers = [BuildWpQueries];

@Module({
   imports: [],
   providers: [...services, ...helpers],
   exports: [WorkPermitService],
})
export class CoreModule {}
