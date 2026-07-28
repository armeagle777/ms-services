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

/**
 * Bounds for the INTERPOL FIND `Rankthreshold` (SearchEx) parameter.
 *
 * The FIND 1.2 nominal service reference does not publish an explicit range; it only
 * documents that "a threshold of 10 only return exact match on name, forename and date
 * of birth". We therefore treat 10 as the strictest/most relevant value and 0 as the
 * loosest, and default to the strictest when the client does not supply a score.
 */
const RANK_THRESHOLD_MIN = 0;
const RANK_THRESHOLD_MAX = 10;
const RANK_THRESHOLD_DEFAULT = RANK_THRESHOLD_MAX;

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

   /**
    * Resolves the `Rankthreshold` sent to INTERPOL.
    *
    * When the client supplies a score it must be an integer within
    * [RANK_THRESHOLD_MIN, RANK_THRESHOLD_MAX] — anything else is rejected rather than
    * silently coerced, so callers cannot accidentally widen the search. When no score is
    * supplied we fall back to the strictest value, i.e. the most relevant search.
    */
   private parseRankThreshold(score?: number | string) {
      if (score === undefined || score === null || score === '') {
         return RANK_THRESHOLD_DEFAULT;
      }

      const numberValue = Number(score);
      if (
         !Number.isInteger(numberValue) ||
         numberValue < RANK_THRESHOLD_MIN ||
         numberValue > RANK_THRESHOLD_MAX
      ) {
         throw new BadRequestException(
            `score must be an integer between ${RANK_THRESHOLD_MIN} and ${RANK_THRESHOLD_MAX}, where ${RANK_THRESHOLD_MAX} is the most relevant (exact) match.`,
         );
      }

      return numberValue;
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
      const rankThreshold = this.parseRankThreshold(body?.score);

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
         rankThreshold,
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
