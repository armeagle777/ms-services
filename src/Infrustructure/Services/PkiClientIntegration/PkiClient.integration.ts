import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const CERTIFICATE_PROFILE = {
   RA_CITIZEN: 'RA Citizen',
   FOREIGN_CITIZEN: 'Foreign Citizen',
} as const;

export interface RevokePkiUserRequest {
   ssn: string;
   reasonCode?: number;
   deleteUser?: number;
}

export interface RevokePkiUserResponse {
   status: 'success';
}

export interface CreatePkiUserRequest {
   userData: {
      first_name_en?: string;
      last_name_en?: string;
      ssn?: string;
      first_name_am?: string;
      last_name_am?: string;
      [key: string]: unknown;
   };
   isRaCitizen?: boolean;
}

@Injectable()
export class PkiClientIntegration {
   private readonly baseUrl: string;
   private readonly agent: https.Agent;
   private readonly xmlParser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
   });

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

   async revokeUser(request: RevokePkiUserRequest): Promise<RevokePkiUserResponse | string> {
      if (!this.baseUrl) {
         throw new InternalServerErrorException('ESIGN_PKI_API_URL is not configured');
      }

      const soapBody = this.buildRevokeUserSoap(request);
      const { data } = await this.postSoap<string>(soapBody);

      return this.parseRevokeUserResponse(data);
   }

   async createUser(request: CreatePkiUserRequest): Promise<{ password: string; data: string }> {
      if (!this.baseUrl) {
         throw new InternalServerErrorException('ESIGN_PKI_API_URL is not configured');
      }

      const { soapBody, password } = this.buildEditUserSoap(request.userData, {
         isRaCitizen: request.isRaCitizen ?? false,
      });
      const { data } = await this.postSoap<string>(soapBody);

      return { password, data };
   }

   async findUser(matchValue: string): Promise<string> {
      if (!this.baseUrl) {
         throw new InternalServerErrorException('ESIGN_PKI_API_URL is not configured');
      }

      const soapBody = this.buildFindUserSoap(matchValue);
      const { data } = await this.postSoap<string>(soapBody);

      return data;
   }

   parseFindUserResponse(xml: string): unknown {
      const parsed = this.xmlParser.parse(xml);
      const body = parsed?.Envelope?.Body;

      if (body?.Fault) {
         return {
            fault: body.Fault,
         };
      }

      return this.normalizeFindUserResult(body?.findUserResponse?.return ?? []);
   }

   parseRevokeUserResponse(xml: string): RevokePkiUserResponse | string {
      const parsed = this.xmlParser.parse(xml);
      const body = parsed?.Envelope?.Body;

      if (body?.Fault) {
         return xml;
      }

      if (
         body?.revokeUserResponse &&
         !Object.prototype.hasOwnProperty.call(body.revokeUserResponse, 'return')
      ) {
         return { status: 'success' };
      }

      return xml;
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

   buildFindUserSoap(matchValue: string): string {
      return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ws="http://ws.protocol.core.ejbca.org/">
        <soapenv:Header/>
        <soapenv:Body>
          <ws:findUser>
            <arg0>
              <matchtype>0</matchtype>
              <matchvalue>${this.escapeXml(matchValue)}</matchvalue>
              <matchwith>0</matchwith>
            </arg0>
          </ws:findUser>
        </soapenv:Body>
      </soapenv:Envelope>
          `.trim();
   }

   buildEditUserSoap(
      userData: CreatePkiUserRequest['userData'],
      { isRaCitizen }: { isRaCitizen: boolean },
   ): { password: string; soapBody: string } {
      const password = this.generatePassword();
      const cn = `${userData.first_name_en} ${userData.last_name_en} ${userData.ssn}`;
      const sn = userData.ssn ?? '';
      const givenName = userData.first_name_am ?? '';
      const surname = userData.last_name_am ?? '';
      const certificateProfileName = isRaCitizen
         ? CERTIFICATE_PROFILE.RA_CITIZEN
         : CERTIFICATE_PROFILE.FOREIGN_CITIZEN;
      const subjectDN = `CN=${cn},SN=${sn},GIVENNAME=${givenName},SURNAME=${surname},C=AM`;

      return {
         password,
         soapBody: `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:ws="http://ws.protocol.core.ejbca.org/">
          <soapenv:Header/>
          <soapenv:Body>
            <ws:editUser>
              <arg0>
                <caName>CA_AM</caName>
                <certificateProfileName>${this.escapeXml(certificateProfileName)}</certificateProfileName>
                <clearPwd>false</clearPwd>
                <endEntityProfileName>${this.escapeXml(certificateProfileName)}</endEntityProfileName>
                <extendedInformation>
                  <name>customdata_REVOCATIONREASON</name>
                  <value>6</value>
                </extendedInformation>
                <extendedInformation>
                  <name>subjectdirattributes</name>
                  <value></value>
                </extendedInformation>
                <keyRecoverable>false</keyRecoverable>
                <password>${this.escapeXml(password)}</password>
                <sendNotification>false</sendNotification>
                <status>40</status>
                <subjectDN>${this.escapeXml(subjectDN)}</subjectDN>
                <tokenType>USERGENERATED</tokenType>
                <username>${this.escapeXml(sn)}</username>
              </arg0>
            </ws:editUser>
          </soapenv:Body>
        </soapenv:Envelope>
            `.trim(),
      };
   }

   private generatePassword(): string {
      return crypto
         .randomBytes(24)
         .toString('base64')
         .replace(/[^a-zA-Z0-9]/g, '')
         .slice(0, 15);
   }

   private escapeXml(value: string): string {
      return String(value)
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&apos;');
   }

   private postSoap<T>(soapBody: string) {
      return axios.post<T>(this.baseUrl, soapBody, {
         headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            Accept: 'text/xml',
         },
         httpsAgent: this.agent,
         maxBodyLength: Infinity,
         timeout: 30_000,
      });
   }

   private normalizeFindUserResult(value: unknown): unknown {
      if (value === undefined || value === null || value === '') {
         return [];
      }

      if (Array.isArray(value)) {
         return value;
      }

      return [value];
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
