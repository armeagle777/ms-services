import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { QkagHttpClient } from './HttpClient/QkagHttpClient';

@Injectable()
export class QkagIntegration {
   constructor(private qkagClient: QkagHttpClient) {}

   // Qkag Documents
   async getDocumentsBySsn(ssn: string) {
      const documents = await this.qkagClient.QkagDocuments.getQkagDocuments(ssn);
      if (!documents) throw new HttpException('Documents not found', HttpStatus.NOT_FOUND);
      return documents.data;
   }
}
