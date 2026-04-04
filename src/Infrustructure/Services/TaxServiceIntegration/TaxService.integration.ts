import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class TaxServiceIntegration {
   private readonly taxUrl: string;

   constructor(private readonly configService: ConfigService) {
      this.taxUrl = this.configService.get<string>('TAX_SERVICE_API_URL');
      if (!this.taxUrl) {
         throw new InternalServerErrorException('TAX_SERVICE_API_URL is not configured');
      }
   }

   async getTaxBySsn(ssn: string): Promise<any> {
      const config: AxiosRequestConfig = {
         url: this.taxUrl,
         method: 'POST',
         data: { ssn },
      };

      const { data } = await axios(config);
      return data;
   }
}
