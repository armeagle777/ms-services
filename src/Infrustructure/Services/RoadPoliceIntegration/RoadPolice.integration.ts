import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import * as qs from 'qs';

export interface LicenseSearchRequest {
   personId: string;
}

export interface VehiclesSearchRequest {
   personId: string;
}

export interface VehicleSearchRequest {
   searchField: string;
   searchValue: string;
}

@Injectable()
export class RoadPoliceIntegration {
   private readonly baseUrl: string;

   private readonly licensesRequestPath = 'get_driving_license_with_info';
   private readonly vehiclesRequestPath = 'get_vehicle_info';

   constructor(private readonly configService: ConfigService) {
      this.baseUrl = this.configService.get<string>('ROADPOLICE_API_URL');

      if (!this.baseUrl) {
         throw new InternalServerErrorException('ROADPOLICE_API_URL is not configured');
      }
   }

   async getPersonLicenses(request: LicenseSearchRequest): Promise<any> {
      const axiosBody = qs.stringify({ psn: request.personId });

      const config: AxiosRequestConfig = {
         method: 'post',
         maxBodyLength: Infinity,
         url: `${this.baseUrl}/${this.licensesRequestPath}`,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: axiosBody,
      };

      const response = await axios(config);
      return response.data;
   }

   async getPersonVehicles(request: VehiclesSearchRequest): Promise<any> {
      const axiosBody = qs.stringify({ psn: request.personId });

      const config: AxiosRequestConfig = {
         method: 'post',
         maxBodyLength: Infinity,
         url: `${this.baseUrl}/${this.vehiclesRequestPath}`,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: axiosBody,
      };

      const response = await axios(config);
      return response.data;
   }

   async searchVehicle(request: VehicleSearchRequest): Promise<any> {
      const axiosBody = qs.stringify({ [request.searchField]: request.searchValue });

      const config: AxiosRequestConfig = {
         method: 'post',
         maxBodyLength: Infinity,
         url: `${this.baseUrl}/${this.vehiclesRequestPath}`,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: axiosBody,
      };

      const response = await axios(config);
      return response.data;
   }
}
