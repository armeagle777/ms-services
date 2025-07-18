import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APIModule } from './API/APIModule';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), APIModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
