import { Injectable } from '@nestjs/common';

import { WPBackendHttpClient } from './HttpClient/WPBackendHttpClient';

@Injectable()
export class WPBackendIntegration {
   constructor(private wpBackendHttpClient: WPBackendHttpClient) {}

   // Images
   async getWorkerImage(path: string): Promise<string> {
      const workerImageResponse = await this.wpBackendHttpClient.Image.getWorkerImage(path);

      const base64Image = Buffer.from(workerImageResponse.data).toString('base64');
      const mimeType = workerImageResponse.headers['content-type'] || 'image/jpeg';

      return `data:${mimeType};base64,${base64Image}`;
   }
}
