import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { RefugeeCardModel } from './Models';
import { buildFindByRefugeeIdQuery } from './Helpers';
import { FindAllQuery } from './Queries/FindAll.query';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';

@Injectable()
export class RefugeeCardService {
   constructor(@Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize) {}

   async findAll(): Promise<Partial<RefugeeCardModel>[]> {
      return this.asylumDb.query<RefugeeCardModel>(FindAllQuery, SequelizeSelectOptions);
   }

   async findByRefugeeId(refugeeId: number): Promise<RefugeeCardModel[]> {
      const findCardsQuery = buildFindByRefugeeIdQuery(refugeeId);
      return this.asylumDb.query<RefugeeCardModel>(findCardsQuery, SequelizeSelectOptions);
   }
}
