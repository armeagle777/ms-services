import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { stringify as qsStringify } from 'qs';

@Injectable()
export class StatePopulationRegisterIntegration {
   private readonly baseUrl: string;

   constructor(private readonly configService: ConfigService) {
      this.baseUrl = this.configService.get<string>('STATE_POPULATION_REGISTER_API_URL') || '';
      if (!this.baseUrl) {
         throw new InternalServerErrorException(
            'STATE_POPULATION_REGISTER_API_URL is not configured',
         );
      }
   }

   /**
    * Build request options for getting a person by SSN
    * @param ssn - Social Security Number
    * @returns Request configuration object
    */
   buildGetPersonBySsnOptions(ssn: string) {
      const queryData = qsStringify({ psn: ssn, addresses: 'ALL' });
      return {
         method: 'POST' as const,
         url: this.baseUrl,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: queryData,
      };
   }

   /**
    * Build request options for searching persons
    * @param searchData - Search parameters
    * @returns Request configuration object
    */
   buildSearchPersonsOptions(searchData: Record<string, unknown>) {
      const queryData = qsStringify({ ...searchData, addresses: 'ALL' });
      return {
         method: 'POST' as const,
         url: this.baseUrl,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: queryData,
      };
   }

   /**
    * Get a person by SSN
    * @param ssn - Social Security Number
    * @returns Person data or empty array
    */
   async getPersonBySsn<T = any>(ssn: string): Promise<T | []> {
      const config = this.buildGetPersonBySsnOptions(ssn);

      try {
         const response: AxiosResponse = await axios(config);
         const { status, result } = response.data || {};

         if (status === 'failed' || !Array.isArray(result) || result.length === 0) {
            return [];
         }

         return result[0] as T;
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         throw new InternalServerErrorException(
            `StatePopulationRegister request failed: ${message}`,
         );
      }
   }

   /**
    * Search persons by parameters
    * @param searchData - Search parameters (firstName, lastName, patronomicName, birthDate, documentNumber, ssn)
    * @returns Array of person records
    */
   async searchPersons<T = any>(searchData: Record<string, unknown>): Promise<T[] | []> {
      const config = this.buildSearchPersonsOptions(searchData);

      try {
         const response: AxiosResponse = await axios(config);
         const { status, result } = response.data || {};

         if (status === 'failed' || !Array.isArray(result)) {
            return [];
         }

         return result as T[];
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         throw new InternalServerErrorException(
            `StatePopulationRegister search failed: ${message}`,
         );
      }
   }
}
