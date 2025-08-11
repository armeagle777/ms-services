import { Module } from '@nestjs/common';
import { WPBackendIntegration } from './WPBackendIntegration/WPBackend.integration';
import { WPBackendHttpClient } from './WPBackendIntegration/HttpClient/WPBackendHttpClient';

@Module({
   imports: [],
   exports: [WPBackendIntegration],
   providers: [WPBackendIntegration, WPBackendHttpClient],
})
export class IntegrationModule {}
