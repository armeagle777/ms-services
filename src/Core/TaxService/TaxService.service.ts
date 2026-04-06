import { Injectable } from '@nestjs/common';
import { TaxServiceIntegration } from 'src/Infrustructure/Services/TaxServiceIntegration/TaxService.integration';

export interface TaxPayerInfo {
   // Define the structure based on the API response
   [key: string]: any;
}

@Injectable()
export class TaxService {
   constructor(private readonly taxServiceIntegration: TaxServiceIntegration) {}

   async getTaxBySsnDb(ssn: string): Promise<TaxPayerInfo[]> {
      const data = await this.taxServiceIntegration.getTaxBySsn(ssn);

      if (!data.taxPayersInfo) {
         return [];
      }

      const {
         taxPayersInfo: { taxPayerInfo },
      } = data;

      return taxPayerInfo;
   }
}
