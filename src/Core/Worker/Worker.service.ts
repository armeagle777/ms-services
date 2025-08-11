import axios from 'axios';
import { Sequelize } from 'sequelize-typescript';
import { Inject, Injectable, Logger } from '@nestjs/common';

import {
   extractWpData,
   BuildWpQueries,
   formatGetWpQuery,
   formatGetEatmQuery,
   formatBaseInfoResult,
   formatFilterWpPersonsSubQuery,
   formatGetEatmFamilyMemberQuery,
} from './Helpers';
import {
   IWp,
   IEatm,
   IWorkerCard,
   IWorkerFine,
   IEatmFamily,
   IWorkerAdvanced,
   ITableResultsMap,
   IGetFullDataByIdProps,
   IFilterFullDataResponse,
   IGetFullDataByIdResponse,
   IGetWpFamilyMemberResponse,
   IGetFullDataByPnumResponse,
} from './Models';
import { WorkerTbNamesEnum } from '../Shared/Enums';
import { Filters } from 'src/API/Validators/Person/PersonFilterWpData.validator';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';
import { WPBackendIntegration } from 'src/Infrustructure/Services/WPBackendIntegration/WPBackend.integration';

@Injectable()
export class WorkerService {
   private readonly logger = new Logger(WorkerService.name);

   constructor(
      private readonly buildWpQueriesHelper: BuildWpQueries,
      private readonly wpBackIntegration: WPBackendIntegration,
      @Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize,
   ) {}

   // Filter paginated work permit data
   async filterFullData(filters: Filters, { pagination }): Promise<IFilterFullDataResponse> {
      const { page, pageSize } = pagination;
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const countSubQuery = formatFilterWpPersonsSubQuery(filters);
      const query = `${countSubQuery} LIMIT :limit OFFSET :offset`;

      // Get total count of records
      const countResult = await this.wpDb.query(countSubQuery, SequelizeSelectOptions);
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

   // Get worker data by ID
   async getFullDataById({
      id,
      tableName,
      user_id,
   }: IGetFullDataByIdProps): Promise<IGetFullDataByIdResponse> {
      const promisess = [
         this.getWpAdvancedData(tableName, id),
         this.getWpFinesData(tableName, id),
         this.getWpClaimsData(tableName, id),
         this.getWpCardsData(tableName, id),
         ...(tableName === WorkerTbNamesEnum.EAEU
            ? [this.getWpFamilyMemberData(tableName, user_id)]
            : []),
      ];
      const [baseInfo, fines, claims, cards, familyMembers] = await Promise.all(promisess);
      const formatedBaseInfo = await formatBaseInfoResult(baseInfo);
      await this.addWorkerProfileImage(formatedBaseInfo);
      return {
         fines: fines,
         cards: cards,
         claims: claims,
         familyMembers: familyMembers,
         baseInfo: formatedBaseInfo,
      };
   }

   // Get worker data by pnum
   async getFullDataByPnum(pnum: string): Promise<IGetFullDataByPnumResponse> {
      const promisess: [Promise<IWp[]>, Promise<IEatm[]>, Promise<IEatmFamily[]>] = [
         this.getWpDataByPnum(pnum),
         this.getEatmDataByPnum(pnum),
         this.getEatmFamilyDataByPnum(pnum),
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

   private async getWpAdvancedData(
      tableName: WorkerTbNamesEnum,
      id: number,
   ): Promise<IWorkerAdvanced[]> {
      const query = this.buildWpQueriesHelper.buildFullInfoBaseQuery(tableName, id);
      const result = await this.wpDb.query<IWorkerAdvanced>(query, SequelizeSelectOptions);
      return result;
   }

   private async getWpFinesData(tableName: WorkerTbNamesEnum, id: number): Promise<IWorkerFine[]> {
      const query = this.buildWpQueriesHelper.buildFinesQuery(tableName, id);
      const result = await this.wpDb.query<IWorkerFine>(query, SequelizeSelectOptions);
      return result;
   }

   private async getWpClaimsData<T extends WorkerTbNamesEnum>(
      tableName: WorkerTbNamesEnum,
      id: number,
   ): Promise<ITableResultsMap[T][]> {
      const query = this.buildWpQueriesHelper.buildClaimsQuery(tableName, id);
      const result = await this.wpDb.query<ITableResultsMap[T]>(query, SequelizeSelectOptions);
      return result;
   }

   private async getWpCardsData(tableName: WorkerTbNamesEnum, id: number): Promise<IWorkerCard[]> {
      const query = this.buildWpQueriesHelper.buildCardsQuery(tableName, id);
      const result = await this.wpDb.query<IWorkerCard>(query, SequelizeSelectOptions);
      return result;
   }

   private async getWpFamilyMemberData(
      tableName: WorkerTbNamesEnum,
      user_id: number,
   ): Promise<IGetWpFamilyMemberResponse[]> | null {
      const query = this.buildWpQueriesHelper.buildFamilyMemberQuery(tableName, user_id);
      const result = query
         ? await this.wpDb.query<IGetWpFamilyMemberResponse>(query, SequelizeSelectOptions)
         : null;
      return result;
   }

   private async getWpDataByPnum(pnum: string): Promise<IWp[]> {
      const query = formatGetWpQuery(pnum);
      const results = await this.wpDb.query<IWp>(query, SequelizeSelectOptions);
      return results;
   }

   private async getEatmDataByPnum(pnum: string): Promise<IEatm[]> {
      const query = formatGetEatmQuery(pnum);
      const results = await this.wpDb.query<IEatm>(query, SequelizeSelectOptions);
      return results;
   }

   private async getEatmFamilyDataByPnum(pnum: string): Promise<IEatmFamily[]> {
      const query = formatGetEatmFamilyMemberQuery(pnum);
      const results = await this.wpDb.query<IEatmFamily>(query, SequelizeSelectOptions);
      return results;
   }

   private async addWorkerProfileImage(baseInfo: IWorkerAdvanced): Promise<void> {
      if (baseInfo.path) {
         try {
            const workerBase64Image = await this.wpBackIntegration.getWorkerImage(baseInfo.path);

            baseInfo.path = workerBase64Image;
         } catch (error) {
            this.logger.error(`Failed to fetch image: ${error.message}`);
            baseInfo.path = null;
         }
      }
   }
}
