import { Sequelize } from 'sequelize-typescript';
import { Inject, Injectable } from '@nestjs/common';

import { Country } from './Models';
import { GetCountriesQuery } from './Queries';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';

@Injectable()
export class CountryService {
   constructor(@Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize) {}

   async findAll(): Promise<Partial<Country>[]> {
      const results: Partial<Country>[] = await this.wpDb.query(
         GetCountriesQuery,
         SequelizeSelectOptions,
      );
      return results;
   }
}
