import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APIModule } from './API/APIModule';
import { RequestContextMiddleware } from './API/Middlewares/requestContext.middleware';
import { LoggingModule } from './Core/Logging/Logging.module';
import { DatabaseModule } from './Infrustructure/Database/Database.module';
// import { AdminModule } from './modules/auth/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      LoggingModule,
      APIModule,
      DatabaseModule,
      AuthModule,
      // AdminModule,
   ],
   controllers: [],
   providers: [],
})
export class AppModule implements NestModule {
   configure(consumer: MiddlewareConsumer) {
      // Must run first: opens the per-request correlation/timing scope.
      consumer.apply(RequestContextMiddleware).forRoutes('*');
   }
}
