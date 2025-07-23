import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import axios, { AxiosInstance } from 'axios';

@Injectable()
export class QkagConnector {
   private readonly axiosInstance: AxiosInstance;

   constructor(private readonly configService: ConfigService) {
      this.axiosInstance = axios.create({ baseURL: this.configService.get('QKAG_API_URL') });
   }

   getAxiosInstance() {
      return this.axiosInstance;
   }
}
