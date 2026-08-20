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
      await this.migrateIntegrationCallLogsTable();
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

      // Timing / correlation columns, added in place so existing rows are kept.
      await this.sequelize.query(`
         ALTER TABLE request_logs ADD COLUMN IF NOT EXISTS "requestId" VARCHAR(64) NULL;
         ALTER TABLE request_logs ADD COLUMN IF NOT EXISTS "durationMs" INTEGER NULL;
         ALTER TABLE request_logs ADD COLUMN IF NOT EXISTS "upstreamMs" INTEGER NULL;
         ALTER TABLE request_logs ADD COLUMN IF NOT EXISTS "upstreamCalls" TEXT NULL;
      `);

      await this.sequelize.query(`
         CREATE INDEX IF NOT EXISTS request_logs_created_at_idx ON request_logs ("createdAt");
         CREATE INDEX IF NOT EXISTS request_logs_request_id_idx ON request_logs ("requestId");
         CREATE INDEX IF NOT EXISTS request_logs_duration_idx ON request_logs ("durationMs");
      `);
   }

   private async migrateIntegrationCallLogsTable() {
      await this.sequelize.query(`
         CREATE TABLE IF NOT EXISTS integration_call_logs (
            id SERIAL PRIMARY KEY,
            "requestId" VARCHAR(64) NULL,
            integration VARCHAR(128) NOT NULL,
            method VARCHAR(16) NOT NULL,
            url VARCHAR(1024) NOT NULL,
            "statusCode" INTEGER NULL,
            "durationMs" INTEGER NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 1,
            "timedOut" BOOLEAN NOT NULL DEFAULT FALSE,
            error TEXT NULL,
            "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
         );
      `);

      await this.sequelize.query(`
         CREATE INDEX IF NOT EXISTS integration_call_logs_created_at_idx
            ON integration_call_logs ("createdAt");
         CREATE INDEX IF NOT EXISTS integration_call_logs_integration_idx
            ON integration_call_logs (integration, "createdAt");
         CREATE INDEX IF NOT EXISTS integration_call_logs_request_id_idx
            ON integration_call_logs ("requestId");
      `);
   }
}
