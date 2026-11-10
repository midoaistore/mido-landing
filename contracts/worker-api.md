# Mido Deep Search — Worker API Contract v2.0

**Worker Version:** 6.3  
**Contract Version:** 2.0  
**Base URL:** `https://mido-deepsearch.midoaistore.workers.dev`  
**Last Updated:** November 2026

This document defines the complete contract between the `mido-landing` frontend (`index.html`) and the Cloudflare Worker backend (`worker.js`). Both sides must be updated together when this contract changes.

---

## Table of Contents

1. [Authentication & Identity](#1-authentication--identity)
2. [Endpoints](#2-endpoints)
   - [POST / — Search & Transform](#21-post----search--transform)
   - [GET /stats — Daily Statistics](#22-get-stats--daily-statistics)
   - [POST /visit — Global Visitor Counter](#23-post-visit--global-visitor-counter)
   - [POST /me — Personal Quota Check](#24-post-me--personal-quota-check)
   - [GET /spider — Debug Info](#25-get-spider--debug-info)
3. [Skills (15 stable IDs)](#3-skills-15-stable-ids)
4. [Languages](#4-languages)
5. [Rate Limiting](#5-rate-limiting)
6. [Environment Variables](#6-environment-variables)
7. [Error Codes Reference](#7-error-codes-reference)
8. [Compatibility Matrix](#8-compatibility-matrix)
9. [Security Requirements](#9-security-requirements)
10. [Version History](#10-version-history)

---

## 1. Authentication & Identity

### 1.1 Admin Key

- **Header:** `X-Admin-Key: <ADMIN_KEY>`
- **Purpose:** Grants unlimited search quota. Bypasses all free-tier and paid-tier limits.
- **Security:** **Never** pass the admin key via URL query parameters. The frontend must strip `?admin_key=...` on load using `history.replaceState` and send it only via this header.
- **Verification:** Compared directly against `env.ADMIN_KEY` in Cloudflare Secrets (no Gumroad lookup).

### 1.2 Paid License (Gumroad)

- **Header:** `X-Admin-Key: <GUMROAD_LICENSE_KEY>`
- **Purpose:** Grants paid-tier quota (200 searches/day).
- **Verification:** Via `https://api.gumroad.com/v2/licenses/verify` with `product_permalink` matching `env.GUMROAD_PRODUCT_ID`.
- **Cache:** Successful verifications cached in KV for 24 hours (`license:<key>`).
- **Rejection cases:**
  - `refunded`, `disputed`, `chargebacked` → license invalid
  - Network failure → `gumroad_network_error`

### 1.3 Visitor ID (Free Tier)

- **Body field:** `visitor_id` (preferred — used by current frontend)
- **Header (accepted by CORS):** `X-Visitor-Id` — reserved for future use
- **Fallback:** `CF-Connecting-IP` when `visitor_id` absent
- **Format:** Any string, max 64 characters
- **Purpose:** Primary rate-limit identity for the free tier. Using a visitor ID instead of IP makes the limit resistant to VPN switching.

### 1.4 CORS

- Controlled by `env.ALLOWED_ORIGINS` (comma-separated list)
- Empty or `*` → allow all origins (development only)
- Returns `Vary: Origin` on all responses

**Allowed headers:**
Content-Type, X-Admin-Key, X-Visitor-Id, X-Visitor-ID, X-Country, X-Lang

**Allowed methods:** `POST, GET, OPTIONS`

---

## 2. Endpoints

### 2.1 `POST /` — Search & Transform

Primary endpoint. Handles both new research searches and skill transformations of existing reports.

#### 2.1.1 Request Headers
Content-Type: application/json
X-Admin-Key: <optional>
Origin: <origin>

#### 2.1.2 Request Body — Search Mode (default)

```json
{
  "query": "Best programming laptop under 1500 USD",
  "visitor_id": "v_abc123",
  "skill": "deep_search",
  "country": "US",
  "lang": "en"
}
Field Type Required Constraints Notes
query string ✅ Max 500 chars Trimmed and sanitized
visitor_id string ⚠️ recommended Max 64 chars Falls back to IP if absent
skill string ❌ One of 15 IDs Default: deep_search
country string ❌ 2–4 chars Default: US
lang string ❌ 2-letter code Default: en
mode string ❌ search or transform Default: search
2.1.3 Request Body — Transform Mode

Reuses an existing report and its sources without performing a new Tavily search. Does NOT consume rate limit.
{
  "mode": "transform",
  "query": "same as original",
  "base_answer": "<existing report markdown>",
  "base_sources": [
    { "title": "...", "url": "...", "snippet": "..." }
  ],
  "visitor_id": "v_abc123",
  "skill": "compare",
  "country": "US",
  "lang": "en"
}
Field Type Required Constraints
base_answer string ✅ (transform only) Max 10,000 chars
base_sources array ⚠️ recommended Max 12 items
Each source item:
{
  "title": "String, max 200 chars",
  "url": "String, max 1000 chars",
  "snippet": "String, max 700 chars (or 'content' — both accepted)"
}
2.1.4 Success Response (200) — Search Mode
{
  "ok": true,
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-11-10T12:34:56.789Z",
  "answer": "## Short Summary\n...\n",
  "sources": [
    {
      "id": 1,
      "title": "Example Source",
      "url": "https://example.com",
      "snippet": "First 300 chars of source content...",
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
  "success": true,
  "deep_answer": "same as answer (legacy field)",
  "top_sources": "same as sources (legacy field)",
  "meta": {
    "query": "Best programming laptop under 1500 USD",
    "lang": "en",
    "lang_detected": "en",
    "lang_client": "en",
    "lang_mismatch": false,
    "country": "US",
    "skill": "deep_search",
    "sources_count": 12,
    "elapsed_ms": 34500,
    "remaining_quota": 99,
    "quota_limit": 100,
    "user_type": "free",
    "license": null,
    "is_admin": false,
    "worker_version": "6.3",
    "self_check": "PASS"
  }
}
2.1.5 Success Response (200) — Transform Mode
{
  "ok": true,
  "report_id": "...",
  "created_at": "...",
  "answer": "## Short Summary\n... (transformed)",
  "sources": [
    { "id": 1, "title": "...", "url": "...", "snippet": "...", "score": null }
  ],
  "logs": [
    { "stage": 1, "status": "reused", "name": "Existing Sources", "count": 8 },
    { "stage": 2, "status": "done", "name": "Skill Transform" },
    { "stage": 3, "status": "done", "name": "Format Report" },
    { "stage": 4, "status": "done", "name": "Evidence Preserved" },
    { "stage": 5, "status": "done", "name": "Final Report" }
  ],
  "meta": {
    "mode": "transform",
    "reused_sources": true,
    "remaining_quota": 99,
    "...": "(same fields as search mode)"
  }
}
Key differences in transform mode:

· logs[0].status = "reused" (not "done")
· All sources[].score = null (no re-scoring)
· meta.mode = "transform", meta.reused_sources = true
· Rate limit NOT consumed (remaining_quota unchanged)

2.1.6 Error Responses

Status error Trigger
400 empty_query query missing or empty
400 invalid_json Malformed JSON body
400 missing_base_report mode=transform without base_answer
401 invalid_license Invalid/expired/refunded/disputed admin key
405 method_not_allowed Non-POST request on /
429 rate_limit_exceeded Daily quota exhausted
500 search_failed Tavily or Groq failure (search mode)
500 transform_failed Groq failure (transform mode)

Example error body:
Status error Trigger
400 empty_query query missing or empty
400 invalid_json Malformed JSON body
400 missing_base_report mode=transform without base_answer
401 invalid_license Invalid/expired/refunded/disputed admin key
405 method_not_allowed Non-POST request on /
429 rate_limit_exceeded Daily quota exhausted
500 search_failed Tavily or Groq failure (search mode)
500 transform_failed Groq failure (transform mode)
Example error body:
{
  "error": "rate_limit_exceeded",
  "message": "Free daily limit of 100 searches reached. Purchase a license for 200 searches/day.",
  "remaining": 0,
  "limit": 100,
  "user_type": "free",
  "upgrade_url": "https://midoaistore.gumroad.com/l/dtqpvka"
}
2.2 GET /stats — Daily Statistics

Site-wide usage statistics for the current UTC day.

Response (200)
{
  "date": "2026-11-10",
  "total_visitors": 42,
  "today_searches": 17,
  "successful_trials": 15,
  "failed_trials": 2,
  "remaining_today": 83,
  "visitors": 42,
  "searches": 17,
  "success": 15,
  "failure": 2
}
Field notes:

· Both new (total_visitors, today_searches, successful_trials, failed_trials, remaining_today) and legacy (visitors, searches, success, failure) field names are provided for backward compatibility.
· remaining_today = RATE_LIMIT_FREE (100) - today_searches (site-wide, not per-user).
· If KV is unavailable, returns { "error": "stats_unavailable" } with status 200.

Frontend mapping

UI Element Reads from
#stVisitors total_visitors
#stSearches today_searches
#stOk successful_trials
#stFail failed_trials
#stLeft NOT from /stats — uses /me instead

---

2.3 POST /visit — Global Visitor Counter

Increments the daily visitors counter. Called once per page load by the frontend.

Request

```
POST /visit
Content-Type: text/plain (body content ignored)
```

Body may contain visitor_id but is currently ignored.

Response (200)
{ "ok": true, "success": true }
Behavior:

· Increments stats:YYYY-MM-DD:visitors in KV
· TTL: 30 days
· Does NOT affect rate limits
· Does NOT track per-visitor

---

2.4 POST /me — Personal Quota Check

Added in Contract v2.0. Read-only endpoint used by the frontend to display personal quota and validate admin sessions.

Request Headers

```
Content-Type: application/json
X-Admin-Key: <optional>
```

Request Body

```json
{ "visitor_id": "v_abc123" }
```

Response (200) — Free User

```json
{
  "ok": true,
  "user_type": "free",
  "remaining": 87,
  "limit": 100,
  "used": 13,
  "is_admin": false
}
```

Response (200) — Paid User

```json
{
  "ok": true,
  "user_type": "paid",
  "remaining": 185,
  "limit": 200,
  "used": 15,
  "is_admin": false
}
```

Response (200) — Admin

```json
{
  "ok": true,
  "user_type": "admin",
  "remaining": 999999,
  "limit": 999999,
  "used": 0,
  "is_admin": true
}
```

Response (401) — Invalid Admin Key

```json
{
  "ok": false,
  "error": "invalid_license",
  "message": "Invalid or expired license key."
}
```

Critical properties:

· Read-only — does NOT increment the rate counter
· Fast — single KV read; no external API calls unless admin key verification is needed and not cached
· CORS-safe — returns CORS headers on all responses
· Admin validation — frontend uses this to validate admin keys before storing them in sessionStorage

---

2.5 GET /spider — Debug Info

Simple debug page showing request metadata. Not used in production flows.

Response (200, text/html)

Returns an HTML page with:

· Client IP (CF-Connecting-IP, truncated to 50 chars)
· User-Agent (truncated to 200 chars)
· Current timestamp
· Worker version (v6.3)

---

3. Skills (15 stable IDs)

Shared between frontend (index.html) and Worker (worker.js). Any change requires updating both sides.

# Skill ID Objective
1 deep_search Complete evidence-based research report
2 summarize Concise, faithful summary
3 compare Structured comparison of strongest valid options
4 recommend Ranked options with transparent recommendation
5 price_check Audit prices, currency, date, availability (no conversion)
6 save Clean complete report suitable for saving
7 fact_check Classify claims: supported / contradicted / unverified
8 pros_cons Balanced evidence-based pros and cons
9 buying_guide Practical guide from criteria to final choice
10 local_price_check Local availability and locally sourced prices only
11 source_audit Evaluate source quality, relevance, recency, independence
12 risk_check Identify limitations, risks, missing evidence
13 extract_facts Extract only verifiable facts
14 outline Clear structured outline from supported information
15 decision_matrix Transparent decision matrix with criteria and scoring

Normalization: Unknown skill values are silently normalized to deep_search.

Behavior: Each skill has its own goal (in SKILL_CONFIG) and output format (in buildOutputFormat). The Worker injects the skill directive into all three prompts (plan, report, transform).

---

4. Languages

4.1 Supported Languages

Code Language
ar Arabic
en English
fr French
de German
es Spanish
pt Portuguese
ja Japanese
zh Simplified Chinese
it Italian (Worker only — not in current frontend)

4.2 Language Resolution Logic

The frontend sends lang (UI language). The Worker then:

```javascript
const detectedLang = detectLanguage(query, "en");
const effectiveLang = normalizeLanguage(detectedLang !== clientLang ? detectedLang : clientLang);
```

UI Language Query Language Detected Effective Report Language
ar Arabic ar ar Arabic
ar English en en English
en Arabic ar ar Arabic
en English en en English
ar Ambiguous short ("Sony") en (fallback) en English

Design principle: The report language follows the query language, not the UI language. This prevents English queries on Arabic UI from producing Arabic reports.

Mismatch flag: When detectedLang !== clientLang, the response sets meta.lang_mismatch: true.

4.3 Detection Heuristics

1. Character patterns first: Arabic script, Han, Hiragana/Katakana, Hangul, Cyrillic, extended Latin.
2. Stopword scoring: Each of 6 Latin-script languages has 20 stopwords; matches add +2 points.
3. Threshold: Score < 2 → falls back to "en".
4. Priority order: ja → ar/ko/ru → zh → Latin scoring.

---

5. Rate Limiting

5.1 Limits by User Type

User Type Daily Limit Identity Key
free 100 v:<visitor_id> or ip:<CF-Connecting-IP>
paid 200 paid:<last-12-of-license>
admin ∞ "admin"

5.2 Reset Schedule

Daily at 00:00 UTC. KV keys use the YYYY-MM-DD prefix.

5.3 Consumption Rules

Operation Consumes? Reason
POST / — search mode ✅ Yes Full research pipeline
POST / — transform mode ❌ No Reuses existing evidence
POST /me ❌ No Read-only check
POST /visit ❌ No Global counter only

Transform mode exemption rationale: The user is not requesting new evidence — they are re-presenting the same report through a different skill lens. This prevents token waste when a user cycles between skills on the same report.

5.4 Frontend Protection (Client-Side)

The frontend adds a second layer of protection via transformCache:

· First use of a skill → calls Worker → caches result
· Second use of the same skill → returns cached result locally (0 API calls)
· Return to deep_search → restores original from baseReportText (0 API calls)
· New search → cache is reset

Combined result: Users can explore all 15 skills on one report with only 1 API call per unique skill.

---

6. Environment Variables

6.1 Secrets (via wrangler secret put)

Name Purpose
TAVILY_API_KEY Tavily API authentication
GROQ_API_KEY Groq API authentication
ADMIN_KEY Admin bypass key

6.2 Variables (via wrangler.toml [vars])

Name Purpose Example
GUMROAD_PRODUCT_ID Gumroad product permalink dtqpvka
GUMROAD_URL Public purchase URL https://midoaistore.gumroad.com/l/dtqpvka
ALLOWED_ORIGINS CORS whitelist https://midoaistore.github.io
GROQ_MODEL Primary model override openai/gpt-oss-120b
GROQ_MODEL_SECONDARY Fallback model override openai/gpt-oss-20b

6.3 KV Bindings

Binding Purpose
MIDO_KV Rate limits, stats counters, license cache

6.4 Named KV Keys

Pattern TTL Purpose
rate:YYYY-MM-DD:<identity> 2 days Rate limit counter
stats:YYYY-MM-DD:visitors 30 days Global visitor counter
stats:YYYY-MM-DD:searches 30 days Global search counter
stats:YYYY-MM-DD:success 30 days Successful search counter
stats:YYYY-MM-DD:failure 30 days Failed search counter
license:<key> 24 hours Gumroad license cache

---

7. Error Codes Reference

7.1 Codes Emitted by Worker

Code Endpoint HTTP Status Meaning
empty_query POST / 400 Missing or empty query
invalid_json POST / 400 Body is not valid JSON
missing_base_report POST / 400 mode=transform without base_answer
invalid_license POST /, POST /me 401 Invalid/expired/refunded/disputed license
method_not_allowed POST / 405 Non-POST request on /
rate_limit_exceeded POST / 429 Daily quota exhausted
search_failed POST / 500 Tavily or Groq error (search mode)
transform_failed POST / 500 Groq error (transform mode)
not_found any 404 Unknown endpoint
stats_unavailable GET /stats 200 (in body) KV read failure

7.2 Codes Handled Defensively by Frontend

These may appear if the Worker evolves or is misconfigured. The frontend handles them but they are not currently emitted:

Code Frontend Behavior
admin_key_in_url Shows message asking user to use 🔑 button
missing_api_key Shows "Server configuration error"
daily_cap Treated as rate_limit_exceeded
trial_used Treated as rate_limit_exceeded
origin_not_allowed Shows CORS error message

---

8. Compatibility Matrix

Full verification that worker.js v6.3 is compatible with index.html v10.3.

Feature Frontend Worker Status
POST / search Sends all fields Accepts all fields ✅ Compatible
POST / transform Sends mode, base_answer, base_sources Handles transform mode ✅ Compatible
GET /stats Reads new + legacy fields Returns both ✅ Compatible
POST /visit Sends visitor_id in body Increments global counter ✅ Compatible
POST /me Reads remaining, user_type Returns all fields ✅ Compatible
X-RateLimit-* headers Reads (fallback to /me) Not emitted ⚠️ Optional
15 skill IDs SKILL_IDS array SKILL_CONFIG keys ✅ Exact match
8 UI languages T dictionary SUPPORTED_LANGS ✅ Match (+ it)
Report language = query language Sends lang Uses detectLanguage(query, "en") ✅ Compatible
Sources format (snippet/content) Reads s.content \|\| s.snippet Returns snippet ✅ Compatible
Logs format (stage/ring) Reads log.ring \|\| log.stage Returns stage ✅ Compatible
Legacy response fields Not used, safe to exist success, deep_answer, top_sources ✅ Compatible
Transform cache Client-side cache N/A ✅ Frontend-only
Admin session validation Calls /me with key Returns 200 or 401 ✅ Compatible

No outstanding compatibility gaps.

---

9. Security Requirements

9.1 Secrets Management

· Never put TAVILY_API_KEY, GROQ_API_KEY, or ADMIN_KEY in index.html, wrangler.toml, or any committed file
· Use wrangler secret put <NAME> to add secrets to Cloudflare
· Never commit .dev.vars or .env files

9.2 Admin Key Handling

· Never accept admin key via URL query parameter (?admin_key=...)
· Frontend must strip it via history.replaceState and store in sessionStorage
· Send only via X-Admin-Key header
· Admin key validation must pass /me before being stored

9.3 Source and Output Trust

· Treat all Tavily results and Groq output as untrusted data
· Validate source URLs (http: / https: only) before rendering as <a href>
· Escape HTML in all user-facing strings
· Never execute or eval model output

9.4 CORS

· Set ALLOWED_ORIGINS to explicit production origins
· Do not use * in production
· All admin operations must pass CORS preflight

9.5 Rate Limit Identity

· Prefer visitor_id over IP for free tier (VPN-resistant)
· Never expose other visitors' identities in responses
· Rate limit counters must be per-identity, not global

---

10. Version History

Contract v2.0 — November 2026

· Added POST /me endpoint (personal quota check, read-only)
· Documented transform mode officially (previously undocumented)
· Documented rate-limit exemption for transform mode
· Added full error code reference with HTTP status
· Added compatibility matrix (Worker ↔ Frontend)
· Corrected language detection behavior (report follows query language)
· Clarified source field aliases (snippet / content)
· Clarified log field aliases (stage / ring)
· Removed references to never-emitted codes
· Version aligned to Worker v6.3

Contract v1.0 — Initial

· Documented POST /, GET /stats, POST /visit
· Basic authentication overview
· Basic error codes

---

Appendix A — Complete Frontend ↔ Worker Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Page Load                                                        │
├─────────────────────────────────────────────────────────────────┤
│ 1. index.html loads → applyLang(saved)                          │
│ 2. fetchStats() → GET /stats                                    │
│ 3. fetchMyQuota() → POST /me                                    │
│ 4. POST /visit (fire-and-forget)                                │
│ 5. Read sessionStorage['mido_admin_key'] if present             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ User Submits Search                                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. validate query not empty                                     │
│ 2. POST / with {query, visitor_id, skill, country, lang}        │
│ 3. Worker: identity → rate limit → Tavily → Groq (3 passes)     │
│ 4. Worker: return {answer, sources, logs, meta}                 │
│ 5. Frontend: render report + save baseReportText                │
│ 6. Frontend: fetchMyQuota() → refresh quota display             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ User Clicks a Skill (e.g., "Compare")                            │
├─────────────────────────────────────────────────────────────────┤
│ IF transformCache[compare] exists:                              │
│   → renderTransformResult(compare, fromCache=true)              │
│   → toast: "From cache — no tokens used"                        │
│   → NO API call                                                 │
│                                                                  │
│ ELSE:                                                            │
│   → POST / with {mode: "transform", base_answer, base_sources}   │
│   → Worker: rate limit (no increment) → Groq (1 pass)            │
│   → Worker: return transformed report                            │
│   → Frontend: cache result in transformCache[compare]            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ User Clicks "Deep Search" Again                                  │
├─────────────────────────────────────────────────────────────────┤
│ IF lastReportText !== baseReportText:                            │
│   → Restore baseReportText and baseReportSources                │
│   → renderTransformResult(null, fromCache=false)                 │
│   → toast: "Original restored (no API call)"                     │
│   → NO API call                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

Appendix B — Deployment Checklist

Before deploying to production:

☐ node --check worker.js passes
☐ All 3 secrets set via wrangler secret put (TAVILY_API_KEY, GROQ_API_KEY, ADMIN_KEY)
☐ ALLOWED_ORIGINS set to production frontend URL (not *)
☐ GUMROAD_PRODUCT_ID and GUMROAD_URL configured
☐ MIDO_KV namespace bound in wrangler.toml
☐ Test POST /me returns 200 with valid free tier response
☐ Test POST / search returns sources and logs arrays
☐ Test POST / transform does not consume rate limit
☐ Test admin key validation via /me
☐ Verify index.html WORKER_URL matches deployed Worker URL
☐ Confirm CORS preflight (OPTIONS) returns correct headers

---

End of Contract v2.0

```
