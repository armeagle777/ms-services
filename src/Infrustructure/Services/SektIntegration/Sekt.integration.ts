import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import { XMLParser } from 'fast-xml-parser';
import {
   SEKT_BORDERCROSS_CONTENT_TYPE,
   SEKT_EXTENDED_BORDERCROSS_CONTENT_TYPE,
   SEKT_LIST_TAG_NAMES,
} from './Models/sekt.constants';
import { SektExtendedBordercrossRawResponse, SektRequest } from './Models/sekt.types';

@Injectable()
export class SektIntegration {
   private readonly bordercrossUrl: string;
   private readonly authorization: string;
   private readonly cookies: string;
   private readonly migrationApiUrl: string;
   private readonly migrationUsername: string;
   private readonly migrationPassword: string;
   private readonly xmlParser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
      isArray: (tagName) => SEKT_LIST_TAG_NAMES.includes(tagName),
   });

   constructor(private readonly configService: ConfigService) {
      this.bordercrossUrl = this.configService.get<string>('SEKT_API_URL');
      this.authorization = this.configService.get<string>('SEKT_API_AUTHORIZATION');
      this.cookies = this.configService.get<string>('SEKT_API_COOKIES');

      if (!this.bordercrossUrl) {
         throw new InternalServerErrorException('SEKT_API_URL is not configured');
      }

      this.migrationApiUrl = this.configService.get<string>('SEKT_MIGRATION_API_URL');
      this.migrationUsername = this.configService.get<string>('SEKT_MIGRATION_API_USERNAME');
      this.migrationPassword = this.configService.get<string>('SEKT_MIGRATION_API_PASSWORD');

      if (!this.migrationApiUrl) {
         throw new InternalServerErrorException('SEKT_MIGRATION_API_URL is not configured');
      }
   }

   async getBordercrossBySsn(request: SektRequest): Promise<any> {
      const axiosData = this.buildBordercrossXml(request);

      const config: AxiosRequestConfig = {
         method: 'post',
         maxBodyLength: Infinity,
         url: this.bordercrossUrl,
         headers: {
            'Content-Type': SEKT_BORDERCROSS_CONTENT_TYPE,
            Authorization: `Basic ${this.authorization}`,
            Cookie: this.cookies,
         },
         data: axiosData,
      };

      const response = await axios(config);
      return this.xmlParser.parse(response.data);
   }

   async getExtendedBordercrossInfo(
      request: SektRequest,
   ): Promise<SektExtendedBordercrossRawResponse> {
      const axiosData = this.buildBordercrossXml(request);
      const authToken = Buffer.from(`${this.migrationUsername}:${this.migrationPassword}`).toString(
         'base64',
      );

      const config: AxiosRequestConfig = {
         method: 'post',
         maxBodyLength: Infinity,
         url: this.migrationApiUrl,
         headers: {
            'Content-Type': SEKT_EXTENDED_BORDERCROSS_CONTENT_TYPE,
            Authorization: `Basic ${authToken}`,
         },
         data: axiosData,
      };

      const response = await axios(config);
      return this.xmlParser.parse(response.data);
   }

   private buildBordercrossXml(request: SektRequest): string {
      return `<?xml version="1.0" encoding="UTF-8"?>\r\n <data>\r\n    <citizenship>${request.citizenship}</citizenship>\r\n    <passportNumber>${request.passportNumber}</passportNumber>\r\n </data>`;
   }
}
