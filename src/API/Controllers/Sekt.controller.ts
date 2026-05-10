import { Controller, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';

import { SektService } from 'src/Core/Sekt/Sekt.service';
import { BordercrossRequestDto } from 'src/API/DTO/Persons';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('sekt')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class SektController {
   constructor(private readonly sektService: SektService) {}

   @Post('bordercross')
   getBordercrossBySsn(@Body() body: BordercrossRequestDto) {
      return this.sektService.getBordercrossBySsn(body.passportNumber, body.citizenship);
   }
}
