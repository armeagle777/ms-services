import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import * as qs from 'qs';

export interface CivilActsRegistrationRequest {
   ssn: string;
   firstName: string;
   lastName: string;
}

@Injectable()
export class CivilActsRegistrationIntegration {
   private readonly qkagUrl: string;

   constructor(private readonly configService: ConfigService) {
      this.qkagUrl = this.configService.get<string>('CIVIL_ACTS_REGISTRATION_SERVICE_API_URL');
      if (!this.qkagUrl) {
         throw new InternalServerErrorException(
            'CIVIL_ACTS_REGISTRATION_SERVICE_API_URL is not configured',
         );
      }
   }

   async getCivilActsInfoBySsn(request: CivilActsRegistrationRequest): Promise<any> {
      const queryData = qs.stringify(
         {
            ssn: request.ssn,
            first_name: request.firstName,
            last_name: request.lastName,
         },
         { encode: true },
      );

      const config: AxiosRequestConfig = {
         url: this.qkagUrl,
         method: 'POST',
         data: queryData,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      };

      const response = await axios(config);
      return response.data;
   }
}
