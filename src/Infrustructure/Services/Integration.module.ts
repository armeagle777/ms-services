import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { WPBackendIntegration, WPBackendHttpClient } from './WPBackendIntegration';
import { AsylumBackendIntegration, AsylumBackendHttpClient } from './AsylumBackendIntegration';
import { EkengIntegration } from './EkengIntegration/Ekeng.integration';
import { PkiClientService } from './ESignIntegration/PkiClient.service';

@Module({
   imports: [HttpModule],
   exports: [WPBackendIntegration, AsylumBackendIntegration, EkengIntegration, PkiClientService],
   providers: [
      WPBackendIntegration,
      AsylumBackendIntegration,
      WPBackendHttpClient,
      AsylumBackendHttpClient,
      EkengIntegration,
      PkiClientService,
   ],
})
export class IntegrationModule {}
