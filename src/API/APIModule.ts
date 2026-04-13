import {
   // MiddlewareConsumer,
   Module,
   // NestModule, RequestMethod
} from '@nestjs/common';

import {
   ArtsakhController,
   InvestigativeCommitteeController,
   InterpolController,
   StateRegisterController,
   CadastreController,
   MigrationCitizenServiceController,
   RevenueCommitteeController,
   StatePopulationRegisterController,
   TaxServiceController,
   CivilActsRegistrationController,
   SektController,
   RoadPoliceController,
} from './Controllers';
import { CoreModule } from 'src/Core/Core.module';
import { BasicAuthGuard } from './Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from './Interceptors/ProtectedRequestLogging.interceptor';
import { MinistryOfJusticeController } from './Controllers/MinistryOfJutice.controller';
// import { SignatureVerificationMiddleware } from './Middlewares';

@Module({
   imports: [CoreModule],
   controllers: [
      ArtsakhController,
      MinistryOfJusticeController,
      RevenueCommitteeController,
      InterpolController,
      InvestigativeCommitteeController,
      StateRegisterController,
      CadastreController,
      MigrationCitizenServiceController,
      StatePopulationRegisterController,
      TaxServiceController,
      CivilActsRegistrationController,
      SektController,
      RoadPoliceController,
   ],
   providers: [BasicAuthGuard, ProtectedRequestLoggingInterceptor],
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
