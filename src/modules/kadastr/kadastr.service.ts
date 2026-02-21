import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import https from 'https';
import fs from 'fs';
import crypto from 'crypto';

import { SEARCH_BASES } from './kadastr.constants';
import { KadastrProperty } from './interfaces/kadastr.interfaces';

@Injectable()
export class KadastrService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getPropertiesBySsn(ssn: string): Promise<KadastrProperty[] | []> {
    const kadastrUrl = this.configService.get<string>('KADASTR_URL');
    if (!kadastrUrl) throw new InternalServerErrorException('KADASTR_URL is not configured');

    const { privateKey, certificate } = this.loadCertificates();

    const postData = JSON.stringify({
      ssn,
      date_from: '01/01/1970',
      date_to: this.getCurrentDate(),
    });

    const signature = this.signPayload(privateKey, postData);
    const agent = this.buildHttpsAgent(privateKey, certificate);

    const response = await firstValueFrom(
      this.httpService.post(kadastrUrl, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-Signature-Algorithm': 'RSA-SHA256',
          'X-Signature': signature,
        },
        httpsAgent: agent,
      }),
    );

    const data = response.data;
    if (!data?.cad_get_realty_owned_response?.owned_realties) return [];

    return data.cad_get_realty_owned_response.owned_realties as KadastrProperty[];
  }

  async getPropertyByCertificate(
    certificateNumber: string,
    searchBase?: string,
  ): Promise<KadastrProperty[] | []> {
    const kadastrUrl = this.configService.get<string>('KADASTR_CERTIFICATE_URL');
    if (!kadastrUrl)
      throw new InternalServerErrorException('KADASTR_CERTIFICATE_URL is not configured');

    const { privateKey, certificate } = this.loadCertificates();

    const searchProp = SEARCH_BASES[searchBase || ''] || 'cert_number';
    const postData = JSON.stringify({
      [searchProp]: certificateNumber,
      date_from: '01/01/1970',
      date_to: this.getCurrentDate(),
    });

    const signature = this.signPayload(privateKey, postData);
    const agent = this.buildHttpsAgent(privateKey, certificate);

    const response = await firstValueFrom(
      this.httpService.post(kadastrUrl, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-Signature-Algorithm': 'RSA-SHA256',
          'X-Signature': signature,
        },
        httpsAgent: agent,
      }),
    );

    const data = response.data;
    if (!data?.cad_get_realty_gip_response?.cad_get_realty) return [];

    return data.cad_get_realty_gip_response.cad_get_realty as KadastrProperty[];
  }

  private loadCertificates() {
    // TODO: confirm certificate locations for Nest app deployment
    const privateKey = fs.readFileSync('./src/certificates/migration_am.key', 'utf8');
    const certificate = fs.readFileSync(
      './src/certificates/32837fe0_26ee_4f51_ac0d_00604a9167b4.pem',
      'utf8',
    );

    return { privateKey, certificate };
  }

  private signPayload(privateKey: string, payload: string) {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(payload);
    sign.end();
    return sign.sign(privateKey, 'base64');
  }

  private buildHttpsAgent(privateKey: string, certificate: string) {
    return new https.Agent({
      key: privateKey,
      cert: certificate,
      rejectUnauthorized: false,
    });
  }

  private getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
