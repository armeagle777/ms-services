import { Injectable } from '@nestjs/common';
import { CadastreClientIntegration } from 'src/Infrustructure/Services/CadastreClientIntegration/CadastreClient.integration';
import { getCurrentDate } from './Cadastre.helpers';
import { SEARCH_BASES } from './Cadastre.constants';

@Injectable()
export class CadastreService {
   constructor(private readonly cadastreClient: CadastreClientIntegration) {}

   async getPropertiesBySsn(ssn: string): Promise<any[]> {
      const endpoint = '/get_realty_owned/v1';

      const body = {
         ssn,
         date_from: '01/01/1970',
         date_to: getCurrentDate(),
      };

      const result = await this.cadastreClient.executeRequest(endpoint, body);

      return result;
   }

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

      return result;
   }
}
