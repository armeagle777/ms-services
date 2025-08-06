import { Injectable } from '@nestjs/common';
import { CountryService } from '../Country/Country.service';
import { PersonService } from '../Person/Person.service';
import { extractWpData } from '../Person/Helpers';

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

   async filterPersonWpData(filterData) {
      const { page = 1, pageSize = 10, filters } = filterData;

      const paginatedResult = await this.personService.filterPaginatedWpData(filters, {
         pagination: { page, pageSize },
      });

      return paginatedResult;
   }

   async getPersonDetailData(id, body) {
      const { tablename: procedure, user_id } = body;

      //       const queries = [
      //          { key: 'baseInfo', query: getFullInfoBaseQuery(procedure, id) }, //for tab 1
      //          { key: 'fines', query: getFinesQuery(procedure, id) }, //for tab 4
      //          { key: 'claims', query: getClaimsQuery(procedure, id) }, // for tab 2
      //          { key: 'cards', query: getCardsQuery(procedure, id) }, // for tab 3
      //          ...(procedure === TABLE_NAMES.EAEU
      //             ? [
      //                  {
      //                     key: 'familyMembers',
      //                     query: getFamilyMemberQuery(procedure, user_id),
      //                  },
      //               ]
      //             : []), // conditional for tab 5
      //       ];
      //       const resultsArray = await Promise.all(queries.map((q) => wpSequelize.query(q.query)));
      //       const results = {};
      //       queries.forEach((q, i) => {
      //          results[q.key] = q.key === 'baseInfo' ? formatBaseResult(resultsArray[i]) : resultsArray[i];
      //       });
      //       return results;
   }
}
