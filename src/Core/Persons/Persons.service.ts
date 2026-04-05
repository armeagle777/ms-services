import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import qs from 'qs';
import { XMLParser } from 'fast-xml-parser';
import { InvestigativeCommitteeIntegration } from 'src/Infrustructure/Services/InvestigativeCommitteeIntegration/InvestigativeCommitee.integration';
import { StatePopulationRegisterIntegration } from 'src/Infrustructure/Services/StatePopulationRegisterIntegration/StatePopulationRegister.integration';
import { CivilActsRegistrationService } from 'src/Core/CivilActsRegistration/CivilActsRegistration.service';

import { BordercrossRequestDto, QkagInfoRequestDto } from 'src/API/DTO/Persons';
import {
   BordercrossResponse,
   PoliceResponse,
   QkagDocumentResponse,
   RoadPoliceResponse,
   TaxPayerInfo,
   VehicleSearchResponse,
   PetregistrCompanyResponse,
} from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class PersonsService {
   private readonly xmlParser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
   });

   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
      private readonly icIntegration: InvestigativeCommitteeIntegration,
      private readonly statePopulationRegister: StatePopulationRegisterIntegration,
      private readonly civilActsRegistration: CivilActsRegistrationService,
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

   async getBordercrossBySsn(body: BordercrossRequestDto): Promise<BordercrossResponse> {
      const { passportNumber, citizenship } = body || {};
      if (!passportNumber || !citizenship) throw new BadRequestException('Missing fields');

      const response = await firstValueFrom(
         this.httpService.request(this.buildBordercrossRequest({ passportNumber, citizenship })),
      );

      const xmlData = response.data;
      const jsonData = this.xmlParser.parse(xmlData);
      const data = jsonData?.data;

      if (!data?.status || data.status !== 'ok') return {};

      const { visaList, crossingList, residencePermitList } = data;
      return { visaList, crossingList, residencePermitList } as BordercrossResponse;
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

   async getCompanyByHvhh(hvhh: string): Promise<PetregistrCompanyResponse | []> {
      const petregistrUrl = this.configService.get<string>('PETREGISTR_URL');
      if (!petregistrUrl)
         throw new InternalServerErrorException('PETREGISTR_URL is not configured');

      const options = {
         jsonrpc: '2.0',
         id: 1,
         method: 'company_info',
         params: { tax_id: hvhh },
      };

      const response = await firstValueFrom(this.httpService.post(petregistrUrl, options));
      const data = response.data;
      if (!data?.result) return [];

      return data.result.company as PetregistrCompanyResponse;
   }

   private buildBordercrossRequest({
      passportNumber,
      citizenship,
   }: {
      passportNumber: string;
      citizenship: string;
   }) {
      const axiosData = `<?xml version="1.0" encoding="UTF-8"?>\r\n <data>\r\n    <citizenship>${citizenship}</citizenship>\r\n    <passportNumber>${passportNumber}</passportNumber>\r\n </data>`;

      return {
         method: 'post',
         maxBodyLength: Infinity,
         url: this.configService.get<string>('BORDERCROSS_EKENQ_URL'),
         headers: {
            'Content-Type': 'application/xml',
            Authorization: `Basic ${this.configService.get<string>('BORDERCROSS_EKENG_AUTHORIZATION')}`,
            Cookie: this.configService.get<string>('BORDERCROSS_AXIOS_COOKIES'),
         },
         data: axiosData,
      };
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
