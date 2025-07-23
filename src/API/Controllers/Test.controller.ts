import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { QkagIntegration } from 'src/Infrustructure/Services/QkagIntegration/Qkag.integration';

@Controller('test')
export class TestController {
   constructor(private readonly qkagIntegration: QkagIntegration) {}
   @Get()
   getTest() {
      return this.qkagIntegration.getDocumentsBySsn('ssss');
   }

   @Post()
   postTest(@Body() body: any) {
      return this.qkagIntegration.getDocumentsBySsn(body.ssn);
   }

   @Put()
   putTest(@Body() body: any) {
      return this.qkagIntegration.getDocumentsBySsn(body);
   }
}
