import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { FindAllEthnicsQuery } from './Queries';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';
import { AsylumEthnics } from './Models';

@Injectable()
export class EthnicsService {
   constructor(@Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize) {}
   async findAll(): Promise<Partial<AsylumEthnics>[]> {
      return this.asylumDb.query(FindAllEthnicsQuery, SequelizeSelectOptions);
   }
}
