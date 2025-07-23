import { Module } from '@nestjs/common';
import { QkagIntegration } from './QkagIntegration/Qkag.integration';
import { QkagHttpClient } from './QkagIntegration/HttpClient/QkagHttpClient';

@Module({
   providers: [QkagIntegration, QkagHttpClient],
   exports: [QkagIntegration, QkagHttpClient],
   imports: [],
})
export class IntegrationModule {}
