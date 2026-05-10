import { Injectable } from '@nestjs/common';
import { KtakIntegration } from 'src/Infrustructure/Services/KtakIntegration/Ktak.integration';

@Injectable()
export class KtakService {
   constructor(private readonly ktakIntegration: KtakIntegration) {}

   async getStudentsDB(pnum: string) {
      const response = await this.ktakIntegration.getStudentInfo({ ssn: pnum });
      return response;
   }
}
