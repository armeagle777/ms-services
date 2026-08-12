import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import {
   WisdmActivityQueryDto,
   WisdmBulkCreateDto,
   WisdmCountQueryDto,
   WisdmCreateRecordDto,
   WisdmExtendRetentionDto,
   WisdmInfosDocumentedSchemaQueryDto,
   WisdmInfosSchemaByKeyQueryDto,
   WisdmInitializeDto,
   WisdmRecordQueryDto,
   WisdmReferenceTableQueryDto,
   WisdmUpdateRecordDto,
} from 'src/API/DTO/Interpol/wisdm.dto';
import {
   cleanDin,
   compareWisdmDates,
   normalizeCountryCode,
   normalizeOptional,
   normalizeUpdatable,
} from 'src/Core/Wisdm/Helpers/wisdm.helpers';
import { WisdmInfosSchemaFormat } from 'src/Core/Wisdm/Enums/wisdm.enums';
import { WisdmIntegration } from 'src/Infrustructure/Services/WisdmIntegration/Wisdm.integration';
import type {
   WisdmActivityResponse,
   WisdmCountResponse,
   WisdmDocumentResponse,
   WisdmExpiryAlertsResponse,
   WisdmInfosSchemaResponse,
   WisdmInitializationResult,
   WisdmInitStepResponse,
   WisdmMutationResponse,
   WisdmRecordParams,
   WisdmReferenceTableResponse,
} from 'src/Infrustructure/Services/WisdmIntegration/Models/wisdm.types';

/**
 * Business rules for the WISDM SLTD/SAD data-management features.
 *
 * Field-level validation (formats, lengths, past/future dates) is already enforced by the
 * DTOs and the global `ValidationPipe`. What is left here is what a decorator cannot
 * express: cross-field rules, DIN cleaning, retention arithmetic, and the ordering and
 * safety of the multi-step initialization sequence.
 */
@Injectable()
export class WisdmService {
   private readonly logger = new Logger(WisdmService.name);

   constructor(private readonly wisdmIntegration: WisdmIntegration) {}

   /* ---------------------------------------------------------------------- */
   /*  §3.1 Document management                                              */
   /* ---------------------------------------------------------------------- */

   /** §3.1.1 — insert a new SLTD/SAD record. */
   async createRecord(body: WisdmCreateRecordDto): Promise<WisdmMutationResponse> {
      const params = this.toRecordParams(body, 'create', { fraudType: body.fraudType });

      return this.wisdmIntegration.createRecord(params);
   }

   /**
    * §3.1.2 — update an existing record.
    * DIN, type of document and type of fraud identify the record and cannot change; a
    * retention-date change must carry a reason for extension.
    */
   async updateRecord(body: WisdmUpdateRecordDto): Promise<WisdmMutationResponse> {
      const params = this.toRecordParams(body, 'update', {
         extensionReason: body.extensionReason,
      });

      if (params.recordRetentionDate && !params.extensionReason) {
         throw new BadRequestException(
            'extensionReason is required when recordRetentionDate is changed.',
         );
      }

      this.assertHasUpdatableField(body);

      return this.wisdmIntegration.updateRecord(params);
   }

   /** §3.1.2 (administrative part) — extend only the retention date. */
   async extendRetention(body: WisdmExtendRetentionDto): Promise<WisdmMutationResponse> {
      const din = this.requireCleanDin(body.din);
      const typeOfDocument = this.requireTypeOfDocument(body.typeOfDocument);

      return this.wisdmIntegration.extendRetention({
         din,
         typeOfDocument,
         recordRetentionDate: body.recordRetentionDate,
         extensionReason: body.extensionReason,
      });
   }

   /** §3.1.3 — delete one of the country's own records. */
   async deleteRecord(query: WisdmRecordQueryDto): Promise<WisdmMutationResponse> {
      return this.wisdmIntegration.deleteRecord({
         din: this.requireCleanDin(query.din),
         typeOfDocument: this.requireTypeOfDocument(query.typeOfDocument),
      });
   }

   /* ---------------------------------------------------------------------- */
   /*  §3.2 Data management                                                  */
   /* ---------------------------------------------------------------------- */

   /** §3.2.1 — read the full properties of a record. */
   async getDocument(query: WisdmRecordQueryDto): Promise<WisdmDocumentResponse> {
      return this.wisdmIntegration.getDocument({
         din: this.requireCleanDin(query.din),
         typeOfDocument: this.requireTypeOfDocument(query.typeOfDocument),
      });
   }

   /** §3.2.2 — total number of records for a document type. */
   async getDocumentCount(query: WisdmCountQueryDto): Promise<WisdmCountResponse> {
      return this.wisdmIntegration.getDocumentCount(
         this.requireTypeOfDocument(query.typeOfDocument),
      );
   }

   /** §3.2.3 — monthly data-management activity. */
   async getActivity(query: WisdmActivityQueryDto): Promise<WisdmActivityResponse> {
      const from = normalizeOptional(query.from);
      const to = normalizeOptional(query.to);

      if (from && to && from > to) {
         throw new BadRequestException('from cannot be later than to.');
      }

      return this.wisdmIntegration.getActivity({
         typeOfDocument: normalizeOptional(query.typeOfDocument),
         from,
         to,
      });
   }

   /** §5.3.1 — pull an INTERPOL reference table to refresh the local copy. */
   async getReferenceTable(
      query: WisdmReferenceTableQueryDto,
   ): Promise<WisdmReferenceTableResponse> {
      return this.wisdmIntegration.getReferenceTable(query.table);
   }

   /** §3.2.5 — records due to expire within the window, plus records already purged. */
   async getExpiryAlerts(): Promise<WisdmExpiryAlertsResponse> {
      return this.wisdmIntegration.getExpiryAlerts();
   }

   /** Exact `ListOfSchema` operation from the supplied Infos WSDL. */
   async listInfosSchemas(): Promise<WisdmInfosSchemaResponse> {
      return this.wisdmIntegration.listSchemas();
   }

   /** Exact documented `GetSLTD*Schema` operations from the supplied Infos WSDL. */
   async getInfosDocumentedSchema(
      query: WisdmInfosDocumentedSchemaQueryDto,
   ): Promise<WisdmInfosSchemaResponse> {
      return this.wisdmIntegration.getDocumentedSchema(
         query.operation,
         query.documentation ?? true,
      );
   }

   /** Exact `GetSchema`, `GetSchema2`, and `GetHtmlSchema` operations from Infos WSDL. */
   async getInfosSchemaByKey(
      query: WisdmInfosSchemaByKeyQueryDto,
   ): Promise<WisdmInfosSchemaResponse> {
      return this.wisdmIntegration.getSchemaByKey(
         normalizeOptional(query.key),
         query.format ?? WisdmInfosSchemaFormat.XML,
      );
   }

   /* ---------------------------------------------------------------------- */
   /*  Bulk insert and §3.2.4 initialization                                 */
   /* ---------------------------------------------------------------------- */

   /**
    * Inserts many records sequentially. Used on its own for a first data load and as the
    * middle step of {@link initializeRecords}.
    *
    * Sequential on purpose: WISDM is a single upstream endpoint shared by the whole NCB
    * and the manual gives no concurrency guarantees, so parallel inserts risk both rate
    * limiting and an unreadable failure report.
    */
   async bulkCreate(body: WisdmBulkCreateDto): Promise<WisdmInitializationResult['inserted']> {
      const failures: WisdmInitializationResult['inserted']['failures'] = [];
      let succeeded = 0;

      for (const record of body.records) {
         const params = this.toRecordParams(record, 'create', { fraudType: record.fraudType });

         try {
            const response = await this.wisdmIntegration.createRecord(params);

            if (response.ok) {
               succeeded += 1;
               continue;
            }

            failures.push({
               din: params.din,
               typeOfDocument: params.typeOfDocument,
               reason:
                  response.functionalError?.message ??
                  response.fault ??
                  response.resultCodeMeta.description,
            });
         } catch (err) {
            failures.push({
               din: params.din,
               typeOfDocument: params.typeOfDocument,
               reason: err instanceof Error ? err.message : String(err),
            });
         }

         if (failures.length > 0 && body.stopOnError) break;
      }

      return {
         total: body.records.length,
         succeeded,
         failed: failures.length,
         failures,
      };
   }

   /**
    * §3.2.4 — full re-initialization: `InitAllRecords` → bulk insert → `FinalizeInit`.
    *
    * Safety model, following the manual's note that "during the process the previous
    * documents are still searchable. Records not reinserted will be removed after the
    * FinalizeInit process":
    *  - `confirm` must be `true`;
    *  - if `InitAllRecords` fails, nothing else runs;
    *  - if any record fails to insert, finalize is skipped and the run is reported as
    *    aborted, leaving the previous data intact and searchable;
    *  - finalize only happens when explicitly requested via `finalize: true`.
    */
   async initializeRecords(body: WisdmInitializeDto): Promise<WisdmInitializationResult> {
      if (body.confirm !== true) {
         throw new BadRequestException(
            'confirm must be true: initialization deletes every national record that is not re-inserted.',
         );
      }

      const started = await this.wisdmIntegration.initAllRecords();
      if (!started.ok) {
         return {
            ok: false,
            started,
            inserted: { total: body.records.length, succeeded: 0, failed: 0, failures: [] },
            finalized: null,
            abortedReason:
               started.functionalError?.message ??
               started.fault ??
               'InitAllRecords was rejected by INTERPOL; no records were touched.',
         };
      }

      const inserted = await this.bulkCreate({
         records: body.records,
         stopOnError: body.stopOnError,
      });

      if (inserted.failed > 0) {
         this.logger.warn(
            `WISDM initialization: ${inserted.failed}/${inserted.total} records failed; skipping FinalizeInit so existing data stays searchable.`,
         );

         return {
            ok: false,
            started,
            inserted,
            finalized: null,
            abortedReason:
               'One or more records failed to insert. FinalizeInit was skipped; the previous records remain in INTERPOL SLTD. Fix the failures, re-run the insert, then finalize explicitly.',
         };
      }

      if (!body.finalize) {
         return {
            ok: true,
            started,
            inserted,
            finalized: null,
            abortedReason:
               'All records inserted. FinalizeInit was not requested — call the finalize endpoint to commit the re-initialization.',
         };
      }

      const finalized = await this.wisdmIntegration.finalizeInit();

      return {
         ok: finalized.ok,
         started,
         inserted,
         finalized,
         abortedReason: finalized.ok
            ? null
            : (finalized.functionalError?.message ??
              finalized.fault ??
              'FinalizeInit was rejected by INTERPOL.'),
      };
   }

   /** §3.2.4 step 3 — commit a re-initialization that was started earlier. */
   async finalizeInit(confirm: boolean): Promise<WisdmInitStepResponse> {
      if (confirm !== true) {
         throw new BadRequestException(
            'confirm must be true: finalizing permanently removes every record that was not re-inserted.',
         );
      }

      return this.wisdmIntegration.finalizeInit();
   }

   /* ---------------------------------------------------------------------- */
   /*  Normalization and cross-field rules                                   */
   /* ---------------------------------------------------------------------- */

   private toRecordParams(
      body: WisdmCreateRecordDto | WisdmUpdateRecordDto,
      mode: 'create' | 'update',
      extras: Partial<Pick<WisdmRecordParams, 'fraudType' | 'extensionReason'>>,
   ): WisdmRecordParams {
      const normalizeField = mode === 'update' ? normalizeUpdatable : normalizeOptional;
      const countryOfTheft =
         mode === 'update'
            ? normalizeUpdatable(body.countryOfTheft)?.toUpperCase()
            : normalizeCountryCode(body.countryOfTheft);

      const params: WisdmRecordParams = {
         din: this.requireCleanDin(body.din),
         typeOfDocument: this.requireTypeOfDocument(body.typeOfDocument),
         fraudType: extras.fraudType,
         stolenBatchIdentifier: normalizeField(body.stolenBatchIdentifier),
         countryOfTheft,
         dateOfTheft: normalizeField(body.dateOfTheft),
         documentIssuanceDate: normalizeField(body.documentIssuanceDate),
         documentExpiryDate: normalizeField(body.documentExpiryDate),
         nationalReferenceNumber: normalizeField(body.nationalReferenceNumber),
         ncbReferenceNumber: normalizeField(body.ncbReferenceNumber),
         additionalInformation: normalizeField(body.additionalInformation),
         recordRetentionDate: normalizeOptional(body.recordRetentionDate),
         extensionReason: extras.extensionReason,
      };

      this.assertDateOrdering(params);
      return params;
   }

   private requireCleanDin(value: string): string {
      const cleaned = cleanDin(value);
      if (!cleaned) {
         throw new BadRequestException('din is required.');
      }
      return cleaned;
   }

   private requireTypeOfDocument(value: string): string {
      const normalized = normalizeOptional(value)?.toUpperCase();
      if (!normalized) {
         throw new BadRequestException('typeOfDocument is required.');
      }
      return normalized;
   }

   /** Date consistency that spans fields; each date's own format is validated by the DTO. */
   private assertDateOrdering(params: WisdmRecordParams): void {
      const theftVsIssuance = compareWisdmDates(params.dateOfTheft, params.documentIssuanceDate);
      if (theftVsIssuance !== null && theftVsIssuance < 0) {
         throw new BadRequestException('dateOfTheft cannot be earlier than documentIssuanceDate.');
      }

      const expiryVsIssuance = compareWisdmDates(
         params.documentExpiryDate,
         params.documentIssuanceDate,
      );
      if (expiryVsIssuance !== null && expiryVsIssuance <= 0) {
         throw new BadRequestException('documentExpiryDate must be after documentIssuanceDate.');
      }
   }

   /** An update with no supplied updatable field is a wasted round trip to Lyon. */
   private assertHasUpdatableField(body: WisdmUpdateRecordDto): void {
      const updatable: Array<keyof WisdmUpdateRecordDto> = [
         'stolenBatchIdentifier',
         'countryOfTheft',
         'dateOfTheft',
         'documentIssuanceDate',
         'documentExpiryDate',
         'nationalReferenceNumber',
         'ncbReferenceNumber',
         'additionalInformation',
         'recordRetentionDate',
      ];

      if (updatable.every((field) => !Object.prototype.hasOwnProperty.call(body, field))) {
         throw new BadRequestException(
            'At least one updatable field must be provided: stolenBatchIdentifier, countryOfTheft, dateOfTheft, documentIssuanceDate, documentExpiryDate, nationalReferenceNumber, ncbReferenceNumber, additionalInformation or recordRetentionDate.',
         );
      }
   }
}
