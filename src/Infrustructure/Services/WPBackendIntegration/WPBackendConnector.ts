import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

export class WPBackendConnector {
   private readonly axiosInstance: AxiosInstance;
   private readonly httpsAgent = new https.Agent({
      rejectUnauthorized: false,
   });

   constructor() {
      this.axiosInstance = axios.create({
         baseURL: process.env.WP_BACKEND_URL,
         httpsAgent: this.httpsAgent,
      });
   }

   getAxiosInstance() {
      return this.axiosInstance;
   }
}
