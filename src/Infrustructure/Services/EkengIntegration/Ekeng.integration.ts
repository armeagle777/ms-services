import * as fs from 'fs';
import * as path from 'path';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as crypto from 'crypto';

@Injectable()
export class EkengIntegration {
   private readonly privateKey: string;
   private readonly certificate: string;
   private readonly agent: https.Agent;

   constructor(private readonly configService: ConfigService) {
      const keyPath =
         this.configService.get<string>('EKENG_KEY_PATH') || './src/API/Certificates/moj-ces.key';
      const certPath =
         this.configService.get<string>('EKENG_CERT_PATH') ||
         './src/API/Certificates/4af066b1_bb43_4631_962c_1c961b62dd07.pem';

      this.privateKey = this.resolveAndReadCertFile('EKENG_KEY_PATH', keyPath);
      this.certificate = this.resolveAndReadCertFile('EKENG_CERT_PATH', certPath);

      this.agent = new https.Agent({
         key: this.privateKey,
         cert: this.certificate,
         rejectUnauthorized: false,
      });
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
         method: 'post',
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

   private resolveAndReadCertFile(envKey: string, filePath: string) {
      const direct = path.resolve(process.cwd(), filePath);
      const fallback = path.resolve(process.cwd(), '..', filePath.replace(/^\.\//, ''));
      const resolvedPath = fs.existsSync(direct) ? direct : fallback;

      if (!fs.existsSync(resolvedPath)) {
         throw new InternalServerErrorException(
            `${envKey} points to a non-existing path: ${resolvedPath}`,
         );
      }

      const stat = fs.statSync(resolvedPath);
      if (!stat.isFile()) {
         throw new InternalServerErrorException(
            `${envKey} must point to a file, but got: ${resolvedPath}`,
         );
      }

      try {
         return fs.readFileSync(resolvedPath, 'utf8');
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         throw new InternalServerErrorException(
            `Failed to read ${envKey} file at ${resolvedPath}: ${message}`,
         );
      }
   }
}
