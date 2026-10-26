# ⚡ Mido DeepSearch - Setup in 3 Minutes

> You bought the skill for $6. Now get 3 FREE API keys to run unlimited reports.

### Total Cost: $0/month (free tiers) | Time: 3 minutes

---

## 🔑 Step 1: Tavily API (Search - 1000 free searches/month)

1. Go to: https://tavily.com
2. Click **Sign Up** (use Google - 10 seconds)
3. Go to **API Keys** in dashboard
4. Copy your key: `tvly-xxxxxxxxxxxxxxxx`
5. Save it.

**What it does:** Pulls 10 live sources for each report.

---

## 🔑 Step 2: Groq API (Speed - 14,400 free requests/day)

1. Go to: https://console.groq.com
2. Click **Log In** (Google)
3. Left menu → **API Keys** → **Create API Key**
4. Copy your key: `gsk_xxxxxxxxxxxxxxxx`
5. Save it.

**What it does:** Runs Trust Ranker + Scout at lightning speed.

---

## 🔑 Step 3: Nebius API (Brain - $10 free credit)

1. Go to: https://studio.nebius.com
2. Sign Up with GitHub or Google
3. Go to **API Keys** → **Create**
4. Copy your key: `nebius-xxxxxxxx`
5. You get $10 free = ~500 reports free.

**What it does:** Runs Qwen3 for Thesis Builder + Report Weaver.

---

## ⚙️ Step 4: Add Keys to Your Project

Create a file named `.env` in your project root:

```env
TAVILY_API_KEY=tvly-xxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxx
NEBIUS_API_KEY=nebius-xxxx
```

Or if using Claude Code / Skill:

```bash
export TAVILY_API_KEY="tvly-xxxx"
export GROQ_API_KEY="gsk-xxxx"
export NEBIUS_API_KEY="nebius-xxxx"
```

---

## ✅ Step 5: Test It

Ask your first question:

```
Best noise-cancelling headphones under $150 - verified reviews only
```

You should get:
- 10 sources scanned
- Trust > 0.7 filter
- D3 spider map
- Final report in 35-40 seconds

If you see the report → You're done! 🎉

---

## 💰 How Much Does It Cost After Free Tier?

One report = ~$0.02

- Tavily: $0.005 per search (1000 free/month)
- Groq: FREE forever (14k/day)
- Nebius: $0.001 per 1K tokens ($10 free = 500 reports)

**100 reports = ~$2** - cheaper than ChatGPT Plus.

---

## 🆘 Troubleshooting

**Error: Tavily key invalid?**
→ Make sure it starts with `tvly-`

**Error: Groq rate limit?**
→ Wait 1 minute, free tier resets quickly.

**Error: Nebius no credit?**
→ Check billing in Nebius dashboard, $10 should be there.

**Report says Trust < 0.7 for all sources?**
→ Try a more specific question with year: "2026 best ..."

---

## 📧 Need Help?

- GitHub Issues: midoaistore/mido-landing
- Email: midoaistore@gmail.com
- Built in Cairo - Response within 12h

---

### Why API Keys and Not Subscription?

1. **Privacy:** Your keys = your data stays with you
2. **No Limits:** Generate 1000 reports/day, not 10
3. **Cheap:** $6 once vs $30/month subscription tools
4. **Future-proof:** If one API goes down, swap it

**Welcome to real research. Links ≠ Decisions.**

— Mohamed Anwar | Mido AI Store | Day 7/30 Build in Public
