import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataTypes, Sequelize } from 'sequelize';

import { SphereController } from './sphere.controller';
import { SphereService } from './sphere.service';

export const SPHERE_SEQUELIZE = 'SPHERE_SEQUELIZE';
export const SPHERE_MODEL = 'SPHERE_MODEL';

@Module({
  imports: [ConfigModule],
  controllers: [SphereController],
  providers: [
    SphereService,
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
  ],
  exports: [SphereService],
})
export class SphereModule {}
