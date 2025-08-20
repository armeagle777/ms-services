import { Injectable } from '@nestjs/common';

import { RefugeeCountry } from '../Country/Models';
import { CountryService } from '../Country/Country.service';
import { RefugeeService } from '../Refugee/Refugee.service';
import { PersonFilterAsylumDataValidator } from 'src/API/Validators';
import { RefugeeCardService } from '../RefugeeCard/RefugeeCard.service';

@Injectable()
export class AsylumService {
   constructor(
      private readonly countryService: CountryService,
      private readonly refugeeService: RefugeeService,
      private readonly refugeeCardsService: RefugeeCardService,
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

   async getRefugeeDetailData(refugeeId: number) {
      return this.refugeeService.getDetailById(refugeeId);
   }
}
