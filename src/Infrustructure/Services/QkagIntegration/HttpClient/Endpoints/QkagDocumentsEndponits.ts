import { AxiosInstance, AxiosResponse } from 'axios';

import { IQkagResponseModel } from '../../Models';

export class QkagDocumentsEndponits {
   constructor(private http: AxiosInstance) {}

   getQkagDocuments(ssn: string): Promise<AxiosResponse<IQkagResponseModel>> {
      return this.http.post(`get_act`, ssn);
   }
}
