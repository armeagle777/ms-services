import { AxiosInstance, AxiosResponse } from 'axios';

export class ImageEndpoints {
   constructor(private http: AxiosInstance) {}

   async getRefugeeImage(path: string): Promise<AxiosResponse<ArrayBuffer>> {
      const response = await this.http.get<ArrayBuffer>(path, {
         responseType: 'arraybuffer',
      });
      return response;
   }
}
