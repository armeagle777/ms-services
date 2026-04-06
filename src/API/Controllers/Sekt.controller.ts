import { Controller, Post, Body } from '@nestjs/common';

import { SektService } from 'src/Core/Sekt/Sekt.service';
import { BordercrossRequestDto } from 'src/API/DTO/Persons';

@Controller('sekt')
export class SektController {
   constructor(private readonly sektService: SektService) {}

   @Post('bordercross')
   getBordercrossBySsn(@Body() body: BordercrossRequestDto) {
      return this.sektService.getBordercrossBySsn(body.passportNumber, body.citizenship);
   }
}
