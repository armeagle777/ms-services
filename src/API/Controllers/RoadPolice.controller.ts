import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { RoadPoliceService } from 'src/Core/RoadPolice/RoadPolice.service';

export class VehicleSearchBodyDto {
   searchField!: string;
   searchValue!: string;
}

@Controller('road-police')
export class RoadPoliceController {
   constructor(private readonly roadPoliceService: RoadPoliceService) {}

   @Get('driver-license-and-vehicles/:personId')
   getPersonDrivingLicenseAndVehicles(@Param() params: { personId: string }) {
      return this.roadPoliceService.getPersonDrivingLicenseAndVehicles(params.personId);
   }

   @Post('vehicles/search')
   searchVehicleByParams(@Body() body: VehicleSearchBodyDto) {
      return this.roadPoliceService.searchVehicleByParams(body.searchField, body.searchValue);
   }
}
