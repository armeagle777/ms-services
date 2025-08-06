import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
   formatGetWpQuery,
   formatGetEatmQuery,
   formatFilterWpPersonsSubQuery,
   formatGetEatmFamilyMemberQuery,
} from './Helpers';

@Injectable()
export class PersonService {
   constructor(@Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize) {}

   async getWpData(pnum: string) {
      const [results] = await this.wpDb.query(formatGetWpQuery(pnum));
      return results;
   }

   async getEatmData(pnum: string) {
      const [results] = await this.wpDb.query(formatGetEatmQuery(pnum));
      return results;
   }

   async getEatmFamilyData(pnum: string) {
      const [results] = await this.wpDb.query(formatGetEatmFamilyMemberQuery(pnum));
      return results;
   }

   async filterPaginatedWpData(filters, { pagination }) {
      const { page, pageSize } = pagination;
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const countSubQuery = formatFilterWpPersonsSubQuery(filters);
      const query = `${countSubQuery} LIMIT :limit OFFSET :offset`;

      // Get total count of records
      const countResult = await this.wpDb.query(countSubQuery);
      const total = countResult?.length || 0;

      // Get paginated records
      const [persons] = await this.wpDb.query(query, {
         replacements: { limit, offset },
      });

      // Calculate total pages
      const totalPages = Math.ceil(total / pageSize);

      const response = {
         data: persons,
         pagination: {
            total,
            page,
            pageSize,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
         },
      };

      return response;
   }
}
