import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class MigrationCitizenServiceIntegration {
   constructor(private readonly configService: ConfigService) {}

   /**
    * Get URL from environment variable
    * @param envKey - Environment variable key
    * @returns URL string
    */
   private getUrl(envKey: string): string {
      const url = this.configService.get<string>(envKey);
      if (!url) {
         throw new InternalServerErrorException(`${envKey} is not configured`);
      }
      return url;
   }

   /**
    * Build address catalog request options
    * @param path - API path (e.g., 'community?region=...')
    * @returns Request configuration object
    */
   buildAddressOptions(path: string) {
      const baseUrl = this.getUrl('MCS_ADDRESS_CATALOGS_API_URL');
      return {
         method: 'GET' as const,
         maxBodyLength: Infinity,
         url: `${baseUrl}/${path}`,
         headers: { 'Content-Type': 'application/json' },
      };
   }

   /**
    * Build persons search request options
    * @param path - API path (e.g., 'by-ssn-list', 'by-addr')
    * @param body - Request body
    * @returns Request configuration object
    */
   buildPersonsOptions(path: string, body: Record<string, unknown>) {
      const baseUrl = this.getUrl('MCS_SEARCH_PERSONS_API_URL');
      return {
         method: 'POST' as const,
         maxBodyLength: Infinity,
         url: `${baseUrl}/${path}`,
         headers: { 'Content-Type': 'application/json' },
         data: JSON.stringify(body),
      };
   }

   /**
    * Execute address catalog request
    * @param path - API path
    * @param responsePath - Path to extract from response (e.g., 'rcr_catalog')
    * @returns Extracted response data or empty array on error
    */
   async executeAddressRequest<T = any>(path: string, responsePath?: string): Promise<T | []> {
      const config = this.buildAddressOptions(path);

      try {
         const response: AxiosResponse = await axios(config);
         const data = response.data;

         if (responsePath) {
            const pathParts = responsePath.split('.');
            let result = data;
            for (const part of pathParts) {
               result = result?.[part];
               if (result === undefined) {
                  return [];
               }
            }
            return result as T;
         }

         return data as T;
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         throw new InternalServerErrorException(`MCS address request failed: ${message}`);
      }
   }

   /**
    * Execute persons search request
    * @param path - API path
    * @param body - Request body
    * @param responsePath - Path to extract from response (e.g., 'avv_persons', 'ssn_list')
    * @returns Extracted response data or empty array on error
    */
   async executePersonsRequest<T = any>(
      path: string,
      body: Record<string, unknown>,
      responsePath?: string,
   ): Promise<T | []> {
      const config = this.buildPersonsOptions(path, body);

      try {
         const response: AxiosResponse = await axios(config);
         const data = response.data;

         if (responsePath) {
            const pathParts = responsePath.split('.');
            let result = data;
            for (const part of pathParts) {
               result = result?.[part];
               if (result === undefined) {
                  return [];
               }
            }
            return result as T;
         }

         return data as T;
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         throw new InternalServerErrorException(`MCS persons request failed: ${message}`);
      }
   }
}
