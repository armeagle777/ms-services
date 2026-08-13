# API Endpoints Documentation

This document describes all available API endpoints, their methods, parameters, and authentication requirements.

**Base URL:** `http://localhost:3000/api`

## OpenAPI Documentation

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## Authentication

All endpoints require authentication via:

- **Basic Auth**: HTTP Basic Authentication header
- **Permission-based Auth**: Requires specific permissions assigned via AdminJS

---

## Revenue Committee

### Get Company Obligations

```
GET /revenue-committee/company/:tin/obligations
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tin` | string | Yes | Tax Identification Number |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Start date (YYYY-MM-DD) |
| `endDate` | string | No | End date (YYYY-MM-DD) |

**Response:**

```ts
{
   taxInfo?: {
      taxTypeList?: Array<{
         fine?: string;
         name?: string;
         penalty?: string;
         liabilityAmount?: string;
      }>;
      responseDate?: string;
      totalBalance?: string;
      singleAccountBalance?: string;
   };
   declInfo?: {
      vatTaxDeclInfo?: string;
      profitTaxDeclInfo?: {
         profitWithDecreases?: string;
         profitForReportingPeriod?: string;
         profitCalculatedPrepayment?: string;
         profitTaxEntrepreneurNotar?: string;
      };
      turnoverTaxDeclInfo?: string;
      totalTurnoverActivitiesDeclInfo?: string;
   };
   taxPayerInfo?: {
      tin?: string;
      taxpayerName?: string;
   };
   responseStatus?: {
      statusCode?: number;
      statusText?: string;
   };
   singleAccountPayments?: {
      amount?: string;
      toDate?: string;
      fromDate?: string;
   };
}
```

---

### Get Person Obligations

```
GET /revenue-committee/person/:ssn/obligations
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

**Response:**

```ts
{
   Date?: string;
   TIN?: number;
   PSN?: number;
   Taxpayer?: string;
   BirthDate?: string;
   Result?: string;
   JurLocation?: {
      Region?: string;
      Community?: string;
      Location?: string;
      Street?: string;
      Building?: number;
      Apartment?: number;
   };
   InFactLocation?: {
      Region?: string;
      Community?: string;
      Location?: string;
      Street?: string;
      Building?: number;
      Apartment?: number;
   };
   TaxDebts?: {
      VAT?: TaxDebt;
      TurnoverTax?: TaxDebt;
      SocialFee?: TaxDebt;
      Patent?: TaxDebt;
      Other?: TaxDebt;
      TotalTaxes?: TaxDebt;
   };
}

type TaxDebt = {
   Liability?: number;
   Fine?: number;
   Penalty?: number;
   Total?: number;
}
```

---

### Get Employment Contracts

```
GET /revenue-committee/employment-contracts/:ssn
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

**Response:**

```ts
{
   employment_contract?: {
      data?: {
         contracts?: Array<{
            term?: string;
            type?: string;
            number?: string;
            signer?: {
               name?: string;
               surname?: string;
               position?: string;
            };
            employee?: {
               ssn?: string;
               name?: string;
               email?: string;
               surname?: string;
               document?: string;
               patronymic?: string;
            };
            employer?: {
               tin?: string;
               name?: string;
               representative?: {
                  name?: string;
                  surname?: string;
                  position?: string;
               };
            };
            position?: string;
            work_start_date?: string;
            termination_order?: unknown | null;
            amendment_agreements?: unknown | null;
         }>;
      };
      errors?: unknown | null;
      message?: string;
      success?: boolean;
      response_id?: string;
   };
}
```

---

### Get Obligation Period Data By SSN

```
POST /revenue-committee/obligations/ssn
```

**Body:**

```json
{
   "ssn": "string",
   "start_date": "YYYY-MM-DD",
   "end_date": "YYYY-MM-DD"
}
```

**Validation:**

- `ssn` is required and must be a non-empty string.
- `start_date` and `end_date` are optional and must use `YYYY-MM-DD` format when provided.

**Response:**

```ts
{
   error?: {
      errorcode: string;
      errortext: string;
   };
   taxPayerInfo?: Array<{
      taxpayerid: string;
      taxpayerName?: string;
      legalTypeCode?: string;
      legalTypeName?: string;
      personInfoPeriods: {
         personInfoPeriod: Array<{
            date: string;
            personInfo: {
               incomeTax: number;
               workinghours: number;
               socialpayments: number;
               socialpaymentspaid: number;
               salaryEquivPayments: number;
               civilLowContractPayments: number;
            };
         }>;
      };
   }>;
}
```

The `taxPayerInfo` field is optional. An `error` in the response can represent an upstream business error rather than an HTTP failure.

---

### Get Active Employment Tax Info By SSN

```
POST /revenue-committee/tax-info/ssn
```

**Body:**

```json
{
   "ssn": "string",
   "start_date": "DD.MM.YYYY",
   "end_date": "DD.MM.YYYY"
}
```

**Validation:**

- `ssn` is required and must be a non-empty string.
- `start_date` and `end_date` are optional and must use `DD.MM.YYYY` format when provided.
- When omitted, `start_date` defaults to `01.01.1991` and `end_date` defaults to the current date.

**Response:**

```ts
{
   get_tax_info_response?: {
      PNum?: string;
      Full_Name?: string;
      Series_Number?: string;
      Document_Type_Name?: string;
      EmployerInfo?: Array<{
         TIN?: string;
         Address?: string;
         TP_NAME?: string;
         PositionInfo: Array<{
            Position?: string | null;
            Position_ID?: string;
            Position_End_Date?: null;
            Position_Start_Date: string;
            Civil_relations_EndDate?: string | null;
            Civil_relations_StartDate?: string | null;
         }>;
      }>;
   };
}
```

Only employers with active positions and only active `PositionInfo` entries are returned. Salary and income fields are removed from employer data.

---

### Get Tax Info By TIN

```
POST /revenue-committee/tax-info/tin
```

**Body:**

```json
{
   "tin": "string",
   "startDate": "YYYY-MM-DD",
   "endDate": "YYYY-MM-DD"
}
```

**Validation:**

- `tin` is required and must be a non-empty string.
- `startDate`, `endDate` are optional non-empty strings when provided.
- Dates should use `YYYY-MM-DD` format.
- When omitted or blank after trimming, `startDate` defaults to `1970-01-01`, and `endDate` default to the current date.

**Response:**

```ts
{
   get_ekeng_info_tin_response?: {
      taxInfo?: {
         taxTypeList?: Array<{
            fine?: string;
            name?: string;
            penalty?: string;
            liabilityAmount?: string;
            responseDate?: string;
         }>;
         totalBalance?: string;
         singleAccountBalance?: string;
      };
      declInfo?: {
         vatTaxDeclInfo?: string;
         profitTaxDeclInfo?: {
            profitWithDecreases?: string;
            profitForReportingPeriod?: string;
            profitCalculatedPrepayment?: string;
            profitTaxEntrepreneurNotar?: string;
         };
         turnoverTaxDeclInfo?: string;
         totalTurnoverActivitiesDeclInfo?: string;
      };
      taxPayerInfo?: {
         tin?: string;
         taxpayerName?: string;
      };
      responseStatus?: {
         error?: {
            errorcode?: string;
            errortext?: string;
         };
         statusCode?: number;
         statusText?: string;
      };
      singleAccountPayments?: {
         amount?: string;
         toDate?: string;
         fromDate?: string;
      };
   };
}
```

---

## Road Police

### Get Person Driving License and Vehicles

```
GET /road-police/driver-license-and-vehicles/:personId
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `personId` | string | Yes | Person ID |

---

### Search Vehicle By Params

```
POST /road-police/vehicles/search
```

**Body:**

```json
{
   "searchField": "string",
   "searchValue": "string"
}
```

---

## State Register

### Get Legal Entities By SSN

```
GET /state-register/legal-entities/:ssn
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

---

### Get Company By Tax ID

```
GET /state-register/companies/:taxId
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taxId` | string | Yes | Tax ID |

---

## Sekt

### Get Border Cross Data

```
POST /sekt/bordercross
```

**Body:**

```json
{
   "passportNumber": "string",
   "citizenship": "string"
}
```

---

### Get Extended Border Cross Data

```
POST /sekt/bordercross-extended
```

**Body:**

```json
{
   "passportNumber": "string",
   "citizenship": "string"
}
```

**Validation:**

`passportNumber` and `citizenship` are both required, non-empty strings.

**Response:**

```ts
{
   visaList?: Array<{
      visaNumber: number;
      visaType: string;
      code: string;
      allowedDays: number;
      validFrom: string;
      validTo: string;
      status: string;
   }>;
   crossingList?: Array<{
      direction: string;
      datetime: string;
      name: string;
      surname: string;
      birthDate: string;
      passport: string;
      status: string;
   }>;
   residencePermitList?: Array<{
      type: string;
      cardNumber: string;
      cardIssued: string;
      cardValid: string;
      status: string;
   }>;
   documentNumberList?: Array<{
      docNr: string;
      countryCode: string;
      country: string;
   }>;
   restrictedInfo?: 0 | 1;
}
```

If the upstream response status is not `ok`, an empty object (`{}`) is returned.

---

## Civil Acts Registration

### Get Civil Acts Info By SSN

```
POST /civil-acts-registration/documents/ssn/:ssn
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

**Body:**

```json
{
   "firstName": "string",
   "lastName": "string"
}
```

---

## Tax Service

### Get Tax By SSN

```
GET /tax-service/ssn/:ssn
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

---

## State Population Register

### Get Person By SSN

```
GET /state-population-register/:ssn
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

---

### Search Persons

```
POST /state-population-register/search
```

**Body:**

```json
{
   "firstName": "string",
   "lastName": "string",
   "patronomicName": "string",
   "birthDate": "string",
   "documentNumber": "string",
   "ssn": "string"
}
```

---

## Ministry of Justice

### Get Debtor Data

```
POST /ministry-of-justice/debtor-data
```

**Body:**

```json
{
   "psn": "string",
   "tax_id": "string"
}
```

---

## Migration Citizenship Service

### Get Communities

```
GET /migration-citizenship-service/options/communities
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | Region name |

---

### Get Residences

```
GET /migration-citizenship-service/options/residences
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | Region name |
| `community` | string | No | Community name |

---

### Get Streets

```
GET /migration-citizenship-service/options/streets
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | Region name |
| `community` | string | No | Community name |
| `residence` | string | No | Residence name |

---

### Search Persons

```
POST /migration-citizenship-service/persons/search
```

**Body:**

```json
{
  "addressType": "BIRTH | LIVING",
  "registrationType": "EVER | CURRENT",
  "firstName": "string",
  "lastName": "string",
  "patronomicName": "string",
  "birthDate": "string",
  "firstNameMatchType": "exact | partial",
  "lastNameMatchType": "exact | partial",
  "patronomicNameMatchType": "exact | partial",
  "region": "string",
  "community": "string",
  "residence": "string",
  "street": "string",
  "building": "string",
  "apartment": "string",
  "age": { "min": number, "max": number },
  "gender": "MALE | FEMALE"
}
```

---

## Cadastre

### Get Properties By SSN

```
GET /cadastre/properties-by-ssn/:ssn
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

---

### Get Property By Certificate

```
POST /cadastre/property-by-certificate
```

**Body:**

```json
{
   "certificateNumber": "string",
   "searchBase": "string"
}
```

---

## Investigative Committee

**Requires Basic Auth + Permission Guard**

### Search Wanted Persons

```
POST /investigative-committee/persons/search
```

**Body:**

```json
{
   "pnum": "string",
   "firstName": "string",
   "lastName": "string",
   "birthDate": "string"
}
```

---

### Search Varchakan Data

```
POST /investigative-committee/persons/varchakan
```

**Body (search by passport):**

```json
{
   "passport": "AM1234567"
}
```

**Body (search by personal data):**

```json
{
   "firstName": "string",
   "lastName": "string",
   "patronomicName": "string",
   "birthDate": "1990"
}
```

**Validation:**

- Provide either `passport`, or `firstName`, `lastName`, and `birthDate`.
- `patronomicName` is optional.
- `birthDate` must be a four-digit year.
- Every provided field must be a non-empty string.

The endpoint proxies the upstream police varchakan response.

---

## Ktak

### Get Student Information

```
POST /ktak/students
```

**Body:**

```json
{
   "pnum": "string"
}
```

**Validation:**

`pnum` is required and must be a non-empty string.

**Response:**

The endpoint returns the `get_student_info_response.data` array from Ktak. If no data is found, it returns an empty array.

```json
[
   {
      "exampleField": "exampleValue"
   }
]
```

---

## Artsakh

### Get Displacement Data

```
GET /artsakh/displacements/:pnum
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pnum` | string | Yes | Person number |

---

## ESign

### Create Profile

```
POST /esign/create-profile/ejbcaws
```

**Body:**

```json
{
   "userData": {
      "firstNameEng": "string",
      "lastNameEng": "string",
      "ssn": "string",
      "firstName": "string",
      "lastName": "string"
   },
   "isRaCitizen": true
}
```

**Validation:**

- `userData` is required and must be an object.
- `userData.firstNameEng` is required and must be a non-empty string.
- `userData.lastNameEng` is required and must be a non-empty string.
- `userData.ssn` is required and must be a non-empty string.
- `userData.firstName` is required and must be a non-empty string.
- `userData.lastName` is required and must be a non-empty string.
- `isRaCitizen` is optional and must be a boolean when provided.

The endpoint creates or updates the EJBCA user through `editUser` and returns the generated password together with the upstream SOAP response.

### Find Profile

```
GET /esign/find-profile/ejbcaws/:ssn
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social security number used as `findUser.matchvalue` |

**Validation:**

- `ssn` is required and must be a non-empty string.

The endpoint sends the EJBCA `findUser` request and returns the parsed SOAP response entries.

### Revoke Profile

```
POST /esign/revoke-profile/ejbcaws
```

**Body:**

```json
{
   "ssn": "string",
   "reasonCode": 0,
   "deleteUser": 1
}
```

**Validation:**

- `ssn` is required and must be a non-empty string.
- `reasonCode` is optional, must be a non-negative integer, and defaults to `0`.
- `deleteUser` is optional, must be `0` or `1`, and defaults to `1`.

The endpoint sends the EJBCA `revokeUser` request and returns the ups

---

## Interpol WISDM (SLTD/SAD data management)

Write side of INTERPOL SLTD: insert, update, delete and report on **Armenia's own**
records through the WISDM interface. Separate upstream service from the FIND/SLTD search
endpoints, with its own credentials (`INTERPOL_WISDM_*`).

Reference: *WISDM SLTD/SAD Functional description* v1.2 (17/08/2016); section numbers below
point at that document.

### Upstream configuration

The integration requires `INTERPOL_WISDM_SLTD_ENDPOINT`, `INTERPOL_WISDM_INFOS_ENDPOINT`,
`INTERPOL_WISDM_USERNAME`, `INTERPOL_WISDM_PASSWORD`, `INTERPOL_WISDM_SLTD_NAMESPACE` and
the WSDL-derived SLTD namespace. The Infos namespace is fixed by its supplied WSDL as
`http://tempuri.org/`; there is no `INTERPOL_WISDM_INFOS_NAMESPACE` setting.

`INTERPOL_WISDM_WS_USERINFO_USERNAME` defaults to the authentication username,
`INTERPOL_WISDM_WS_USERNAME_VERSION` defaults to `1.0`, and
`INTERPOL_WISDM_XML_PREFIX` defaults to `tns`. Each request receives a unique
`ReferenceInCountry` value (`ARM-<UUID>`), following the existing FIND integration. Country
of registration is not configured or sent: INTERPOL derives it from the authenticated
country account.

Do not commit issued WISDM passwords. The operation and XML element names must be checked
against the separate technical-services reference/WSDL before connecting to an INTERPOL
environment; the functional manual does not publish that wire contract.

The supplied Infos WSDL publishes schema-discovery operations, not a `Statistics` business
operation. The implementation sends its exact SOAP 1.1 actions and the WSDL-declared
`UsernameToken` header (without the SLTD-only `UserInformation` header):

```
GET /interpol/wisdm/infos/schemas
GET /interpol/wisdm/infos/schemas/documented?operation=GetSLTDStatisticsSchema&documentation=true
GET /interpol/wisdm/infos/schemas/by-key?key=<ListOfSchema-key>&format=xml
```

`operation` accepts `GetSLTDSearchSchema`, `GetSLTDSearchResultSchema`,
`GetSLTDRecordSchema`, `GetSLTDReviewDateSchema`, `GetSLTDStatisticsSchema`, or
`GetSLTDActionsSchema`. `format` accepts `xml`, `xml2`, or `html`.

Record, statistics, activity, reference-table, initialization, and expiry business calls
are sent to `INTERPOL_WISDM_SLTD_ENDPOINT`. They are not sent to `infos.asmx`, whose WSDL
does not declare those actions. The application rejects an SLTD endpoint ending in
`infos.asmx` so this configuration mistake fails locally instead of reaching INTERPOL as an
unrecognized `SOAPAction` fault.

### Shared conventions

| Field | Format |
|-------|--------|
| `din` | Document Identification Number. 5–25 characters `[A-Za-z0-9]` after cleaning (upper-cased, non-alphanumeric stripped). |
| `typeOfDocument` | Code from the `IPSGT_Document_Type` reference table, e.g. `PAS`. |
| `fraudType` | Exact code from the current `IPSGT_Theft_Type` reference table. |
| `countryOfTheft` | 2–3 letter ICPO country code, e.g. `ARM`. |
| dates | `YYYYMMDD`. |
| periods | `YYYYMM`. |

Every response carries `ok`, `httpStatus`, `resultCode`, `resultCodeMeta` and
`functionalError` (the §3.1.1 error catalogue, or `null`).

### Record management

```
POST   /interpol/wisdm/records              §3.1.1  Create a record
PATCH  /interpol/wisdm/records              §3.1.2  Update a record
PATCH  /interpol/wisdm/records/retention    §3.1.2  Extend the retention date
DELETE /interpol/wisdm/records              §3.1.3  Delete a record
GET    /interpol/wisdm/records              §3.2.1  Read a record's properties
```

**Create body:** `din`, `typeOfDocument` and `fraudType` are required. INTERPOL requires
`countryOfTheft` unless the supplied reference-table code means stolen blank. Optional fields are
`stolenBatchIdentifier` (stolen blank only), `dateOfTheft`, `documentIssuanceDate`,
`documentExpiryDate`, `nationalReferenceNumber`, `ncbReferenceNumber`,
`additionalInformation` and `recordRetentionDate`.

**Update body:** same shape minus `fraudType` (not updatable). At least one updatable field
must be present; changing `recordRetentionDate` also requires `extensionReason`.

**Delete / read query:** `din`, `typeOfDocument`.

### Statistics and reference data

```
GET    /interpol/wisdm/statistics/count      §3.2.2  Total records for a document type
GET    /interpol/wisdm/statistics/activity   §3.2.3  Monthly ADD/UPD/DEL/ERD counters
GET    /interpol/wisdm/reference-tables      §5.3.1  Pull an IPSGT_* reference table
GET    /interpol/wisdm/alerts/expiring       §3.2.5  Records in the six-month alert window
```

`activity` accepts `typeOfDocument`, `from`, `to` (`YYYYMM`). `reference-tables` accepts
`table` (`IPSGT_Document_Type` \| `IPSGT_Theft_Type` \| `IPSGT_ICPO_Countries` \|
`IPSGT_Extension_Reason`). `alerts/expiring` uses INTERPOL's fixed six-month window.
Statistics are recomputed once a day upstream.

### Bulk load and initialization (§3.2.4)

```
POST   /interpol/wisdm/records/bulk          Bulk insert (sequential, per-record failures)
POST   /interpol/wisdm/initialization        InitAllRecords → bulk insert → (optional) FinalizeInit
POST   /interpol/wisdm/initialization/finalize  Commit a re-initialization started earlier
```

> **Destructive.** `InitAllRecords` marks every national record for removal; anything not
> re-inserted is deleted once finalized. Previous records stay searchable until finalize,
> so an aborted run is recoverable. `confirm: true` is mandatory, `finalize` defaults to
> `false`, and finalize is skipped automatically if any record fails to insert.

### Validation

Field-level rules (DIN length, real calendar dates, past/future constraints, expiry after
issuance, free-text lengths) are enforced by `class-validator` and return `400` before any
SOAP call. Rules needing INTERPOL state (authorized reference values, duplicate DIN) are
enforced upstream and surface as `functionalError`.

---

## Common HTTP Errors

- `400 Bad Request`: Request body validation failed, usually because a required field is missing or a date format is invalid.
- `401 Unauthorized`: Basic Auth credentials are missing or invalid.
- `500 Internal Server Error`: An upstream service request or backend configuration failed.

---

## AdminJS (RBAC Management)

Admin panel for managing API clients and permissions.

- **URL:** `http://localhost:3000/admin`
- **Default credentials:** `admin@example.com` / `admin123`

See [README.md](./README.md) for more details.
