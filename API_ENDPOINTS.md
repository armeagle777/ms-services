# API Endpoints Documentation

This document describes all available API endpoints, their methods, parameters, and authentication requirements.

**Base URL:** `http://localhost:3000/api`

## Authentication

Some endpoints require authentication via:

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

## Interpol

**Requires Basic Auth**

### Search

```
POST /interpol/search
```

**Body:**

```json
{
  "name": "string",
  "forename": "string",
  "ageMin": number,
  "ageMax": number,
  "dateOfBirth": "string",
  "identity": "string",
  "entityId": "string",
  "dob": "string",
  "nb": number,
  "nbRecord": number
}
```

---

### SLTD Search

```
POST /interpol/sltd/search
```

**Body:**

```json
{
  "din": "string",
  "countryOfRegistration": "string",
  "typeOfDocument": "string",
  "nb": number
}
```

---

### SLTD Details

```
POST /interpol/sltd/details
```

**Body:**

```json
{
   "id": "string"
}
```

---

### Get Details

```
GET /interpol/details?item_id=string
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item_id` | string | Yes | Item ID |

---

### Download Notice

```
GET /interpol/download/notice?path=string
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | File path |

---

### Download Image

```
GET /interpol/download/image?item_id=string&path=string
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item_id` | string | Yes | Item ID |
| `path` | string | Yes | File path |

---

## Kadastr

### Get Properties By SSN

```
GET /kadastr/:ssn/person
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ssn` | string | Yes | Social Security Number |

---

### Get Property By Certificate

```
GET /kadastr/:certificateNumber/document?searchBase=string
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `certificateNumber` | string | Yes | Certificate number |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `searchBase` | string | No | Search base |

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

## AdminJS (RBAC Management)

Admin panel for managing API clients and permissions.

- **URL:** `http://localhost:3000/admin`
- **Default credentials:** `admin@example.com` / `admin123`

See [README.md](./README.md) for more details.
