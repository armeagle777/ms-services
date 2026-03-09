import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import qs from 'qs';

import { PoliceResponse } from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class IcIntegration {
   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
   ) {}

   async searchWantedPersons({
      pnum,
      firstName,
      lastName,
      birthDate,
   }: {
      pnum?: string;
      firstName?: string;
      lastName?: string;
      birthDate?: string;
   }): Promise<PoliceResponse | ''> {
      const icApiUrl = this.configService.get<string>('IC_API_URL');
      if (!icApiUrl) throw new InternalServerErrorException('IC_API_URL is not configured');

      const normalizedPnum = (pnum || '').trim();
      const normalizedFirstName = (firstName || '').trim();
      const normalizedLastName = (lastName || '').trim();
      const normalizedBirthDate = (birthDate || '').trim();

      if (!normalizedPnum && !normalizedFirstName && !normalizedLastName && !normalizedBirthDate) {
         throw new BadRequestException(
            'At least one of pnum, firstName, lastName, birthDate is required',
         );
      }

      const requestBody = {
         Dzev: 9,
         HAYR: '',
         SSN: normalizedPnum,
         BDATE: normalizedBirthDate,
         last_name: normalizedLastName,
         first_name: normalizedFirstName,
         STUGOX: this.configService.get<string>('IC_API_STUGOX'),
         User: this.configService.get<string>('IC_API_USER_NAME'),
         USER_ID: this.configService.get<string>('IC_API_USER_ID'),
         PASSWORD: this.configService.get<string>('IC_API_USER_PASSWORD'),
      };

      const response = await firstValueFrom(
         this.httpService.request(
            this.buildOptions(icApiUrl, { customer: JSON.stringify(requestBody) }),
         ),
      );

      const data = response.data;
      if (!data?.INFO) return '';
      return data.INFO as PoliceResponse;
   }

   buildOptions(url: string, body: Record<string, unknown>) {
      return {
         method: 'post' as const,
         maxBodyLength: Infinity,
         url,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: qs.stringify(body),
      };
   }
}
