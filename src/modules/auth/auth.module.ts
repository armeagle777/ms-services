import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule, MetadataScanner } from '@nestjs/core';
import { Sequelize } from 'sequelize-typescript';
import {
   API_CLIENT_MODEL,
   API_CLIENT_PERMISSION_MODEL,
   PERMISSION_MODEL,
   RBAC_SEQUELIZE,
} from 'src/modules/auth/auth.constants';
import { APIClient } from 'src/modules/auth/entities/api-client.model';
import { APIClientPermission } from 'src/modules/auth/entities/api-client-permission.model';
import { Permission } from 'src/modules/auth/entities/permission.model';
import { BasicAuthGuard } from 'src/modules/auth/guards/basic-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { PermissionScannerService } from 'src/modules/auth/scanner/permission-scanner.service';
import { APIClientsService } from 'src/modules/api-clients/api-clients.service';
import { PermissionsService } from 'src/modules/permissions/permissions.service';

@Global()
@Module({
   imports: [ConfigModule, DiscoveryModule],
   providers: [
      {
         provide: RBAC_SEQUELIZE,
         inject: [ConfigService],
         useFactory: async (configService: ConfigService) => {
            const host = configService.get<string>('POSTGRES_DB_HOST', '127.0.0.1');
            const port = Number(configService.get<string>('POSTGRES_DB_PORT', '5432'));
            const database = configService.get<string>('POSTGRES_DB_NAME', 'ms_services_auth');
            const username = configService.get<string>('POSTGRES_DB_USERNAME', 'postgres');
            const password = configService.get<string>('POSTGRES_DB_PASSWORD', 'postgres');

            const sequelize = new Sequelize({
               dialect: 'postgres',
               host,
               port,
               database,
               username,
               password,
               logging: false,
               models: [APIClient, Permission, APIClientPermission],
            });

            await sequelize.authenticate();
            await sequelize.sync();

            return sequelize;
         },
      },
      {
         provide: API_CLIENT_MODEL,
         useValue: APIClient,
      },
      {
         provide: PERMISSION_MODEL,
         useValue: Permission,
      },
      {
         provide: API_CLIENT_PERMISSION_MODEL,
         useValue: APIClientPermission,
      },
      MetadataScanner,
      APIClientsService,
      PermissionsService,
      BasicAuthGuard,
      PermissionGuard,
      PermissionScannerService,
   ],
   exports: [
      RBAC_SEQUELIZE,
      API_CLIENT_MODEL,
      PERMISSION_MODEL,
      API_CLIENT_PERMISSION_MODEL,
      APIClientsService,
      PermissionsService,
      BasicAuthGuard,
      PermissionGuard,
   ],
})
export class AuthModule {}
