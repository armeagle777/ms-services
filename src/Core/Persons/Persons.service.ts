import { Injectable } from '@nestjs/common';
import { InvestigativeCommitteeIntegration } from 'src/Infrustructure/Services/InvestigativeCommitteeIntegration/InvestigativeCommitee.integration';

import { PoliceResponse } from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class PersonsService {
   constructor(private readonly icIntegration: InvestigativeCommitteeIntegration) {}

   async getPoliceByPnum(
      pnum: string,
      filters?: { firstName?: string; lastName?: string; birthDate?: string },
   ): Promise<PoliceResponse | ''> {
      return this.icIntegration.searchWantedPersons({
         pnum,
         firstName: filters?.firstName,
         lastName: filters?.lastName,
         birthDate: filters?.birthDate,
      });
   }
}
