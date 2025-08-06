import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { GetCountriesQuery } from './Queries';

@Injectable()
export class CountryService {
   constructor(@Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize) {}

   async findAll() {
      const [results] = await this.wpDb.query(GetCountriesQuery);
      return results;
   }
}
