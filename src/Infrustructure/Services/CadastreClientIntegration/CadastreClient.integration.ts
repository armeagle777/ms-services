import * as fs from 'fs';
import * as path from 'path';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class CadastreClientIntegration {
   private readonly privateKey: string;
   private readonly certificate: string;
   private readonly agent: https.Agent;
   private readonly baseUrl: string;

   constructor(private readonly configService: ConfigService) {
      const keyPath = './src/API/Certificates/migration_am.key';
      const certPath = './src/API/Certificates/32837fe0_26ee_4f51_ac0d_00604a9167b4.pem';

      this.privateKey = this.resolveAndReadCertFile(keyPath);
      this.certificate = this.resolveAndReadCertFile(certPath);

      this.agent = new https.Agent({
         key: this.privateKey,
         cert: this.certificate,
         rejectUnauthorized: false,
      });

      this.baseUrl = this.configService.get<string>('CADASTRE_API_URL');
   }

   signData(data: string) {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(data);
      sign.end();
      return sign.sign(this.privateKey, 'base64');
   }

   buildRequestOptions(url: string, body: Record<string, unknown>) {
      const postData = JSON.stringify(body);
      const signature = this.signData(postData);

      return {
         method: 'post' as const,
         url,
         headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'X-Signature-Algorithm': 'RSA-SHA256',
            'X-Signature': signature,
         },
         data: postData,
         httpsAgent: this.agent,
      };
   }

   async executeRequest<T = any>(endpoint: string, body: Record<string, unknown>): Promise<T | []> {
      try {
         const url = this.buildUrl(endpoint);
         const config = this.buildRequestOptions(url, body);
         const response: AxiosResponse = await axios(config);

         const data = response?.data;
         return data as T;
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         throw new InternalServerErrorException(`Cadastre request failed: ${message}`);
      }
   }

   private buildUrl(endpoint: string): string {
      return `${this.baseUrl}${endpoint}`;
   }

   private resolveAndReadCertFile(filePath: string) {
      const direct = path.resolve(process.cwd(), filePath);
      const fallback = path.resolve(process.cwd(), '..', filePath.replace(/^\.\//, ''));
      const resolvedPath = fs.existsSync(direct) ? direct : fallback;

      if (!fs.existsSync(resolvedPath)) {
         throw new InternalServerErrorException(
            `${filePath} points to a non-existing path: ${resolvedPath}`,
         );
      }

      const stat = fs.statSync(resolvedPath);
      if (!stat.isFile()) {
         throw new InternalServerErrorException(
            `${filePath} must point to a file, but got: ${resolvedPath}`,
         );
      }

      try {
         return fs.readFileSync(resolvedPath, 'utf8');
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         throw new InternalServerErrorException(
            `Failed to read ${filePath} file at ${resolvedPath}: ${message}`,
         );
      }
   }
}
