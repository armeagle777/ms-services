import { Injectable } from '@nestjs/common';
import { CountryService } from '../Country/Country.service';
import { PersonService } from '../Person/Person.service';
import { extractWpData } from '../Person/Helpers';
import { PersonFilterWpDataValidator } from 'src/API/Validators/Person/PersonFilterWpData.validator';
import { PersonDetailWpData } from 'src/API/Validators/Person/PersonDetailWpData.validator';

@Injectable()
export class WorkPermitService {
   constructor(
      private readonly countryService: CountryService,
      private readonly personService: PersonService,
   ) {}
   async getCountries() {
      return this.countryService.findAll();
   }

   async getPersonWpData(pnum) {
      const promisess = [
         this.personService.getWpData(pnum),
         this.personService.getEatmData(pnum),
         this.personService.getEatmFamilyData(pnum),
      ];
      const [wpResponse, eatmResponse, eatmFamilyResponse] = await Promise.all(promisess);
      const { cards: wpCards, data: wpData } = extractWpData(wpResponse);
      const { cards: eatmCards, data: eatmData } = extractWpData(eatmResponse);
      const { cards: eatmFamilyCards, data: eatmFamilyData } = extractWpData(eatmFamilyResponse);
      return {
         wpData,
         eatmData,
         eatmFamilyData,
         cards: [...wpCards, ...eatmCards, ...eatmFamilyCards],
      };
   }

   async filterPersonWpData(filterData: PersonFilterWpDataValidator) {
      const { page = 1, pageSize = 10, filters } = filterData;

      return await this.personService.filterPaginatedWpData(filters, {
         pagination: { page, pageSize },
      });
   }

   async getPersonDetailData(id: number, body: PersonDetailWpData) {
      const { tablename: tableName, user_id } = body;

      return this.personService.getWpDataById({ id, tableName, user_id });
   }
}
