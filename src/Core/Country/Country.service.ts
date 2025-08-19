import { Sequelize } from 'sequelize-typescript';
import { Inject, Injectable } from '@nestjs/common';

import { AsylumCountry, Country } from './Models';
import { GetWpCountriesQuery, GetAsylumCountriesQuery } from './Queries';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';

@Injectable()
export class CountryService {
   constructor(
      @Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize,
      @Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize,
   ) {}

   async findAllWp(): Promise<Partial<Country>[]> {
      const results: Partial<Country>[] = await this.wpDb.query(
         GetWpCountriesQuery,
         SequelizeSelectOptions,
      );
      return results;
   }

   async findAllAsylum(): Promise<Partial<AsylumCountry>[]> {
      const results: Partial<AsylumCountry>[] = await this.asylumDb.query(
         GetAsylumCountriesQuery,
         SequelizeSelectOptions,
      );
      return results;
   }
}
