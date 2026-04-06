import { Injectable } from '@nestjs/common';
import { RoadPoliceIntegration } from 'src/Infrustructure/Services/RoadPoliceIntegration/RoadPolice.integration';
import {
   RoadPoliceResponse,
   VehicleSearchResponse,
} from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class RoadPoliceService {
   constructor(private readonly roadPoliceIntegration: RoadPoliceIntegration) {}

   async getPersonDrivingLicenseAndVehicles(personId: string): Promise<RoadPoliceResponse> {
      const [licenseResponse, vehiclesResponse] = await Promise.all([
         this.roadPoliceIntegration.getPersonLicenses({ personId }),
         this.roadPoliceIntegration.getPersonVehicles({ personId }),
      ]);

      const license = licenseResponse?.result || null;
      const vehicles = vehiclesResponse?.result?.length ? vehiclesResponse.result : null;

      return { license, vehicles };
   }

   async searchVehicleByParams(
      searchField: string,
      searchValue: string,
   ): Promise<VehicleSearchResponse> {
      const response = await this.roadPoliceIntegration.searchVehicle({
         searchField,
         searchValue,
      });

      const vehicles = response?.result?.length ? response.result : null;
      return { vehicles };
   }
}
