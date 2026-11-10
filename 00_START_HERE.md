# 🛑 START HERE — Welcome to Mido Deep Search

Thank you for purchasing Mido Deep Search! 

You now have access to a production-ready, multi-stage AI research engine powered by Cloudflare Workers, Tavily, and Groq.

This file will guide you on what to do next.

---

## 📦 What's in this package?

- **`SETUP.md`** — **Open this first!** The complete step-by-step deployment guide.
- **`index.html`** — The main frontend interface.
- **`bacterium-lite.html`** — The 3D biological visualizer engine.
- **`worker.js`** — The core Cloudflare Worker API (contains the 15 skills logic).
- **`wrangler.toml`** — Worker configuration file.
- **`WORKER_API_CONTRACT.md`** — Technical documentation of all endpoints.
- **`LICENSE`** — Source Available (Non-Commercial) license terms.
- **Other `.md` files** — Changelog, Contributing, and Security policies.

---

## ⚡ Quick Start (5 Steps)

To get Mido running on your own domain, you will need:
1. A **Cloudflare** account (Free tier is fine).
2. A **Tavily API Key** (Free tier available at `tavily.com`).
3. A **Groq API Key** (Free tier available at `console.groq.com`).

**The Fastest Path:**
1. Read **`SETUP.md`** carefully. It contains the exact terminal commands.
2. Create your API keys from Tavily and Groq.
3. Deploy the Worker using `npx wrangler deploy`.
4. Add your secrets to Cloudflare using `npx wrangler secret put`.
5. Host `index.html` and `bacterium-lite.html` on GitHub Pages, Cloudflare Pages, or any static host.

---

## 🚨 IMPORTANT: Security & API Keys

- **NEVER** put your API keys directly inside `index.html` or `worker.js`.
- **NEVER** upload an `.env` file to a public GitHub repository.
- Your keys MUST be stored securely as **Cloudflare Worker Secrets** (the `SETUP.md` guide explains exactly how to do this).

---

## 📜 License Notice

This software is licensed under **Source Available — Non-Commercial Use Only**. 
- You are free to use it for personal projects.
- You may **not** resell, redistribute, or offer this software as a paid service to others without a commercial license.

---

## 🆘 Need Help?

- Read the **`SETUP.md`** first — 99% of questions are answered there.
- If you encounter a bug, check the **`WORKER_API_CONTRACT.md`** to ensure your endpoints are configured correctly.
- For commercial licensing or further support, contact: **support@midoaistore.com**

Enjoy building, and welcome to Mido Deep Search! 🚀
