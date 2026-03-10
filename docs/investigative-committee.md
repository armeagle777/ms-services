# InvestigativeCommittee API

## Authentication

This controller is protected with HTTP Basic Auth.

Send the credentials in the `Authorization` header:

```http
Authorization: Basic base64(username:password)
```

Example:

```http
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

Where:

- `username` is the client application username
- `password` is the client application password

## Endpoint

### `POST /api/investigative-committee/persons/search`

Searches wanted-person information in the Investigative Committee integration.

## Request Body

All fields are optional, but the request must contain at least one of:

- `pnum`
- `firstName`
- `lastName`
- `birthDate`

Request fields:

```json
{
  "pnum": "string",
  "firstName": "string",
  "lastName": "string",
  "birthDate": "string"
}
```

Notes:

- If `pnum` is provided, the service uses it as the primary lookup value.
- If `pnum` is not provided, use person identity fields such as `firstName`, `lastName`, and `birthDate`.

## Request Example

```bash
curl --request POST 'http://localhost:3000/api/investigative-committee/persons/search' \
  --header 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=' \
  --header 'Content-Type: application/json' \
  --data '{
    "pnum": "7134110672"
  }'
```

Example with name-based search:

```bash
curl --request POST 'http://localhost:3000/api/investigative-committee/persons/search' \
  --header 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=' \
  --header 'Content-Type: application/json' \
  --data '{
    "firstName": "ANNA",
    "lastName": "PETROSYAN",
    "birthDate": "1990-01-01"
  }'
```

## Response Structure

Example response:

```json
{
  "RES": "2",
  "sType": ",,,,7134110672",
  "INFO": "Փնտրվող տվյալները ՀՀ ոստիկանության ինֆորմացիոն կենտրոնում գրանցված չեն",
  "FlagDat": "0",
  "FlagHet": "0"
}
```

Response fields:

- `RES`: response/result code
- `sType`: response type or matched identifier details
- `INFO`: human-readable message from the upstream system
- `FlagDat`: status flag
- `FlagHet`: status flag

## Error Cases

- `401 Unauthorized` if the `Authorization` header is missing or credentials are invalid
- `400 Bad Request` if none of `pnum`, `firstName`, `lastName`, or `birthDate` is provided
