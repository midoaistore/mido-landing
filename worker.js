/**
*  * ============================================================================
* Mido AI Store - Deep Search Worker
* Version: V6.2
* Platform: Cloudflare Workers | KV: MIDO_KV
* APIs: Tavily (search) + Groq (LLM) + Gumroad (licensing)
* ============================================================================
*
* CHANGELOG V6.0 -> V6.2:
*  - [FIX]  Gumroad: product_permalink instead of product_id (CRITICAL)
*  - [NEW]  Response now includes `sources` and `logs` for frontend
*  - [NEW]  /stats includes total_visitors, today_searches, successful_trials,
*           failed_trials, remaining_today (plus legacy fields)
*  - [NEW]  /visit endpoint for explicit visit tracking
*  - [NEW]  visitor_id used as primary rate-limit identity (VPN-resistant)
*  - [FIX]  Removed duplicate visitors counter inside search (handled by /visit)
*  - [KEPT] All V6.0 features: Gumroad cache, admin key, refund/dispute,
*           Category Guard, Seed Candidates, Language Detection, Self-Check,
*           Two-pass prompt, Model fallback, Price Sanity
* ============================================================================
*/

const CONFIG = {
TAVILY_ENDPOINT: "https://api.tavily.com/search",
GROQ_ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
GUMROAD_VERIFY_ENDPOINT: "https://api.gumroad.com/v2/licenses/verify",
GROQ_MODEL: "openai/gpt-oss-120b",
GROQ_MODEL_SECONDARY: "openai/gpt-oss-20b",
MAX_QUERY_LENGTH: 500,
MAX_SEARCH_RESULTS: 12,
MAX_TOKENS: 4096,
MAX_TOKENS_PLAN: 600,
TEMPERATURE: 0.2,
TEMPERATURE_PLAN: 0.1,
RATE_LIMIT_FREE: 100,
RATE_LIMIT_PAID: 200,
LICENSE_CACHE_TTL: 86400,
REQUEST_TIMEOUT_MS: 45000
};

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

const LANG_STOPWORDS = {
en: ["the","and","is","are","was","were","with","for","from","this","that","which","have","has","been","will","would","can","could","should","best","price","battery"],
fr: ["le","la","les","et","est","sont","pour","avec","dans","sur","une","des","du","ce","cette","qui","que","mais","ou","meilleur","prix","batterie"],
de: ["der","die","das","und","ist","sind","mit","für","von","auf","eine","einen","einem","nicht","auch","aber","oder","beste","preis","akku"],
es: ["el","la","los","las","y","es","son","para","con","en","una","del","que","pero","o","mejor","precio","batería"],
pt: ["o","a","os","as","e","é","são","para","com","em","uma","do","que","mas","ou","melhor","preço","bateria"],
it: ["il","lo","la","i","gli","le","e","è","sono","per","con","in","una","del","che","ma","o","migliore","prezzo","batteria"]
};

const LANG_CHAR_PATTERNS = {
ar: /[\u0600-\u06FF]/g,
zh: /[\u4E00-\u9FFF]/g,
ja: /[\u3040-\u309F\u30A0-\u30FF]/g,
ko: /[\uAC00-\uD7AF]/g,
ru: /[\u0400-\u04FF]/g,
de: /[äöüßÄÖÜ]/g,
fr: /[àâçéèêëîïôûùüÿœæÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆ]/g,
es: /[ñ¿¡Ñ]/g,
pt: /[ãõçÃÕÇ]/g
};

function detectLanguage(text, fallback = "en") {
if (!text || typeof text !== "string") return fallback;
const sample = text.slice(0, 800);
const charScores = {};
for (const [lang, re] of Object.entries(LANG_CHAR_PATTERNS)) {
const matches = sample.match(re);
charScores[lang] = matches ? matches.length : 0;
}
for (const lang of ["ar", "zh", "ja", "ko", "ru"]) {
if (charScores[lang] >= 5) return lang;
}
const lower = sample.toLowerCase();
const words = lower.split(/[\s\p{P}]+/u).filter(Boolean);
const wordSet = new Set(words);
const scores = {};
for (const [lang, stop] of Object.entries(LANG_STOPWORDS)) {
let s = 0;
for (const w of stop) if (wordSet.has(w)) s += 2;
if (LANG_CHAR_PATTERNS[lang]) {
const m = sample.match(LANG_CHAR_PATTERNS[lang]);
if (m) s += m.length;
}
scores[lang] = s;
}
let bestLang = fallback, bestScore = 0;
for (const [lang, score] of Object.entries(scores)) {
if (score > bestScore) { bestScore = score; bestLang = lang; }
}
return bestScore < 4 ? fallback : bestLang;
}

// ============================================================================
// CATEGORY GUARD
// ============================================================================

const CATEGORY_BLACKLIST_PATTERNS = [
/\b(wired|studio monitor|monitor speaker|monitor speakers)\b/i,
/\b(usb headset|telephony headset|call center headset|blackwire)\b/i,
/\b(over[- ]ear|on[- ]ear|full[- ]size)\b/i,
/\b(enc[- ]only|environmental noise cancellation|call noise cancellation)\b/i,
/\b(speaker|speakers|soundbar)\b/i
];

const SEED_CANDIDATES = [
"EarFun Air Pro 4", "EarFun Air Pro 4+", "Soundcore Liberty 4 NC",
"Soundcore Space A40", "Nothing Ear (a)", "Nothing Ear (2024)",
"CMF Buds Pro 2", "QCY MeloBuds Pro", "QCY HT05", "Baseus Bowie MA10",
"Baseus Bowie M2s", "Edifier NeoBuds Pro 2", "JBL Live Beam 3",
"JBL Tour Pro 3", "1MORE Aero", "1MORE ComfoBuds Pro 2",
"Anker Soundcore Life P3i", "Realme Buds Air 6 Pro",
"Xiaomi Redmi Buds 6 Pro", "Huawei FreeBuds 6i"
];

// ============================================================================

const SKILL_CONFIG = {
  deep_search: {goal: "Run a complete evidence-based research report."},
  summarize: {goal: "Compress the evidence into a concise, faithful summary."},
  compare: {goal: "Compare the strongest valid options against the user's criteria."},
  recommend: {goal: "Rank options and give one transparent recommendation with trade-offs."},
  price_check: {goal: "Audit sourced prices, currency, date, and availability without conversion."},
  save: {goal: "Produce a clean complete report suitable for saving."},
  fact_check: {goal: "Check important claims against sources and label their status."},
  pros_cons: {goal: "Present a balanced evidence-based pros and cons analysis."},
  buying_guide: {goal: "Create a practical buying guide from criteria to final choice."},
  local_price_check: {goal: "Focus on local availability and locally sourced prices; never invent or convert."},
  source_audit: {goal: "Audit source quality, relevance, recency, independence, and conflicts."},
  risk_check: {goal: "Identify limitations, risks, missing evidence, and failure conditions."},
  extract_facts: {goal: "Extract only verifiable facts and mark missing facts as unverified."},
  outline: {goal: "Create a clear structured outline using only supported information."},
  decision_matrix: {goal: "Build a transparent decision matrix with criteria, evidence, and scoring rationale."}
};
function normalizeSkill(value) {
  const key = String(value || "deep_search").toLowerCase().replace(/[^a-z_]/g, "").slice(0, 32);
  return Object.prototype.hasOwnProperty.call(SKILL_CONFIG, key) ? key : "deep_search";
}
function buildSkillDirective(skill) {
  const cfg = SKILL_CONFIG[skill] || SKILL_CONFIG.deep_search;
  return `SELECTED SKILL: ${skill}\nSKILL OBJECTIVE: ${cfg.goal}\nDo not drift into a different report type. Preserve all evidence, citation, price, language, and uncertainty rules.`;
}
function buildOutputFormat(skill) {
  const formats = {
    summarize: `## Short Summary\n5-7 concise bullets with citations [n].\n\n## Evidence Notes\nOnly the most important supporting facts, with [n].\n\n## Caveats\nMissing or conflicting evidence.`,
    compare: `## Short Summary\n3 lines max.\n\n## Comparison Table\n| Option | Criteria | Sourced Price | Strengths | Weaknesses | Sources |\n|---|---|---|---|---|---|\n\n## Verdict\nExplain the ranking and trade-offs with [n].\n\n## Caveats\nUnverified or conflicting data.`,
    recommend: `## Short Summary\n3 lines max.\n\n## Ranked Options\nList the ranking and decision criteria with [n].\n\n## Final Recommendation\nOne clear pick, why it wins, and what it does not satisfy.\n\n## Caveats\nRisks and missing evidence.`,
    price_check: `## Short Summary\n3 lines max.\n\n## Price Table\n| Option | Price as sourced | Currency | Date/availability | Source |\n|---|---|---|---|---|\n\n## Price Findings\nNever convert or estimate. Use unverified when needed.\n\n## Caveats`,
    local_price_check: `## Short Summary\n3 lines max.\n\n## Local Availability and Price Table\n| Option | Local price as sourced | Currency | Seller/market | Date | Sources |\n|---|---|---|---|---|---|\n\n## Local Market Findings\nNo conversion or invented local prices.\n\n## Caveats`,
    fact_check: `## Claims Checked\n| Claim | Status: supported/contradicted/unverified | Evidence | Sources |\n|---|---|---|---|\n\n## Overall Assessment\n\n## Caveats`,
    pros_cons: `## Short Summary\n3 lines max.\n\n## Comparison Table\n| Option | Pros | Cons | Evidence |\n|---|---|---|---|\n\n## Balanced Conclusion\n\n## Caveats`,
    buying_guide: `## Short Summary\n3 lines max.\n\n## What to Look For\n\n## Options Table\n| Option | Best for | Sourced Price | Strengths | Trade-offs | Sources |\n|---|---|---|---|---|---|\n\n## Final Recommendation\n\n## Caveats`,
    source_audit: `## Source Audit\n| Source | Relevance | Authority | Recency | Independence | Notes |\n|---|---|---|---|---|---|\n\n## Evidence Conclusion\n\n## Caveats`,
    risk_check: `## Risk Summary\n\n## Risk Register\n| Risk or limitation | Evidence | Severity | Mitigation | Sources |\n|---|---|---|---|---|\n\n## Recommendation Under Risk\n\n## Caveats`,
    extract_facts: `## Verified Facts\n- fact [n]\n\n## Unverified or Conflicting Facts\n- item [n]\n\n## Source Notes`,
    outline: `## Research Outline\n1. Topic and scope [n]\n2. Key criteria [n]\n3. Evidence sections [n]\n4. Decision or conclusion [n]\n\n## Caveats`,
    decision_matrix: `## Decision Criteria\n\n## Decision Matrix\n| Option | Criterion | Evidence | Assessment | Sources |\n|---|---|---|---|---|\n\n## Decision\nExplain the choice and weighting transparently.\n\n## Caveats`
  };
  return formats[skill] || `## Short Summary\n(3 lines max)\n\n## Comparison Table\n| Option | Price as sourced | Key criteria | Sources |\n|---|---|---|---|\n\n## Key Findings\n- finding [n]\n\n## Final Recommendation\nOne clear pick or explicit no full match.\n\n## Caveats\nUnverified specs, price conflicts, and source limitations.`;
}

// PROMPTS
// ============================================================================

function buildPlanPrompt(query, lang, skill) {
return `You are a research planner. The user asked (in ${lang}):
"""
${query}
"""

Before writing a full report, produce a SHORT plan (max 8 bullet points).

${buildSkillDirective(skill)}

Plan according to the selected skill:
1. Which product categories to include and exclude.
2. Which 4-6 specific criteria to verify.
3. Which known models to check first.
4. What "recommendation" means for this query.

Seed candidates: ${SEED_CANDIDATES.slice(0, 12).join(", ")}

Output ONLY the plan, under 150 words.`;
}

function buildReportPrompt(query, lang, country, plan, skill) {
const seedList = SEED_CANDIDATES.map((c, i) => `${i + 1}. ${c}`).join("\n");
return `You are "Mido Deep Search", a rigorous product-research analyst.

USER QUERY (verbatim, in ${lang}):
"""
${query}
"""

SEARCH PLAN:
"""
${plan}
"""

${buildSkillDirective(skill)}

================================================================
CRITICAL RULES — VIOLATION = FAILED OUTPUT
================================================================

[RULE 1 — CATEGORY GUARD]
Identify the exact category requested by the user and include only items in that category.
If the query specifically requests TRUE WIRELESS STEREO (TWS) earbuds with ANC:
- ANC must be EXPLICITLY stated in source specs or a reputable review.
- NEVER infer ANC from a product name.
- ENC-only is NOT ANC. Exclude.
For other categories, do not force earbuds or ANC into the report. Exclude irrelevant products.

[RULE 2 — PRICE SANITY]
Real ANC TWS typically cost >= $25 USD.
If < $25 and claims ANC → flag "⚠️ price-category mismatch".

[RULE 3 — EVIDENCE v2]
- NEVER invent prices/specs/models.
- NEVER convert currencies.
- NEVER create price range wider than 3x.
- Unknown → "unverified", do NOT guess.

[RULE 4 — SOURCE DIVERSITY]
- Each recommended product: >= 2 independent sources.
- Preferred: RTINGS, SoundGuys, TechRadar, What Hi-Fi, GSMArena, official pages.

[RULE 5 — RECOMMENDATION QUALITY GATE]
#1 pick MUST satisfy ALL user criteria. If none does, state:
"No product fully meets all criteria. Best partial match: <X>, missing: <Y>."

[RULE 6 — SEED CANDIDATES]
${seedList}

[RULE 7 — LANGUAGE]
Respond ENTIRELY in ${lang}.

[RULE 8 — OUTPUT FORMAT — STRICT]
${buildOutputFormat(skill)}

================================================================
Now produce the FULL report. Every claim must cite [n].
================================================================`;
}

function buildSelfCheckPrompt(lang, skill) {
return `You are a QA reviewer. Review the report below.
Reply with ONLY "PASS" if all checks pass, OR a short list of failures.

CHECKLIST:
1. The report follows the selected skill objective: ${buildSkillDirective(skill)}.
2. Category matches the user query; do not force an unrelated product category.
3. All products are TWS in-ear earbuds with verified ANC only when the query requests that category.
4. No price is under $25 without a warning when the item claims ANC TWS.
5. No price range is wider than 3x.
6. Each recommended product has >= 2 sources.
7. Recommendation satisfies all criteria or states what is missing.
8. Response is entirely in ${lang}.
9. Output follows the selected skill format.

If any check fails, list the failure codes (e.g., "FAIL-1, FAIL-4").`;
}

// ============================================================================
// GROQ
// ============================================================================

async function groqComplete(env, messages, options = {}) {
const model = options.model || CONFIG.GROQ_MODEL;
const body = {
model,
messages,
temperature: options.temperature ?? CONFIG.TEMPERATURE,
max_tokens: options.max_tokens ?? CONFIG.MAX_TOKENS,
top_p: 0.9
};
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);
try {
const res = await fetch(CONFIG.GROQ_ENDPOINT, {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${env.GROQ_API_KEY}`
},
body: JSON.stringify(body),
signal: controller.signal
});
clearTimeout(timeout);
if (!res.ok) {
const txt = await res.text();
throw new Error(`Groq ${res.status}: ${txt.slice(0, 300)}`);
}
const data = await res.json();
const content = data?.choices?.[0]?.message?.content;
if (!content) throw new Error("Groq: empty response");
return content;
} catch (e) {
clearTimeout(timeout);
throw e;
}
}

async function groqCompleteWithFallback(env, messages, options = {}) {
const primaryModel = env.GROQ_MODEL || CONFIG.GROQ_MODEL;
const secondaryModel = env.GROQ_MODEL_SECONDARY || CONFIG.GROQ_MODEL_SECONDARY;
try {
return await groqComplete(env, messages, { ...options, model: primaryModel });
} catch (primaryErr) {
console.warn("Primary Groq failed:", primaryErr.message);
try {
return await groqComplete(env, messages, { ...options, model: secondaryModel });
} catch (secondaryErr) {
throw new Error(`Both Groq models failed. Primary: ${primaryErr.message} | Secondary: ${secondaryErr.message}`);
}
}
}

// ============================================================================
// TAVILY
// ============================================================================

async function tavilySearch(env, query) {
const body = {
api_key: env.TAVILY_API_KEY,
query,
search_depth: "advanced",
include_answer: true,
include_raw_content: false,
max_results: CONFIG.MAX_SEARCH_RESULTS
};
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);
try {
const res = await fetch(CONFIG.TAVILY_ENDPOINT, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
signal: controller.signal
});
clearTimeout(timeout);
if (!res.ok) {
const txt = await res.text();
throw new Error(`Tavily ${res.status}: ${txt.slice(0, 200)}`);
}
const data = await res.json();
return {
results: Array.isArray(data.results) ? data.results : [],
answer: data.answer || ""
};
} catch (e) {
clearTimeout(timeout);
throw e;
}
}

// ============================================================================
// GUMROAD LICENSE VERIFICATION
// ============================================================================

async function verifyGumroadLicense(env, licenseKey) {
if (!env.GUMROAD_PRODUCT_ID) {
return { valid: false, error: "gumroad_not_configured" };
}
// V6.2 FIX: use product_permalink (dtqpvka), not product_id
const body = new URLSearchParams({
product_permalink: env.GUMROAD_PRODUCT_ID,
license_key: licenseKey,
increment_uses_count: "false"
});
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);
try {
const res = await fetch(CONFIG.GUMROAD_VERIFY_ENDPOINT, {
method: "POST",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body: body.toString(),
signal: controller.signal
});
clearTimeout(timeout);
const data = await res.json();
if (!data.success) {
return { valid: false, error: data.message || "invalid_license" };
}
if (data.purchase.refunded) return { valid: false, error: "license_refunded" };
if (data.purchase.disputed) return { valid: false, error: "license_disputed" };
if (data.purchase.chargebacked) return { valid: false, error: "license_chargebacked" };
return {
valid: true,
email: data.purchase.email,
purchase_id: data.purchase.id,
product_name: data.purchase.product_name
};
} catch (e) {
clearTimeout(timeout);
console.error("Gumroad verification error:", e);
return { valid: false, error: "gumroad_network_error" };
}
}

async function resolveLicense(env, key) {
if (!key) return { type: "none", valid: false };
if (env.ADMIN_KEY && key === env.ADMIN_KEY) {
return { type: "admin", valid: true, quota: Infinity };
}
const cacheKey = `license:${key}`;
try {
const cached = await env.MIDO_KV.get(cacheKey);
if (cached) {
const parsed = JSON.parse(cached);
if (parsed.valid) {
return { type: "paid", valid: true, quota: CONFIG.RATE_LIMIT_PAID, ...parsed };
}
}
} catch (e) {
console.warn("License cache read error:", e);
}
const result = await verifyGumroadLicense(env, key);
if (!result.valid) return { type: "invalid", valid: false, error: result.error };
try {
await env.MIDO_KV.put(cacheKey, JSON.stringify(result), {
expirationTtl: CONFIG.LICENSE_CACHE_TTL
});
} catch (e) {
console.warn("License cache write error:", e);
}
return { type: "paid", valid: true, quota: CONFIG.RATE_LIMIT_PAID, ...result };
}

// ============================================================================
// HELPERS
// ============================================================================

function buildCorsHeaders(origin, allowedOrigins) {
const allowed = (allowedOrigins || "").split(",").map((s) => s.trim()).filter(Boolean);
const isAllowed =
allowed.length === 0 || allowed.includes("*") || allowed.includes(origin) || origin === "";
return {
"Access-Control-Allow-Origin": isAllowed ? origin || "*" : "null",
"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, X-Visitor-Id, X-Visitor-ID, X-Country, X-Lang, X-Admin-Key-2"
"Access-Control-Max-Age": "86400",
Vary: "Origin"
};
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
return new Response(JSON.stringify(data), {
status,
headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders }
});
}

function escapeHtml(str) {
return String(str)
.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function sanitizeQuery(q) {
if (typeof q !== "string") return "";
return q.trim().slice(0, CONFIG.MAX_QUERY_LENGTH);
}

// ============================================================================
// RATE LIMITING (visitor_id preferred, IP fallback)
// ============================================================================

async function checkRateLimit(env, identity, quota) {
if (quota === Infinity) return { allowed: true, remaining: Infinity, limit: Infinity };
const today = new Date().toISOString().slice(0, 10);
const key = `rate:${today}:${identity}`;
try {
const current = await env.MIDO_KV.get(key);
const count = current ? parseInt(current, 10) : 0;
if (count >= quota) {
return { allowed: false, remaining: 0, limit: quota };
}
await env.MIDO_KV.put(key, String(count + 1), { expirationTtl: 86400 * 2 });
return { allowed: true, remaining: quota - count - 1, limit: quota };
} catch (e) {
console.error("Rate limit KV error:", e);
return { allowed: true, remaining: -1, limit: quota };
}
}

// ============================================================================
// STATS
// ============================================================================

async function incrementStat(env, field) {
try {
const today = new Date().toISOString().slice(0, 10);
const key = `stats:${today}:${field}`;
const current = await env.MIDO_KV.get(key);
const count = current ? parseInt(current, 10) : 0;
await env.MIDO_KV.put(key, String(count + 1), { expirationTtl: 86400 * 30 });
return count + 1;
} catch (e) {
console.error("Stat increment error:", e);
return 0;
}
}

async function getStats(env) {
try {
const today = new Date().toISOString().slice(0, 10);
const [v, s, ok, fail] = await Promise.all([
env.MIDO_KV.get(`stats:${today}:visitors`),
env.MIDO_KV.get(`stats:${today}:searches`),
env.MIDO_KV.get(`stats:${today}:success`),
env.MIDO_KV.get(`stats:${today}:failure`)
]);
const visitors = parseInt(v || "0", 10);
const searches = parseInt(s || "0", 10);
const success = parseInt(ok || "0", 10);
const failure = parseInt(fail || "0", 10);
return {
date: today,
// New field names (V6.2)
total_visitors: visitors,
today_searches: searches,
successful_trials: success,
failed_trials: failure,
remaining_today: Math.max(0, CONFIG.RATE_LIMIT_FREE - searches),
// Legacy field names (V6.0 compatible)
visitors,
searches,
success,
failure
};
} catch (e) {
return { error: "stats_unavailable" };
}
}

// ============================================================================
// CONTEXT BUILDER
// ============================================================================

function buildSearchContext(results, tavilyAnswer) {
let ctx = "";
if (tavilyAnswer) {
ctx += `TAVILY SUMMARY (reference only):\n${tavilyAnswer}\n\n---\n\n`;
}
if (!results || results.length === 0) {
return ctx + "NO SEARCH RESULTS AVAILABLE.";
}
ctx += results.map((r, i) => {
const idx = i + 1;
const title = r.title || "Untitled";
const url = r.url || "";
const content = (r.content || "").slice(0, 700);
return `[${idx}] ${title}\nURL: ${url}\nSNIPPET: ${content}`;
}).join("\n\n---\n\n");
return ctx;
}

// ============================================================================
// POST-FILTERS
// ============================================================================

function filterBlacklistedProducts(answer, query = "") {
if (!/(\bearbuds?\b|\bTWS\b|\btrue wireless\b|\bANC\b|\bnoise[- ]cancell?ing\b)/i.test(query)) return answer;
if (!answer) return answer;
return answer.split("\n").filter((line) => {
if (!line.trim().startsWith("|")) return true;
if (/\|\s*-+\s*\|/.test(line)) return true;
for (const p of CATEGORY_BLACKLIST_PATTERNS) {
if (p.test(line)) return false;
}
return true;
}).join("\n");
}

function flagPriceSanityIssues(answer) {
if (!answer) return answer;
return answer.replace(
/(\|\s*[^|]*?)(\$\s*(\d{1,2})\.\d{2})([^|]*\|)/g,
(m, before, priceStr, priceNum, after) => {
const price = parseFloat(priceNum);
if (price < 25) return `${before}${priceStr} ⚠️${after}`;
return m;
}
);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default {
async fetch(request, env, ctx) {
const url = new URL(request.url);
const origin = request.headers.get("Origin") || "";
const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGINS);

if (request.method === "OPTIONS") {
return new Response(null, { status: 204, headers: corsHeaders });
}

// ---- GET /stats ----
if (url.pathname === "/stats" && request.method === "GET") {
return jsonResponse(await getStats(env), 200, corsHeaders);
}

// ---- POST /visit ----
if (url.pathname === "/visit" && request.method === "POST") {
await incrementStat(env, "visitors");
return jsonResponse({ ok: true, success: true }, 200, corsHeaders);
}

// ---- GET /spider (debug) ----
if (url.pathname === "/spider" && request.method === "GET") {
const ua = request.headers.get("User-Agent") || "";
const ip = request.headers.get("CF-Connecting-IP") || "unknown";
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Spider</title></head>
<body style="background:#0b0f14;color:#e8eef7;font-family:sans-serif;padding:20px">
<h2>🕷️ Mido Spider</h2>
<p><strong>IP:</strong> ${escapeHtml(ip.slice(0, 50))}</p>
<p><strong>UA:</strong> ${escapeHtml(ua.slice(0, 200))}</p>
<p><strong>Time:</strong> ${new Date().toISOString()}</p>
<p><strong>Worker:</strong> v6.2</p></body></html>`;
return new Response(html, {
status: 200,
headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
});
}

// ---- POST / (main search) ----
if (url.pathname === "/" || url.pathname === "") {
if (request.method !== "POST") {
return jsonResponse({ error: "method_not_allowed" }, 405, corsHeaders);
}

const clientKey = request.headers.get("X-Admin-Key") || "";
const ip = request.headers.get("CF-Connecting-IP") || "unknown";

// ---- PARSE BODY (before identity, to read visitor_id) ----
let body;
try { body = await request.json(); }
catch (e) { return jsonResponse({ error: "invalid_json" }, 400, corsHeaders); }

const query = sanitizeQuery(body?.query || "");
const country = String(body?.country || "US").slice(0, 4);
const clientLang = String(body?.lang || "en").slice(0, 8);
const visitorId = String(body?.visitor_id || "").slice(0, 64);
const skill = normalizeSkill(body?.skill || "deep_search");

if (!query) return jsonResponse({ error: "empty_query" }, 400, corsHeaders);

// ---- IDENTITY + LICENSE RESOLUTION ----
let identity, quota, userType, licenseMeta = null;

if (clientKey) {
const license = await resolveLicense(env, clientKey);
if (!license.valid) {
return jsonResponse({
error: "invalid_license",
message: license.error || "Invalid or expired license key.",
code: "LICENSE_INVALID"
}, 401, corsHeaders);
}
if (license.type === "admin") {
identity = "admin";
quota = Infinity;
userType = "admin";
} else {
identity = `paid:${clientKey.slice(-12)}`;
quota = CONFIG.RATE_LIMIT_PAID;
userType = "paid";
licenseMeta = {
email: license.email || null,
purchase_id: license.purchase_id || null
};
}
} else {
// V6.2: prefer visitor_id (VPN-resistant), fall back to IP
identity = visitorId ? `v:${visitorId}` : `ip:${ip}`;
quota = CONFIG.RATE_LIMIT_FREE;
userType = "free";
}

// ---- RATE LIMIT ----
const rl = await checkRateLimit(env, identity, quota);
if (!rl.allowed) {
return jsonResponse({
error: "rate_limit_exceeded",
message: userType === "paid"
? `Daily limit of ${CONFIG.RATE_LIMIT_PAID} searches reached. Resets at midnight UTC.`
: `Free daily limit of ${CONFIG.RATE_LIMIT_FREE} searches reached. Purchase a license for ${CONFIG.RATE_LIMIT_PAID} searches/day.`,
remaining: 0,
limit: rl.limit,
user_type: userType,
upgrade_url: userType === "free" ? (env.GUMROAD_URL || null) : null
}, 429, corsHeaders);
}

const detectedLang = detectLanguage(query, clientLang);
const effectiveLang = detectedLang !== clientLang ? detectedLang : clientLang;

await incrementStat(env, "searches");
// NOTE: visitors are incremented by /visit endpoint, not here

const startedAt = Date.now();

try {
// 1) Search
const { results, answer: tavilyAnswer } = await tavilySearch(env, query);
const context = buildSearchContext(results, tavilyAnswer);

// 2) Plan pass
let plan = "";
try {
plan = await groqCompleteWithFallback(env, [
{ role: "system", content: buildPlanPrompt(query, effectiveLang, skill) },
{ role: "user", content: `SEARCH SNIPPETS:\n\n${context.slice(0, 6000)}\n\nProduce the short plan.` }
], { temperature: CONFIG.TEMPERATURE_PLAN, max_tokens: CONFIG.MAX_TOKENS_PLAN });
} catch (e) {
console.warn("Plan pass failed:", e.message);
plan = "(plan unavailable)";
}

// 3) Report pass
let answer = await groqCompleteWithFallback(env, [
{ role: "system", content: buildReportPrompt(query, effectiveLang, country, plan, skill) },
{ role: "user", content: `SEARCH RESULTS:\n\n${context}\n\nNow produce the final report. Cite [n].` }
], { temperature: CONFIG.TEMPERATURE, max_tokens: CONFIG.MAX_TOKENS });

// 4) Self-check
let selfCheck = "";
try {
selfCheck = await groqCompleteWithFallback(env, [
{ role: "system", content: buildSelfCheckPrompt(effectiveLang, skill) },
{ role: "user", content: `REPORT TO REVIEW:\n\n${answer}\n\nReply "PASS" or list failures.` }
], { temperature: 0, max_tokens: 400 });
} catch (e) {
console.warn("Self-check failed:", e.message);
selfCheck = "SKIPPED";
}

const selfCheckClean = (selfCheck || "").trim().toUpperCase();
if (selfCheckClean.startsWith("FAIL")) {
try {
answer = await groqCompleteWithFallback(env, [
{ role: "system", content: `Fix a report based on QA failures. Keep same structure/language.` },
{ role: "user", content: `ORIGINAL:\n\n${answer}\n\nQA FAILURES:\n${selfCheck}\n\nProduce FIXED report.` }
], { temperature: CONFIG.TEMPERATURE, max_tokens: CONFIG.MAX_TOKENS });
} catch (e) {
console.warn("Fix pass failed:", e.message);
}
}

// 5) Post-filters
answer = filterBlacklistedProducts(answer, query);
answer = flagPriceSanityIssues(answer);

const elapsed = Date.now() - startedAt;
const reportId = crypto.randomUUID();
const reportCreatedAt = new Date().toISOString();
await incrementStat(env, "success");

// V6.2: structured sources for frontend
const sources = results.map((r, i) => ({
id: i + 1,
title: String(r.title || "").slice(0, 200),
url: String(r.url || ""),
snippet: String(r.content || "").slice(0, 300),
score: typeof r.score === "number" ? r.score : null
}));

// V6.2: pipeline logs (all done by the time we respond)
const logs = [
{ stage: 1, status: "done", name: "Source Search", count: results.length },
{ stage: 2, status: "done", name: "Thesis Build" },
{ stage: 3, status: "done", name: "Reduce & Rank" },
{ stage: 4, status: "done", name: "Risk Check" },
{ stage: 5, status: "done", name: "Final Report" }
];

return jsonResponse({
// V6.2 canonical names
ok: true,
report_id: reportId,
created_at: reportCreatedAt,
answer: answer,
sources: sources,
logs: logs,
// V6.0 legacy names (backward compat with 700-line HTML)
success: true,
deep_answer: answer,
top_sources: sources,
meta: {
query,
lang: effectiveLang,
lang_detected: detectedLang,
lang_client: clientLang,
lang_mismatch: detectedLang !== clientLang,
country,
skill,
sources_count: results.length,
elapsed_ms: elapsed,
remaining_quota: rl.remaining,
quota_limit: rl.limit,
user_type: userType,
license: licenseMeta,
is_admin: userType === "admin",
worker_version: "6.2",
self_check: selfCheckClean.slice(0, 200)
}
}, 200, corsHeaders);

} catch (e) {
await incrementStat(env, "failure");
console.error("Search error:", e);
return jsonResponse({
error: "search_failed",
message: e.message || "Unknown error",
remaining_quota: rl.remaining
}, 500, corsHeaders);
}
}

return jsonResponse({ error: "not_found" }, 404, corsHeaders);
}
};
