import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';

import { DatabaseModule } from 'src/Infrustructure/Database/Database.module';
import { ARTSAKH_CONNECTION } from 'src/Infrustructure/Database/database.tokens';
import { IntegrationModule } from 'src/Infrustructure/Services/Integration.module';
import { ArtsakhService } from './Artsakh/Artsakh.service';
import { AuthService } from './Auth/Auth.service';
import { CadastreService } from './Cadastre/Cadastre.service';
import { CivilActsRegistrationService } from './CivilActsRegistration/CivilActsRegistration.service';
import { InterpolService } from './Interpol/Interpol.service';
import { InvestigativeCommitteeService } from './InvestigativeCommittee/InvestigativeCommittee.service';
import { KadastrService } from './Kadastr/Kadastr.service';
import { RequestLoggingService } from './Logging/RequestLogging.service';
import { MigrationCitizenService } from './MigrationCitizenService/MigrationCitizenService.service';
import { MinistryOfJusticeService } from './MinistryOfJustice/MinistryOfJustice.service';
import { PersonsService } from './Persons/Persons.service';
import { RevenueCommitteeService } from './RevenueCommittee/RevenueCommittee.service';
import { SektService } from './Sekt/Sekt.service';
import { StatePopulationRegisterService } from './StatePopulationRegister/StatePopulationRegister.service';
import { StateRegisterService } from './StateRegister/StateRegister.service';
import { RoadPoliceService } from './RoadPolice/RoadPolice.service';
import { TaxService } from './TaxService/TaxService.service';

const services = [
   PersonsService,
   KadastrService,
   ArtsakhService,
   MinistryOfJusticeService,
   RevenueCommitteeService,
   TaxService,
   CivilActsRegistrationService,
   SektService,
   MigrationCitizenService,
   InterpolService,
   InvestigativeCommitteeService,
   AuthService,
   RequestLoggingService,
   StateRegisterService,
   RoadPoliceService,
   CadastreService,
   StatePopulationRegisterService,
];

const helpers = [];

const databaseProviders = [
   {
      provide: ARTSAKH_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
         const host = configService.get<string>('ARTSAKH_DATABASE_HOST');
         const db = configService.get<string>('ARTSAKH_DATABASE_NAME');
         const username = configService.get<string>('ARTSAKH_DATABASE_USERNAME');
         const password = configService.get<string>('ARTSAKH_DATABASE_USER_PASSWORD');

         return new Sequelize(db || '', username || '', password || '', {
            host,
            dialect: 'mysql',
            logging: false,
         });
      },
   },
];

@Module({
   imports: [ConfigModule, HttpModule, IntegrationModule, DatabaseModule],
   providers: [...services, ...helpers, ...databaseProviders],
   exports: [...services],
})
export class CoreModule {}
