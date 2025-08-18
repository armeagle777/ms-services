import { Injectable } from '@nestjs/common';

import { RefugeeCountry } from '../Country/Models';
import { CountryService } from '../Country/Country.service';
import { RefugeeService } from '../Refugee/Refugee.service';
import { PersonFilterAsylumDataValidator } from 'src/API/Validators';

@Injectable()
export class AsylumService {
   constructor(
      private readonly countryService: CountryService,
      private readonly refugeeService: RefugeeService,
   ) {}

   async getCountries(): Promise<Partial<RefugeeCountry>[]> {
      return this.countryService.findAllRefugeeCountries();
   }

   async filterPersonData(filterData: PersonFilterAsylumDataValidator) {
      const { page = 1, pageSize = 10, filters } = filterData;

      return this.refugeeService.filterLightData(filters, {
         pagination: { page, pageSize },
      });
   }

   async getPersonDetailData(id: number) {
      return this.refugeeService.getFullDataById(id);
   }
}
