import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import { XMLParser } from 'fast-xml-parser';

export interface SektRequest {
   passportNumber: string;
   citizenship: string;
}

@Injectable()
export class SektIntegration {
   private readonly bordercrossUrl: string;
   private readonly authorization: string;
   private readonly cookies: string;
   private readonly xmlParser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
   });

   constructor(private readonly configService: ConfigService) {
      this.bordercrossUrl = this.configService.get<string>('SEKT_API_URL');
      this.authorization = this.configService.get<string>('SEKT_API_AUTHORIZATION');
      this.cookies = this.configService.get<string>('SEKT_API_COOKIES');

      if (!this.bordercrossUrl) {
         throw new InternalServerErrorException('SEKT_API_URL is not configured');
      }
   }

   async getBordercrossBySsn(request: SektRequest): Promise<any> {
      const axiosData = `<?xml version="1.0" encoding="UTF-8"?>\r\n <data>\r\n    <citizenship>${request.citizenship}</citizenship>\r\n    <passportNumber>${request.passportNumber}</passportNumber>\r\n </data>`;

      const config: AxiosRequestConfig = {
         method: 'post',
         maxBodyLength: Infinity,
         url: this.bordercrossUrl,
         headers: {
            'Content-Type': 'application/xml',
            Authorization: `Basic ${this.authorization}`,
            Cookie: this.cookies,
         },
         data: axiosData,
      };

      const response = await axios(config);
      return this.xmlParser.parse(response.data);
   }
}
