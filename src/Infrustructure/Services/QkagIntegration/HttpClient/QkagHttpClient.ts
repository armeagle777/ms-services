import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { QkagConnector } from '../QkagConnector';
import { QkagDocumentsEndponits } from './Endpoints';

@Injectable()
export class QkagHttpClient {
   QkagDocuments: QkagDocumentsEndponits;

   constructor(private configService: ConfigService) {
      const httpAxiosInstance = new QkagConnector(this.configService).getAxiosInstance();

      this.QkagDocuments = new QkagDocumentsEndponits(httpAxiosInstance);
   }
}
