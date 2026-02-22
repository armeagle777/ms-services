import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
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
      this.configService.get<string>('EKENG_KEY_PATH') || './src/certificates/moj-ces.key';
    const certPath =
      this.configService.get<string>('EKENG_CERT_PATH') ||
      './src/certificates/4af066b1_bb43_4631_962c_1c961b62dd07.pem';

    const resolvedKeyPath = this.resolveCertPath(keyPath);
    const resolvedCertPath = this.resolveCertPath(certPath);

    this.privateKey = fs.readFileSync(resolvedKeyPath, 'utf8');
    this.certificate = fs.readFileSync(resolvedCertPath, 'utf8');

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

  private resolveCertPath(filePath: string) {
    const direct = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(direct)) return direct;

    const fallback = path.resolve(process.cwd(), '..', filePath.replace(/^\.\//, ''));
    return fallback;
  }
}
