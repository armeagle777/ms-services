import { Injectable } from '@nestjs/common';
import { EkengBasicClientIntegration } from 'src/Infrustructure/Services/EkengBasicClientIntegration/EkengBasicClient.integration';
import { StateRegisterIntegration } from 'src/Infrustructure/Services/StateRegisterIntegration/StateRegister.integration';
import { StateRegisterCompanyResponse } from './StateRegister.types';

@Injectable()
export class StateRegisterService {
   private readonly endpoint = '/eregister/json_rpc';

   constructor(
      private readonly ekengBasicClient: EkengBasicClientIntegration,
      private readonly stateRegisterIntegration: StateRegisterIntegration,
   ) {}

   async getLegalEntitiesBySsn(ssn: string) {
      const result = await this.ekengBasicClient.makeJsonRpcRequest(this.endpoint, 'person_info', {
         ssn,
      });

      if (Array.isArray(result)) {
         return [];
      }

      const person = (result as any)?.person || {};
      const { companies, ...rest } = person;

      return {
         ...rest,
         companies: Object.values(companies || {}),
      };
   }

   async getCompanyByTaxId(taxId: string): Promise<StateRegisterCompanyResponse | []> {
      const data = await this.stateRegisterIntegration.getCompanyByTaxId({ taxId });
      if (!data?.result) return [];

      return data.result.company as StateRegisterCompanyResponse;
   }
}
