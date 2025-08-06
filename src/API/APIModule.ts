import { Module } from '@nestjs/common';

import { AsylumController, WorkPermitController } from './Controllers';
import { CoreModule } from 'src/Core/Core.module';

@Module({
   imports: [CoreModule],
   controllers: [AsylumController, WorkPermitController],
   providers: [],
})
export class APIModule {}
