import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from 'src/modules/auth/guards/basic-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';

@Controller('person')
@UseGuards(BasicAuthGuard, PermissionGuard)
export class PersonController {
   @Post('search')
   searchPerson(@Body() body: Record<string, unknown>) {
      return {
         ok: true,
         action: 'search',
         payload: body,
      };
   }

   @Get(':id')
   getPerson(@Param('id') id: string) {
      return {
         ok: true,
         action: 'get',
         id,
      };
   }
}
