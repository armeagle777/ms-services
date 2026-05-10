import { Controller, Get, Param, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';

import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { RoadPoliceService } from 'src/Core/RoadPolice/RoadPolice.service';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

export class VehicleSearchBodyDto {
   searchField!: string;
   searchValue!: string;
}

@Controller('road-police')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class RoadPoliceController {
   constructor(private readonly roadPoliceService: RoadPoliceService) {}

   @Get('driver-license-and-vehicles/:ssn')
   getPersonDrivingLicenseAndVehicles(@Param() params: { ssn: string }) {
      return this.roadPoliceService.getPersonDrivingLicenseAndVehicles(params.ssn);
   }

   @Post('vehicles/search')
   searchVehicleByParams(@Body() body: VehicleSearchBodyDto) {
      return this.roadPoliceService.searchVehicleByParams(body.searchField, body.searchValue);
   }
}
