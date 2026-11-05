# Mido Deep Search

> **Do not collect dozens of links. Build a decision you can defend.**
>
> Mido Deep Search turns an ordinary question into a structured, source-backed report with clear comparisons, visible risks, and prices shown exactly as found in the source—without invented estimates.

<p align="center">
  <a href="https://midoaistore.github.io/mido-landing/"><strong>Try the live demo</strong></a> ·
  <a href="https://midoaistore.gumroad.com/l/dtqpvka"><strong>Get full access</strong></a> ·
  <a href="https://github.com/midoaistore/mido-landing/issues">Report an issue</a>
</p>

<p align="center">
  <a href="https://github.com/midoaistore/mido-landing/stargazers">
    <img src="https://img.shields.io/github/stars/midoaistore/mido-landing?style=for-the-badge&logo=github&label=Stars" alt="GitHub stars">
  </a>
  <a href="https://img.shields.io/badge/license-MIT-7c3aed?style=for-the-badge">
    <img src="https://img.shields.io/badge/license-MIT-7c3aed?style=for-the-badge" alt="MIT license">
  </a>
</p>

![Mido Deep Search report preview](report-preview-en-hud.png)

## Why Mido?

Search engines give you pages. AI tools give you answers. Mido is designed to give you a **reviewable path from question to decision**.

Try a request like this:

> Find the best programming laptop under $1,500. I want a real comparison with sources, current prices, and purchase risks.

Mido searches live sources, organizes the evidence, compares alternatives, separates verified information from missing evidence, and produces a report you can copy, save, download, share, or print as a PDF.

> **The goal is not to make the report sound confident. The goal is to show you why the conclusion was reached.**

## Start in under a minute

1. Open the [live demo](https://midoaistore.github.io/mido-landing/).
2. Choose your language and research skill.
3. Write a specific question with your budget, country, or comparison criteria.
4. Click **Search**.
5. Review the sources and report, then copy, download, save, or share it.

### Try one of these prompts

```text
Best wireless noise-cancelling headphones under $150, using reliable sources only.
```

```text
Compare the MacBook Air and MacBook Pro for programming, including the limitations that could make the recommendation unsuitable.
```

```text
Is the current price of this product verified? Show the currency, date, and source. Do not convert it to another currency.
```

## A five-stage research pipeline

Mido does not rely on a decorative timer alone. The interface visualizes the workflow through five protection rings and the interactive `bacterium-lite.html` engine.

```mermaid
flowchart LR
    A[User question] --> B[Source search]
    B --> C[Thesis build]
    C --> D[Reduce and rank evidence]
    D --> E[Risk assessment]
    E --> F[Final report]
```

| Stage | What it does |
|---|---|
| **1 — Source Search** | Retrieves live Tavily results and builds the initial evidence set. |
| **2 — Thesis Build** | Identifies what must be verified before the report is written. |
| **3 — Reduce and Rank** | Organizes options and evidence around the user’s criteria. |
| **4 — Risk Assessment** | Exposes limitations, conflicts, missing data, and failure conditions. |
| **5 — Final Report** | Produces structured findings with citations, sources, and uncertainty notes. |

While the search is running, the biological visualizer reacts to the stages: completed balls remain illuminated, the current ball is emphasized, and the light moves progressively through all fifteen organelles.

## 15 skills — one report, multiple perspectives

You can begin with deep research and then reuse the same report and sources to apply another skill instead of starting a completely new search.

| ID | Purpose |
|---|---|
| `deep_search` | Run a complete evidence-based research report. |
| `summarize` | Compress the evidence while preserving the important points. |
| `compare` | Compare valid options in a structured format. |
| `recommend` | Rank alternatives and provide a transparent recommendation. |
| `price_check` | Audit price, currency, date, and availability. |
| `save` | Produce a clean report suitable for saving. |
| `fact_check` | Classify claims as supported, contradicted, or unverified. |
| `pros_cons` | Present a balanced analysis of strengths and weaknesses. |
| `buying_guide` | Build a practical guide from criteria to final choice. |
| `local_price_check` | Focus on local availability and locally sourced prices. |
| `source_audit` | Evaluate source quality, relevance, recency, and independence. |
| `risk_check` | Record risks, limitations, and failure conditions. |
| `extract_facts` | Extract verifiable facts and label unsupported information. |
| `outline` | Create a clear outline for the topic and report. |
| `decision_matrix` | Build a decision matrix with criteria and transparent reasoning. |

> A skill is not just a label. Each skill changes the report objective and output structure.

## Evidence before eloquence

Mido is designed to say **“unverified”** when the evidence is insufficient instead of filling the gap with a confident-sounding guess.

- No invented prices, specifications, or availability.
- Prices remain in the currency used by the source unless an explicit conversion policy is enabled.
- Unsupported claims are labeled clearly.
- Product categories are not forced onto unrelated questions.
- Sources and citations are checked before they are shown to the user.
- Tavily and Groq keys never belong in the browser or inside the HTML source.

## Current capabilities

- Multilingual RTL and LTR interface.
- Five visual research stages with an interactive biological engine.
- Fifteen stable research skill IDs shared by the frontend and Worker.
- Structured sources and inline report citations.
- Copy, download, save, share, and print actions.
- Local report library for returning to previous reports.
- Browser printing with **Save as PDF** support.
- Word-compatible export generated locally in the browser.
- Privacy, usage, and safety policies built into the page.
- Gumroad license verification and Cloudflare KV caching and counters.

## Technical architecture

```text
Browser
├── index.html
│   ├── Search interface and translations
│   ├── Skills and report rendering
│   ├── Local report library
│   └── Search-stage synchronization
│
├── bacterium-lite.html
│   └── Three.js visual engine with fifteen organelles
│
└── Cloudflare Worker
    ├── POST /                 Search and report generation
    ├── GET  /stats            Frontend statistics, depending on deployment settings
    ├── POST /visit            Visit tracking
    ├── Tavily                 Live web sources
    ├── Groq                   Planning, report generation, and fallback
    ├── Gumroad                License verification
    └── Cloudflare KV          License cache and usage counters
```

## Repository layout

```text
index.html                 Static frontend
bacterium-lite.html        Interactive biological visualizer
worker.js                  Cloudflare Worker API
wrangler.toml              Worker deployment configuration
SETUP.md                   Setup and deployment guide
SKILL.md                   Reusable skill definition
report-preview-en-hud.png  Report preview image
```

## Run the frontend locally

Start a simple static server from the repository root:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Do not open `index.html` directly through `file://` when testing the iframe and network requests. Some browsers block these operations for security reasons.

## Configure the Cloudflare Worker

### Requirements

- A Cloudflare account.
- A current Wrangler installation.
- A Worker connected to a KV namespace.
- A Tavily account.
- A Groq account.
- Gumroad product details if license verification is enabled.

### Install Wrangler and authenticate

```bash
npm install
npx wrangler login
```

### Configure secrets

Never put provider keys in `index.html`, `wrangler.toml`, or GitHub. Add them as Cloudflare Worker Secrets:

```bash
npx wrangler secret put TAVILY_API_KEY
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put ADMIN_KEY
```

Public configuration such as the Gumroad URL and Worker settings may be placed in `wrangler.toml`. Provider keys and the admin key must remain secrets.

### Deploy

Run this from the repository root:

```bash
npx wrangler deploy
```

After deployment, update `WORKER_URL` in `index.html` if the Worker address has changed.

## Request and response contract

### Search request

```http
POST /
Content-Type: application/json
Origin: https://midoaistore.github.io
```

```json
{
  "query": "Best programming laptop under 1500 USD",
  "visitor_id": "v_example",
  "skill": "deep_search",
  "country": "US",
  "lang": "en"
}
```

### Short successful response

```json
{
  "ok": true,
  "report_id": "example-id",
  "answer": "...",
  "sources": [],
  "logs": [],
  "meta": {
    "skill": "deep_search",
    "sources_count": 0,
    "elapsed_ms": 0
  }
}
```

The frontend and Worker use the same skill IDs. If the contract changes, update both sides and test them together.

## Security and privacy

- Never pass `admin_key` through a URL.
- Never store API keys or the admin key in `localStorage` or `sessionStorage`.
- Never expose Tavily or Groq keys in browser code.
- Keep provider secrets inside Cloudflare Secrets.
- Allow only approved origins through CORS.
- Treat source snippets and model output as untrusted data.
- Validate source URLs before rendering them to users.
- Never put real secrets in Issues, Pull Requests, or screenshots.

Report security vulnerabilities through a private channel instead of publishing exploit details in a public Issue.

## Quick validation

Run this before deployment:

```bash
node --check worker.js
```

For the embedded JavaScript in the HTML page, extract the `<script>` blocks and validate them with Node as well. The check should fail when the page contains invalid JavaScript or malformed script tags.

## Usage and cost notes

Search quality, latency, quotas, and cost depend on Tavily, Groq, Cloudflare, Gumroad, and the Worker configuration. The project therefore does not promise unlimited usage independently of provider limits.

PDF export uses the browser print dialog; choose **Save as PDF**. Word export is a Word-compatible HTML document generated locally from the report.

## Why star the repository?

If Mido helped you turn scattered research into a clearer decision, please star the repository:

<p align="center">
  <a href="https://github.com/midoaistore/mido-landing/stargazers">
    <strong>⭐ Star Mido Deep Search on GitHub</strong>
  </a>
</p>

A star is more than a number. It helps the project reach researchers and developers who need a more accountable way to work with AI-assisted research.

> **If you tried a report, tell us what you researched. If you found a bug, open an Issue. If you like the direction, leave a star.**

## Contributing

Contributions are welcome. Before opening a Pull Request:

1. Run the syntax checks.
2. Do not include API keys or real secrets.
3. Preserve compatibility between the Worker and frontend fields.
4. Test both RTL and LTR when changing translations or direction behavior.
5. Explain what changed and how you tested it.

## License

Add an official `LICENSE` file before announcing the final license publicly. If MIT is the intended license, add the official MIT text and review its terms before redistribution or commercial use.

## Links

- [Live demo](https://midoaistore.github.io/mido-landing/)
- [Product page](https://midoaistore.gumroad.com/l/dtqpvka)
- [Issues](https://github.com/midoaistore/mido-landing/issues)
- [GitHub repository](https://github.com/midoaistore/mido-landing)
