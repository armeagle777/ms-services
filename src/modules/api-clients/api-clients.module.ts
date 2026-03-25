import { Module } from '@nestjs/common';
import { APIClientsService } from './api-clients.service';

@Module({
   providers: [APIClientsService],
   exports: [APIClientsService],
})
export class APIClientsModule {}
