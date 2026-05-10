import { Injectable } from '@nestjs/common';
import { PoliceVarchDto } from 'src/API/DTO/Ic/police-varch.dto';
import { InvestigativeCommitteeIntegration } from 'src/Infrustructure/Services/InvestigativeCommitteeIntegration/InvestigativeCommitee.integration';

@Injectable()
export class InvestigativeCommitteeService {
   constructor(private readonly icIntegration: InvestigativeCommitteeIntegration) {}

   async searchWantedPersons(body) {
      const response = await this.icIntegration.searchWantedPersons(body);
      return response;
   }

   async getPoliceVarch(body: PoliceVarchDto) {
      const response = await this.icIntegration.getPoliceVarch(body);
      return response;
   }
}
