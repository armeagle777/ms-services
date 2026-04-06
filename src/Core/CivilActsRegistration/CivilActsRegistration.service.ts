import { Injectable, BadRequestException } from '@nestjs/common';
import {
   CivilActsRegistrationIntegration,
   CivilActsRegistrationRequest,
} from 'src/Infrustructure/Services/CivilActsRegistrationIntegration/CivilActsRegistration.integration';
import { QkagDocumentResponse } from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class CivilActsRegistrationService {
   constructor(private readonly civilActsIntegration: CivilActsRegistrationIntegration) {}

   async getCivilActsInfoBySsn(
      ssn: string,
      firstName: string,
      lastName: string,
   ): Promise<QkagDocumentResponse[]> {
      if (!firstName || !lastName) {
         throw new BadRequestException('Missing fields');
      }

      const request: CivilActsRegistrationRequest = {
         ssn,
         firstName,
         lastName,
      };

      const response = await this.civilActsIntegration.getCivilActsInfoBySsn(request);

      const { status, result } = response || {};
      const documents = Object.values(result || {});
      if (status === 'failed' || documents.length === 0) {
         return [];
      }

      return documents as QkagDocumentResponse[];
   }
}
