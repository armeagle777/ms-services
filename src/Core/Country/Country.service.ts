import { Sequelize } from 'sequelize-typescript';
import { Inject, Injectable } from '@nestjs/common';

import { Country } from './Models';
import { QueryTypes } from 'sequelize';
import { GetCountriesQuery } from './Queries';

@Injectable()
export class CountryService {
   constructor(@Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize) {}

   async findAll(): Promise<Partial<Country>[]> {
      const results: Partial<Country>[] = await this.wpDb.query(GetCountriesQuery, {
         type: QueryTypes.SELECT,
      });
      return results;
   }
}
