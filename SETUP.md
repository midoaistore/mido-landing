# 🛠️ Mido Deep Search — Setup Guide

This guide walks you through deploying the Cloudflare Worker (backend) and the static frontend.

## Prerequisites

- Node.js and npm installed
- A Cloudflare account (free tier is sufficient)
- A static hosting service: GitHub Pages, Cloudflare Pages, Netlify, or Vercel
- API keys for: Tavily (search), Groq (LLM)

---

## 1. Backend — Cloudflare Worker

### 1.1 Install and log in
```bash
npm install -g wrangler
wrangler login
1.2 Create the KV namespace
wrangler kv namespace create MIDO_KV
Copy the returned id and paste it into your wrangler.toml file under [[kv_namespaces]].

1.3 Configure wrangler.toml

Open the wrangler.toml file and update the [vars] section with your own details:
[vars]
ALLOWED_ORIGINS = "https://YOUR-FRONTEND-URL.com"
GUMROAD_PRODUCT_ID = "YOUR_GUMROAD_ID" 
GUMROAD_URL = "https://YOUR-STORE.gumroad.com/l/YOUR-PRODUCT"
(Note: ALLOWED_ORIGINS must be your exact frontend URL without a trailing slash. GUMROAD_* variables are optional; skip them if you do not need license validation).

1.4 Add Secrets

Run each command below and paste the value when prompted. Secrets are encrypted and stored by Cloudflare — never commit them to GitHub
wrangler secret put TAVILY_API_KEY
wrangler secret put GROQ_API_KEY
wrangler secret put ADMIN_KEY
(Note: ADMIN_KEY is a password you create yourself to bypass rate limits. Generate a strong value, e.g., openssl rand -base64 32).

1.5 Deploy
wrangler deploy
Note the deployed URL: https://<worker-name>.<your-subdomain>.workers.dev.

---

2. Frontend

2.1 Point the frontend at YOUR Worker

Open index.html and find:
const WORKER_API_URL = "";
Replace the empty string with your deployed Worker URL, for example:
This step is mandatory. If you leave it empty, the frontend will show a configuration error and will not send requests.

2.2 Deploy the static files

Upload the files to any static host:

· GitHub Pages: Settings → Pages → Deploy from branch → main → / (root)
· Cloudflare Pages, Netlify, or Vercel: drag and drop the folder
· Or open index.html directly in a browser (Note: some browsers block iframe/local requests via file:// protocol; using a local server like python3 -m http.server is recommended for testing).

Your site will be live at the URL provided by your host.

---

3. Admin Key — secure usage

· Enter the admin key only through the Settings panel (⚙️) in the UI.
· The key is sent as the X-Admin-Key request header and is never written to localStorage, cookies, or the URL.
· After reloading the page, you will need to re-enter the key. This is intentional for security.

---

4. Testing

1. Test the Worker:
curl https://<your-worker-url>/stats
You should receive a JSON response with daily statistics.

2. Test the frontend: open your site, run a query, and confirm the 3D engine renders and the report completes. Typical time is 15–40 seconds depending on query complexity and network.

---

🆘 Troubleshooting

· CORS error — ALLOWED_ORIGINS in wrangler.toml must match your frontend origin exactly, including https:// and without a trailing slash.
· "Worker not configured" — edit WORKER_API_URL in index.html.
· Bacterium not showing — ensure bacterium-lite.html sits in the same folder as index.html; check the browser console for 404.
· Rate limit during testing — clear mido_visitor_id from Local Storage in your browser's developer tools.

---

🔐 If a secret was ever exposed

Rotate it immediately, even if you see no signs of misuse:
# 🛠️ دليل إعداد Mido Deep Search

سيرشدك هذا الدليل خلال خطوات نشر الـ Cloudflare Worker (الواجهة الخلفية) والواجهة الأمامية الثابتة.

## المتطلبات المسبقة

- تثبيت Node.js و npm على جهازك.
- حساب على Cloudflare (الخطة المجانية كافية).
- خدمة استضافة ثابتة: GitHub Pages أو Cloudflare Pages أو Netlify أو Vercel.
- مفاتيح API (API Keys) لخدمات: Tavily (للبحث)، و Groq (للذكاء الاصطناعي).

---

## 1. الواجهة الخلفية — Cloudflare Worker

### 1.1 التثبيت وتسجيل الدخول
```bash
npm install -g wrangler
wrangler login
1.2 إنشاء مساحة تخزين KV (KV Namespace)
wrangler kv namespace create MIDO_KV
انسخ الـ id الذي يظهر لك، والصقه في ملف wrangler.toml تحت قسم [[kv_namespaces]].

1.3 إعداد ملف wrangler.toml

افتح ملف wrangler.toml وقم بتحديث قسم [vars] ببياناتك الخاصة:
[vars]
ALLOWED_ORIGINS = "https://YOUR-FRONTEND-URL.com"
GUMROAD_PRODUCT_ID = "YOUR_GUMROAD_ID" 
GUMROAD_URL = "https://YOUR-STORE.gumroad.com/l/YOUR-PRODUCT"
(ملاحظة: يجب أن يكون ALLOWED_ORIGINS هو رابط الواجهة الأمامية الخاص بك بالضبط، بدون علامة مائلة / في النهاية. متغيرات GUMROAD_* اختيارية؛ يمكنك تجاهلها إذا لم تكن بحاجة إلى التحقق من الترخيص).

1.4 إضافة الأسرار (Secrets)

قم بتشغيل كل أمر من الأوامر التالية وألصق القيمة المطلوبة عند طلبها. سيتم تشفير الأسرار وتخزينها بواسطة Cloudflare — لا تقم أبداً برفعها إلى GitHub.
wrangler secret put TAVILY_API_KEY
wrangler secret put GROQ_API_KEY
wrangler secret put ADMIN_KEY
(ملاحظة: ADMIN_KEY هي كلمة مرور تقوم بإنشائها بنفسك لتجاوز حدود الاستخدام (Rate Limits). قم بإنشاء قيمة قوية، على سبيل المثال باستخدام أمر openssl rand -base64 32).

1.5 النشر (Deploy)
wrangler deploy
لاحظ رابط النشر الذي سيظهر لك: https://<worker-name>.<your-subdomain>.workers.dev.

---

2. الواجهة الأمامية (Frontend)

2.1 ربط الواجهة الأمامية بالـ Worker الخاص بك

افتح ملف index.html وابحث عن:
const WORKER_API_URL = "";
استبدل النص الفارغ برابط الـ Worker الذي قمت بنشره، على سبيل المثال:
const WORKER_API_URL = "https://mido-deepsearch.your-subdomain.workers.dev/";
هذه الخطوة إلزامية. إذا تركتها فارغة، ستظهر للواجهة الأمامية رسالة خطأ في الإعداد ولن ترسل الطلبات.

2.2 نشر الملفات الثابتة

قم برفع الملفات إلى أي خدمة استضافة ثابتة:

· GitHub Pages: الإعدادات (Settings) ← الصفحات (Pages) ← النشر من الفرع (Deploy from branch) ← main ← مجلد / (root)
· Cloudflare Pages أو Netlify أو Vercel: اسحب وأفلت المجلد.
· أو افتح index.html مباشرة في المتصفح (ملاحظة: بعض المتصفحات تحظر الطلبات المحلية عبر بروتوكول file://؛ يُنصح باستخدام خادم محلي مثل python3 -m http.server للاختبار).

سيكون موقعك متاحاً على الرابط الذي توفره منصة الاستضافة.

---

3. مفتاح الأدمن (Admin Key) — الاستخدام الآمن

· أدخل مفتاح الأدمن فقط من خلال لوحة الإعدادات (⚙️) في واجهة المستخدم.
· يتم إرسال المفتاح كترويسة طلب (Header) باسم X-Admin-Key ولا يُكتب أبداً في localStorage أو ملفات تعريف الارتباط (Cookies) أو الرابط (URL).
· بعد إعادة تحميل الصفحة، ستحتاج إلى إدخال المفتاح مرة أخرى. هذا مقصود لأغراض الأمان.

---

4. الاختبار

1. اختبار الـ Worker:
curl https://<your-worker-url>/stats
يجب أن تتلقى استجابة بصيغة JSON تحتوي على الإحصائيات اليومية.

2. اختبار الواجهة الأمامية: افتح موقعك، وقم بتشغيل استعلام، وتأكد من ظهور المحرك ثلاثي الأبعاد (3D Engine) واكتمال التقرير. الوقت المتوقع 15-40 ثانية حسب تعقيد السؤال وسرعة الشبكة.

---

🆘 حل المشكلات (Troubleshooting)

· خطأ CORS — يجب أن يتطابق ALLOWED_ORIGINS في wrangler.toml مع رابط الواجهة الأمامية الخاص بك بالضبط، بما في ذلك https:// وبدون علامة مائلة / في النهاية.
· "Worker not configured" — قم بتعديل WORKER_API_URL في ملف index.html.
· البكتيريا لا تظهر — تأكد من وجود ملف bacterium-lite.html في نفس المجلد الذي يحتوي على index.html؛ وافحص وحدة التحكم في المتصفح (Console) بحثاً عن خطأ 404.
· حد الاستخدام أثناء الاختبار — امسح mido_visitor_id من مساحة التخزين المحلية (Local Storage) في أدوات المطور بالمتصفح.

---

🔐 إذا تم كشف أي سر (Secret)

قم بتغييره (Rotate) فوراً، حتى لو لم ترَ أي علامات على إساءة الاستخدام:
wrangler secret put TAVILY_API_KEY
wrangler secret put GROQ_API_KEY
wrangler secret put ADMIN_KEY
