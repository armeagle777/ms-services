import { Module } from '@nestjs/common';

import {
   McsController,
   TaxController,
   EsignController,
   MojCesController,
   SphereController,
   ArtsakhController,
   KadastrController,
   PersonsController,
   InterpolController,
   PetregistrController,
   StatisticsController,
   InvestigativeCommitteeController,
} from './Controllers';
import { CoreModule } from 'src/Core/Core.module';
import { BasicAuthGuard } from './Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from './Interceptors/ProtectedRequestLogging.interceptor';

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
      InvestigativeCommitteeController,
   ],
   providers: [BasicAuthGuard, ProtectedRequestLoggingInterceptor],
})
export class APIModule {}
