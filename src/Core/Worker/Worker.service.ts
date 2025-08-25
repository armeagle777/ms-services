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
   IFilterLightDataResponse,
   IGetFullDataByIdResponse,
   IGetWpFamilyMemberResponse,
   IGetFullDataByPnumResponse,
   IWorkPermitFamilyClaim,
   IWorkPermitEmployeeClaim,
   IWorkPermitEaeuClaim,
} from './Models';
import { WorkerTbNamesEnum } from '../Shared/Enums';
import { Filters } from 'src/API/Validators/Person/PersonFilterWpData.validator';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';
import { WPBackendIntegration } from 'src/Infrustructure/Services/WPBackendIntegration/WPBackend.integration';
import { IWorkerLightDataModel } from './Models/WorkerLightData.model';
import { formatQueryPagination } from '../Shared/Helpers';

@Injectable()
export class WorkerService {
   private readonly logger = new Logger(WorkerService.name);

   constructor(
      private readonly buildWpQueriesHelper: BuildWpQueries,
      private readonly wpBackIntegration: WPBackendIntegration,
      @Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize,
   ) {}

   // Filter paginated work permit data
   async filterLightData(filters: Filters, { pagination }): Promise<IFilterLightDataResponse> {
      const { limit, offset, page, pageSize } = formatQueryPagination(pagination);
      const { query, replacements } = formatFilterWpPersonsSubQuery(filters);

      const finalQuery = `${query} LIMIT :limit OFFSET :offset`;

      // Get total count of records
      const countResult = await this.wpDb.query(query, {
         ...SequelizeSelectOptions,
         replacements: { ...replacements },
      });
      const total = countResult?.length || 0;

      // Get paginated records
      const persons = (await this.wpDb.query(finalQuery, {
         ...SequelizeSelectOptions,
         replacements: { ...replacements, limit, offset },
      })) as IWorkerLightDataModel[];

      //Add base64 image string to all persons
      const getImagesBase64Promises = persons?.map((p) => this.addWorkerProfileImage(p));
      await Promise.allSettled(getImagesBase64Promises);

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
      ] as const;

      const [baseInfo, fines, claims, cards, familyMembers] = (await Promise.all(promisess)) as [
         IWorkerAdvanced[],
         IWorkerFine[],
         (IWorkPermitFamilyClaim | IWorkPermitEmployeeClaim | IWorkPermitEaeuClaim)[],
         IWorkerCard[],
         IGetWpFamilyMemberResponse[]?,
      ];
      const formatedBaseInfo = formatBaseInfoResult(baseInfo);
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

   private async addWorkerProfileImage(
      baseInfo: IWorkerAdvanced | IWorkerLightDataModel,
   ): Promise<void> {
      try {
         if (!baseInfo?.path) return;
         const workerBase64Image = await this.wpBackIntegration.getWorkerImage(baseInfo.path);

         baseInfo.path = workerBase64Image;
      } catch (error) {
         this.logger.error(`Failed to fetch image: ${error.message}`);
         baseInfo.path = null;
      }
   }
}
