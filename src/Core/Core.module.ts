import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataTypes, Sequelize } from 'sequelize';

import { ArtsakhService } from './Artsakh/Artsakh.service';
import { KadastrService } from './Kadastr/Kadastr.service';
import { McsService } from './Mcs/Mcs.service';
import { MojCesService } from './MojCes/MojCes.service';
import { InterpolService } from './Interpol/Interpol.service';
import { PersonsService } from './Persons/Persons.service';
import { PetregistrService } from './Petregistr/Petregistr.service';
import { SphereService } from './Sphere/Sphere.service';
import { StatisticsService } from './Statistics/Statistics.service';
import { TaxService } from './Tax/Tax.service';
import { IntegrationModule } from 'src/Infrustructure/Services/Integration.module';
import { SPHERE_MODEL, SPHERE_SEQUELIZE } from 'src/Core/Sphere/sphere.tokens';
import {
   SAHMANAHATUM_SEQUELIZE,
   STATISTICS_SEQUELIZE,
   WP_SEQUELIZE as STATISTICS_WP_SEQUELIZE,
} from 'src/Core/Statistics/statistics.tokens';
import { InvestigativeCommitteeService } from './InvestigativeCommittee/InvestigativeCommittee.service';
import { AuthService } from './Auth/Auth.service';
import { DatabaseModule } from 'src/Infrustructure/Database/Database.module';
import { RequestLoggingService } from './Logging/RequestLogging.service';
import { ARTSAKH_CONNECTION } from 'src/Infrustructure/Database/database.tokens';

const services = [
   PersonsService,
   PetregistrService,
   KadastrService,
   ArtsakhService,
   MojCesService,
   TaxService,
   SphereService,
   McsService,
   InterpolService,
   StatisticsService,
   InvestigativeCommitteeService,
   AuthService,
   RequestLoggingService,
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
   {
      provide: SPHERE_SEQUELIZE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
         const host = configService.get<string>('DATABASE_HOST');
         const db = configService.get<string>('DATABASE_NAME');
         const username = configService.get<string>('DATABASE_USERNAME');
         const password = configService.get<string>('DATABASE_PASSWORD');

         return new Sequelize(db || '', username || '', password || '', {
            host,
            dialect: 'mysql',
            logging: false,
         });
      },
   },
   {
      provide: SPHERE_MODEL,
      inject: [SPHERE_SEQUELIZE],
      useFactory: (sequelize: Sequelize) =>
         sequelize.define(
            'Sphere',
            {
               name: { type: DataTypes.STRING, validate: { len: [0, 255] } },
               tin: {
                  type: DataTypes.STRING,
                  allowNull: false,
                  validate: { args: [7, 8] },
               },
               sphere_code: { type: DataTypes.STRING },
               sphere_text: { type: DataTypes.TEXT('long') },
               is_inactive: { type: DataTypes.BOOLEAN, defaultValue: false },
               is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
               is_checked: { type: DataTypes.BOOLEAN, defaultValue: false },
               createdAt: {
                  type: 'TIMESTAMP',
                  defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                  allowNull: false,
               },
               updatedAt: {
                  type: 'TIMESTAMP',
                  defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                  allowNull: false,
               },
            },
            { timestamps: false },
         ),
   },
   {
      provide: STATISTICS_SEQUELIZE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
         const host = configService.get<string>('DATABASE_HOST');
         const db = configService.get<string>('STATISTICS_DATABASE_NAME');
         const username = configService.get<string>('DATABASE_USERNAME');
         const password = configService.get<string>('DATABASE_PASSWORD');

         return new Sequelize(db || '', username || '', password || '', {
            host,
            dialect: 'mysql',
            logging: false,
         });
      },
   },
   {
      provide: SAHMANAHATUM_SEQUELIZE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
         const host = configService.get<string>('DATABASE_HOST');
         const db = configService.get<string>('SAHMANAHATUM_DATABASE_NAME');
         const username = configService.get<string>('DATABASE_USERNAME');
         const password = configService.get<string>('DATABASE_PASSWORD');

         return new Sequelize(db || '', username || '', password || '', {
            host,
            dialect: 'mysql',
            logging: false,
         });
      },
   },
   {
      provide: STATISTICS_WP_SEQUELIZE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
         const host = configService.get<string>('WP_DATABASE_HOST');
         const db = configService.get<string>('WP_DATABASE_NAME');
         const username = configService.get<string>('WP_DATABASE_USERNAME');
         const password = configService.get<string>('WP_DATABASE_PASSWORD');

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
