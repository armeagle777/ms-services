import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';

import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { InterpolService } from 'src/Core/Interpol/Interpol.service';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';
import { SearchPersonDto } from 'src/API/DTO/Interpol/SearchPerson.dto';
import { GetPersonDetailsDto } from 'src/API/DTO/Interpol/GetPersonDetails.dto';
import { DownloadNoticeDto } from 'src/API/DTO/Interpol/DownloadNotice.dto';
import { DownloadImageDto } from 'src/API/DTO/Interpol/DownloadImage.dto';
import { SltdSearchDto } from 'src/ApI/DTO/Interpol/SltdSearch.dto';
import { SltdDetailsDto } from 'src/API/DTO/Interpol/SltdDetails.dto';

@Controller('interpol')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class InterpolController {
   constructor(private readonly interpolService: InterpolService) {}

   @Post('search')
   search(@Body() body: SearchPersonDto) {
      return this.interpolService.search(body);
   }

   @Post('sltd/search')
   sltdSearch(@Body() body: SltdSearchDto) {
      return this.interpolService.sltdSearch(body);
   }

   @Post('sltd/details')
   sltdDetails(@Body() body: SltdDetailsDto) {
      return this.interpolService.sltdDetails(body.id);
   }

   @Get('details')
   details(@Query() query: GetPersonDetailsDto) {
      return this.interpolService.details(query.item_id);
   }

   @Get('download/notice')
   downloadNotice(@Query() query: DownloadNoticeDto) {
      return this.interpolService.getNoticePdf(query.path);
   }

   @Get('download/image')
   downloadImage(@Query() query: DownloadImageDto) {
      return this.interpolService.getImageFile(query.item_id, query.path);
   }
}
