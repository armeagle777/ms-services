import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HttpInstrumentationService } from 'src/Infrustructure/Http/HttpInstrumentation.service';
import { RequestLoggingService } from './RequestLogging.service';

/**
 * Global so that request logging and the outbound HTTP instrumentation are
 * installed exactly once, and are injectable anywhere without extra imports.
 */
@Global()
@Module({
   imports: [ConfigModule, HttpModule],
   providers: [RequestLoggingService, HttpInstrumentationService],
   exports: [RequestLoggingService, HttpInstrumentationService],
})
export class LoggingModule {}
