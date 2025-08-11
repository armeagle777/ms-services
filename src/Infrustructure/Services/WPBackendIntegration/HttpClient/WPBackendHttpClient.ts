import { Injectable } from '@nestjs/common';

import { WPBackendConnector } from './../WPBackendConnector';

import { ImageEndpoints } from './Endpoints/ImageEndpoints';

@Injectable()
export class WPBackendHttpClient {
   Image: ImageEndpoints;

   constructor() {
      const httpAxiosInstance = new WPBackendConnector().getAxiosInstance();

      this.Image = new ImageEndpoints(httpAxiosInstance);
   }
}
