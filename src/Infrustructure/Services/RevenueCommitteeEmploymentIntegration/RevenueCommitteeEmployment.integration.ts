import * as fs from 'fs';
import * as path from 'path';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as crypto from 'crypto';

@Injectable()
export class EmploymentContractsIntegration {
   private readonly privateKey: string;
   private readonly certificate: string;
   private readonly agent: https.Agent;
   private readonly baseUrl: string;

   constructor(private readonly configService: ConfigService) {
      const keyPath = './src/API/Certificates/employee_contracts.key';
      const certPath = './src/API/Certificates/employee_contracts.pem';

      this.privateKey = this.resolveAndReadCertFile(keyPath);
      this.certificate = this.resolveAndReadCertFile(certPath);

      this.agent = new https.Agent({
         key: this.privateKey,
         cert: this.certificate,
         rejectUnauthorized: false,
      });

      this.baseUrl = this.configService.get<string>('REVENUE_COMMITTEE_API_URL') || '';
      if (!this.baseUrl) {
         throw new InternalServerErrorException('REVENUE_COMMITTEE_API_URL is not configured');
      }
   }

   signData(data: string) {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(data);
      sign.end();
      return sign.sign(this.privateKey, 'base64');
   }

   buildRequestOptions(endpointPath: string, body: Record<string, unknown>) {
      const url = `${this.baseUrl}${endpointPath}`;
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
