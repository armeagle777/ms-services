import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';

@Injectable()
export class EkengBasicClientIntegration {
   private readonly agent: https.Agent;

   constructor(private readonly configService: ConfigService) {
      this.agent = new https.Agent({
         rejectUnauthorized: false,
      });
   }

   buildRequestOptions(url: string, body: Record<string, unknown>) {
      const postData = JSON.stringify(body);

      return {
         method: 'post',
         url,
         headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'X-Signature-Algorithm': 'RSA-SHA256',
         },
         data: postData,
         httpsAgent: this.agent,
      };
   }
}
