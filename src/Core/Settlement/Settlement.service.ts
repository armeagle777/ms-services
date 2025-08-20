import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { FindAllQuery } from './Queries';
import { SettlementModel } from './Models';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';

@Injectable()
export class SettlementService {
   constructor(@Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize) {}

   async findAll(): Promise<Partial<SettlementModel>[]> {
      return this.asylumDb.query<SettlementModel>(FindAllQuery, SequelizeSelectOptions);
   }
}
