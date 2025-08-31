import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { AsylumController, WorkPermitController } from './Controllers';
import { CoreModule } from 'src/Core/Core.module';
import { SignatureVerificationMiddleware } from './Middlewares';

@Module({
   imports: [CoreModule],
   controllers: [AsylumController, WorkPermitController],
   providers: [],
})
export class APIModule implements NestModule {
   configure(consumer: MiddlewareConsumer) {
      consumer
         .apply(SignatureVerificationMiddleware)
         .exclude(
            { path: 'work-permit/countries', method: RequestMethod.GET },
            { path: 'work-permit/diagnosis', method: RequestMethod.GET },
            { path: 'asylum/filter/options', method: RequestMethod.GET },
         )
         .forRoutes(WorkPermitController, AsylumController);
   }
}
{
}
