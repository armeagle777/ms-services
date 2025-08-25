import { Inject, Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { IPaginationParams } from '../Shared/Models';
import { RefugeeLightDataFilters } from 'src/API/Validators';
import {
   IRefugeeDetail,
   IRefugeeFamilyMemberModel,
   IGetDetailByIdResponseModel,
   IRefugeeLightDataModel,
   IFilterRefugeeLightDataModel,
} from './Models';
import { RefugeeCardService } from '../RefugeeCard/RefugeeCard.service';
import { buildFindByIdQuery, buildFindFamilyMembersQuery } from './Helpers';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';
import { formatQueryPagination } from '../Shared/Helpers';
import { buildFilterRefugeeLightDataQuery } from './Helpers/buildFilterRefugeeLightData.helper';
import { AsylumBackendIntegration } from 'src/Infrustructure/Services/AsylumBackendIntegration';

@Injectable()
export class RefugeeService {
   private readonly logger = new Logger(RefugeeService.name);

   constructor(
      @Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize,
      private readonly refugeeCardService: RefugeeCardService,
      private readonly asylumBackend: AsylumBackendIntegration,
   ) {}

   async filterLightData(
      filters: RefugeeLightDataFilters,
      { pagination }: { pagination: IPaginationParams },
   ): Promise<IFilterRefugeeLightDataModel> {
      const { limit, offset, page, pageSize } = formatQueryPagination(pagination);
      const { query, replacements } = buildFilterRefugeeLightDataQuery(filters);

      const finalQuery = `${query} LIMIT :limit OFFSET :offset`;

      // Get total count of records
      const countResult = await this.asylumDb.query(query, SequelizeSelectOptions);
      const total = countResult?.length || 0;

      // Get paginated records
      const persons = (await this.asylumDb.query(finalQuery, {
         ...SequelizeSelectOptions,
         replacements: { ...replacements, limit, offset },
      })) as IRefugeeLightDataModel[];

      //Add base64 image string to all persons
      const getImagesBase64Promises = persons?.map((p) => this.addRefugeeProfileImage(p));
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

   async getDetailById(personalId: number): Promise<IGetDetailByIdResponseModel | null> {
      const getByPersonalIdQuery = buildFindByIdQuery(personalId);
      const getRefugeeByIdResponse = await this.asylumDb.query<IRefugeeDetail>(
         getByPersonalIdQuery,
         SequelizeSelectOptions,
      );
      const refugee = getRefugeeByIdResponse[0];
      if (!refugee) return null;

      await this.addRefugeeProfileImage(refugee);
      const refugeeCards = await this.refugeeCardService.findByRefugeeId(personalId);
      const refugeeFamilyMembers = await this.getFamilyMembers(personalId);
      const refugeeDetailFullDatan: IGetDetailByIdResponseModel = Object.assign(refugee, {
         cards: refugeeCards,
         familyMembers: refugeeFamilyMembers,
      });

      return refugeeDetailFullDatan;
   }

   async getFamilyMembers(personalId: number): Promise<IRefugeeFamilyMemberModel[]> {
      const getFamilyMembersQuery = buildFindFamilyMembersQuery(personalId);
      const result = await this.asylumDb.query<IRefugeeFamilyMemberModel>(
         getFamilyMembersQuery,
         SequelizeSelectOptions,
      );
      return result;
   }

   private async addRefugeeProfileImage(
      baseInfo: IRefugeeLightDataModel | IRefugeeDetail,
   ): Promise<void> {
      try {
         if (!baseInfo?.image || !baseInfo.case_id || !baseInfo.personal_id) return;
         const profileImageUrl = `/uploads/${baseInfo.case_id}/${baseInfo.personal_id}/${baseInfo.image}`;
         const refugeeBase64Image = await this.asylumBackend.getRefugeeImage(profileImageUrl);

         baseInfo.image = refugeeBase64Image;
      } catch (error) {
         this.logger.error(
            `Failed to fetch image for Refugee ${baseInfo.personal_id}: ${error.message}`,
         );
         baseInfo.image = null;
      }
   }
}
