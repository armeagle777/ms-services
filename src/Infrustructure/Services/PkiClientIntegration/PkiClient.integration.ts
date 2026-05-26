import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import axios from 'axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RevokePkiUserRequest {
   ssn: string;
   reasonCode?: number;
   deleteUser?: number;
}

@Injectable()
export class PkiClientIntegration {
   private readonly baseUrl: string;
   private readonly agent: https.Agent;

   constructor(private readonly configService: ConfigService) {
      const keyPath = './src/API/Certificates/pki-request.key';
      const certPath = './src/API/Certificates/pki-request.pem';

      this.baseUrl = this.configService.get<string>('ESIGN_PKI_API_URL') || '';
      const privateKey = this.resolveAndReadCertFile(keyPath);
      const certificate = this.resolveAndReadCertFile(certPath);

      this.agent = new https.Agent({
         key: privateKey,
         cert: certificate,
         rejectUnauthorized: false,
      });
   }

   async revokeUser(request: RevokePkiUserRequest): Promise<string> {
      if (!this.baseUrl) {
         throw new InternalServerErrorException('ESIGN_PKI_API_URL is not configured');
      }

      const soapBody = this.buildRevokeUserSoap(request);
      const { data } = await axios.post<string>(this.baseUrl, soapBody, {
         headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            Accept: 'text/xml',
         },
         httpsAgent: this.agent,
         maxBodyLength: Infinity,
         timeout: 30_000,
      });

      return data;
   }

   buildRevokeUserSoap({ ssn, reasonCode = 0, deleteUser = 1 }: RevokePkiUserRequest): string {
      return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ws="http://ws.protocol.core.ejbca.org/">
        <soapenv:Header/>
        <soapenv:Body>
          <ws:revokeUser>
            <arg0>${this.escapeXml(ssn)}</arg0>
            <arg1>${Number(reasonCode)}</arg1>
            <arg2>${Number(deleteUser)}</arg2>
          </ws:revokeUser>
        </soapenv:Body>
      </soapenv:Envelope>
          `.trim();
   }

   private escapeXml(value: string): string {
      return String(value)
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&apos;');
   }

   private resolveAndReadCertFile(filePath: string): string {
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
