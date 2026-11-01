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
      const normalizedSearchedSsn = this.normalizePsn(searchedSsn);

      return Object.fromEntries(
         entries.filter(([, document]) => {
            if (document.type !== 'birth') {
               return false;
            }

            const childPsn = this.normalizePsn(document.child?.psn);
            return (
               childPsn !== normalizedSearchedSsn &&
               !this.isAtLeastAge(document.child?.base_info?.birth_date, 16)
            );
         }),
      );
   }

   private normalizePsn(psn: string | undefined): string | undefined {
      const normalized = psn?.trim();
      return normalized || undefined;
   }

   private isAtLeastAge(birthDate: string | undefined, minimumAge: number): boolean {
      const parsedBirthDate = this.parseDate(birthDate);
      if (!parsedBirthDate) {
         return false;
      }

      const today = new Date();
      const age =
         today.getFullYear() -
         parsedBirthDate.year -
         (today.getMonth() + 1 < parsedBirthDate.month ||
         (today.getMonth() + 1 === parsedBirthDate.month && today.getDate() < parsedBirthDate.day)
            ? 1
            : 0);

      return age >= minimumAge;
   }

   private parseDate(
      value: string | undefined,
   ): { year: number; month: number; day: number } | undefined {
      const normalized = value?.trim();
      if (!normalized) {
         return undefined;
      }

      const yearFirst = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(normalized);
      const dayFirst = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(normalized);
      const match = yearFirst || dayFirst;
      if (!match) {
         return undefined;
      }

      const year = Number(yearFirst ? match[1] : match[3]);
      const month = Number(match[2]);
      const day = Number(yearFirst ? match[3] : match[1]);
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

      if (month < 1 || month > 12 || day < 1 || day > daysInMonth) {
         return undefined;
      }

      return { year, month, day };
   }
}
