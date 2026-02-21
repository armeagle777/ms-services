import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import qs from 'qs';
import { XMLParser } from 'fast-xml-parser';

import {
  BordercrossRequestDto,
  QkagInfoRequestDto,
  SearchPersonsRequestDto,
} from './dto';
import {
  BordercrossResponse,
  PersonResponse,
  PersonSearchResponse,
  PoliceResponse,
  QkagDocumentResponse,
  RoadPoliceResponse,
  TaxPayerInfo,
  VehicleSearchResponse,
  PetregistrCompanyResponse,
} from './interfaces/persons.interfaces';

@Injectable()
export class PersonsService {
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async downloadBprInfo(_body: Record<string, unknown>) {
    throw new NotImplementedException('File download logic is not migrated.');
  }

  async getPersonBySsn(ssn: string): Promise<PersonResponse | []> {
    const bprUrl = this.configService.get<string>('BPR_URL');
    if (!bprUrl) throw new InternalServerErrorException('BPR_URL is not configured');

    const queryData = qs.stringify({ psn: ssn, addresses: 'ALL' });

    const response = await firstValueFrom(
      this.httpService.post(bprUrl, queryData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    const { status, result } = response.data || {};
    if (status === 'failed' || !Array.isArray(result) || result.length === 0) return [];

    const person = result[0] || {};
    const { AVVDocuments, AVVAddresses, ...restInfo } = person;

    const addresses = AVVAddresses?.AVVAddress || [];
    const documents = AVVDocuments?.Document || [];

    return { addresses, documents, ...restInfo } as PersonResponse;
  }

  async getSearchedPersons(body: SearchPersonsRequestDto): Promise<PersonSearchResponse[]> {
    const bprUrl = this.configService.get<string>('BPR_URL');
    if (!bprUrl) throw new InternalServerErrorException('BPR_URL is not configured');

    const {
      firstName,
      lastName,
      patronomicName,
      birthDate,
      documentNumber,
      ssn,
    } = body || {};

    const searchData: Record<string, string> = { addresses: 'ALL' };

    if (ssn) searchData.psn = ssn;
    if (firstName) searchData.first_name = firstName;
    if (lastName) searchData.last_name = lastName;
    if (patronomicName) searchData.middle_name = patronomicName;
    if (birthDate) searchData.birth_date = birthDate;
    if (documentNumber) searchData.docnum = documentNumber;

    const queryData = qs.stringify(searchData);

    const response = await firstValueFrom(
      this.httpService.post(bprUrl, queryData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    const { status, result } = response.data || {};
    if (status === 'failed' || !Array.isArray(result)) return [];

    return result.map((person: Record<string, unknown>) => {
      const { AVVDocuments, AVVAddresses, ...restInfo } = person as any;
      const addresses = AVVAddresses?.AVVAddress || [];
      const documents = AVVDocuments?.Document || [];
      return { addresses, documents, ...restInfo } as PersonSearchResponse;
    });
  }

  async getQkagInfoBySsn(ssn: string, body: QkagInfoRequestDto): Promise<QkagDocumentResponse[]> {
    const qkagUrl = this.configService.get<string>('QKAG_URL');
    if (!qkagUrl) throw new InternalServerErrorException('QKAG_URL is not configured');

    const { firstName, lastName } = body || {};
    if (!firstName || !lastName) throw new BadRequestException('Missing fields');

    const queryData = qs.stringify(
      {
        ssn,
        first_name: firstName,
        last_name: lastName,
      },
      { encode: true },
    );

    const response = await firstValueFrom(
      this.httpService.post(qkagUrl, queryData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    const { status, result } = response.data || {};
    const documents = Object.values(result || {});
    if (status === 'failed' || documents.length === 0) return [];

    return documents as QkagDocumentResponse[];
  }

  async getTaxBySsn(ssn: string): Promise<TaxPayerInfo[] | []> {
    const taxUrl = this.configService.get<string>('TAX_URL');
    if (!taxUrl) throw new InternalServerErrorException('TAX_URL is not configured');

    const response = await firstValueFrom(this.httpService.post(taxUrl, { ssn }));
    const { data } = response;

    const taxPayersInfo = data?.taxPayersInfo?.taxPayerInfo;
    if (!taxPayersInfo) return [];

    return taxPayersInfo as TaxPayerInfo[];
  }

  async getRoadpoliceBySsn(psn: string): Promise<RoadPoliceResponse> {
    const licenseResponse = await firstValueFrom(
      this.httpService.request(this.buildLicensesRequest(psn)),
    );
    const license = licenseResponse?.data?.result || null;

    const vehiclesResponse = await firstValueFrom(
      this.httpService.request(this.buildVehiclesRequest(psn)),
    );
    const vehicles = vehiclesResponse?.data?.result?.length
      ? vehiclesResponse.data.result
      : null;

    return { license, vehicles };
  }

  async searchVehicle(paramValue: string, searchBase: string): Promise<VehicleSearchResponse> {
    if (!searchBase) throw new BadRequestException('searchBase is required');

    const vehiclesResponse = await firstValueFrom(
      this.httpService.request(this.buildSearchVehiclesRequest(searchBase, paramValue)),
    );
    const vehicles = vehiclesResponse?.data?.result?.length
      ? vehiclesResponse.data.result
      : null;

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

  async getCompanyByHvhh(hvhh: string): Promise<PetregistrCompanyResponse | []> {
    const petregistrUrl = this.configService.get<string>('PETREGISTR_URL');
    if (!petregistrUrl) throw new InternalServerErrorException('PETREGISTR_URL is not configured');

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
