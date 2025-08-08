import { Injectable } from '@nestjs/common';

import { Country } from '../Country/Models';
import { WorkerService } from '../Worker/Worker.service';
import { CountryService } from '../Country/Country.service';
import { PersonFilterWpDataValidator } from 'src/API/Validators/Person/PersonFilterWpData.validator';
import { PersonDetailWpData } from 'src/API/Validators/Person/PersonDetailWpData.validator';

@Injectable()
export class WorkPermitService {
   constructor(
      private readonly countryService: CountryService,
      private readonly workerService: WorkerService,
   ) {}

   async getCountries(): Promise<Partial<Country>[]> {
      return this.countryService.findAll();
   }

   async getPersonWpData(pnum: string) {
      return this.workerService.getFullDataByPnum(pnum);
   }

   async filterPersonWpData(filterData: PersonFilterWpDataValidator) {
      const { page = 1, pageSize = 10, filters } = filterData;

      return await this.workerService.filterFullData(filters, {
         pagination: { page, pageSize },
      });
   }

   async getPersonDetailData(id: number, body: PersonDetailWpData) {
      const { tablename: tableName, user_id } = body;

      return this.workerService.getFullDataById({ id, tableName, user_id });
   }
}
