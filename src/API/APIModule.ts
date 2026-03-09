import {
   // MiddlewareConsumer,
   Module,
   // NestModule, RequestMethod
} from '@nestjs/common';

import {
   ArtsakhController,
   EsignController,
   IcController,
   InterpolController,
   KadastrController,
   McsController,
   MojCesController,
   PersonsController,
   PetregistrController,
   SphereController,
   StatisticsController,
   TaxController,
} from './Controllers';
import { CoreModule } from 'src/Core/Core.module';
// import { SignatureVerificationMiddleware } from './Middlewares';

@Module({
   imports: [CoreModule],
   controllers: [
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
      IcController,
   ],
   providers: [],
})
export class APIModule {
   // configure(consumer: MiddlewareConsumer) {
   //    consumer
   //       .apply(SignatureVerificationMiddleware)
   //       .exclude(
   //          { path: 'work-permit/countries', method: RequestMethod.GET },
   //          { path: 'work-permit/diagnosis', method: RequestMethod.GET },
   //          { path: 'asylum/filter/options', method: RequestMethod.GET },
   //       )
   //       .forRoutes(WorkPermitController, AsylumController);
   // }
}
// {}
