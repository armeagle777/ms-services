import { Module } from '@nestjs/common';

import { BuildWpQueries } from './Worker/Helpers';
import { AsylumService } from './Asylum/Asylum.service';
import { WorkerService } from './Worker/Worker.service';
import { RefugeeService } from './Refugee/Refugee.service';
import { CountryService } from './Country/Country.service';
import { WorkPermitService } from './WorkPermit/WorkPermit.service';
import { IntegrationModule } from 'src/Infrustructure/Services/Integration.module';
import { EthnicsService } from './Ethnics/Ethnics.serrvice';
import { ReligionService } from './Religion/Religion.serrvice';
import { MarzService } from './Marz/Marz.service';
import { CommunityService } from './Community/Community.service';
import { SettlementService } from './Settlement/Settlement.service';
import { RefugeeCardService } from './RefugeeCard/RefugeeCard.service';

const services = [
   WorkerService,
   RefugeeService,
   AsylumService,
   WorkPermitService,
   CountryService,
   EthnicsService,
   ReligionService,
   MarzService,
   CommunityService,
   SettlementService,
   RefugeeCardService,
];

const helpers = [BuildWpQueries];

@Module({
   imports: [IntegrationModule],
   providers: [...services, ...helpers],
   exports: [WorkPermitService, AsylumService],
})
export class CoreModule {}
