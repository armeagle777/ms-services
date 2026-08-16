import {
   Body,
   Controller,
   Delete,
   Get,
   Patch,
   Post,
   Query,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';

import { InterpolService } from 'src/Core/Interpol/Interpol.service';
import { WisdmService } from 'src/Core/Wisdm/Wisdm.service';
import {
   InterpolDetailsQueryDto,
   InterpolDownloadImageQueryDto,
   InterpolDownloadNoticeQueryDto,
   InterpolSearchRequestDto,
   InterpolSltdDetailsRequestDto,
   InterpolSltdSearchRequestDto,
} from 'src/API/DTO/Interpol/interpol.dto';
import {
   WisdmActivityQueryDto,
   WisdmBulkCreateDto,
   WisdmClearRecordsDto,
   WisdmCountQueryDto,
   WisdmCreateRecordDto,
   WisdmExtendRetentionDto,
   WisdmExpiryAlertsQueryDto,
   WisdmFinalizeInitDto,
   WisdmInfosDocumentedSchemaQueryDto,
   WisdmInfosSchemaByKeyQueryDto,
   WisdmInitializeDto,
   WisdmRecordQueryDto,
   WisdmReferenceTableQueryDto,
   WisdmUpdateRecordDto,
} from 'src/API/DTO/Interpol/wisdm.dto';
import { BasicAuthGuard } from 'src/API/Guards/BasicAuth.guard';
import { ProtectedRequestLoggingInterceptor } from 'src/API/Interceptors/ProtectedRequestLogging.interceptor';

@Controller('interpol')
@UseGuards(BasicAuthGuard)
@UseInterceptors(ProtectedRequestLoggingInterceptor)
export class InterpolController {
   constructor(
      private readonly interpolService: InterpolService,
      private readonly wisdmService: WisdmService,
   ) {}

   @Post('search')
   search(@Body() body: InterpolSearchRequestDto) {
      return this.interpolService.search(body);
   }

   @Post('sltd/search')
   sltdSearch(@Body() body: InterpolSltdSearchRequestDto) {
      return this.interpolService.sltdSearch(body);
   }

   @Post('sltd/details')
   sltdDetails(@Body() body: InterpolSltdDetailsRequestDto) {
      return this.interpolService.sltdDetails(body.id);
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

   /** §3.1.1 — insert a stolen, lost or revoked travel document, or a stolen administrative document. */
   @Post('wisdm/records')
   wisdmCreateRecord(@Body() body: WisdmCreateRecordDto) {
      return this.wisdmService.createRecord(body);
   }

   /** §3.1.2 — update the non-identifying fields of one of our own records. */
   @Patch('wisdm/records')
   wisdmUpdateRecord(@Body() body: WisdmUpdateRecordDto) {
      return this.wisdmService.updateRecord(body);
   }

   /** §3.1.2 — extend only the retention date of a record, with a reason for extension. */
   @Patch('wisdm/records/retention')
   wisdmExtendRetention(@Body() body: WisdmExtendRetentionDto) {
      return this.wisdmService.extendRetention(body);
   }

   /** §3.1.3 — delete one of our own records. */
   @Delete('wisdm/records')
   wisdmDeleteRecord(@Query() query: WisdmRecordQueryDto) {
      return this.wisdmService.deleteRecord(query);
   }

   /** §3.2.1 — retrieve the full properties of one of our own records. */
   @Get('wisdm/records')
   wisdmGetRecord(@Query() query: WisdmRecordQueryDto) {
      return this.wisdmService.getDocument(query);
   }

   /** §3.2 — remove all records owned by the authenticated country. */
   @Post('wisdm/records/clear')
   wisdmClearRecords(@Body() body: WisdmClearRecordsDto) {
      return this.wisdmService.clearAllRecords(body.confirm);
   }

   /** §3.2.2 — total number of our records for a given document type. */
   @Get('wisdm/statistics/count')
   wisdmGetCount(@Query() query: WisdmCountQueryDto) {
      return this.wisdmService.getDocumentCount(query);
   }

   /** §3.2.3 — monthly insert/update/delete/retention activity per document type. */
   @Get('wisdm/statistics/activity')
   wisdmGetActivity(@Query() query: WisdmActivityQueryDto) {
      return this.wisdmService.getActivity(query);
   }

   /** §5.3.1 — pull an INTERPOL reference table to refresh our local copy. */
   @Get('wisdm/reference-tables')
   wisdmGetReferenceTable(@Query() query: WisdmReferenceTableQueryDto) {
      return this.wisdmService.getReferenceTable(query);
   }

   /** §3.2.5 / §7.9 — retrieve expiry alerts for a WISDM Actions movement. */
   @Get('wisdm/alerts/expiring')
   wisdmGetExpiryAlerts(@Query() query: WisdmExpiryAlertsQueryDto) {
      return this.wisdmService.getExpiryAlerts(query);
   }

   /** Exact Infos `ListOfSchema` operation from the supplied WSDL. */
   @Get('wisdm/infos/schemas')
   wisdmListInfosSchemas() {
      return this.wisdmService.listInfosSchemas();
   }

   /** Exact Infos `GetSLTD*Schema` operations from the supplied WSDL. */
   @Get('wisdm/infos/schemas/documented')
   wisdmGetInfosDocumentedSchema(@Query() query: WisdmInfosDocumentedSchemaQueryDto) {
      return this.wisdmService.getInfosDocumentedSchema(query);
   }

   /** Exact Infos `GetSchema`, `GetSchema2`, and `GetHtmlSchema` operations. */
   @Get('wisdm/infos/schemas/by-key')
   wisdmGetInfosSchemaByKey(@Query() query: WisdmInfosSchemaByKeyQueryDto) {
      return this.wisdmService.getInfosSchemaByKey(query);
   }

   /** Bulk insert, for a first data load or for re-loading during initialization. */
   @Post('wisdm/records/bulk')
   wisdmBulkCreate(@Body() body: WisdmBulkCreateDto) {
      return this.wisdmService.bulkCreate(body);
   }

   /**
    * §3.2.4 — re-initialize all national records: InitAllRecords → bulk insert → (optional)
    * FinalizeInit. Destructive: anything not re-inserted is removed once finalized.
    */
   @Post('wisdm/initialization')
   wisdmInitialize(@Body() body: WisdmInitializeDto) {
      return this.wisdmService.initializeRecords(body);
   }

   /** §3.2.4 — commit a re-initialization that was started earlier. */
   @Post('wisdm/initialization/finalize')
   wisdmFinalizeInit(@Body() body: WisdmFinalizeInitDto) {
      return this.wisdmService.finalizeInit(body.confirm);
   }
}
