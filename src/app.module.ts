import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APIModule } from './API/APIModule';
import { DatabaseModule } from './Infrustructure/Database/Database.module';
import { AdminModule } from './modules/auth/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      APIModule,
      DatabaseModule,
      AuthModule,
      // AdminModule,
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
