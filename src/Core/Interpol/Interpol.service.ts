import { BadRequestException, Injectable } from '@nestjs/common';
import type {
   InterpolDetailsResponse,
   InterpolFileResponse,
   InterpolNominalSearchParams,
   InterpolSearchResponse,
   InterpolSltdDetailsResponse,
   InterpolSltdSearchResponse,
} from 'src/Infrustructure/Services/InterpolIntegration/Models/interpol.types';

import { InterpolIntegration } from 'src/Infrustructure/Services/InterpolIntegration/Interpol.integration';
import {
   InterpolSearchRequestDto,
   InterpolSltdSearchRequestDto,
} from 'src/API/DTO/Interpol/interpol.dto';

@Injectable()
export class InterpolService {
   constructor(private readonly interpolIntegration: InterpolIntegration) {}

   async search(body: InterpolSearchRequestDto): Promise<InterpolSearchResponse> {
      const params = this.normalizeNominalSearch(body);
      return this.interpolIntegration.search(params);
   }

   async sltdSearch(body: InterpolSltdSearchRequestDto): Promise<InterpolSltdSearchResponse> {
      const din = (body?.din || '').trim();
      const countryOfRegistration = (body?.countryOfRegistration || '').trim();
      const typeOfDocument = (body?.typeOfDocument || '').trim();

      if (!din || !countryOfRegistration || !typeOfDocument) {
         throw new BadRequestException(
            'din, countryOfRegistration and typeOfDocument are required',
         );
      }

      const safeNb = this.parseNbRecord(body?.nb);

      return this.interpolIntegration.sltdSearch({
         din,
         countryOfRegistration,
         typeOfDocument,
         nbRecord: safeNb,
      });
   }

   async sltdDetails(id: string): Promise<InterpolSltdDetailsResponse> {
      const normalizedId = (id || '').trim();
      if (!normalizedId) {
         throw new BadRequestException('id is required');
      }

      return this.interpolIntegration.sltdDetails(normalizedId);
   }

   async details(itemId: string): Promise<InterpolDetailsResponse> {
      const normalizedItemId = (itemId || '').trim();
      if (!normalizedItemId) {
         throw new BadRequestException('item_id is required');
      }

      return this.interpolIntegration.details(normalizedItemId);
   }

   async getNoticePdf(pathToNotice: string): Promise<InterpolFileResponse> {
      const normalizedPath = (pathToNotice || '').trim();
      if (!normalizedPath) {
         throw new BadRequestException('path is required');
      }

      return this.interpolIntegration.getNoticePdfFile(normalizedPath);
   }

   async getImageFile(itemId: string, imagePath: string): Promise<InterpolFileResponse> {
      const normalizedItemId = (itemId || '').trim();
      const normalizedPath = (imagePath || '').trim();
      if (!normalizedItemId || !normalizedPath) {
         throw new BadRequestException('item_id and path are required');
      }

      return this.interpolIntegration.imageFile(normalizedItemId, normalizedPath);
   }

   private parseNbRecord(nb?: number) {
      const numberValue = Number(nb);
      if (!Number.isFinite(numberValue) || numberValue < 1) return 10;
      return Math.min(Math.floor(numberValue), 100);
   }

   private normalizeNominalSearch(body: InterpolSearchRequestDto): InterpolNominalSearchParams {
      const name = this.normalizeString(body?.name);
      const forename = this.normalizeString(body?.forename);
      const identity = this.normalizeString(body?.identity);
      const entityId = this.normalizeString(body?.entityId);
      const dateOfBirth = this.validateDobDdMmYyyy(
         this.normalizeString(body?.dateOfBirth) || this.normalizeString(body?.dob),
      );
      const ageMin = this.parseAge(body?.ageMin, 'ageMin');
      const ageMax = this.parseAge(body?.ageMax, 'ageMax');
      const nbRecord = this.parseNbRecord(body?.nbRecord ?? body?.nb);

      const hasNameSearch = Boolean(name);
      const hasIdentitySearch = Boolean(identity);
      const hasEntityIdSearch = Boolean(entityId);
      const hasAgeBounds = ageMin !== undefined || ageMax !== undefined;
      const hasDateOfBirth = Boolean(dateOfBirth);
      const hasAnyCriteria = Boolean(
         name ||
            forename ||
            hasIdentitySearch ||
            hasEntityIdSearch ||
            hasAgeBounds ||
            hasDateOfBirth,
      );

      if (!hasAnyCriteria) {
         throw new BadRequestException(
            'At least one search criterion is required: name, identity, or entityId.',
         );
      }

      if (!hasNameSearch && (forename || hasAgeBounds || hasDateOfBirth)) {
         throw new BadRequestException(
            'forename, ageMin, ageMax, and dateOfBirth can only be used together with name.',
         );
      }

      if (hasNameSearch && hasIdentitySearch) {
         throw new BadRequestException('Cannot search both name and identity.');
      }

      if (hasNameSearch && hasEntityIdSearch) {
         throw new BadRequestException('Cannot search both name and entityId.');
      }

      if (hasIdentitySearch && hasEntityIdSearch) {
         throw new BadRequestException('Cannot search both identity and entityId.');
      }

      if (hasAgeBounds && hasDateOfBirth) {
         throw new BadRequestException('Cannot search both age limits and dateOfBirth.');
      }

      if (ageMin !== undefined && ageMax !== undefined && ageMin > ageMax) {
         throw new BadRequestException('ageMin cannot be greater than ageMax.');
      }

      return {
         name,
         forename,
         ageMin,
         ageMax,
         dateOfBirth,
         identity,
         entityId,
         nbRecord,
      };
   }

   private normalizeString(value?: string) {
      return (value || '').trim();
   }

   private parseAge(value: number | string | undefined, fieldName: 'ageMin' | 'ageMax') {
      if (value === undefined || value === null || value === '') return undefined;

      const numberValue = Number(value);
      if (!Number.isInteger(numberValue) || numberValue < 0) {
         throw new BadRequestException(`${fieldName} must be a non-negative integer.`);
      }

      return numberValue;
   }

   private validateDobDdMmYyyy(dob: string) {
      if (!dob) return '';

      const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) {
         throw new BadRequestException(
            'Date of birth must be dd/mm/yyyy (e.g., 15/03/1971) or empty.',
         );
      }

      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);
      const dt = new Date(Date.UTC(year, month - 1, day));

      if (
         dt.getUTCFullYear() !== year ||
         dt.getUTCMonth() !== month - 1 ||
         dt.getUTCDate() !== day
      ) {
         throw new BadRequestException(
            'Date of birth must be dd/mm/yyyy (e.g., 15/03/1971) or empty.',
         );
      }

      return dob;
   }
}
