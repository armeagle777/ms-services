import { Transform, Type } from 'class-transformer';
import {
   ArrayMaxSize,
   ArrayMinSize,
   IsArray,
   IsBoolean,
   IsEnum,
   IsInt,
   IsNotEmpty,
   IsOptional,
   IsString,
   Max,
   MaxLength,
   Min,
   ValidateNested,
} from 'class-validator';

import {
   WISDM_ADDITIONAL_INFORMATION_MAX_LENGTH,
   WISDM_BULK_MAX_RECORDS,
   WISDM_DOCUMENT_TYPE_MAX_LENGTH,
   WISDM_NATIONAL_REFERENCE_MAX_LENGTH,
   WISDM_NCB_REFERENCE_MAX_LENGTH,
   WISDM_STOLEN_BATCH_IDENTIFIER_MAX_LENGTH,
} from 'src/Core/Wisdm/Constants/wisdm.rules.constants';
import {
   WisdmDocumentClass,
   WisdmExtensionReason,
   WisdmFraudType,
   WisdmReferenceTable,
} from 'src/Core/Wisdm/Enums/wisdm.enums';
import {
   IsAfterWisdmDate,
   IsFutureWisdmDate,
   IsIcpoCountryCode,
   IsNotBeforeWisdmDate,
   IsPastWisdmDate,
   IsWisdmDate,
   IsWisdmDin,
   IsWisdmMonth,
} from 'src/API/Validators/Wisdm';

/**
 * Request DTOs for the WISDM SLTD/SAD data-management endpoints.
 *
 * Validation strategy: every rule that can be checked without calling INTERPOL is checked
 * here by `class-validator` and enforced by the global `ValidationPipe` (see `main.ts`),
 * so obviously-invalid payloads never reach Lyon. Rules that need INTERPOL's reference
 * tables or database state (is this document type authorized? is this DIN already
 * recorded?) are left to the upstream service and surfaced as `functionalError`.
 *
 * JSDoc on these properties is picked up by `@nestjs/swagger` (`introspectComments: true`).
 */

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const upper = () =>
   Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value));

/** Identifies a single record: cleaned DIN plus the type of document (§3.1.3). */
export class WisdmRecordIdentifierDto {
   /**
    * Document Identification Number as it appears on the document.
    * Cleaned before sending: upper-cased, non-alphanumeric characters removed.
    */
   @IsString()
   @IsNotEmpty()
   @IsWisdmDin()
   @upper()
   din!: string;

   /** Type of document code from the `IPSGT_Document_Type` reference table (e.g. `PAS`). */
   @IsString()
   @IsNotEmpty()
   @MaxLength(WISDM_DOCUMENT_TYPE_MAX_LENGTH)
   @upper()
   typeOfDocument!: string;
}

/**
 * Fields common to record creation and update. Mandatory-ness differs between the two
 * (§3.1.1 vs §3.1.2), so the concrete DTOs below re-declare the fields that change.
 */
class WisdmRecordBaseDto extends WisdmRecordIdentifierDto {
   /**
    * Class of the record, when known. Supplying it lets us verify the retention date
    * against the 5/30/10 rule locally; omit it and INTERPOL's own rules apply.
    */
   @IsOptional()
   @IsEnum(WisdmDocumentClass)
   documentClass?: WisdmDocumentClass;

   /**
    * National identifier of the lot of stolen documents.
    * Accepted only when `fraudType` is `STOLEN_BLANK`.
    */
   @IsOptional()
   @IsString()
   @MaxLength(WISDM_STOLEN_BATCH_IDENTIFIER_MAX_LENGTH)
   @trim()
   stolenBatchIdentifier?: string;

   /** Date the document was reported stolen, lost or revoked. `YYYYMMDD`, in the past. */
   @IsOptional()
   @IsString()
   @IsWisdmDate()
   @IsPastWisdmDate()
   @IsNotBeforeWisdmDate('documentIssuanceDate')
   @trim()
   dateOfTheft?: string;

   /** Issuance date of the document. `YYYYMMDD`, in the past. */
   @IsOptional()
   @IsString()
   @IsWisdmDate()
   @IsPastWisdmDate()
   @trim()
   documentIssuanceDate?: string;

   /** Expiry date of the document. `YYYYMMDD`, after the issuance date. Omit if it never expires. */
   @IsOptional()
   @IsString()
   @IsWisdmDate()
   @IsAfterWisdmDate('documentIssuanceDate')
   @trim()
   documentExpiryDate?: string;

   /** Reference number of the police case. Free text, not transliterated. */
   @IsOptional()
   @IsString()
   @MaxLength(WISDM_NATIONAL_REFERENCE_MAX_LENGTH)
   @trim()
   nationalReferenceNumber?: string;

   /** Reference number of the operation at NCB level. Free text, not transliterated. */
   @IsOptional()
   @IsString()
   @MaxLength(WISDM_NCB_REFERENCE_MAX_LENGTH)
   @trim()
   ncbReferenceNumber?: string;

   /**
    * Circumstances of the theft or loss.
    * Do NOT put personal data here — INTERPOL SLTD holds no personal information.
    */
   @IsOptional()
   @IsString()
   @MaxLength(WISDM_ADDITIONAL_INFORMATION_MAX_LENGTH)
   @trim()
   additionalInformation?: string;

   /**
    * Date the record is automatically deleted. `YYYYMMDD`, must be in the future and
    * within the initial retention period. Omit to let INTERPOL apply the default.
    */
   @IsOptional()
   @IsString()
   @IsWisdmDate()
   @IsFutureWisdmDate()
   @trim()
   recordRetentionDate?: string;
}

/** §3.1.1 — create a new SLTD/SAD record. */
export class WisdmCreateRecordDto extends WisdmRecordBaseDto {
   /** Why the document is recorded: stolen, lost, stolen blank or revoked. Mandatory. */
   @IsEnum(WisdmFraudType)
   fraudType!: WisdmFraudType;

   /** ICPO code of the country where the document was lost or stolen. Mandatory. */
   @IsString()
   @IsNotEmpty()
   @IsIcpoCountryCode()
   @upper()
   countryOfTheft!: string;
}

/**
 * §3.1.2 — update an existing record.
 * `din` and `typeOfDocument` identify the record and are not updatable; `fraudType` is
 * not updatable either, so it is absent here by design.
 */
export class WisdmUpdateRecordDto extends WisdmRecordBaseDto {
   /** ICPO code of the country where the document was lost or stolen. */
   @IsOptional()
   @IsString()
   @IsIcpoCountryCode()
   @upper()
   countryOfTheft?: string;

   /** Required when `recordRetentionDate` is being extended. */
   @IsOptional()
   @IsEnum(WisdmExtensionReason)
   extensionReason?: WisdmExtensionReason;
}

/** §3.1.2 (administrative part) — extend only the retention date of a record. */
export class WisdmExtendRetentionDto extends WisdmRecordIdentifierDto {
   /** New retention date. `YYYYMMDD`, must be in the future. */
   @IsString()
   @IsNotEmpty()
   @IsWisdmDate()
   @IsFutureWisdmDate()
   @trim()
   recordRetentionDate!: string;

   /** Reason from `IPSGT_Extension_Reason`. Currently a single allowed value. */
   @IsEnum(WisdmExtensionReason)
   extensionReason!: WisdmExtensionReason;

   /** Class of the record, when known — enables the local retention-period check. */
   @IsOptional()
   @IsEnum(WisdmDocumentClass)
   documentClass?: WisdmDocumentClass;

   /** Type of fraud, when known — a stolen blank document may be retained for 30 years. */
   @IsOptional()
   @IsEnum(WisdmFraudType)
   fraudType?: WisdmFraudType;
}

/** §3.1.3 / §3.2.1 — delete a record, or read its properties. */
export class WisdmRecordQueryDto extends WisdmRecordIdentifierDto {}

/** §3.2.2 — total number of existing documents for one document type. */
export class WisdmCountQueryDto {
   /** Type of document code from `IPSGT_Document_Type`. */
   @IsString()
   @IsNotEmpty()
   @MaxLength(WISDM_DOCUMENT_TYPE_MAX_LENGTH)
   @upper()
   typeOfDocument!: string;
}

/** §3.2.3 — monthly insert/update/delete/retention activity. */
export class WisdmActivityQueryDto {
   /** Restrict to one document type. Omit for every type the country records. */
   @IsOptional()
   @IsString()
   @MaxLength(WISDM_DOCUMENT_TYPE_MAX_LENGTH)
   @upper()
   typeOfDocument?: string;

   /** First month of the reporting window, `YYYYMM`. */
   @IsOptional()
   @IsString()
   @IsWisdmMonth()
   @trim()
   from?: string;

   /** Last month of the reporting window, `YYYYMM`. */
   @IsOptional()
   @IsString()
   @IsWisdmMonth()
   @trim()
   to?: string;
}

/** §3.2.5 — records due to expire, and records already removed for expiry. */
export class WisdmExpiryAlertsQueryDto {
   /**
    * Size of the look-ahead window in months. Defaults to 6, the period INTERPOL's
    * periodic assessment of data (PAD) process is built around.
    */
   @IsOptional()
   @IsInt()
   @Min(1)
   @Max(24)
   @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
   monthsAhead?: number;

   /** Restrict to one document type. */
   @IsOptional()
   @IsString()
   @MaxLength(WISDM_DOCUMENT_TYPE_MAX_LENGTH)
   @upper()
   typeOfDocument?: string;
}

/** §5.3.1 — pull one of the INTERPOL reference tables. */
export class WisdmReferenceTableQueryDto {
   /** Which reference table to fetch. */
   @IsEnum(WisdmReferenceTable)
   table!: WisdmReferenceTable;
}

/** Bulk insert used on its own or as the middle step of the initialization sequence. */
export class WisdmBulkCreateDto {
   /** Records to insert. Processed sequentially; failures are reported per record. */
   @IsArray()
   @ArrayMinSize(1)
   @ArrayMaxSize(WISDM_BULK_MAX_RECORDS)
   @ValidateNested({ each: true })
   @Type(() => WisdmCreateRecordDto)
   records!: WisdmCreateRecordDto[];

   /**
    * Stop at the first failing record instead of inserting everything that is valid.
    * Defaults to `false`.
    */
   @IsOptional()
   @IsBoolean()
   @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
   stopOnError?: boolean;
}

/**
 * §3.2.4 — full re-initialization of the national records.
 *
 * DESTRUCTIVE. `InitAllRecords` marks every national record for removal; anything not
 * re-inserted before `FinalizeInit` is deleted from INTERPOL SLTD. The previous records
 * stay searchable until finalize, so an aborted run is recoverable — which is why
 * `confirm` is mandatory and `finalize` defaults to `false`.
 */
export class WisdmInitializeDto extends WisdmBulkCreateDto {
   /** Must be `true`. A deliberate speed bump in front of a destructive operation. */
   @IsBoolean()
   confirm!: boolean;

   /**
    * Call `FinalizeInit` after the bulk insert. Leave `false` to review the outcome first
    * and finalize explicitly through the dedicated endpoint.
    */
   @IsOptional()
   @IsBoolean()
   @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
   finalize?: boolean;
}

/** Explicit confirmation for the standalone finalize step. */
export class WisdmFinalizeInitDto {
   /** Must be `true`; finalizing permanently removes records that were not re-inserted. */
   @IsBoolean()
   confirm!: boolean;
}
