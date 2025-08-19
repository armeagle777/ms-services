import { Injectable } from '@nestjs/common';

import { AsylumBackendHttpClient } from './HttpClient/AsylumBackendHttpClient';

@Injectable()
export class AsylumBackendIntegration {
   constructor(private asylumBackendHttpClient: AsylumBackendHttpClient) {}

   // Images
   async getRefugeeImage(path: string): Promise<string> {
      const refugeeImageResponse = await this.asylumBackendHttpClient.Image.getRefugeeImage(path);

      const base64Image = Buffer.from(refugeeImageResponse.data).toString('base64');
      const mimeType = refugeeImageResponse.headers['content-type'] || 'image/jpeg';

      return `data:${mimeType};base64,${base64Image}`;
   }
}
