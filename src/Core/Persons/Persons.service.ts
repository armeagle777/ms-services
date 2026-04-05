import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import qs from 'qs';
import { firstValueFrom } from 'rxjs';
import { InvestigativeCommitteeIntegration } from 'src/Infrustructure/Services/InvestigativeCommitteeIntegration/InvestigativeCommitee.integration';

import {
   PoliceResponse,
   RoadPoliceResponse,
   VehicleSearchResponse,
} from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class PersonsService {
   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
      private readonly icIntegration: InvestigativeCommitteeIntegration,
   ) {}

   async getRoadpoliceBySsn(psn: string): Promise<RoadPoliceResponse> {
      const licenseResponse = await firstValueFrom(
         this.httpService.request(this.buildLicensesRequest(psn)),
      );
      const license = licenseResponse?.data?.result || null;

      const vehiclesResponse = await firstValueFrom(
         this.httpService.request(this.buildVehiclesRequest(psn)),
      );
      const vehicles = vehiclesResponse?.data?.result?.length ? vehiclesResponse.data.result : null;

      return { license, vehicles };
   }

   async searchVehicle(paramValue: string, searchBase: string): Promise<VehicleSearchResponse> {
      if (!searchBase) throw new BadRequestException('searchBase is required');

      const vehiclesResponse = await firstValueFrom(
         this.httpService.request(this.buildSearchVehiclesRequest(searchBase, paramValue)),
      );
      const vehicles = vehiclesResponse?.data?.result?.length ? vehiclesResponse.data.result : null;

      return { vehicles };
   }

   async getPoliceByPnum(
      pnum: string,
      filters?: { firstName?: string; lastName?: string; birthDate?: string },
   ): Promise<PoliceResponse | ''> {
      return this.icIntegration.searchWantedPersons({
         pnum,
         firstName: filters?.firstName,
         lastName: filters?.lastName,
         birthDate: filters?.birthDate,
      });
   }

   private buildLicensesRequest(psn: string) {
      const axiosBody = qs.stringify({ psn });
      const baseUrl = this.configService.get<string>('ROADPOLICE_URL');
      const path = this.configService.get<string>('ROADPOLICE_URL_LICENSES_PATH');
      return {
         method: 'post',
         maxBodyLength: Infinity,
         url: `${baseUrl}/${path}`,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: axiosBody,
      };
   }

   private buildVehiclesRequest(psn: string) {
      const axiosBody = qs.stringify({ psn });
      const baseUrl = this.configService.get<string>('ROADPOLICE_URL');
      const path = this.configService.get<string>('ROADPOLICE_URL_VEHICLES_PATH');
      return {
         method: 'post',
         maxBodyLength: Infinity,
         url: `${baseUrl}/${path}`,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: axiosBody,
      };
   }

   private buildSearchVehiclesRequest(key: string, value: string) {
      const axiosBody = qs.stringify({ [key]: value });
      const baseUrl = this.configService.get<string>('ROADPOLICE_URL');
      const path = this.configService.get<string>('ROADPOLICE_URL_VEHICLES_PATH');
      return {
         method: 'post',
         maxBodyLength: Infinity,
         url: `${baseUrl}/${path}`,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: axiosBody,
      };
   }
}
