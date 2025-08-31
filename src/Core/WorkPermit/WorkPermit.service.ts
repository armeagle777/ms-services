import { Injectable } from '@nestjs/common';

import { WorkerCountry } from '../Country/Models';
import { WorkerService } from '../Worker/Worker.service';
import { CountryService } from '../Country/Country.service';
import { PersonFilterWpDataValidator } from 'src/API/Validators/Person/PersonFilterWpData.validator';
import { PersonDetailWpData } from 'src/API/Validators/Person/PersonDetailWpData.validator';
import { GetDiagnosis } from 'src/API/Validators/Person/GetDiagnosis.validator';

@Injectable()
export class WorkPermitService {
   constructor(
      private readonly countryService: CountryService,
      private readonly workerService: WorkerService,
   ) {}

   async getCountries(): Promise<Partial<WorkerCountry>[]> {
      return this.countryService.findAllWorkerCountries();
   }

   async getPersonWpData(pnum: string) {
      return this.workerService.getFullDataByPnum(pnum);
   }

   async filterPersonWpData(filterData: PersonFilterWpDataValidator) {
      const { page = 1, pageSize = 10, filters } = filterData;

      return this.workerService.filterLightData(filters, {
         pagination: { page, pageSize },
      });
   }

   async getPersonDetailData(id: number, body: PersonDetailWpData) {
      const { tableName, user_id } = body;

      return this.workerService.getFullDataById({ id, tableName, user_id });
   }

   async getPersonDiagnosis({ ssn, cardSerial }: GetDiagnosis) {
      return this.workerService.getCardDiagnosis({ ssn, cardSerial });
   }
}
