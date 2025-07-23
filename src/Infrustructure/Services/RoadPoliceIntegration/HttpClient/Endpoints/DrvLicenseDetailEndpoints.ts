import { AxiosInstance, AxiosResponse } from 'axios';

import { IRoadPoliceResponseModel } from '../../Models';

export class DrvLicenseDetailEndpoints {
   constructor(private http: AxiosInstance) {}

   getDrvLicenseInfoBySsn(ssn: string): Promise<AxiosResponse<IRoadPoliceResponseModel>> {
      return this.http.post(`get_driving_license_with_info`, ssn);
   }
}
