import {
   Body,
   Controller,
   Post,
   UseGuards,
   // UseInterceptors
} from '@nestjs/common';

import { KtakService } from 'src/Core/Ktak/Ktak.service';
import { KtakStudentsRequestDto } from 'src/API/DTO/Ktak/ktak.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
// import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('ktak')
@UseGuards(BasicAuthGuard)
// @UseInterceptors(ProtectedRequestLoggingInterceptor)
export class KtakController {
   constructor(private readonly ktakService: KtakService) {}

   @Post('students')
   getStudents(@Body() body: KtakStudentsRequestDto) {
      return this.ktakService.getStudentsDB(body.pnum);
   }
}
