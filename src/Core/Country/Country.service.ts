import { Sequelize } from 'sequelize-typescript';
import { Inject, Injectable } from '@nestjs/common';

import { RefugeeCountry, WorkerCountry } from './Models';
import { GetRefugeeCountriesQuery, GetWorkerCountriesQuery } from './Queries';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';

@Injectable()
export class CountryService {
   constructor(
      @Inject('WORKPERMIT_CONNECTION') private readonly wpDb: Sequelize,
      @Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize,
   ) {}

   async findAllWorkerCountries(): Promise<Partial<WorkerCountry>[]> {
      const results: Partial<WorkerCountry>[] = await this.wpDb.query(
         GetWorkerCountriesQuery,
         SequelizeSelectOptions,
      );
      return results;
   }

   async findAllRefugeeCountries(): Promise<RefugeeCountry[]> {
      const results = await this.asylumDb.query<RefugeeCountry>(
         GetRefugeeCountriesQuery,
         SequelizeSelectOptions,
      );
      return results;
   }
}
