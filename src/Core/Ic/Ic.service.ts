import { Injectable } from '@nestjs/common';
import { IcIntegration } from 'src/Infrustructure/Services/IcIntegration/Ic.integration';

@Injectable()
export class IcService {
   constructor(private readonly icIntegration: IcIntegration) {}

   async searchWantedPersons(body) {
      const response = await this.icIntegration.searchWantedPersons(body);
      return response;
   }
}
