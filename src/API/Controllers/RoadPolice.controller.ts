import { Controller, Get, Param, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { RoadPoliceService } from 'src/Core/RoadPolice/RoadPolice.service';
import { BasicAuthGuard } from 'src/modules/auth/guards/basic-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

export class VehicleSearchBodyDto {
   searchField!: string;
   searchValue!: string;
}

@Controller('road-police')
@UseGuards(BasicAuthGuard, PermissionGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
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
