# 🛠️ Mido Deep Search — Complete Setup Guide

This guide will walk you through deploying both the **Cloudflare Worker (Backend)** and the **GitHub Pages (Frontend)**.

## 📋 Prerequisites

Before you begin, ensure you have:
1. **Node.js** and **npm** installed.
2. A **Cloudflare Account** (Free tier is sufficient).
3. A **GitHub Account**.
4. API Keys for the following services:
   - [Tavily API](https://tavily.com/) (Search)
   - [Groq API](https://console.groq.com/) (LLM)
   - [Gumroad API](https://gumroad.com/) (Licensing - Optional)

---

## 1. Backend Setup (Cloudflare Worker)

### 1.1. Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

1.2. Configure wrangler.toml

Create or modify your wrangler.toml file in the root directory. Ensure you have a KV Namespace bound to your Worker for rate-limiting and stats.

```toml
name = "mido-deepsearch"
main = "worker.js"
compatibility_date = "2023-10-01"

[[kv_namespaces]]
binding = "MIDO_KV"
id = "your_kv_namespace_id_here" # Get this by running: wrangler kv:namespace create "MIDO_KV"
```

1.3. Add Environment Secrets (API Keys)

Run the following commands in your terminal to securely add your API keys. These will be encrypted and stored in Cloudflare.

```bash
wrangler secret put TAVILY_API_KEY
# Paste your Tavily API Key

wrangler secret put GROQ_API_KEY
# Paste your Groq API Key

wrangler secret put ADMIN_KEY
# Create a strong password (e.g., Mido_Admin_2025!)

wrangler secret put GUMROAD_PRODUCT_ID
# Paste your Gumroad permalink (e.g., "dtqpvka")

wrangler secret put ALLOWED_ORIGINS
# Add your frontend URL (e.g., "https://midoaistore.github.io")
```

1.4. Deploy the Worker

```bash
wrangler deploy
```

Take note of the deployed URL (e.g., https://mido-deepsearch.midoaistore.workers.dev).

---

2. Frontend Setup (GitHub Pages)

2.1. Update the Worker URL

Open index.html and search for the WORKER_API_URL constant. Update it with the URL of your deployed Worker:

```javascript
const WORKER_API_URL = "https://mido-deepsearch.midoaistore.workers.dev/";
```

2.2. Deploy to GitHub Pages

1. Push your code to a GitHub repository.
2. Go to Settings > Pages.
3. Under "Build and deployment", select Deploy from a branch.
4. Select the main branch and / (root) folder. Click Save.
5. Your site will be live at https://<your-username>.github.io/<repo-name>/.

---

3. Admin Key Security (Important)

🚨 NEVER share URLs containing ?admin_key=...

The index.html includes an IIFE (Immediately Invoked Function Expression) that automatically strips the admin key from the URL to prevent it from appearing in browser history or referrers.

How to use the Admin Key safely:

1. Open your website.
2. Click the ⚙️ Settings icon in the top right corner.
3. Paste your Admin Key and click Save.
4. The key is stored securely in sessionStorage and sent via the X-Admin-Key header in API requests.

---

4. Testing the Setup

1. Test Stats Endpoint:
   Open in your browser: https://<your-worker-url>/stats
   You should see a JSON response with daily statistics.
2. Test the Frontend:
   Open your GitHub Pages URL, type a query, and click Start Search.
   The 3D Biological Engine should trigger, and the report should generate in under 35 seconds.

---

🆘 Troubleshooting

· CORS Error: Ensure your ALLOWED_ORIGINS secret in the Worker matches your frontend URL exactly (without a trailing slash).
· Bacterium Not Showing: Check the browser console. Ensure bacterium-lite.html is in the root directory and the path in the <iframe> is correct.
· Rate Limit Issues: If testing, clear the mido_visitor_id from your browser's Local Storage to get a new ID.
