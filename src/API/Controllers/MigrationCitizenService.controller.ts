import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';

import { MigrationCitizenService } from 'src/Core/MigrationCitizenService/MigrationCitizenService.service';
import { McsAddressQueryDto, McsSearchPersonsDto } from 'src/API/DTO/Mcs/mcs.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('migration-citizenship-service')
@UseGuards(BasicAuthGuard)
// @UseInterceptors(ProtectedRequestLoggingInterceptor)
export class MigrationCitizenServiceController {
   constructor(private readonly mcsService: MigrationCitizenService) {}

   @Get('options/communities')
   getCommunities(@Query() query: McsAddressQueryDto) {
      return this.mcsService.getCommunities(query.region);
   }

   @Get('options/residences')
   getResidences(@Query() query: McsAddressQueryDto) {
      return this.mcsService.getResidences(query.region, query.community);
   }

   @Get('options/streets')
   getStreets(@Query() query: McsAddressQueryDto) {
      return this.mcsService.getStreets(query.region, query.community, query.residence);
   }

   @Post('persons/search')
   searchPersons(@Body() body: McsSearchPersonsDto) {
      return this.mcsService.searchPersons(body);
   }
}
