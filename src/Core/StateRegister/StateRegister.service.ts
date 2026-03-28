import { Injectable } from '@nestjs/common';
import { EkengBasicClientIntegration } from 'src/Infrustructure/Services/EkengBasicClientIntegration/EkengBasicClient.integration';

@Injectable()
export class StateRegisterService {
   private readonly endpoint = '/eregister/json_rpc';

   constructor(private readonly ekengBasicClient: EkengBasicClientIntegration) {}

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
}
