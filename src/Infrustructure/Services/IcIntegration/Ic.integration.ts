import { HttpService } from '@nestjs/axios';
import {
   // BadRequestException,
   Injectable,
   InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import qs from 'qs';

import {
   // PersonSearchResponse,
   PoliceResponse,
} from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class IcIntegration {
   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
   ) {}

   async getPoliceByPnum(pnum: string): Promise<PoliceResponse | ''> {
      const policeUrl = this.configService.get<string>('POLICE_URL');
      if (!policeUrl) throw new InternalServerErrorException('POLICE_URL is not configured');

      const requestBody = {
         Dzev: 9,
         HAYR: '',
         SSN: pnum,
         BDATE: '',
         last_name: '',
         first_name: '',
         STUGOX: this.configService.get<string>('POLICE_REQUEST_STUGOX'),
         User: this.configService.get<string>('POLICE_REQUEST_USER_NAME'),
         USER_ID: this.configService.get<string>('POLICE_REQUEST_USER_ID'),
         PASSWORD: this.configService.get<string>('POLICE_REQUEST_USER_PASSWORD'),
      };

      const dataString = qs.stringify({ customer: JSON.stringify(requestBody) });
      const response = await firstValueFrom(
         this.httpService.post(policeUrl, dataString, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         }),
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
