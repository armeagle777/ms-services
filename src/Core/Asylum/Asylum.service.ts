import { Injectable } from '@nestjs/common';

import { CountryService } from '../Country/Country.service';
import { RefugeeService } from '../Refugee/Refugee.service';
import { PersonFilterAsylumDataValidator } from 'src/API/Validators';
import { IGetFilterOptionsResponseModel } from './Models/IGetFilterOptionsResponse.model';
import { EthnicsService } from '../Ethnics/Ethnics.serrvice';
import { ReligionService } from '../Religion/Religion.serrvice';

@Injectable()
export class AsylumService {
   constructor(
      private readonly countryService: CountryService,
      private readonly ethnicService: EthnicsService,
      private readonly religionService: ReligionService,
      private readonly refugeeService: RefugeeService,
   ) {}

   async getFilterOptions(): Promise<IGetFilterOptionsResponseModel> {
      const countryOptionsAction = this.countryService.findAllRefugeeCountries();
      const ethnicOptionsAction = this.ethnicService.findAll();
      const religionOptionsAction = this.religionService.findAll();

      const [countryOptions, ethnicOptions, religionOptions] = await Promise.all([
         countryOptionsAction,
         ethnicOptionsAction,
         religionOptionsAction,
      ]);

      return { countries: countryOptions, ethnics: ethnicOptions, religions: religionOptions };
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
