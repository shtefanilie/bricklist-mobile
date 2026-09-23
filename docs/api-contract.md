# BrickList API Contract

Base URL is the facilitator-provided Worker URL. Requests and responses use JSON. The
public health endpoint needs no key. Every `/sets` endpoint needs the temporary shared
key header; use a supplied value, never a value from this document.

```http
X-API-Key: <shared-workshop-key>
```

## Health

```http
GET /health
```

```json
{ "ok": true }
```

## List Sets

```http
GET /sets?page=1&limit=20&seed=48291
X-API-Key: <shared-workshop-key>
```

`page` defaults to `1`; `limit` defaults to `20` and must be from `1` through `100`.
`seed` is optional and must be from `1` through `2147483647`. A seed produces a
deterministic random-looking order: reuse it for every page in one browsing session to
avoid duplicates or missing sets, then choose a new seed for a new order. Without a seed,
results are ordered by set number.

```json
{
  "items": [
    {
      "setNumber": "001-1",
      "name": "Gears",
      "theme": "Technic",
      "year": 1965,
      "pieceCount": 43,
      "imageUrl": "https://cdn.example/001-1.jpg"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

## Filters

`search` filters set names case-insensitively. `theme` filters theme names
case-insensitively. Filters can be combined; `total` is the count after both filters.

```http
GET /sets?page=1&limit=20&search=gear
X-API-Key: <shared-workshop-key>

GET /sets?page=1&limit=20&theme=Technic
X-API-Key: <shared-workshop-key>
```

An empty result is successful:

```json
{ "items": [], "page": 1, "limit": 20, "total": 0 }
```

## Set Detail

```http
GET /sets/001-1
X-API-Key: <shared-workshop-key>
```

```json
{
  "setNumber": "001-1",
  "name": "Gears",
  "theme": "Technic",
  "year": 1965,
  "pieceCount": 43,
  "imageUrl": "https://cdn.example/001-1.jpg"
}
```

## Stable Errors

All errors use this shape:

```json
{ "error": { "code": "error_code", "message": "Human-readable message" } }
```

| Status | When | Response |
| --- | --- | --- |
| 400 | `page` or `limit` is invalid | `{ "error": { "code": "invalid_query", "message": "page must be at least 1" } }` |
| 400 | `limit` is above 100 | `{ "error": { "code": "invalid_query", "message": "limit must not exceed 100" } }` |
| 400 | `seed` is outside its supported range | `{ "error": { "code": "invalid_query", "message": "seed must be at least 1" } }` |
| 401 | Key missing or invalid | `{ "error": { "code": "unauthorized", "message": "Unauthorized" } }` |
| 404 | Set does not exist | `{ "error": { "code": "not_found", "message": "Set not found" } }` |
| 404 | Method or route does not exist | `{ "error": { "code": "not_found", "message": "Not found" } }` |
| 429 | Request rate limited | `{ "error": { "code": "rate_limited", "message": "Too many requests" } }` |
| 500 | Worker or D1 failure | `{ "error": { "code": "internal_error", "message": "Internal server error" } }` |

There are no mutation endpoints. Treat the shared key as workshop-only and client-visible,
not as a production credential.
