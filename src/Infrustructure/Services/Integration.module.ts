import { Module } from '@nestjs/common';

import { WPBackendIntegration, WPBackendHttpClient } from './WPBackendIntegration';
import { AsylumBackendIntegration, AsylumBackendHttpClient } from './AsylumBackendIntegration';

@Module({
   imports: [],
   exports: [WPBackendIntegration, AsylumBackendIntegration],
   providers: [
      WPBackendIntegration,
      AsylumBackendIntegration,
      WPBackendHttpClient,
      AsylumBackendHttpClient,
   ],
})
export class IntegrationModule {}
