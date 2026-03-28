import { Injectable } from '@nestjs/common';
import { CadastreClientIntegration } from 'src/Infrustructure/Services/CadastreClientIntegration/CadastreClient.integration';
import { getCurrentDate } from './Cadastre.helpers';
import { SEARCH_BASES } from './Cadastre.constants';

@Injectable()
export class CadastreService {
   constructor(private readonly cadastreClient: CadastreClientIntegration) {}

   /**
    * Get properties by SSN
    * @param ssn - Social Security Number
    * @returns Array of owned realties
    */
   async getPropertiesBySsn(ssn: string): Promise<any[]> {
      const endpoint = '/get_realty_owned/v1';

      const body = {
         ssn,
         date_from: '01/01/1970',
         date_to: getCurrentDate(),
      };

      const result = await this.cadastreClient.executeRequest(endpoint, body);

      return Array.isArray(result) ? result : [];
   }

   /**
    * Get property by certificate number
    * @param certificateNumber - Certificate number
    * @param searchBase - Search base type (default: 'cert_number')
    * @returns Array of realties
    */
   async getPropertyByCertificate(
      certificateNumber: string,
      searchBase: string = 'cert_number',
   ): Promise<any[]> {
      const endpoint = '/get_realty_gip/v1';

      const searchProp = SEARCH_BASES[searchBase] || 'cert_number';
      const body = {
         [searchProp]: certificateNumber,
         date_from: '01/01/1970',
         date_to: getCurrentDate(),
      };

      const result = await this.cadastreClient.executeRequest(endpoint, body);

      return Array.isArray(result) ? result : [];
   }
}
