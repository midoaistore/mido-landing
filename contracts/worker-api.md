# Mido Deep Search — Worker API Contract

**Version:** 1.0
**Worker Version:** V6.3
**Base URL:** `https://mido-deepsearch.midoaistore.workers.dev`

This document defines the contract between the `mido-landing` frontend and the Cloudflare Worker backend.

## 1. Authentication & Rate Limiting

### Admin Key (Optional)
- **Header:** `X-Admin-Key: <ADMIN_KEY>`
- **Purpose:** Grants unlimited search quota.
- **Security:** Never pass the admin key via URL query parameters (e.g., `?admin_key=...`). The frontend must strip it immediately using `history.replaceState` and send it via this header.

### Visitor ID (Free Tier)
- **Header:** `X-Visitor-Id: <UUID>` (preferred) or Body field `visitor_id`.
- **Purpose:** Used as the primary identity for the free tier (100 searches/day). If absent, falls back to client IP.

### CORS
- Only allowed origins configured in `ALLOWED_ORIGINS` environment variable can make requests.

## 2. Endpoints

### 2.1 `POST /` — Search & Report Generation
Initiates a research pipeline and returns a structured report.

**Request Headers:**
- `Content-Type: application/json`
- `X-Admin-Key` (optional)
- `X-Visitor-Id` (optional)

**Request Body:**
```json
{
  "query": "Best programming laptop under 1500 USD",
  "visitor_id": "v_12345",
  "skill": "deep_search",
  "country": "US",
  "lang": "en"
}Fields:

· query (string, required): Max 500 chars.
· visitor_id (string, optional).
· skill (string, optional): One of the 15 supported skills. Default: deep_search.
· country (string, optional): 2-letter ISO code. Default: US.
· lang (string, optional): Language code (en, ar, etc.). Default: en.

Success Response (200 OK):

```json
{
  "ok": true,
  "report_id": "uuid",
  "created_at": "2025-01-01T00:00:00Z",
  "answer": "## Short Summary\n...",
  "sources": [
    {
      "id": 1,
      "title": "Example Source",
      "url": "https://example.com",
      "snippet": "...",
      "score": 0.95
    }
  ],
  "logs": [
    { "stage": 1, "status": "done", "name": "Source Search", "count": 12 },
    { "stage": 2, "status": "done", "name": "Thesis Build" },
    { "stage": 3, "status": "done", "name": "Reduce & Rank" },
    { "stage": 4, "status": "done", "name": "Risk Check" },
    { "stage": 5, "status": "done", "name": "Final Report" }
  ],
  "meta": {
    "elapsed_ms": 34500,
    "remaining_quota": 99,
    "user_type": "free",
    "is_admin": false,
    "worker_version": "6.3"
  }
}
```

Error Responses:

· 400 empty_query: Missing query.
· 401 invalid_license: Invalid admin key.
· 429 rate_limit_exceeded: Quota exhausted.
· 500 search_failed: Tavily or Groq error.

2.2 GET /stats — Frontend Statistics

Returns daily usage statistics.
Response (200 OK):

```json
{
  "date": "2025-01-01",
  "total_visitors": 42,
  "today_searches": 17,
  "remaining_today": 83
}
```

2.3 POST /visit — Visit Tracking

Increments the daily visitor counter.
Response (200 OK):

```json
{ "ok": true, "success": true }
