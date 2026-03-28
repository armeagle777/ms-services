import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class EkengBasicClientIntegration {
   private readonly agent: https.Agent;
   private readonly baseUrl: string;

   constructor(private readonly configService: ConfigService) {
      this.agent = new https.Agent({
         rejectUnauthorized: false,
      });

      this.baseUrl = this.configService.get<string>('EKENG_API_URL');
   }

   /**
    * Build full URL from endpoint path
    * @param endpoint - Endpoint path (e.g., '/tax/ssn', '/avv/search')
    * @returns Full URL string
    */
   private buildUrl(endpoint: string): string {
      return `${this.baseUrl}${endpoint}`;
   }

   /**
    * Build JSON-RPC request options
    * @param url - Target URL
    * @param method - JSON-RPC method name
    * @param params - Method parameters
    * @param id - Request ID (default: 1)
    * @returns Request configuration object
    */
   buildJsonRpcRequestOptions(
      url: string,
      method: string,
      params: Record<string, unknown>,
      id: number = 1,
   ) {
      const body = JSON.stringify({
         jsonrpc: '2.0',
         id,
         method,
         params,
      });

      return {
         method: 'post' as const,
         url,
         headers: {
            'Content-Type': 'application/json',
         },
         data: body,
         httpsAgent: this.agent,
      };
   }

   /**
    * Execute JSON-RPC request and handle response
    * @param url - Target URL
    * @param method - JSON-RPC method name
    * @param params - Method parameters
    * @param id - Request ID (default: 1)
    * @returns Parsed response data or empty array on error
    */
   async executeJsonRpcRequest<T = any>(
      url: string,
      method: string,
      params: Record<string, unknown>,
      id: number = 1,
   ): Promise<T | []> {
      const config = this.buildJsonRpcRequestOptions(url, method, params, id);

      try {
         const response: AxiosResponse = await axios(config);
         console.log('response>>>>>>>>>', response);
         const data = response.data;

         if (data?.error) {
            return [];
         }

         return data?.result as T;
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         throw new InternalServerErrorException(`JSON-RPC request failed: ${message}`);
      }
   }

   /**
    * Make JSON-RPC request to any Ekeng endpoint
    * @param endpoint - Endpoint path (e.g., '/tax/ssn', '/avv/search')
    * @param method - JSON-RPC method name
    * @param params - Method parameters
    * @param id - Request ID (default: 1)
    * @returns Response data
    */
   async makeJsonRpcRequest<T = any>(
      endpoint: string,
      method: string,
      params: Record<string, unknown>,
      id: number = 1,
   ): Promise<T | []> {
      const url = this.buildUrl(endpoint);
      return this.executeJsonRpcRequest<T>(url, method, params, id);
   }
}
