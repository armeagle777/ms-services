import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sequelize,  QueryTypes} from 'sequelize';

import { ArtsakhController } from './artsakh.controller';
import { ArtsakhService } from './artsakh.service';
import { ARTSAKH_SEQUELIZE } from './artsakh.tokens';

@Module({
  imports: [ConfigModule],
  controllers: [ArtsakhController],
  providers: [
    ArtsakhService,
    {
      provide: ARTSAKH_SEQUELIZE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DATABASE_HOST');
        const db = configService.get<string>('ARTSAKH_DATABASE_NAME');
        const username = configService.get<string>('DATABASE_USERNAME');
        const password = configService.get<string>('DATABASE_PASSWORD');

        const sequelize = new Sequelize(db || '', username || '', password || '', {
          host,
          dialect: 'mysql',
          logging: false,
        });

        return sequelize;
      },
    },
  ],
  exports: [ArtsakhService],
})
export class ArtsakhModule {}
