# Mido Deep Search — AI Skill Definition

**Version:** 5.0.0 (Aligned with Worker V6.3 & Frontend V11)
**Author:** Mido AI Store
**Platform:** Cloudflare Workers + GitHub Pages

## 1. Overview
Mido Deep Search is a multi-agent, multi-stage research engine. It takes a user query, searches the web, cross-references data, detects risks, and outputs a structured, multilingual report in under 35 seconds.

## 2. Core Pipeline
The engine operates in a 5-stage pipeline orchestrated by `worker.js`:
1. **Source Search (Tavily):** Parallel search across up to 12 trusted domains.
2. **Thesis Build (Groq):** Synthesizes raw data into a core thesis using `openai/gpt-oss-120b`.
3. **Reduce & Rank (Groq):** Filters out noise, ranks sources by authority and recency.
4. **Risk Check (Groq):** Detects hallucinations, validates claims, and checks for missing evidence.
5. **Final Report (Groq):** Formats the final output in Markdown based on the requested skill format.

## 3. Supported Skills (15)
The `worker.js` dynamically adapts the prompt and output format based on the requested `skill` parameter:
`deep_search`, `summarize`, `compare`, `recommend`, `price_check`, `save`, `fact_check`, `pros_cons`, `buying_guide`, `local_price_check`, `source_audit`, `risk_check`, `extract_facts`, `outline`, `decision_matrix`.

## 4. Models & Providers
- **Search Engine:** Tavily API (`search_depth: advanced`, `max_results: 12`).
- **Primary LLM:** Groq (`openai/gpt-oss-120b`).
- **Fallback LLM:** Groq (`openai/gpt-oss-20b`) in case of rate limits or timeouts.
- **Licensing:** Gumroad API (for premium tier verification).

## 5. Visualizer Engine (V11)
The frontend (`index.html` and `bacterium-lite.html`) features a 3D biological visualization representing the AI agents.
- **Engine:** Three.js (v0.160.0 via Import Map).
- **Performance:** Mobile-optimized (15 organelles, 300 particles via `InstancedMesh`, 60fps).
- **State Sync:** The frontend sends `postMessage` events to the iframe to trigger the "explosion" (teardown) effect and highlight the active agent during the 5-stage search pipeline.

## 6. Languages
The frontend supports 8 languages via a dynamic translation dictionary (EN, AR, ES, FR, DE, ZH, JA, RU), passing the active language code to the Worker for LLM output generation.
