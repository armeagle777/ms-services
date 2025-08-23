import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { AsylumReligion } from './Models';
import { FindAllReligionsQuery } from './Queries';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';

@Injectable()
export class ReligionService {
   constructor(@Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize) {}
   async findAll(): Promise<AsylumReligion[]> {
      return this.asylumDb.query(FindAllReligionsQuery, SequelizeSelectOptions);
   }
}
