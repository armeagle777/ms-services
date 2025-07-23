import { Injectable } from '@nestjs/common';
import { DrvLicenseDetailEndpoints } from './Endpoints';

@Injectable()
export class RoadPoliceHttpClient {
   DrvLicense: DrvLicenseDetailEndpoints;
}
