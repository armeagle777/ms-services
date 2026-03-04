import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// import { EkengIntegration } from './EkengIntegration/Ekeng.integration';
import { PkiClientService } from './ESignIntegration/PkiClient.service';
import { InterpolIntegration } from './InterpolIntegration';

@Module({
   imports: [HttpModule],
   exports: [
      // EkengIntegration,
      PkiClientService,
      InterpolIntegration,
   ],
   providers: [
      // EkengIntegration,
      PkiClientService,
      InterpolIntegration,
   ],
})
export class IntegrationModule {}
