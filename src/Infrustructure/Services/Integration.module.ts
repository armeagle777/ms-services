import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// import { EkengIntegration } from './EkengIntegration/Ekeng.integration';
import { PkiClientService } from './ESignIntegration/PkiClient.service';
import { InterpolIntegration } from './InterpolIntegration';
import { IcIntegration } from 'src/Infrustructure/Services/IcIntegration/Ic.integration';

@Module({
   imports: [HttpModule],
   exports: [
      // EkengIntegration,
      PkiClientService,
      InterpolIntegration,
      IcIntegration,
   ],
   providers: [
      // EkengIntegration,
      PkiClientService,
      InterpolIntegration,
      IcIntegration,
   ],
})
export class IntegrationModule {}
