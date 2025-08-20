import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { Marz } from './Models';
import { FindAllQuery } from './Queries';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';

@Injectable()
export class MarzService {
   constructor(@Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize) {}

   async findAll(): Promise<Partial<Marz>[]> {
      return this.asylumDb.query<Marz>(FindAllQuery, SequelizeSelectOptions);
   }
}
