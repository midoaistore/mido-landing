
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
- **`worker-api.md`** — Technical documentation of all endpoints.
- **`LICENSE`** — Source Available (Commercial Use Allowed).
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

This software is licensed under **Source Available — Commercial Use Allowed (Single-Developer License)**. 
- You are free to use it for personal or commercial projects.
- You may customize and self-host it.
- You may **not** resell, redistribute, or offer this software as a paid competing service to others.

---

## 🆘 Need Help?

- Read the **`SETUP.md`** first — 99% of questions are answered there.
- If you encounter a bug, check the **`worker-api.md`** to ensure your endpoints are configured correctly.
- For commercial licensing or further support, contact: **support@midoaistore.com**

Enjoy building, and welcome to Mido Deep Search! 🚀
# 🛑 ابدأ من هنا — مرحباً بك في Mido Deep Search

شكراً لشرائك Mido Deep Search! 

أصبح لديك الآن حق الوصول إلى محرك بحث متعدد المراحل وجاهز للإنتاج، يعمل بواسطة Cloudflare Workers و Tavily و Groq.

سيرشدك هذا الملف إلى ما يجب فعله بعد ذلك.

---

## 📦 ماذا يوجد في هذه الحزمة؟

- **`SETUP.md`** — **افتح هذا الملف أولاً!** دليل النشر الكامل خطوة بخطوة.
- **`index.html`** — واجهة المستخدم الأمامية الرئيسية.
- **`bacterium-lite.html`** — محرك العرض البيولوجي ثلاثي الأبعاد.
- **`worker.js`** — الواجهة الخلفية الأساسية لـ Cloudflare Worker (تحتوي على منطق المهارات الـ 15).
- **`wrangler.toml`** — ملف إعدادات الـ Worker.
- **`worker-api.md`** — التوثيق التقني لجميع نقاط النهاية (Endpoints).
- **`LICENSE`** — ترخيص مفتوح المصدر (يسمح بالاستخدام التجاري لمطور واحد).
- **ملفات `.md` أخرى** — سجل التغييرات، إرشادات المساهمة، وسياسات الأمان.

---

## ⚡ البدء السريع (5 خطوات)

لتشغيل Mido على النطاق الخاص بك، ستحتاج إلى:
1. حساب **Cloudflare** (الخطة المجانية كافية).
2. مفتاح **Tavily API** (متوفر بخطة مجانية على `tavily.com`).
3. مفتاح **Groq API** (متوفر بخطة مجانية على `console.groq.com`).

**أسرع طريقة:**
1. اقرأ ملف **`SETUP.md`** بعناية. يحتوي على الأوامر الطرفية (Terminal) بالضبط.
2. قم بإنشاء مفاتيح API الخاصة بك من Tavily و Groq.
3. انشر الـ Worker باستخدام `npx wrangler deploy`.
4. أضف الأسرار (Secrets) إلى Cloudflare باستخدام `npx wrangler secret put`.
5. استضف ملفي `index.html` و `bacterium-lite.html` على GitHub Pages أو Cloudflare Pages أو أي خدمة استضافة ثابتة.

---

## 🚨 هام: الأمان ومفاتيح API

- **لا تقم أبداً** بوضع مفاتيح API الخاصة بك مباشرة داخل ملفي `index.html` أو `worker.js`.
- **لا تقم أبداً** برفع ملف `.env` إلى مستودع GitHub عام.
- **يجب** تخزين مفاتيحك بشكل آمن كـ **Cloudflare Worker Secrets** (يشرح دليل `SETUP.md` بالضبط كيفية القيام بذلك).

---

## 📜 إشعار الترخيص

هذا البرنامج مرخص بموجب **Source Available — Commercial Use Allowed (Single-Developer License)** (مفتوح المصدر — يُسمح بالاستخدام التجاري لمطور واحد). 
- لك مطلق الحرية في استخدامه للمشاريع الشخصية أو التجارية.
- يمكنك تعديله واستضافته بنفسك.
- **لا يُسمح** لك بإعادة بيعه أو توزيعه أو تقديمه كخدمة مدفوعة منافسة للآخرين.

---

## 🆘 تحتاج إلى مساعدة؟

- اقرأ **`SETUP.md`** أولاً — 99% من الأسئلة تمت الإجابة عليها هناك.
- إذا واجهت خطأً برمجياً، راجع ملف **`worker-api.md`** للتأكد من إعداد نقاط النهاية (Endpoints) بشكل صحيح.
- للحصول على تراخيص تجارية أو دعم إضافي، تواصل معنا: **support@midoaistore.com**

استمتع بالبناء، ومرحباً بك في Mido Deep Search! 🚀
