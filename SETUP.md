# 🛠️ Mido Deep Search — Setup Guide
> ⚠️ **Note (v1.0):** The `?admin_key=` URL parameter is deprecated. Enter the admin key only via the Settings panel (⚙️). A future release will remove URL handling entirely. 
This guide walks you through deploying the Cloudflare Worker (backend) and the static frontend.

## Prerequisites

- Node.js and npm installed
- A Cloudflare account (free tier is sufficient)
- A static hosting service: GitHub Pages, Cloudflare Pages, Netlify, or Vercel
- API keys for: Tavily (search), Groq (LLM)
- Optional: Gumroad product permalink (only if you want license validation)

---

## 1. Backend — Cloudflare Worker

### 1.1 Install and log in

```bash
npm install -g wrangler
wrangler login
1.2 Create the KV namespace
wrangler kv namespace create MIDO_KV

Copy the returned id into wrangler.toml:
name = "mido-deepsearch"
main = "worker.js"
compatibility_date = "2023-10-01"

[[kv_namespaces]]
binding = "MIDO_KV"
id = "PASTE_YOUR_KV_NAMESPACE_ID"
1.3 Add secrets

Run each command below and paste the value when prompted. Secrets are encrypted and stored by Cloudflare — never commit them to GitHub
wrangler secret put TAVILY_API_KEY
wrangler secret put GROQ_API_KEY
wrangler secret put ADMIN_KEY
wrangler secret put ALLOWED_ORIGINS
wrangler secret put GUMROAD_PRODUCT_ID
Notes:

· ADMIN_KEY — generate a strong value, e.g. openssl rand -base64 32.
· ALLOWED_ORIGINS — your frontend origin exactly as it appears in the browser, with no trailing slash. Example: https://your-username.github.io.
· GUMROAD_PRODUCT_ID — optional. Skip if you do not need license validation.

1.4 Deploy
wrangler deploy
Note the deployed URL: https://<worker-name>.<your-subdomain>.workers.dev.

---

2. Frontend

2.1 Point the frontend at YOUR Worker

Open index.html and find:
const WORKER_API_URL = "";
Replace the empty string with your deployed Worker URL, for example:
const WORKER_API_URL = "https://mido-deepsearch.your-subdomain.workers.dev/";
This step is mandatory. If you leave it empty, the frontend will show a configuration error and will not send requests to the original author's Worker.

2.2 Deploy the static files

Upload the files to any static host:

· GitHub Pages: Settings → Pages → Deploy from branch → main → / (root)
· Cloudflare Pages, Netlify, or Vercel: drag and drop the folder
· Or open index.html directly in a browser — no build step required

Your site will be live at the URL provided by your host.

---

3. Admin Key — secure usage

· Enter the admin key only through the Settings panel (⚙️) in the UI.
· The key is sent as the X-Admin-Key request header and is never written to localStorage, sessionStorage, cookies, or the URL.
· The Worker does not accept the admin key via ?admin_key= query parameters.
· After reloading the page you will need to re-enter the key. This is intentional.

---

4. Testing

1. Test the Worker:
curl https://<your-worker-url>/stats
You should receive a JSON response with daily statistics.
2. Test the frontend: open your site, run a query, and confirm the 3D engine renders and the report completes. Typical time is 15–40 seconds depending on query complexity and network.

---

🆘 Troubleshooting

· CORS error — ALLOWED_ORIGINS must match your frontend origin exactly, including https:// and without a trailing slash.
· "Worker not configured" — edit WORKER_API_URL in index.html.
· Bacterium not showing — ensure bacterium-lite.html sits in the same folder as index.html; check the browser console for 404.
· Rate limit during testing — clear mido_visitor_id from Local Storage in your browser's developer tools.

---

🔐 If a secret was ever exposed

Rotate it immediately, even if you see no signs of misuse:
wrangler secret put TAVILY_API_KEY
wrangler secret put GROQ_API_KEY
wrangler secret put ADMIN_KEY
