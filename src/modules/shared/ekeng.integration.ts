import fs from 'fs';
import https from 'https';
import crypto from 'crypto';

export class EkengIntegration {
  private readonly privateKey: string;
  private readonly certificate: string;
  private readonly agent: https.Agent;

  constructor(options?: { keyPath?: string; certPath?: string }) {
    const keyPath = options?.keyPath || './src/certificates/moj-ces.key';
    const certPath =
      options?.certPath || './src/certificates/4af066b1_bb43_4631_962c_1c961b62dd07.pem';

    this.privateKey = fs.readFileSync(keyPath, 'utf8');
    this.certificate = fs.readFileSync(certPath, 'utf8');

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
}
