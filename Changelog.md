# Changelog

All notable changes to Mido Deep Search will be documented in this file.

The project currently contains a static frontend, a Cloudflare Worker API, an interactive biological visualizer, multilingual content, report actions, and a reusable research-skill definition. Version entries should describe behavior that is actually released and deployed.

## [Unreleased]

### Added

- English project documentation with a product overview, architecture guide, setup instructions, API examples, security notes, and contribution guidance.
- `LICENSE` with the MIT License text.
- `SECURITY.md` with private vulnerability-reporting guidance.
- `CONTRIBUTING.md` with development, testing, security, and Pull Request guidelines.
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

- Improved the project README with a stronger product hook, architecture overview, interactive Mermaid pipeline, skill documentation, setup guidance, security expectations, and a GitHub Star call to action.
- Improved the biological visualizer so the fifteen organelles react individually to search stages: completed organelles remain illuminated, the active organelle is emphasized, and upcoming organelles remain dimmed.
- Clarified that PDF output uses the browser print dialog and that Word output is generated locally as a Word-compatible HTML document.
- Documented that provider API keys and admin credentials must remain in Cloudflare Secrets and must not be placed in frontend code or browser storage.

### Fixed

- Improved synchronization messages between `index.html` and `bacterium-lite.html` for search start, stage progress, completion, and failure states.
- Corrected documentation language that previously risked overstating provider limits or describing implementation details not guaranteed by the current deployment.

### Security

- Documented responsible disclosure through `SECURITY.md`.
- Documented rules against placing Tavily, Groq, Cloudflare, Gumroad, or admin credentials in repository files, URLs, screenshots, Issues, or Pull Requests.

### Known limitations

- Search quality, latency, quotas, and cost depend on Tavily, Groq, Cloudflare, Gumroad, and the deployed Worker configuration.
- The browser visualizer reflects frontend stage signals; it does not expose private provider execution details.
- Local report storage depends on the user's browser storage and is not a server-side backup.
- PDF export is implemented through the browser print flow rather than a server-generated PDF binary.
- A formal automated CI pipeline and a dedicated API contract document should be added before treating the repository as a fully validated release.

## Versioning policy

Until the first tagged release is published, changes should be recorded under `[Unreleased]` instead of being assigned a made-up version number.

When a release is tagged, use a versioned heading such as:

```markdown
## [1.0.0] - YYYY-MM-DD
```

Use the following categories where relevant:

- **Added** — new functionality.
- **Changed** — changes to existing behavior.
- **Deprecated** — functionality that will be removed later.
- **Removed** — deleted functionality.
- **Fixed** — bug fixes.
- **Security** — security improvements or disclosures that are safe to publish.

Do not include API keys, license keys, personal data, private vulnerability details, or exploit instructions in this file.
