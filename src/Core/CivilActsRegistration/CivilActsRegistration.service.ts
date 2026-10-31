import { Injectable, BadRequestException } from '@nestjs/common';
import {
   CivilActsRegistrationIntegration,
   CivilActsRegistrationRequest,
   CivilActsRegistrationResponse,
} from 'src/Infrustructure/Services/CivilActsRegistrationIntegration/CivilActsRegistration.integration';
import { CivilActDocument } from 'src/Infrustructure/Services/CivilActsRegistrationIntegration/CivilActsRegistration.types';
import { QkagDocumentResponse } from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class CivilActsRegistrationService {
   constructor(private readonly civilActsIntegration: CivilActsRegistrationIntegration) {}

   async getCivilActsInfoBySsn(
      ssn: string,
      firstName: string,
      lastName: string,
   ): Promise<QkagDocumentResponse[]> {
      if (!ssn || !firstName || !lastName) {
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

   async getCivilActsInfoBySsnRaw(
      ssn: string,
      firstName: string,
      lastName: string,
   ): Promise<CivilActsRegistrationResponse> {
      if (!ssn || !firstName || !lastName) {
         throw new BadRequestException('Missing fields');
      }

      const request: CivilActsRegistrationRequest = {
         ssn,
         firstName,
         lastName,
      };

      const response = await this.civilActsIntegration.getCivilActsInfoBySsn(request);

      return {
         ...response,
         result: this.filterChildDocuments(response.result, ssn),
      };
   }

   private filterChildDocuments(
      result: Record<string, CivilActDocument>,
      searchedSsn: string,
   ): Record<string, CivilActDocument> {
      const entries = Object.entries(result || {});
      const birthChildPsns = new Set(
         entries
            .filter(([, document]) => document.type === 'birth')
            .map(([, document]) => this.normalizePsn(document.child?.psn))
            .filter((psn): psn is string => Boolean(psn)),
      );
      const normalizedSearchedSsn = this.normalizePsn(searchedSsn);

      return Object.fromEntries(
         entries.filter(([, document]) => {
            const childPsn = this.normalizePsn(document.child?.psn);

            if (document.type === 'birth') {
               return childPsn !== normalizedSearchedSsn;
            }

            if (document.type === 'paternity') {
               return !childPsn || !birthChildPsns.has(childPsn);
            }

            return false;
         }),
      );
   }

   private normalizePsn(psn: string | undefined): string | undefined {
      const normalized = psn?.trim();
      return normalized || undefined;
   }
}
