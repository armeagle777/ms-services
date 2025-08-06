import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APIModule } from './API/APIModule';
import { DatabaseModule } from './Infrustructure/Database/Database.module';

@Module({
   imports: [ConfigModule.forRoot({ isGlobal: true }), APIModule, DatabaseModule],
   controllers: [],
   providers: [],
})
export class AppModule {}
