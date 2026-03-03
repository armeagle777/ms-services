import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import {
   ArtsakhController,
   AsylumController,
   EsignController,
   InterpolController,
   KadastrController,
   McsController,
   MojCesController,
   PersonsController,
   PetregistrController,
   SphereController,
   StatisticsController,
   TaxController,
   WorkPermitController,
} from './Controllers';
import { CoreModule } from 'src/Core/Core.module';
import { SignatureVerificationMiddleware } from './Middlewares';

@Module({
   imports: [CoreModule],
   controllers: [
      AsylumController,
      WorkPermitController,
      PersonsController,
      PetregistrController,
      KadastrController,
      ArtsakhController,
      MojCesController,
      TaxController,
      SphereController,
      McsController,
      InterpolController,
      EsignController,
      StatisticsController,
   ],
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
