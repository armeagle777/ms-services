import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import {
   WisdmActivityQueryDto,
   WisdmBulkCreateDto,
   WisdmCountQueryDto,
   WisdmCreateRecordDto,
   WisdmExpiryAlertsQueryDto,
   WisdmExtendRetentionDto,
   WisdmInitializeDto,
   WisdmRecordQueryDto,
   WisdmReferenceTableQueryDto,
   WisdmUpdateRecordDto,
} from 'src/API/DTO/Interpol/wisdm.dto';
import { WISDM_EXPIRY_ALERT_WINDOW_MONTHS } from 'src/Core/Wisdm/Constants/wisdm.rules.constants';
import { WisdmFraudType } from 'src/Core/Wisdm/Enums/wisdm.enums';
import {
   cleanDin,
   compareWisdmDates,
   normalizeCountryCode,
   normalizeOptional,
   resolveMaxRetentionDate,
} from 'src/Core/Wisdm/Helpers/wisdm.helpers';
import { WisdmIntegration } from 'src/Infrustructure/Services/WisdmIntegration/Wisdm.integration';
import type {
   WisdmActivityResponse,
   WisdmCountResponse,
   WisdmDocumentResponse,
   WisdmExpiryAlertsResponse,
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
      const params = this.toRecordParams(body, { fraudType: body.fraudType });
      this.assertStolenBatchIdentifierRule(params);
      this.assertRetentionWithinPeriod(params);

      return this.wisdmIntegration.createRecord(params);
   }

   /**
    * §3.1.2 — update an existing record.
    * DIN, type of document and type of fraud identify the record and cannot change; a
    * retention-date change must carry a reason for extension.
    */
   async updateRecord(body: WisdmUpdateRecordDto): Promise<WisdmMutationResponse> {
      const params = this.toRecordParams(body, { extensionReason: body.extensionReason });

      if (params.recordRetentionDate && !params.extensionReason) {
         throw new BadRequestException(
            'extensionReason is required when recordRetentionDate is changed.',
         );
      }

      this.assertStolenBatchIdentifierRule(params);
      this.assertRetentionWithinPeriod(params);
      this.assertHasUpdatableField(body);

      return this.wisdmIntegration.updateRecord(params);
   }

   /** §3.1.2 (administrative part) — extend only the retention date. */
   async extendRetention(body: WisdmExtendRetentionDto): Promise<WisdmMutationResponse> {
      const din = this.requireCleanDin(body.din);
      const typeOfDocument = this.requireTypeOfDocument(body.typeOfDocument);

      this.assertRetentionWithinPeriod({
         din,
         typeOfDocument,
         documentClass: body.documentClass,
         fraudType: body.fraudType,
         recordRetentionDate: body.recordRetentionDate,
      });

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
   async getExpiryAlerts(query: WisdmExpiryAlertsQueryDto): Promise<WisdmExpiryAlertsResponse> {
      return this.wisdmIntegration.getExpiryAlerts({
         monthsAhead: query.monthsAhead ?? WISDM_EXPIRY_ALERT_WINDOW_MONTHS,
         typeOfDocument: normalizeOptional(query.typeOfDocument),
      });
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
         const params = this.toRecordParams(record, { fraudType: record.fraudType });

         try {
            this.assertStolenBatchIdentifierRule(params);
            this.assertRetentionWithinPeriod(params);

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
      extras: Pick<WisdmRecordParams, 'fraudType' | 'extensionReason'>,
   ): WisdmRecordParams {
      const params: WisdmRecordParams = {
         din: this.requireCleanDin(body.din),
         typeOfDocument: this.requireTypeOfDocument(body.typeOfDocument),
         fraudType: extras.fraudType,
         documentClass: body.documentClass,
         stolenBatchIdentifier: normalizeOptional(body.stolenBatchIdentifier),
         countryOfTheft: normalizeCountryCode(
            (body as WisdmCreateRecordDto).countryOfTheft ??
               (body as WisdmUpdateRecordDto).countryOfTheft,
         ),
         dateOfTheft: normalizeOptional(body.dateOfTheft),
         documentIssuanceDate: normalizeOptional(body.documentIssuanceDate),
         documentExpiryDate: normalizeOptional(body.documentExpiryDate),
         nationalReferenceNumber: normalizeOptional(body.nationalReferenceNumber),
         ncbReferenceNumber: normalizeOptional(body.ncbReferenceNumber),
         additionalInformation: normalizeOptional(body.additionalInformation),
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

   /**
    * §3.1.1 — the stolen batch identifier is "the national identifier of the lot of stolen
    * documents" and is only meaningful for stolen blank documents. Sending it otherwise is
    * a documented functional error, so we stop it here.
    */
   private assertStolenBatchIdentifierRule(params: WisdmRecordParams): void {
      if (!params.stolenBatchIdentifier) return;

      // On update the fraud type is not resubmitted, so it may legitimately be unknown;
      // in that case only INTERPOL can decide and we let the request through.
      if (params.fraudType && params.fraudType !== WisdmFraudType.STOLEN_BLANK) {
         throw new BadRequestException(
            'stolenBatchIdentifier can only be provided when fraudType is STOLEN_BLANK.',
         );
      }
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

   /**
    * Rejects a retention date beyond the initial retention period (5 / 30 / 10 years)
    * before the request is sent. Only enforced when the caller supplied `documentClass`;
    * without it the period cannot be resolved locally and INTERPOL remains the authority.
    */
   private assertRetentionWithinPeriod(
      params: Pick<
         WisdmRecordParams,
         'recordRetentionDate' | 'documentClass' | 'fraudType' | 'din' | 'typeOfDocument'
      >,
   ): void {
      if (!params.recordRetentionDate) return;

      const maxDate = resolveMaxRetentionDate(params.documentClass, params.fraudType);
      if (!maxDate) return;

      const comparison = compareWisdmDates(params.recordRetentionDate, maxDate);
      if (comparison !== null && comparison > 0) {
         throw new BadRequestException(
            `recordRetentionDate ${params.recordRetentionDate} exceeds the retention period for this document; the latest allowed value is ${maxDate}.`,
         );
      }
   }

   /** An update with nothing to update is a wasted round trip to Lyon. */
   private assertHasUpdatableField(body: WisdmUpdateRecordDto): void {
      const updatable = [
         body.stolenBatchIdentifier,
         body.countryOfTheft,
         body.dateOfTheft,
         body.documentIssuanceDate,
         body.documentExpiryDate,
         body.nationalReferenceNumber,
         body.ncbReferenceNumber,
         body.additionalInformation,
         body.recordRetentionDate,
      ];

      if (updatable.every((value) => normalizeOptional(value) === undefined)) {
         throw new BadRequestException(
            'At least one updatable field must be provided: stolenBatchIdentifier, countryOfTheft, dateOfTheft, documentIssuanceDate, documentExpiryDate, nationalReferenceNumber, ncbReferenceNumber, additionalInformation or recordRetentionDate.',
         );
      }
   }
}
