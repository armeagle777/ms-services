import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// import { EkengIntegration } from './EkengIntegration/Ekeng.integration';
import { PkiClientService } from './ESignIntegration/PkiClient.service';
import { InterpolIntegration } from './InterpolIntegration/Interpol.integration';
import { InvestigativeCommitteeIntegration } from 'src/Infrustructure/Services/InvestigativeCommitteeIntegration/InvestigativeCommitee.integration';

@Module({
   imports: [HttpModule],
   exports: [
      // EkengIntegration,
      PkiClientService,
      InterpolIntegration,
      InvestigativeCommitteeIntegration,
   ],
   providers: [
      // EkengIntegration,
      PkiClientService,
      InterpolIntegration,
      InvestigativeCommitteeIntegration,
   ],
})
export class IntegrationModule {}
