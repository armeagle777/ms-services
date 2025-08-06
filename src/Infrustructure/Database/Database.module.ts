import { Global, Module } from '@nestjs/common';
import { WorkPermitDbProvider } from './WorkPermitDb/WorkPermitDb.provider';
import { AsylumDbProvider } from './AsylumDb/AsylumDb.provider';

@Global()
@Module({
   imports: [],
   exports: ['WORKPERMIT_CONNECTION', 'ASYLUM_CONNECTION'],
   providers: [WorkPermitDbProvider, AsylumDbProvider],
})
export class DatabaseModule {}
