import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PkiClientService {
   private privateKey?: string;
   private certificate?: string;
   private agent?: https.Agent;
   private readonly keyPath: string;
   private readonly certPath: string;

   constructor(
      private readonly configService: ConfigService,
      private readonly httpService: HttpService,
   ) {
      const keyPath = './src/API/Certificates/pki-request.key';
      const certPath = './src/API/Certificates/pki-request.pem';

      this.keyPath = this.resolveCertPath(keyPath);
      this.certPath = this.resolveCertPath(certPath);
   }

   async editUser(userData: Record<string, unknown>, options: { isRaCitizen?: boolean } = {}) {
      const baseUrl = this.getBaseUrl();
      const { soapBody, password } = this.buildEditUserSoap(userData, options);

      const response = await firstValueFrom(
         this.httpService.post(baseUrl, soapBody, {
            headers: {
               'Content-Type': 'text/xml;charset=UTF-8',
               Accept: 'text/xml',
            },
            httpsAgent: this.ensureAgent(),
         }),
      );

      return { password, data: response.data };
   }

   async findUser(matchValue: string) {
      const baseUrl = this.getBaseUrl();
      const soapBody = this.buildFindUserSoap(matchValue);

      const response = await firstValueFrom(
         this.httpService.post(baseUrl, soapBody, {
            headers: {
               'Content-Type': 'text/xml;charset=UTF-8',
               Accept: 'text/xml',
            },
            httpsAgent: this.ensureAgent(),
         }),
      );

      return response.data;
   }

   async revokeUser(ssn: string, options: { reasonCode?: number; deleteUser?: number } = {}) {
      const baseUrl = this.getBaseUrl();
      const { reasonCode = 0, deleteUser = 1 } = options;
      const soapBody = this.buildRevokeUserSoap(ssn, reasonCode, deleteUser);

      const response = await firstValueFrom(
         this.httpService.post(baseUrl, soapBody, {
            headers: {
               'Content-Type': 'text/xml;charset=UTF-8',
               Accept: 'text/xml',
            },
            httpsAgent: this.ensureAgent(),
         }),
      );

      return response.data;
   }

   private getBaseUrl() {
      const baseUrl = this.configService.get<string>('ESIGN_PKI_API_URL');
      if (!baseUrl) throw new InternalServerErrorException('ESIGN_PKI_API_URL is not configured');
      return baseUrl;
   }

   private ensureAgent() {
      if (this.agent) return this.agent;

      if (!fs.existsSync(this.keyPath) || !fs.existsSync(this.certPath)) {
         throw new InternalServerErrorException(
            'ESIGN certificates not found. Configure ESIGN_PKI_KEY_PATH and ESIGN_PKI_CERT_PATH.',
         );
      }

      this.privateKey = fs.readFileSync(this.keyPath, 'utf8');
      this.certificate = fs.readFileSync(this.certPath, 'utf8');
      this.agent = new https.Agent({
         key: this.privateKey,
         cert: this.certificate,
         rejectUnauthorized: false,
      });

      return this.agent;
   }

   private buildFindUserSoap(matchValue: string) {
      return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ws="http://ws.protocol.core.ejbca.org/">
        <soapenv:Header/>
        <soapenv:Body>
          <ws:findUser>
            <arg0>
              <matchtype>0</matchtype>
              <matchvalue>${matchValue}</matchvalue>
              <matchwith>0</matchwith>
            </arg0>
          </ws:findUser>
        </soapenv:Body>
      </soapenv:Envelope>
          `.trim();
   }

   private buildEditUserSoap(
      userData: Record<string, any>,
      { isRaCitizen }: { isRaCitizen?: boolean },
   ) {
      const password = this.generatePassword();
      const cn = `${userData.first_name_en} ${userData.last_name_en} ${userData.ssn}`;
      const sn = userData.ssn;
      const givenName = userData.first_name_am;
      const surname = userData.last_name_am;
      const certificateProfileName = isRaCitizen ? 'CITIZEN_SIGN' : 'FOREIGN_CITIZEN_SIGN';
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
                <endEntityProfileName>FOREIGN_CITIZEN_SIGN</endEntityProfileName>
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

   private buildRevokeUserSoap(ssn: string, reasonCode = 0, deleteUser = 1) {
      return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ws="http://ws.protocol.core.ejbca.org/">
        <soapenv:Header/>
        <soapenv:Body>
          <ws:revokeUser>
            <arg0>${ssn}</arg0>
            <arg1>${Number(reasonCode)}</arg1>
            <arg2>${Number(deleteUser)}</arg2>
          </ws:revokeUser>
        </soapenv:Body>
      </soapenv:Envelope>
          `.trim();
   }

   private generatePassword() {
      const raw = crypto.randomBytes(24).toString('base64');
      return raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
   }

   private escapeXml(value: string) {
      return String(value)
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&apos;');
   }

   private resolveCertPath(filePath: string) {
      const direct = path.resolve(process.cwd(), filePath);
      if (fs.existsSync(direct)) return direct;

      const fallback = path.resolve(process.cwd(), '..', filePath.replace(/^\.\//, ''));
      return fallback;
   }
}
