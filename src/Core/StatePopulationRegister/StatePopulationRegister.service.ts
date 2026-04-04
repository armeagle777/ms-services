import { Injectable } from '@nestjs/common';
import { StatePopulationRegisterIntegration } from 'src/Infrustructure/Services/StatePopulationRegisterIntegration/StatePopulationRegister.integration';

import { SearchPersonsRequestDto } from 'src/API/DTO/Persons';
import {
   PersonResponse,
   PersonSearchResponse,
} from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class StatePopulationRegister {
   constructor(private readonly statePopulationRegister: StatePopulationRegisterIntegration) {}

   async getPersonBySsn(ssn: string): Promise<PersonResponse | []> {
      const result = await this.statePopulationRegister.getPersonBySsn(ssn);

      if (!result || Array.isArray(result)) {
         return [];
      }

      const person = result as any;
      const { AVVDocuments, AVVAddresses, ...restInfo } = person;

      const addresses = AVVAddresses?.AVVAddress || [];
      const documents = AVVDocuments?.Document || [];

      return { addresses, documents, ...restInfo } as PersonResponse;
   }

   async getSearchedPersons(body: SearchPersonsRequestDto): Promise<PersonSearchResponse[]> {
      const { firstName, lastName, patronomicName, birthDate, documentNumber, ssn } = body || {};

      const searchData: Record<string, unknown> = {};

      if (ssn) searchData.psn = ssn;
      if (firstName) searchData.first_name = firstName;
      if (lastName) searchData.last_name = lastName;
      if (patronomicName) searchData.middle_name = patronomicName;
      if (birthDate) searchData.birth_date = birthDate;
      if (documentNumber) searchData.docnum = documentNumber;

      const result = await this.statePopulationRegister.searchPersons(searchData);

      if (!Array.isArray(result)) return [];

      return result.map((person: Record<string, unknown>) => {
         const { AVVDocuments, AVVAddresses, ...restInfo } = person as any;
         const addresses = AVVAddresses?.AVVAddress || [];
         const documents = AVVDocuments?.Document || [];
         return { addresses, documents, ...restInfo } as PersonSearchResponse;
      });
   }
}
