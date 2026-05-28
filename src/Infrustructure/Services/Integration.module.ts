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
import { RevenueCommitteeTinInfoIntegration } from './RevenueCommitteeTinInfoIntegration/RevenueCommitteeTinInfo.integration';
import { EmploymentContractsIntegration } from './RevenueCommitteeEmploymentIntegration/RevenueCommitteeEmployment.integration';
import { StatePopulationRegisterIntegration } from './StatePopulationRegisterIntegration/StatePopulationRegister.integration';
import { TaxServiceIntegration } from './TaxServiceIntegration/TaxService.integration';
import { CivilActsRegistrationIntegration } from './CivilActsRegistrationIntegration/CivilActsRegistration.integration';
import { SektIntegration } from './SektIntegration/Sekt.integration';
import { StateRegisterIntegration } from './StateRegisterIntegration/StateRegister.integration';
import { RoadPoliceIntegration } from './RoadPoliceIntegration/RoadPolice.integration';
import { KtakIntegration } from './KtakIntegration/Ktak.integration';
import { PkiClientIntegration } from './PkiClientIntegration/PkiClient.integration';

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
      RevenueCommitteeTinInfoIntegration,
      EmploymentContractsIntegration,
      StatePopulationRegisterIntegration,
      TaxServiceIntegration,
      CivilActsRegistrationIntegration,
      SektIntegration,
      StateRegisterIntegration,
      RoadPoliceIntegration,
      KtakIntegration,
      PkiClientIntegration,
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
      RevenueCommitteeTinInfoIntegration,
      EmploymentContractsIntegration,
      StatePopulationRegisterIntegration,
      TaxServiceIntegration,
      CivilActsRegistrationIntegration,
      SektIntegration,
      StateRegisterIntegration,
      RoadPoliceIntegration,
      KtakIntegration,
      PkiClientIntegration,
   ],
})
export class IntegrationModule {}
