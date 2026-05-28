# API Endpoints Documentation

This document describes all available API endpoints, their methods, parameters, and authentication requirements.

**Base URL:** `http://localhost:3000/api`

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

---

### Get Person Obligations

```
GET /revenue-committee/person/:ssn/obligations
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

---

### Get Employment Contracts

```
GET /revenue-committee/employment-contracts/:ssn
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

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

The endpoint sends the EJBCA `revokeUser` request and returns the upstream SOAP response.

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
