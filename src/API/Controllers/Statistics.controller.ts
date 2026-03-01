import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { StatisticsService } from 'src/Core/Statistics/Statistics.service';
import {
   AsylumStatsRequestDto,
   BorderCrossStatsRequestDto,
   ExportStatsRequestDto,
   WpSimpleStatsRequestDto,
} from 'src/API/DTO/Statistics/statistics.dto';
import { StatisticsTypeParamDto } from 'src/API/DTO/Statistics/params.dto';

@Controller('statistics')
export class StatisticsController {
   constructor(private readonly statisticsService: StatisticsService) {}

   @Post('asylum/total')
   getAsylumTotal(@Body() body: AsylumStatsRequestDto) {
      return this.statisticsService.getAsylumTotal(body);
   }

   @Post('asylum/applications')
   getAsylumApplications(@Body() body: AsylumStatsRequestDto) {
      return this.statisticsService.getAsylumApplications(body);
   }

   @Post('asylum/decisions')
   getAsylumDecisions(@Body() body: AsylumStatsRequestDto) {
      return this.statisticsService.getAsylumDecisions(body);
   }

   @Post('asylum/years')
   getAsylumYears() {
      return this.statisticsService.getAsylumYears();
   }

   @Post('sahmanahatum/upload')
   uploadBorderCrossFile(@Body() body: Record<string, unknown>) {
      return this.statisticsService.uploadBorderCrossFile(body);
   }

   @Post('sahmanahatum/total')
   getBorderCrossTotal(@Body() body: BorderCrossStatsRequestDto) {
      return this.statisticsService.getBorderCrossTotal(body);
   }

   @Post('sahmanahatum/countries')
   getBorderCrossCountries(@Body() body: BorderCrossStatsRequestDto) {
      return this.statisticsService.getBorderCrossCountries(body);
   }

   @Post('sahmanahatum/periods')
   getBorderCrossPeriods(@Body() body: BorderCrossStatsRequestDto) {
      return this.statisticsService.getBorderCrossPeriods(body);
   }

   @Post('wp/simple')
   getSimpleWPStatistics(@Body() body: WpSimpleStatsRequestDto) {
      return this.statisticsService.getSimpleWPStatistics(body);
   }

   @Post('export/excel')
   exportExcel(@Body() body: ExportStatsRequestDto) {
      return this.statisticsService.exportExcel(body);
   }

   @Post('export/pdf')
   exportPdf(@Body() body: ExportStatsRequestDto) {
      return this.statisticsService.exportPdf(body);
   }

   @Get('periods/:statisticsType')
   getStatisticsPeriodsData(@Param() params: StatisticsTypeParamDto) {
      return this.statisticsService.getStatisticsPeriodsData(params.statisticsType);
   }
}
