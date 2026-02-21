import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { McsSearchPersonsDto } from './dto/mcs.dto';
import { McsCatalogItem, McsPersonRecord } from './interfaces/mcs.interfaces';

@Injectable()
export class McsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getCommunities(region?: string): Promise<McsCatalogItem[] | null> {
    if (!region) return null;

    const response = await firstValueFrom(
      this.httpService.request(this.buildAddressOptions(`community?region=${region}`)),
    );

    return response.data?.rcr_catalog || [];
  }

  async getResidences(region?: string, community?: string): Promise<McsCatalogItem[] | null> {
    if (!region || !community) return null;

    const response = await firstValueFrom(
      this.httpService.request(
        this.buildAddressOptions(`residence?region=${region}&community=${community}`),
      ),
    );

    return response.data?.rcr_catalog || [];
  }

  async getStreets(
    region?: string,
    community?: string,
    residence?: string,
  ): Promise<McsCatalogItem[] | null> {
    if (!region || !community || (!residence && region !== 'ԵՐԵՎԱՆ' && community !== 'ԳՅՈՒՄՐԻ')) {
      return null;
    }

    const response = await firstValueFrom(
      this.httpService.request(
        this.buildAddressOptions(
          `street?region=${region}&community=${community}${residence ? `&residence=${residence}` : ''}`,
        ),
      ),
    );

    return response.data?.s_catalog?.streets || [];
  }

  async searchPersons(body: McsSearchPersonsDto): Promise<McsPersonRecord[]> {
    const {
      addressType,
      firstName,
      lastName,
      patronomicName,
      building,
      street,
      community,
    } = body || {};

    if (addressType === 'BIRTH') return this.searchPersonByBirthAddress(body);

    if (!firstName && !lastName && !patronomicName) {
      return this.getPersonsByAddress(body);
    }

    if (building) {
      return this.searchByRegionCommunityStreetBuilding(body);
    }

    if (street) {
      return this.searchByRegionCommunityStreet(body);
    }

    if (community) {
      return this.searchByRegionCommunity(body);
    }

    throw new BadRequestException('Որոնման պարամետրերը պակաս են');
  }

  private async getPersonsDetailsBySsnList(pnums: string[]): Promise<McsPersonRecord[]> {
    const body = {
      request: { number: '1101', department: '999' },
      registered_addresses: 'ALL',
      ssn_list: pnums,
    };
    const response = await firstValueFrom(
      this.httpService.request(this.buildPersonsOptions('by-ssn-list', body)),
    );
    return response.data?.avv_persons || [];
  }

  private async getPersonsByAddress(filters: McsSearchPersonsDto): Promise<McsPersonRecord[]> {
    const { region, community, residence, street, building } = filters || {};
    const apartment = filters?.apartment ?? filters?.appartment;

    if (
      !region ||
      !community ||
      (!residence && region !== 'ԵՐԵՎԱՆ' && community !== 'ԳՅՈՒՄՐԻ') ||
      !street ||
      (!apartment && !building)
    ) {
      throw new BadRequestException('Որոնման պարամետրերը պակաս են');
    }

    const body = {
      request: { number: '1101', department: '999' },
      regist_in_addr: filters.registrationType === 'EVER' ? 'EVER_REGISTERED' : 'CURRENTLY_REGISTERED',
      region,
      community,
      residence,
      street,
      ...(building ? { building } : {}),
      ...(apartment ? { apartment } : {}),
    };

    const response = await firstValueFrom(
      this.httpService.request(this.buildPersonsOptions('by-addr', body)),
    );

    if (!response.data?.ssn_list?.length) return [];

    const personsDetailData = await this.getPersonsDetailsBySsnList(response.data.ssn_list);

    if (filters?.age?.min || filters?.age?.max || filters?.gender) {
      return this.filterPersons(personsDetailData, {
        age: filters.age,
        gender: filters.gender,
      });
    }

    return personsDetailData;
  }

  private async searchPersonByBirthAddress(filters: McsSearchPersonsDto): Promise<McsPersonRecord[]> {
    const {
      region,
      community,
      firstName,
      lastName,
      patronomicName,
      birthDate,
      firstNameMatchType,
      lastNameMatchType,
      patronomicNameMatchType,
    } = filters || {};

    if (!region || !community || (!firstName && !lastName && !patronomicName)) {
      throw new BadRequestException('Որոնման պարամետրերը պակաս են');
    }

    const body = {
      request: { number: '1103', department: '999' },
      birth_region: region,
      birth_community: community,
      additional_data: {
        ...(lastName && {
          last_name: { name: lastName, is_complete: lastNameMatchType === 'exact' },
        }),
        ...(firstName && {
          first_name: { name: firstName, is_complete: firstNameMatchType === 'exact' },
        }),
        ...(patronomicName && {
          patr_name: { name: patronomicName, is_complete: patronomicNameMatchType === 'exact' },
        }),
        ...(birthDate && { birth_date: birthDate }),
      },
    };

    const response = await firstValueFrom(
      this.httpService.request(this.buildPersonsOptions('by-birth-addr', body)),
    );

    if (!response.data?.ssn_list?.length) return [];

    const personsDetailData = await this.getPersonsDetailsBySsnList(response.data.ssn_list);

    if (filters?.age?.min || filters?.age?.max || filters?.gender) {
      return this.filterPersons(personsDetailData, {
        age: filters.age,
        gender: filters.gender,
      });
    }

    return personsDetailData;
  }

  private async searchByRegionCommunity(filters: McsSearchPersonsDto) {
    return this.searchPersonsByAddress('by-addr-rc', filters, ['region', 'community']);
  }

  private async searchByRegionCommunityStreet(filters: McsSearchPersonsDto) {
    return this.searchPersonsByAddress('by-addr-rcs', filters, ['region', 'community', 'street']);
  }

  private async searchByRegionCommunityStreetBuilding(filters: McsSearchPersonsDto) {
    return this.searchPersonsByAddress('by-addr-rcsb', filters, [
      'region',
      'community',
      'street',
      'building',
    ]);
  }

  private async searchPersonsByAddress(
    type: string,
    filters: McsSearchPersonsDto,
    requiredFields: string[],
  ): Promise<McsPersonRecord[]> {
    const body = this.buildPersonSearchByAddressBody(filters, requiredFields);

    const response = await firstValueFrom(
      this.httpService.request(this.buildPersonsOptions(type, body)),
    );

    if (!response.data?.ssn_list?.length) return [];

    const personsDetailData = await this.getPersonsDetailsBySsnList(response.data.ssn_list);

    if (filters?.age?.min || filters?.age?.max || filters?.gender) {
      return this.filterPersons(personsDetailData, {
        age: filters.age,
        gender: filters.gender,
      });
    }

    return personsDetailData;
  }

  private buildAddressOptions(path: string) {
    const baseUrl = this.configService.get<string>('MCS_ADDRESS_CATALOGS_API_URL');
    return {
      method: 'GET',
      maxBodyLength: Infinity,
      url: `${baseUrl}/${path}`,
      headers: { 'Content-Type': 'application/json' },
    };
  }

  private buildPersonsOptions(path: string, body: Record<string, unknown>) {
    const baseUrl = this.configService.get<string>('MCS_SEARCH_PERSONS_API_URL');
    return {
      method: 'POST',
      maxBodyLength: Infinity,
      url: `${baseUrl}/${path}`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(body),
    };
  }

  private buildPersonSearchByAddressBody(filters: McsSearchPersonsDto, requiredFields: string[] = []) {
    const {
      region,
      community,
      street,
      building,
      firstName,
      lastName,
      patronomicName,
      birthDate,
      firstNameMatchType,
      lastNameMatchType,
      patronomicNameMatchType,
    } = filters;

    for (const field of requiredFields) {
      if (!(filters as any)[field]) {
        throw new BadRequestException('Որոնման պարամետրերը պակաս են');
      }
    }

    if (!firstName && !lastName && !patronomicName) {
      throw new BadRequestException('Պետք է մուտքագրել անուն/ազգանուն/հայրանուն');
    }

    return {
      request: { number: '1103', department: '999' },
      regist_in_addr: filters.registrationType === 'EVER' ? 'EVER_REGISTERED' : 'CURRENTLY_REGISTERED',
      ...(region && { region }),
      ...(community && { community }),
      ...(street && { street }),
      ...(building && { building }),
      additional_data: {
        ...(lastName && {
          last_name: { name: lastName, is_complete: lastNameMatchType === 'exact' },
        }),
        ...(firstName && {
          first_name: { name: firstName, is_complete: firstNameMatchType === 'exact' },
        }),
        ...(patronomicName && {
          patr_name: { name: patronomicName, is_complete: patronomicNameMatchType === 'exact' },
        }),
        ...(birthDate && { birth_date: birthDate }),
      },
    };
  }

  private filterPersons(data: McsPersonRecord[], filters: { age?: any; gender?: any }) {
    return data.filter((item: any) => {
      const birthDate = item.avv_documents?.find((doc: any) => doc.person?.birth_date)?.person
        ?.birth_date;

      const age = this.calculateAge(birthDate);
      const min = filters.age?.min ?? null;
      const max = filters.age?.max ?? null;

      const ageCheck = (min === null || age >= min) && (max === null || age <= max);

      const sex = item.avv_documents?.find((doc: any) => doc.person?.genus)?.person?.genus;
      const gender = (filters.gender || '').trim();
      const genderCheck =
        (gender === 'MALE' && String(sex).trim() === 'M') ||
        (gender === 'FEMALE' && String(sex).trim() === 'F') ||
        gender === '';

      return ageCheck && genderCheck;
    });
  }

  private calculateAge(birthDate?: string): number {
    if (!birthDate) return 0;

    const [day, month, year] = birthDate.split('/').map((val) => Number(val));
    if (!day || !month || !year) return 0;

    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() + 1 - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age -= 1;
    }

    return age;
  }
}
