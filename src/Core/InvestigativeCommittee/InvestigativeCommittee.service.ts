import { Injectable } from '@nestjs/common';
import { InvestigativeCommitteeIntegration } from 'src/Infrustructure/Services/InvestigativeCommitteeIntegration/InvestigativeCommitee.integration';

@Injectable()
export class InvestigativeCommitteeService {
   constructor(private readonly icIntegration: InvestigativeCommitteeIntegration) {}

   async searchWantedPersons(body) {
      const response = await this.icIntegration.searchWantedPersons(body);
      return response;
   }
}
