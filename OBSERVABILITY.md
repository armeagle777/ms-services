# Request timing & logging

Everything below is on by default and configured through `.env` (see `.env.example`).

## What now gets measured

Every inbound client request opens an `AsyncLocalStorage` scope
(`src/Core/Logging/RequestContext.ts`) carrying a correlation id. Every outbound
call to a third party API is attributed to that scope, so for each client
request we know:

| field | meaning |
| --- | --- |
| `durationMs` | total time the client waited |
| `upstreamMs` | time spent waiting on third party APIs |
| `selfMs` | `durationMs - upstreamMs` — our own parsing, DB and mapping |
| `upstreamCalls` | per-integration breakdown (duration, status, attempts) |

The correlation id is returned to the client in the `x-request-id` response
header and forwarded to upstreams in the `x-request-id` request header. If a
client sends its own `x-request-id`, it is reused.

## Where it shows up

**Logs** — one structured JSON line per event:

```
[InboundHttp]  {"event":"inbound_request","requestId":"...","method":"POST","path":"/api/persons/search","statusCode":200,"durationMs":4120,"upstreamMs":3980,"selfMs":140,"upstreamCalls":2,"slowest":"STATE_POPULATION_REGISTER:3100ms"}
[OutboundHttp] {"event":"upstream_call","requestId":"...","integration":"STATE_POPULATION_REGISTER","method":"POST","url":"https://...","statusCode":200,"durationMs":3100,"attempts":1,"timedOut":false}
[OutboundHttp] {"event":"upstream_retry","integration":"SEKT","attempt":1,"waitedMs":51,"retryInMs":180,"reason":"ECONNRESET: socket hang up"}
```

Slow calls are logged at `warn` (`SLOW_REQUEST_WARN_MS`, `SLOW_UPSTREAM_WARN_MS`),
failures at `error`. Grep-friendly: `grep upstream_call app.log | jq`.

**Database** — two tables in the auth Postgres database, migrated automatically
on boot:

- `request_logs` — one row per inbound request, now with `requestId`,
  `durationMs`, `upstreamMs`, `upstreamCalls` (JSON breakdown).
- `integration_call_logs` — one row per outbound third party call:
  `integration`, `method`, `url`, `statusCode`, `durationMs`, `attempts`,
  `timedOut`, `error`, correlated by `requestId`.

## Queries that answer "why is it slow"

Slowest endpoints over the last day (p50 / p95 / p99):

```sql
SELECT path,
       count(*) AS calls,
       percentile_cont(0.5)  WITHIN GROUP (ORDER BY "durationMs") AS p50,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY "durationMs") AS p95,
       percentile_cont(0.99) WITHIN GROUP (ORDER BY "durationMs") AS p99,
       avg("upstreamMs")::int AS avg_upstream_ms
FROM request_logs
WHERE "createdAt" > now() - interval '1 day' AND "durationMs" IS NOT NULL
GROUP BY path
ORDER BY p95 DESC
LIMIT 20;
```

Which third party API is actually costing the time:

```sql
SELECT integration,
       count(*) AS calls,
       percentile_cont(0.5)  WITHIN GROUP (ORDER BY "durationMs") AS p50,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY "durationMs") AS p95,
       max("durationMs") AS worst,
       sum(CASE WHEN "timedOut" THEN 1 ELSE 0 END) AS timeouts,
       sum(CASE WHEN attempts > 1 THEN 1 ELSE 0 END) AS retried,
       sum(CASE WHEN error IS NOT NULL THEN 1 ELSE 0 END) AS failures
FROM integration_call_logs
WHERE "createdAt" > now() - interval '1 day'
GROUP BY integration
ORDER BY p95 DESC;
```

Our own overhead vs. upstream wait:

```sql
SELECT path,
       avg("durationMs" - coalesce("upstreamMs", 0))::int AS avg_self_ms,
       avg("upstreamMs")::int AS avg_upstream_ms
FROM request_logs
WHERE "createdAt" > now() - interval '1 day' AND "durationMs" IS NOT NULL
GROUP BY path
ORDER BY avg_self_ms DESC
LIMIT 20;
```

Drill into one slow request end to end:

```sql
SELECT * FROM request_logs WHERE "requestId" = '<id from x-request-id>';
SELECT * FROM integration_call_logs WHERE "requestId" = '<id>' ORDER BY "createdAt";
```

Endpoints where several upstream calls happen in sequence (candidates for
`Promise.all`):

```sql
SELECT r.path, count(*) AS requests, avg(c.calls_per_request)::numeric(5,2) AS avg_upstream_calls
FROM request_logs r
JOIN (
   SELECT "requestId", count(*) AS calls_per_request
   FROM integration_call_logs
   WHERE "createdAt" > now() - interval '1 day'
   GROUP BY "requestId"
) c ON c."requestId" = r."requestId"
WHERE c.calls_per_request > 1
GROUP BY r.path
ORDER BY avg_upstream_calls DESC;
```

## Timeouts & retries

`src/Infrustructure/Http/HttpInstrumentation.service.ts` installs interceptors on
both the global `axios` instance and Nest's `HttpService`, so all integrations
are covered without touching them individually.

- **Timeout**: `HTTP_DEFAULT_TIMEOUT_MS` (default 15s) is applied to any call
  that does not set its own. Integrations with an explicit timeout (Wisdm, PKI)
  keep theirs.
- **Retries**: `HTTP_RETRY_ATTEMPTS` (default 2 extra attempts) with exponential
  backoff plus full jitter, capped at `HTTP_RETRY_MAX_DELAY_MS`.
  - GET/HEAD/OPTIONS: retried on timeout, connection failure and 502/503/504.
  - POST/PUT/PATCH/DELETE: `HTTP_RETRY_UNSAFE_METHODS` decides.
    `connection-errors-only` (default) retries only when the upstream never
    produced a response, so a request cannot be processed twice. Set to `always`
    if all upstreams are read-only lookups, `never` to disable.
- **Connection pooling**: keep-alive agents (`HTTP_MAX_SOCKETS`) are attached to
  calls that do not bring their own agent, so repeated TLS handshakes stop being
  a per-request cost. Integrations using client certificates keep their agents.
- **Server timeouts**: `SERVER_KEEP_ALIVE_TIMEOUT_MS` (65s, must exceed the
  proxy's idle timeout) and `SERVER_REQUEST_TIMEOUT_MS` (60s ceiling per
  inbound request).

## Privacy switches

These endpoints carry personal data (SSNs, document numbers), so:

- `LOG_UPSTREAM_QUERY=false` (default) strips query strings from logged URLs.
- `LOG_REQUEST_BODIES=true` (default, previous behaviour) persists inbound
  body/query in `request_logs`; set to `false` to store metadata only.
- Bodies are truncated at 8 000 characters.

## Known gaps

- Requests rejected by `BasicAuthGuard` (401) never reach the interceptor, so
  they appear in the morgan access log but not in `request_logs`. An exception
  filter would close that gap.
- `request_logs` / `integration_call_logs` grow without bound — add a retention
  job (e.g. `DELETE FROM integration_call_logs WHERE "createdAt" < now() - interval '30 days'`).
