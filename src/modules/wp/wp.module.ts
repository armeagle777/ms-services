import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sequelize,  QueryTypes} from 'sequelize';

import { WpController } from './wp.controller';
import { WpService } from './wp.service';
import { WP_SEQUELIZE } from './wp.tokens';

@Module({
  imports: [ConfigModule],
  controllers: [WpController],
  providers: [
    WpService,
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
  exports: [WpService],
})
export class WpModule {}
