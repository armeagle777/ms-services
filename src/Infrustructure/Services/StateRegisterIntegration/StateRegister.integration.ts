import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

export interface CompanyInfoRequest {
   taxId: string;
}

@Injectable()
export class StateRegisterIntegration {
   private readonly petregistrUrl: string;

   constructor(private readonly configService: ConfigService) {
      this.petregistrUrl = this.configService.get<string>('STATE_REGISTER_API_URL');
      if (!this.petregistrUrl) {
         throw new InternalServerErrorException('STATE_REGISTER_API_URL is not configured');
      }
   }

   async getCompanyByTaxId(request: CompanyInfoRequest): Promise<any> {
      const options = {
         jsonrpc: '2.0',
         id: 1,
         method: 'company_info',
         params: { tax_id: request.taxId },
      };

      const config: AxiosRequestConfig = {
         url: this.petregistrUrl,
         method: 'POST',
         data: options,
      };

      const response = await axios(config);
      return response.data;
   }
}
