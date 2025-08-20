import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { IPaginationParams } from '../Shared/Models';
import { RefugeeLightDataFilters } from 'src/API/Validators';
import { IRefugeeDetail, IRefugeeFamilyMemberModel } from './Models';
import { RefugeeCardService } from '../RefugeeCard/RefugeeCard.service';
import { buildFindByIdQuery, buildFindFamilyMembersQuery } from './Helpers';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';
import { IGetDetailByIdResponseModel } from './Models/IGetDetailByIdResponse.model';

@Injectable()
export class RefugeeService {
   constructor(
      @Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize,
      private readonly refugeeCardService: RefugeeCardService,
   ) {}

   filterLightData(
      filters: RefugeeLightDataFilters,
      { pagination }: { pagination: IPaginationParams },
   ) {}

   async getDetailById(personalId: number): Promise<IGetDetailByIdResponseModel | null> {
      const getByPersonalIdQuery = buildFindByIdQuery(personalId);
      const getRefugeeByIdResponse = await this.asylumDb.query<IRefugeeDetail>(
         getByPersonalIdQuery,
         SequelizeSelectOptions,
      );
      const refugee = getRefugeeByIdResponse[0];

      if (!refugee) return null;

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
}
