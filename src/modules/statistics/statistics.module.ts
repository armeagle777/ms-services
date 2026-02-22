import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sequelize,  QueryTypes} from 'sequelize';

import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { SAHMANAHATUM_SEQUELIZE, STATISTICS_SEQUELIZE, WP_SEQUELIZE } from './statistics.tokens';

@Module({
  imports: [ConfigModule],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
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
      provide: WP_SEQUELIZE,
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
  ],
  exports: [StatisticsService],
})
export class StatisticsModule {}
