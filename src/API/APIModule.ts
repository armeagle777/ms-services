import {
   // MiddlewareConsumer,
   Module,
   // NestModule, RequestMethod
} from '@nestjs/common';

import {
   ArtsakhController,
   InvestigativeCommitteeController,
   InterpolController,
   KadastrController,
   PersonsController,
   SphereController,
   StatisticsController,
   StateRegisterController,
   CadastreController,
   MigrationCitizenServiceController,
   RevenueCommitteeController,
   StatePopulationRegisterController,
   TaxServiceController,
   CivilActsRegistrationController,
} from './Controllers';
import { CoreModule } from 'src/Core/Core.module';
import { BasicAuthGuard } from './Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from './Interceptors/ProtectedRequestLogging.interceptor';
import { MinistryOfJusticeController } from './Controllers/MinistryOfJutice.controller';
// import { SignatureVerificationMiddleware } from './Middlewares';

@Module({
   imports: [CoreModule],
   controllers: [
      PersonsController,
      KadastrController,
      ArtsakhController,
      MinistryOfJusticeController,
      RevenueCommitteeController,
      SphereController,
      InterpolController,
      StatisticsController,
      InvestigativeCommitteeController,
      StateRegisterController,
      CadastreController,
      MigrationCitizenServiceController,
      StatePopulationRegisterController,
      TaxServiceController,
      CivilActsRegistrationController,
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
