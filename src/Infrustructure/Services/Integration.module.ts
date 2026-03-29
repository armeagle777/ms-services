import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// import { EkengIntegration } from './EkengIntegration/Ekeng.integration';
import { InterpolIntegration } from './InterpolIntegration/Interpol.integration';
import { InvestigativeCommitteeIntegration } from 'src/Infrustructure/Services/InvestigativeCommitteeIntegration/InvestigativeCommitee.integration';
import { EkengBasicClientIntegration } from './EkengBasicClientIntegration/EkengBasicClient.integration';
import { CadastreClientIntegration } from './CadastreClientIntegration/CadastreClient.integration';
import { MigrationCitizenServiceIntegration } from './MigrationCitizenServiceIntegration/MigrationCitizenService.integration';
import { MinistryOfJusticeIntegration } from './MinistryOfJusticeIntegration/MinistryOfJustice.integration';
import { RevenueCommitteeIntegration } from './RevenueCommitteeIntegration/RevenueCommittee.integration';

@Module({
   imports: [HttpModule],
   exports: [
      // EkengIntegration,
      InterpolIntegration,
      InvestigativeCommitteeIntegration,
      EkengBasicClientIntegration,
      CadastreClientIntegration,
      MigrationCitizenServiceIntegration,
      MinistryOfJusticeIntegration,
      RevenueCommitteeIntegration,
   ],
   providers: [
      // EkengIntegration,
      InterpolIntegration,
      InvestigativeCommitteeIntegration,
      EkengBasicClientIntegration,
      CadastreClientIntegration,
      MigrationCitizenServiceIntegration,
      MinistryOfJusticeIntegration,
      RevenueCommitteeIntegration,
   ],
})
export class IntegrationModule {}
