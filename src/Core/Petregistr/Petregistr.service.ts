import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { PetregistrPersonResponse } from 'src/Core/Petregistr/interfaces/petregistr.interfaces';

@Injectable()
export class PetregistrService {
   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
   ) {}

   async getCompaniesBySsn(ssn: string): Promise<PetregistrPersonResponse | []> {
      const url = this.configService.get<string>('PETREGISTR_URL');
      if (!url) throw new InternalServerErrorException('PETREGISTR_URL is not configured');

      const body = {
         jsonrpc: '2.0',
         id: 1,
         method: 'person_info',
         params: { ssn },
      };

      const response = await firstValueFrom(
         this.httpService.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
         }),
      );

      const data = response.data;
      if (data?.error) return [];

      const person = data?.result?.person || {};
      const { companies, ...rest } = person;

      return {
         ...rest,
         companies: Object.values(companies || {}),
      } as PetregistrPersonResponse;
   }
}
