import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataTypes, Sequelize } from 'sequelize';

import { ArtsakhService } from './Artsakh/Artsakh.service';
import { KadastrService } from './Kadastr/Kadastr.service';
import { MigrationCitizenService } from './MigrationCitizenService/MigrationCitizenService.service';
import { MinistryOfJusticeService } from './MinistryOfJustice/MinistryOfJustice.service';
import { InterpolService } from './Interpol/Interpol.service';
import { PersonsService } from './Persons/Persons.service';
import { RevenueCommitteeService } from './RevenueCommittee/RevenueCommittee.service';
import { TaxService } from './TaxService/TaxService.service';
import { CivilActsRegistrationService } from './CivilActsRegistration/CivilActsRegistration.service';
import { SektService } from './Sekt/Sekt.service';
import { IntegrationModule } from 'src/Infrustructure/Services/Integration.module';
import { InvestigativeCommitteeService } from './InvestigativeCommittee/InvestigativeCommittee.service';
import { AuthService } from './Auth/Auth.service';
import { DatabaseModule } from 'src/Infrustructure/Database/Database.module';
import { RequestLoggingService } from './Logging/RequestLogging.service';
import { ARTSAKH_CONNECTION } from 'src/Infrustructure/Database/database.tokens';
import { StateRegisterService } from './StateRegister/StateRegister.service';
import { CadastreService } from './Cadastre/Cadastre.service';
import { StatePopulationRegisterService } from './StatePopulationRegister/StatePopulationRegister.service';

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
