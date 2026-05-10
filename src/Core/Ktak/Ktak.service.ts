import { Injectable } from '@nestjs/common';
import { KtakIntegration } from 'src/Infrustructure/Services/KtakIntegration/Ktak.integration';

@Injectable()
export class KtakService {
   constructor(private readonly ktakIntegration: KtakIntegration) {}

   async getStudentsDB(pnum: string): Promise<unknown[]> {
      const data = await this.ktakIntegration.getStudentInfo({ ssn: pnum });
      return data?.get_student_info_response?.data || [];
   }
}
