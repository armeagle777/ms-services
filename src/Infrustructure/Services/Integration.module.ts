import { Module } from '@nestjs/common';
import { WPBackendIntegration } from './WPBackendIntegration/WPBackend.integration';

@Module({ imports: [], exports: [WPBackendIntegration], providers: [WPBackendIntegration] })
export class IntegrationModule {}
