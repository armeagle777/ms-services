import { BadRequestException, Injectable } from '@nestjs/common';
import type {
   InterpolDetailsResponse,
   InterpolFileResponse,
   InterpolSearchResponse,
   InterpolSltdSearchResponse,
} from 'src/Infrustructure/Services/InterpolIntegration/interpol.types';

import { InterpolIntegration } from 'src/Infrustructure/Services/InterpolIntegration/Interpol.integration';
import {
   InterpolSearchRequestDto,
   InterpolSltdSearchRequestDto,
} from 'src/API/DTO/Interpol/interpol.dto';

@Injectable()
export class InterpolService {
   constructor(private readonly interpolIntegration: InterpolIntegration) {}

   async search(body: InterpolSearchRequestDto): Promise<InterpolSearchResponse> {
      const name = (body?.name || '').trim();
      const forename = (body?.forename || '').trim();
      const dobInput = (body?.dob || '').trim();

      if (!name || !forename) {
         throw new BadRequestException('name and forename are required');
      }

      const dob = this.validateDobDdMmYyyy(dobInput);
      const safeNb = this.parseNbRecord(body?.nb);

      return this.interpolIntegration.search({
         name,
         forename,
         dobDdMmYyyy: dob,
         nbRecord: safeNb,
      });
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
      return Math.min(Math.floor(numberValue), 50);
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
