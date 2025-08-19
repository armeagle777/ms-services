import * as https from 'https';
import axios, { AxiosInstance } from 'axios';

export class AsylumBackendConnector {
   private readonly axiosInstance: AxiosInstance;
   private readonly httpsAgent = new https.Agent({
      rejectUnauthorized: false,
   });

   constructor() {
      this.axiosInstance = axios.create({
         baseURL: process.env.ASYLUM_BACKEND_URL,
         httpsAgent: this.httpsAgent,
      });
   }

   getAxiosInstance() {
      return this.axiosInstance;
   }
}
