# Changelog

All notable changes to Mido Deep Search will be documented in this file.

The project currently contains a static frontend, a Cloudflare Worker API, an interactive biological visualizer, multilingual content, report actions, and a reusable research-skill definition. Version entries should describe behavior that is actually released and deployed.

## [Unreleased]

### Added

- English project documentation with a product overview, architecture guide, setup instructions, API examples, security notes, and contribution guidance.
- `LICENSE` with the MIT License text.
- `SECURITY.md` with private vulnerability-reporting guidance.
- `CONTRIBUTING.md` with development, testing, security, and Pull Request guidelines.
- `WORKER_API_CONTRACT.md` (v2.0) documenting all Worker endpoints (`POST /`, `GET /stats`, `POST /visit`, `POST /me`, `GET /spider`), including request/response schemas, error codes, rate-limit rules, environment variables, and a full frontend–Worker compatibility matrix.
- `POST /me` Worker endpoint. Read-only personal quota check used by the frontend to display remaining quota and validate admin sessions before storing admin keys in `sessionStorage`.
- Client-side transform cache in `index.html`. Results from each skill transformation are cached in `transformCache[skill]`, so repeated use of the same skill returns the cached result without any additional API call.
- `renderTransformResult` helper function to unify transformation rendering and surface a visible "Cached — no API call" indicator to the user.
- Original-report restoration. Selecting `deep_search` after using another skill restores `baseReportText` and `baseReportSources` directly from memory without contacting the Worker.
- A documented five-stage research pipeline:
  1. Source Search
  2. Thesis Build
  3. Reduce and Rank
  4. Risk Assessment
  5. Final Report
- Fifteen stable research skill identifiers shared between the frontend and Worker:
  - `deep_search`
  - `summarize`
  - `compare`
  - `recommend`
  - `price_check`
  - `save`
  - `fact_check`
  - `pros_cons`
  - `buying_guide`
  - `local_price_check`
  - `source_audit`
  - `risk_check`
  - `extract_facts`
  - `outline`
  - `decision_matrix`
- Interactive synchronization between search stages and the `bacterium-lite.html` visualizer.
- Browser-side report actions including copy, text download, local save, sharing fallback, print/save as PDF, and Word-compatible export.
- A local report library for saving and reopening multiple reports in the browser.

### Changed

- Pricing updated from $6 to $19 across all landing-page references, including the header buy button, the pricing section, the full-report modal CTA, the FAQ entry, and every localized string across all eight supported languages.
- `checkRateLimit` in the Worker now accepts an `increment` parameter (default `true`). When called with `increment = false`, it reads the current counter without writing, enabling read-only quota checks.
- Transform mode (`mode: "transform"`) no longer consumes the daily rate limit. Only the initial search (`mode: "search"`) counts toward quota. Skill transformations on an existing report reuse evidence and are treated as zero-cost.
- Report language now follows the query language rather than the UI language. `detectLanguage(query, "en")` replaces the previous `detectLanguage(query, clientLang)` call, so an English query on an Arabic UI produces an English report and vice versa.
- The `deep_search` skill no longer triggers an API call when the original report is already cached. The frontend restores `baseReportText` locally.
- Improved the project README with a stronger product hook, architecture overview, interactive Mermaid pipeline, skill documentation, setup guidance, security expectations, and a GitHub Star call to action.
- Improved the biological visualizer so the fifteen organelles react individually to search stages: completed organelles remain illuminated, the active organelle is emphasized, and upcoming organelles remain dimmed.
- Clarified that PDF output uses the browser print dialog and that Word output is generated locally as a Word-compatible HTML document.
- Documented that provider API keys and admin credentials must remain in Cloudflare Secrets and must not be placed in frontend code or browser storage.

### Fixed

- Token waste when reusing the same skill on the same report. The frontend now caches each transformation result in `transformCache[skill]` and returns it instantly on repeat selections, eliminating redundant Groq calls.
- Rate limit consumed by transformation requests. Transform calls previously decremented the same counter used for full searches; they now bypass increment entirely.
- Report language mismatch when the UI language differed from the query language. Reports are now generated in the query's detected language regardless of the browser locale.
- Loss of the original report when switching between skills. Selecting `deep_search` restores the original report and its sources without any API call.
- Empty transform responses could previously break the report chain; the frontend now throws an explicit `transform_empty` error and displays it clearly to the user.
- Improved synchronization messages between `index.html` and `bacterium-lite.html` for search start, stage progress, completion, and failure states.
- Corrected documentation language that previously risked overstating provider limits or describing implementation details not guaranteed by the current deployment.

### Security

- Documented responsible disclosure through `SECURITY.md`.
- Documented rules against placing Tavily, Groq, Cloudflare, Gumroad, or admin credentials in repository files, URLs, screenshots, Issues, or Pull Requests.
- Admin keys are validated through `POST /me` before being stored in `sessionStorage`; the Worker returns `401` for invalid keys and the frontend clears the session immediately.
- Admin keys continue to be sent only via the `X-Admin-Key` header, never via URL query parameters.

### Known limitations

- Search quality, latency, quotas, and cost depend on Tavily, Groq, Cloudflare, Gumroad, and the deployed Worker configuration.
- The browser visualizer reflects frontend stage signals; it does not expose private provider execution details.
- Local report storage depends on the user's browser storage and is not a server-side backup.
- PDF export is implemented through the browser print flow rather than a server-generated PDF binary.
- `X-RateLimit-Remaining` and `X-RateLimit-Limit` response headers are not yet emitted by the Worker; the frontend relies on `POST /me` for personal quota display and updates it after each request.
- The client-side transform cache is per-session and per-report. A new search or a page reload clears it, so token savings apply only while exploring multiple skills on the same report.
- A formal automated CI pipeline should be added before treating the repository as a fully validated release.

## Versioning policy

Until the first tagged release is published, changes should be recorded under `[Unreleased]` instead of being assigned a made-up version number.

When a release is tagged, use a versioned heading such as:

```markdown
## [1.0.0] - YYYY-MM-DD
Use the following categories where relevant:

· Added — new functionality.
· Changed — changes to existing behavior.
· Deprecated — functionality that will be removed later.
· Removed — deleted functionality.
· Fixed — bug fixes.
· Security — security improvements or disclosures that are safe to publish.

Do not include API keys, license keys, personal data, private vulnerability details, or exploit instructions in this file.

