import { Injectable } from '@nestjs/common';
import { AsylumCountry } from '../Country/Models';
import { CountryService } from '../Country/Country.service';

@Injectable()
export class AsylumService {
   constructor(private readonly countryService: CountryService) {}

   async getCountries(): Promise<Partial<AsylumCountry>[]> {
      return this.countryService.findAllAsylum();
   }
}
