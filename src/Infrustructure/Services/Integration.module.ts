import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { WPBackendIntegration, WPBackendHttpClient } from './WPBackendIntegration';
import { AsylumBackendIntegration, AsylumBackendHttpClient } from './AsylumBackendIntegration';
import { EkengIntegration } from './EkengIntegration/Ekeng.integration';
import { PkiClientService } from './ESignIntegration/PkiClient.service';
import { InterpolIntegration } from './InterpolIntegration';

@Module({
   imports: [HttpModule],
   exports: [
      WPBackendIntegration,
      AsylumBackendIntegration,
      EkengIntegration,
      PkiClientService,
      InterpolIntegration,
   ],
   providers: [
      WPBackendIntegration,
      AsylumBackendIntegration,
      WPBackendHttpClient,
      AsylumBackendHttpClient,
      EkengIntegration,
      PkiClientService,
      InterpolIntegration,
   ],
})
export class IntegrationModule {}
