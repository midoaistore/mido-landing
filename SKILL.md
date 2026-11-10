# Mido Deep Search — AI Skill Definition

**Version:** 6.0.0 (Aligned with Worker V6.3, Frontend V10.3, and Contract v2.0)
**Author:** Mido AI Store
**Platform:** Cloudflare Workers + GitHub Pages

## 1. Overview
Mido Deep Search is a multi-stage research engine designed to turn an ordinary question into a structured, source-backed report. It searches the web, cross-references data, detects risks, and outputs a reviewable decision path in a multilingual format. The system is built with a strict focus on evidence, transparency, and token efficiency.

## 2. Core Pipeline & Transform Mode
The engine operates primarily in a 5-stage pipeline orchestrated by `worker.js`:

1. **Source Search (Tavily):** Retrieves live web results and builds the initial evidence set.
2. **Thesis Build (Groq):** Synthesizes raw data into a core thesis using the primary model.
3. **Reduce & Rank (Groq):** Filters noise, ranking sources by authority and recency.
4. **Risk Check (Groq):** Detects hallucinations, validates claims, and checks for missing evidence.
5. **Final Report (Groq):** Formats the final output in Markdown based on the requested skill format.

### Token-Efficient Transform Mode
To prevent users from wasting API tokens and daily quotas, the system includes a **Transform Mode** (`mode: "transform"`):
- **No New Search:** It bypasses the Tavily search entirely and reuses the `base_answer` and `base_sources`.
- **Zero Quota Cost:** Transform requests do not increment or consume the user's daily rate limit.
- **Client-Side Cache:** The frontend caches the results of each skill in `transformCache`. Re-selecting a skill or returning to the original `deep_search` restores the result instantly without making any API calls.

## 3. Supported Skills (15)
The `worker.js` dynamically adapts the LLM prompts and output format based on the requested `skill` parameter:
`deep_search`, `summarize`, `compare`, `recommend`, `price_check`, `save`, `fact_check`, `pros_cons`, `buying_guide`, `local_price_check`, `source_audit`, `risk_check`, `extract_facts`, `outline`, `decision_matrix`.

*Note: Unknown skill IDs gracefully fall back to `deep_search`.*

## 4. Models, Providers & Infrastructure
- **Search Engine:** Tavily API (`search_depth: advanced`, `max_results: 12`).
- **Primary LLM:** Groq (`openai/gpt-oss-120b`).
- **Fallback LLM:** Groq (`openai/gpt-oss-20b`) in case of rate limits or timeouts.
- **Licensing:** Gumroad API (for premium tier verification).
- **State & Quota:** Cloudflare KV (tracks rate limits, daily stats, and caches license verifications).
- **Identity Endpoint:** `POST /me` provides a read-only personal quota check for the frontend.

## 5. Visualizer Engine (V10.3)
The frontend (`index.html` and `bacterium-lite.html`) features a 3D biological visualization representing the AI agents.
- **Engine:** Three.js (via Import Map).
- **Performance:** Mobile-optimized (15 organelles, lightweight particle rendering, targeting 60fps).
- **State Sync:** The frontend sends `postMessage` events to the iframe to trigger the teardown effect and highlight the active agent during the 5-stage search pipeline.

## 6. Languages & Localization
The frontend supports 8 UI languages via a dynamic translation dictionary: English (EN), Arabic (AR), French (FR), German (DE), Japanese (JA), Simplified Chinese (ZH), Spanish (ES), and Portuguese (PT). The Worker also includes Italian (IT) support.
- **Query Language Detection:** The system detects the language of the user's query (using `detectLanguage(query, "en")`). 
- **Language Rule:** The final report language follows the **query language**, not the UI language. If a user has an Arabic UI but asks a question in English, the report will be generated in English.

## 7. Security & Licensing
- **License:** Source Available (Non-Commercial). Commercial use or resale requires explicit written permission.
- **Admin Key:** Must never be passed via URL. It is sent via `X-Admin-Key` header and validated against `POST /me` before being stored in `sessionStorage`.
- **Secrets:** Tavily, Groq, and Admin keys are strictly kept in Cloudflare Secrets and never exposed to the browser.

## 8. Output Contract
Responses from `POST /` return a JSON object containing:
- `ok`: Boolean status.
- `answer`: The Markdown report.
- `sources`: Array of source objects (title, url, snippet, score).
- `logs`: Array of stages (with `status: "reused"` for transform mode).
- `meta`: Detailed execution data (language, quota, elapsed time, user type).
