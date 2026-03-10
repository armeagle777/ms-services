import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { AUTH_POSTGRES_SEQUELIZE } from '../database.tokens';

@Injectable()
export class AuthDbMigrationService implements OnModuleInit {
   private readonly logger = new Logger(AuthDbMigrationService.name);

   constructor(
      @Inject(AUTH_POSTGRES_SEQUELIZE) private readonly sequelize: Sequelize,
      private readonly configService: ConfigService,
   ) {}

   async onModuleInit() {
      await this.sequelize.authenticate();
      await this.migrateUsersTable();
      await this.migrateRequestLogsTable();
      await this.seedDefaultUser();
   }

   private async migrateUsersTable() {
      await this.sequelize.query(`
         CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
         );
      `);
   }

   private async seedDefaultUser() {
      const username = this.configService.get<string>('CLIENT_APPLICATION_1_USERNAME', 'admin');
      const password = this.configService.get<string>('CLIENT_APPLICATION_1_PASSWORD', 'admin123');
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.sequelize.query(
         `
            INSERT INTO users (username, password, "createdAt", "updatedAt")
            VALUES (:username, :password, NOW(), NOW())
            ON CONFLICT (username)
            DO UPDATE SET password = EXCLUDED.password, "updatedAt" = NOW();
         `,
         {
            replacements: { username, password: hashedPassword },
         },
      );

      this.logger.log(`Auth user migrated: ${username}`);
   }

   private async migrateRequestLogsTable() {
      await this.sequelize.query(`
         CREATE TABLE IF NOT EXISTS request_logs (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NULL,
            method VARCHAR(16) NOT NULL,
            path VARCHAR(1024) NOT NULL,
            "statusCode" INTEGER NOT NULL,
            ip VARCHAR(64) NULL,
            body TEXT NULL,
            query TEXT NULL,
            error TEXT NULL,
            "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
         );
      `);
   }
}
