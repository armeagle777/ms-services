import { Module } from '@nestjs/common';

import { TestController } from './Controllers';
import { QkagIntegration } from 'src/Infrustructure/Services/QkagIntegration/Qkag.integration';
import { IntegrationModule } from 'src/Infrustructure/Services/Integration.module';

@Module({
   imports: [IntegrationModule],
   controllers: [TestController],
   providers: [QkagIntegration],
})
export class APIModule {}
