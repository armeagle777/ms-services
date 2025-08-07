import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
   formatGetWpQuery,
   formatGetEatmQuery,
   formatFilterWpPersonsSubQuery,
   formatGetEatmFamilyMemberQuery,
   BuildWpQueries,
   formatBaseInfoResult,
} from './Helpers';
import { Filters } from 'src/API/Validators/Person/PersonFilterWpData.validator';
import { WpTableNamesEnum } from '../Shared/Enums';

@Injectable()
export class PersonService {
   constructor(
      @Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize,
      private readonly buildWpQueriesHelper: BuildWpQueries,
   ) {}

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

   async filterPaginatedWpData(filters: Filters, { pagination }) {
      const { page, pageSize } = pagination;
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const countSubQuery = formatFilterWpPersonsSubQuery(filters);
      const query = `${countSubQuery} LIMIT :limit OFFSET :offset`;

      // Get total count of records
      const [countResult] = await this.wpDb.query(countSubQuery);
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

   async getWpDataById({
      id,
      tableName,
      user_id,
   }: {
      id: number;
      tableName: WpTableNamesEnum;
      user_id: number;
   }) {
      const promisess = [
         this.getWpFullInfo(tableName, id),
         this.getWpFinesData(tableName, id),
         this.getWpClaimsData(tableName, id),
         this.getWpCardsData(tableName, id),
         ...(tableName === WpTableNamesEnum.EAEU
            ? [this.getWpFamilyMemberData(tableName, user_id)]
            : []),
      ];
      const [baseInfo, fines, claims, cards, familyMembers] = await Promise.all(promisess);
      return {
         fines: fines,
         cards: cards,
         claims: claims,
         familyMembers: familyMembers,
         baseInfo: formatBaseInfoResult(baseInfo),
      };
   }

   private async getWpFullInfo(tableName: WpTableNamesEnum, id: number) {
      const query = this.buildWpQueriesHelper.buildFullInfoBaseQuery(tableName, id);
      const [result] = await this.wpDb.query(query);
      return result;
   }

   private async getWpFinesData(tableName: WpTableNamesEnum, id: number) {
      const query = this.buildWpQueriesHelper.buildFinesQuery(tableName, id);
      const [result] = await this.wpDb.query(query);
      return result;
   }

   private async getWpClaimsData(tableName: WpTableNamesEnum, id: number) {
      const query = this.buildWpQueriesHelper.buildClaimsQuery(tableName, id);
      const [result] = await this.wpDb.query(query);
      return result;
   }

   private async getWpCardsData(tableName: WpTableNamesEnum, id: number) {
      const query = this.buildWpQueriesHelper.buildCardsQuery(tableName, id);
      const [result] = await this.wpDb.query(query);
      return result;
   }

   private async getWpFamilyMemberData(tableName: WpTableNamesEnum, user_id: number) {
      const query = this.buildWpQueriesHelper.buildFamilyMemberQuery(tableName, user_id);
      const [result] = await this.wpDb.query(query);
      return result;
   }
}
