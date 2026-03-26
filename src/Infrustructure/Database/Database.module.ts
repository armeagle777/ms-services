import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import {
   ARTSAKH_CONNECTION,
   AUTH_POSTGRES_SEQUELIZE,
   AUTH_REQUEST_LOG_MODEL,
   AUTH_USER_MODEL,
} from './database.tokens';
import { initAuthUserEntity } from './Entities/AuthUser.entity';
import { initRequestLogEntity } from './Entities/RequestLog.entity';
import { AuthDbMigrationService } from './Migrations/AuthDbMigration.service';
import { ArtsakhDbProvider } from './ArtsakhDb/ArtsakhDb.provider';

const databaseProviders = [
   {
      provide: AUTH_POSTGRES_SEQUELIZE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
         const host = configService.get<string>('POSTGRES_DB_HOST', '127.0.0.1');
         const port = Number(configService.get<string>('POSTGRES_DB_PORT', '5432'));
         const db = configService.get<string>('POSTGRES_DB_NAME', 'ms_services_auth');
         const username = configService.get<string>('POSTGRES_DB_USERNAME', 'postgres');
         const password = configService.get<string>('POSTGRES_DB_PASSWORD', 'postgres');

         return new Sequelize(db, username, password, {
            host,
            port,
            dialect: 'postgres',
            logging: false,
         });
      },
   },
   {
      provide: AUTH_USER_MODEL,
      inject: [AUTH_POSTGRES_SEQUELIZE],
      useFactory: (sequelize: Sequelize) => initAuthUserEntity(sequelize),
   },
   {
      provide: AUTH_REQUEST_LOG_MODEL,
      inject: [AUTH_POSTGRES_SEQUELIZE],
      useFactory: (sequelize: Sequelize) => initRequestLogEntity(sequelize),
   },
];

@Global()
@Module({
   imports: [],
   exports: [...databaseProviders, AuthDbMigrationService, ARTSAKH_CONNECTION],
   providers: [...databaseProviders, AuthDbMigrationService, ArtsakhDbProvider],
})
export class DatabaseModule {}
