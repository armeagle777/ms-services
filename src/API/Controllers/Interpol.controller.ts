import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { InterpolService } from 'src/Core/Interpol/Interpol.service';
import {
   InterpolDetailsQueryDto,
   InterpolDownloadImageQueryDto,
   InterpolDownloadNoticeQueryDto,
   InterpolSearchRequestDto,
} from 'src/API/DTO/Interpol/interpol.dto';

@Controller('interpol')
export class InterpolController {
   constructor(private readonly interpolService: InterpolService) {}

   @Post('search')
   search(@Body() body: InterpolSearchRequestDto) {
      return this.interpolService.search(body);
   }

   @Get('details')
   details(@Query() query: InterpolDetailsQueryDto) {
      return this.interpolService.details(query.item_id);
   }

   @Get('download/notice')
   downloadNotice(@Query() query: InterpolDownloadNoticeQueryDto) {
      return this.interpolService.getNoticePdf(query.path);
   }

   @Get('download/image')
   downloadImage(@Query() query: InterpolDownloadImageQueryDto) {
      return this.interpolService.getImageFile(query.item_id, query.path);
   }
}
