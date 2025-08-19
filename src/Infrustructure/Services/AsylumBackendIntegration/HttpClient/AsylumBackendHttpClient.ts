import { Injectable } from '@nestjs/common';

import { AsylumBackendConnector } from '../AsylumBackendConnector';
import { ImageEndpoints } from './Endpoints/ImageEndpoints';

@Injectable()
export class AsylumBackendHttpClient {
   Image: ImageEndpoints;

   constructor() {
      const httpAxiosInstance = new AsylumBackendConnector().getAxiosInstance();

      this.Image = new ImageEndpoints(httpAxiosInstance);
   }
}
