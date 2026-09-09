# CityFix integration API

Create a key in Settings → Developer integrations. The secret is returned once; only its SHA-256 hash is stored on the server. Revoke keys through the authenticated `revokeIntegrationKey` callable. Keys expire after 90 days, are read-only, and permit 60 requests per minute per key.

Base URL: `https://us-central1-cityfix-community-20260908.cloudfunctions.net/integrationApi`

```sh
curl "$CITYFIX_API/v1/issues?limit=20&category=Roads" \
  -H "Authorization: Bearer $CITYFIX_API_KEY"
```

- `GET /v1/issues`: `limit` (1–50), optional `category`, `status`, and opaque `cursor`. Returns `{ issues, nextCursor }`. Pass `nextCursor` unchanged with the same filters until it is null.
- `GET /v1/issues/{id}`: a single report.
- `GET /v1/analytics`: server-maintained totals, category/status/severity breakdowns, daily counts, and cumulative resolution hours.

Report responses omit owner IDs, confirmation identities, and internal storage paths. Report text, location, and shareable photo URLs remain part of the community report. Keep keys on your integration server; do not embed them in public websites. CORS is disabled intentionally for this server-to-server API.

Errors use HTTP 400 for invalid arguments, 401 for missing/expired/revoked keys, 404 for unknown routes/reports, 405 for unsupported methods, 429 for rate limits, and 500 for server failures. No report mutation endpoints are exposed.

Pagination is ordered by creation time and ID. It is not a frozen database snapshot: new reports may appear ahead of an existing cursor. Use report IDs to deduplicate periodic imports.
