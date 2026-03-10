# Frontend Integration Guide: InvestigativeCommitteeController and InterpolController

## Scope
This document describes how frontend applications should call:
- `InvestigativeCommitteeController`
- `InterpolController`

All routes are exposed under the global API prefix:
- Base prefix: `/api`

Example full route:
- `/api/interpol/search`

## Common Behavior
- Method/content type:
  - `POST` endpoints expect JSON body (`Content-Type: application/json`).
  - `GET` endpoints expect query params.
- Validation:
  - `InterpolController` applies explicit service-level validation and can return `400 Bad Request` for invalid/missing required fields.
  - `InvestigativeCommitteeController` validations are mostly in integration service logic.
- Authentication:
  - No controller-level auth guard is applied in these endpoints in current backend code.

---

## 1) InvestigativeCommitteeController
Controller base path:
- `/api/investigative-committee`

### 1.1 Search wanted persons
- Endpoint: `POST /api/investigative-committee/persons/search`
- Purpose: Search wanted persons by personal data or passport/SSN-like identifier (`pnum`).

### Request body
```json
{
  "pnum": "optional string",
  "firstName": "optional string",
  "lastName": "optional string",
  "birthDate": "optional string",
  "middleName": "optional string"
}
```

Notes:
- At least one of `pnum`, `firstName`, `lastName`, `birthDate` must be provided.
- If `pnum` is present and non-empty, backend ignores `firstName`, `lastName`, `birthDate`.
- `middleName` defaults internally to `"*"` when not provided and `pnum` is not provided.

### Validation errors
- `400 Bad Request` when all of `pnum`, `firstName`, `lastName`, `birthDate` are missing/empty.

### Success response
- Response shape is currently dynamic/opaque object from upstream IC service.
- Treat this as `Record<string, unknown>` and render defensively.

### Frontend recommendation
- Use a strict client-side form rule:
  - Either provide `pnum`, or provide at least one of `firstName`, `lastName`, `birthDate`.
- Keep UI tolerant of unknown response fields (feature-detect instead of hard mapping).

---

## 2) InterpolController
Controller base path:
- `/api/interpol`

## Shared Interpol response envelope
Most Interpol endpoints return a common envelope:

```json
{
  "ok": true,
  "httpStatus": 200,
  "fault": null,
  "resultCode": "0",
  "resultOtherCode": null,
  "resultCodeMeta": {
    "key": "NO_ERROR",
    "numericValue": 0,
    "description": "No error, request succeeded and result is not empty.",
    "retryable": false,
    "requiresQueryRefinement": false,
    "accessDenied": false,
    "isKnown": true
  }
}
```

Key frontend handling rule:
- Use both `ok` and `resultCodeMeta.key` for behavior.
- `ok: true` can still return no records (for example `NO_ANSWER`).

Known `resultCodeMeta.key` values:
- `NO_ERROR`
- `NO_ANSWER`
- `INVALID_SEARCH_ERROR`
- `UNEXPECTED_ERROR`
- `TOO_MANY_ANSWER`
- `ACCESS_DENIED`
- `OTHER_ERROR_CODE`
- `TIME_OUT`
- `UNKNOWN`

### 2.1 Nominal search
- Endpoint: `POST /api/interpol/search`

#### Request body
```json
{
  "name": "required string",
  "forename": "required string",
  "dob": "optional string in dd/mm/yyyy, example 15/03/1971",
  "nb": 10
}
```

Rules:
- `name` and `forename` are required, trimmed.
- `dob` is optional but must be valid `dd/mm/yyyy` if provided.
- `nb` defaults to `10`; min effective is `1`; max is `50` (values above 50 are clamped).

#### Success payload extension
```json
{
  "hits": [
    {
      "item_id": "string",
      "name": "string",
      "forename": "string",
      "dob": "string",
      "caution": "string",
      "score": "string",
      "owner_office_id": "string"
    }
  ]
}
```

#### Validation errors
- `400`: `name and forename are required`
- `400`: invalid `dob` format/value

---

### 2.2 SLTD search
- Endpoint: `POST /api/interpol/sltd/search`

#### Request body
```json
{
  "din": "required string",
  "countryOfRegistration": "required string",
  "typeOfDocument": "required string",
  "nb": 10
}
```

Rules:
- First 3 fields are required.
- `nb` handling is same as nominal search.

#### Success payload extension
```json
{
  "xmlData": "string"
}
```

`xmlData` is raw XML content (string), not parsed JSON.

#### Validation errors
- `400`: `din, countryOfRegistration and typeOfDocument are required`

---

### 2.3 SLTD details
- Endpoint: `POST /api/interpol/sltd/details`

#### Request body
```json
{
  "id": "required string"
}
```

#### Success payload extension
```json
{
  "xmlData": "string"
}
```

#### Validation errors
- `400`: `id is required`

---

### 2.4 Nominal details
- Endpoint: `GET /api/interpol/details?item_id=<value>`

#### Query params
- `item_id` (required string)

#### Success payload extension
```json
{
  "details": {
    "fields": {
      "item_id_short": "string",
      "name": "string",
      "forename": "string",
      "dob": "string",
      "sex_id": "string",
      "owner_office_id": "string",
      "db_last_updated_on": "string",
      "caution_id": "string"
    },
    "refs": [
      {
        "type_id": "string",
        "ref": "string",
        "language_id": "string"
      }
    ]
  }
}
```

`details` can be `null` when not successful.

#### Validation errors
- `400`: `item_id is required`

---

### 2.5 Download notice
- Endpoint: `GET /api/interpol/download/notice?path=<value>`
- Query param: `path` (required string)

#### Success payload extension
```json
{
  "files": [
    {
      "fileName": "string",
      "type": "string",
      "binData": "base64 string"
    }
  ]
}
```

Important:
- This endpoint returns JSON with base64 file data (`binData`), not a direct binary stream response.

#### Validation errors
- `400`: `path is required`

---

### 2.6 Download image
- Endpoint: `GET /api/interpol/download/image?item_id=<value>&path=<value>`
- Query params:
  - `item_id` (required string)
  - `path` (required string)

#### Success payload extension
Same shape as notice download:
```json
{
  "files": [
    {
      "fileName": "string",
      "type": "string",
      "binData": "base64 string"
    }
  ]
}
```

#### Validation errors
- `400`: `item_id and path are required`

---

## Frontend Error-Handling Strategy
For all Interpol endpoints:
1. Handle HTTP-level failures (network, 5xx, 4xx).
2. For successful HTTP responses, inspect:
   - `ok`
   - `resultCodeMeta.key`
3. Suggested UI mapping:
   - `NO_ERROR`: render payload
   - `NO_ANSWER`: show empty state
   - `TOO_MANY_ANSWER` or `INVALID_SEARCH_ERROR`: show "refine your query"
   - `ACCESS_DENIED`: show authorization/permission error state
   - `UNEXPECTED_ERROR` or `TIME_OUT`: allow retry

For Investigative Committee search:
- Handle potential `400` for empty criteria.
- Treat response schema as dynamic unless backend contracts are stabilized.

---

## Example requests
### Interpol search
```bash
curl -X POST http://localhost:3000/api/interpol/search \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DOE",
    "forename": "JOHN",
    "dob": "15/03/1971",
    "nb": 10
  }'
```

### Investigative Committee search by `pnum`
```bash
curl -X POST http://localhost:3000/api/investigative-committee/persons/search \
  -H "Content-Type: application/json" \
  -d '{
    "pnum": "1234567890"
  }'
```
