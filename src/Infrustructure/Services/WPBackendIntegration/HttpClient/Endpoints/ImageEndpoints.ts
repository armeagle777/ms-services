import { Axios, AxiosInstance, AxiosResponse } from 'axios';

export class ImageEndpoints {
   constructor(private http: AxiosInstance) {}

   async getWorkerImage(path: string | null): Promise<AxiosResponse<string>> {
      const response = await this.http.get<string>(path, {
         responseType: 'arraybuffer',
      });
      return response;
   }
}
