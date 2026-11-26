/* =========================================================
Mido Deep Search – Frontend Logic (FIXED Production Version)
Fixes:
1) LIB_TEXT moved BEFORE applyLang (fixes TDZ ReferenceError)
2) WORKER_URL / BUY_URL real defaults (was "" / "#")
3) Config banner removed from production -> console.warn only
4) Local state with let (no fragile window.* globals)
5) renderSkills keeps active skill, parseMarkdown real impl
========================================================= */
(function () {
  "use strict";
  window.T = window.T || {};
  const T = window.T;
  const FALLBACK_T = {
    en: { search_btn:"Search",
 searching:"Searching...",
 prog_elapsed:"Elapsed",
 prog_complete:"Complete",
 actual_time:"Time",
 prog_used:"sources used",
 err_net:"Network error. Please try again.",
 err_trial:"Your free trial has been used.",
 err_daily:"Your free search was used, or today's free limit was reached.",
 err_license:"Invalid license key.",
 saved_empty:"Nothing to save",
 saved_ok:"Report saved",
 skill_save_hint:"Report will be saved after search",
 buy_btn:"Get the Source Code — $19",
 nav_buy:"Get Source Code — $19",
 st_left:"Your free searches left",
 case_title:"Example Report",
 t2:"✓ Free searches capped at 100/day (all visitors)",
 meta2:"Daily cap (all visitors): 100",
 f1:"Full source code (frontend + Cloudflare Worker)",
 law1_t:"Law 1",
law1_s:"Short description",
law1_d:"Detailed description",
law2_t:"Law 2",
law2_s:"Short description",
law2_d:"Detailed description",
law3_t:"Law 3",
law3_s:"Short description",
law3_d:"Detailed description",
law4_t:"Law 4",
law4_s:"Short description",
law4_d:"Detailed description",
ring1_t:"Ring 1",
ring1_s:"Short",
ring1_d:"Detail",
ring2_t:"Ring 2",
ring2_s:"Short",
ring2_d:"Detail",
ring3_t:"Ring 3",
ring3_s:"Short",
ring3_d:"Detail",
ring4_t:"Ring 4",
ring4_s:"Short",
ring4_d:"Detail",
ring5_t:"Ring 5",
ring5_s:"Short",
ring5_d:"Detail",
sug1:"Best noise cancelling headphones under $150",
 sug2:"Compare iPhone 16 vs Samsung S25",
 sug3:"Best laptop for programming 2025" },
    ar: { search_btn:"بحث",
 searching:"جاري البحث...",
 prog_elapsed:"الوقت المنقضي",
 prog_complete:"اكتمل",
 actual_time:"الوقت الفعلي",
 prog_used:"مصدر مستخدم",
 err_net:"خطأ في الشبكة. حاول مرة أخرى.",
 err_trial:"تم استخدام الفترة التجريبية المجانية.",
 err_daily:"تم استخدام بحثك المجاني، أو انتهى الحد المجاني لليوم.",
 err_license:"مفتاح الترخيص غير صالح.",
 saved_empty:"لا يوجد شيء لحفظه",
 saved_ok:"تم حفظ التقرير",
 skill_save_hint:"سيتم حفظ التقرير بعد البحث",
 buy_btn:"احصل على الكود المصدري — $19",
 nav_buy:"احصل على الكود المصدري — $19",
 st_left:"متبقي لك من البحث المجاني",
 case_title:"مثال على تقرير",
 t2:"✓ سقف يومي 100 بحث مجاني (لكل الزوار)",
 meta2:"السقف اليومي (لكل الزوار): 100",
 f1:"الكود المصدري الكامل (واجهة + Cloudflare Worker)",
 law1_t:"القانون 1",
law1_s:"وصف مختصر",
law1_d:"وصف تفصيلي",
law2_t:"القانون 2",
law2_s:"وصف مختصر",
law2_d:"وصف تفصيلي",
law3_t:"القانون 3",
law3_s:"وصف مختصر",
law3_d:"وصف تفصيلي",
law4_t:"القانون 4",
law4_s:"وصف مختصر",
law4_d:"وصف تفصيلي",
ring1_t:"الحلقة 1",
ring1_s:"مختصر",
ring1_d:"تفصيل",
ring2_t:"الحلقة 2",
ring2_s:"مختصر",
ring2_d:"تفصيل",
ring3_t:"الحلقة 3",
ring3_s:"مختصر",
ring3_d:"تفصيل",
ring4_t:"الحلقة 4",
ring4_s:"مختصر",
ring4_d:"تفصيل",
ring5_t:"الحلقة 5",
ring5_s:"مختصر",
ring5_d:"تفصيل",
sug1:"أفضل سماعات بخاصية إلغاء الضوضاء تحت 150 دولار",
 sug2:"مقارنة آيفون 16 مع سامسونج S25",
 sug3:"أفضل لابتوب للبرمجة 2025" },
    fr: { search_btn:"Rechercher",
 searching:"Recherche en cours...",
 prog_elapsed:"Temps écoulé",
 prog_complete:"Terminé",
 actual_time:"Temps",
 prog_used:"sources utilisées",
 err_net:"Erreur réseau. Veuillez réessayer.",
 err_trial:"Votre essai gratuit a été utilisé.",
 err_daily:"Votre recherche gratuite a été utilisée, ou la limite gratuite du jour est atteinte.",
 err_license:"Clé de licence invalide.",
 saved_empty:"Rien à enregistrer",
 saved_ok:"Rapport enregistré",
 skill_save_hint:"Le rapport sera enregistré après la recherche",
 buy_btn:"Obtenir le code source — $19",
 nav_buy:"Obtenir le code source — $19",
 st_left:"Recherches gratuites restantes",
 case_title:"Exemple de rapport",
 law1_t:"Loi 1",
law1_s:"Description courte",
law1_d:"Description détaillée",
law2_t:"Loi 2",
law2_s:"Description courte",
law2_d:"Description détaillée",
law3_t:"Loi 3",
law3_s:"Description courte",
law3_d:"Description détaillée",
law4_t:"Loi 4",
law4_s:"Description courte",
law4_d:"Description détaillée",
ring1_t:"Anneau 1",
ring1_s:"Court",
ring1_d:"Détail",
ring2_t:"Anneau 2",
ring2_s:"Court",
ring2_d:"Détail",
ring3_t:"Anneau 3",
ring3_s:"Court",
ring3_d:"Détail",
ring4_t:"Anneau 4",
ring4_s:"Court",
ring4_d:"Détail",
ring5_t:"Anneau 5",
ring5_s:"Court",
ring5_d:"Détail",
sug1:"Meilleurs casques à réduction de bruit sous 150 $",
 sug2:"Comparer iPhone 16 vs Samsung S25",
 sug3:"Meilleur ordinateur portable pour programmer 2025" },
    de: { search_btn:"Suchen",
 searching:"Suche läuft...",
 prog_elapsed:"Verstrichene Zeit",
 prog_complete:"Abgeschlossen",
 actual_time:"Zeit",
 prog_used:"Quellen verwendet",
 err_net:"Netzwerkfehler. Bitte erneut versuchen.",
 err_trial:"Ihre kostenlose Testversion wurde genutzt.",
 err_daily:"Ihre kostenlose Suche wurde genutzt, oder das heutige Gratis-Limit ist erreicht.",
 err_license:"Ungültiger Lizenzschlüssel.",
 saved_empty:"Nichts zu speichern",
 saved_ok:"Bericht gespeichert",
 skill_save_hint:"Bericht wird nach der Suche gespeichert",
 buy_btn:"Quellcode holen — $19",
 nav_buy:"Quellcode holen — $19",
 st_left:"Verbleibende kostenlose Suchen",
 case_title:"Beispielbericht",
 law1_t:"Gesetz 1",
law1_s:"Kurzbeschreibung",
law1_d:"Ausführliche Beschreibung",
law2_t:"Gesetz 2",
law2_s:"Kurzbeschreibung",
law2_d:"Ausführliche Beschreibung",
law3_t:"Gesetz 3",
law3_s:"Kurzbeschreibung",
law3_d:"Ausführliche Beschreibung",
law4_t:"Gesetz 4",
law4_s:"Kurzbeschreibung",
law4_d:"Ausführliche Beschreibung",
ring1_t:"Ring 1",
ring1_s:"Kurz",
ring1_d:"Detail",
ring2_t:"Ring 2",
ring2_s:"Kurz",
ring2_d:"Detail",
ring3_t:"Ring 3",
ring3_s:"Kurz",
ring3_d:"Detail",
ring4_t:"Ring 4",
ring4_s:"Kurz",
ring4_d:"Detail",
ring5_t:"Ring 5",
ring5_s:"Kurz",
ring5_d:"Detail",
sug1:"Beste Noise-Cancelling-Kopfhörer unter 150 $",
 sug2:"iPhone 16 vs Samsung S25 vergleichen",
 sug3:"Bester Laptop zum Programmieren 2025" },
    es: { search_btn:"Buscar",
 searching:"Buscando...",
 prog_elapsed:"Tiempo transcurrido",
 prog_complete:"Completado",
 actual_time:"Tiempo",
 prog_used:"fuentes usadas",
 err_net:"Error de red. Inténtalo de nuevo.",
 err_trial:"Tu prueba gratuita ya se usó.",
 err_daily:"Ya usaste tu búsqueda gratuita, o se alcanzó el límite gratuito de hoy.",
 err_license:"Clave de licencia no válida.",
 saved_empty:"Nada que guardar",
 saved_ok:"Informe guardado",
 skill_save_hint:"El informe se guardará después de la búsqueda",
 buy_btn:"Obtener el código fuente — $19",
 nav_buy:"Obtener el código fuente — $19",
 st_left:"Búsquedas gratuitas restantes",
 case_title:"Informe de ejemplo",
 law1_t:"Ley 1",
law1_s:"Descripción corta",
law1_d:"Descripción detallada",
law2_t:"Ley 2",
law2_s:"Descripción corta",
law2_d:"Descripción detallada",
law3_t:"Ley 3",
law3_s:"Descripción corta",
law3_d:"Descripción detallada",
law4_t:"Ley 4",
law4_s:"Descripción corta",
law4_d:"Descripción detallada",
ring1_t:"Anillo 1",
ring1_s:"Corto",
ring1_d:"Detalle",
ring2_t:"Anillo 2",
ring2_s:"Corto",
ring2_d:"Detalle",
ring3_t:"Anillo 3",
ring3_s:"Corto",
ring3_d:"Detalle",
ring4_t:"Anillo 4",
ring4_s:"Corto",
ring4_d:"Detalle",
ring5_t:"Anillo 5",
ring5_s:"Corto",
ring5_d:"Detalle",
sug1:"Mejores auriculares con cancelación de ruido por menos de $150",
 sug2:"Comparar iPhone 16 vs Samsung S25",
 sug3:"Mejor portátil para programar 2025" },
    pt: { search_btn:"Pesquisar",
 searching:"Pesquisando...",
 prog_elapsed:"Tempo decorrido",
 prog_complete:"Concluído",
 actual_time:"Tempo",
 prog_used:"fontes usadas",
 err_net:"Erro de rede. Tente novamente.",
 err_trial:"Sua avaliação gratuita já foi usada.",
 err_daily:"Você já usou sua pesquisa grátis, ou o limite grátis de hoje foi atingido.",
 err_license:"Chave de licença inválida.",
 saved_empty:"Nada para salvar",
 saved_ok:"Relatório salvo",
 skill_save_hint:"O relatório será salvo após a pesquisa",
 buy_btn:"Obter o código-fonte — $19",
 nav_buy:"Obter o código-fonte — $19",
 st_left:"Pesquisas grátis restantes",
 case_title:"Relatório de exemplo",
 law1_t:"Lei 1",
law1_s:"Descrição curta",
law1_d:"Descrição detalhada",
law2_t:"Lei 2",
law2_s:"Descrição curta",
law2_d:"Descrição detalhada",
law3_t:"Lei 3",
law3_s:"Descrição curta",
law3_d:"Descrição detalhada",
law4_t:"Lei 4",
law4_s:"Descrição curta",
law4_d:"Descrição detalhada",
ring1_t:"Anel 1",
ring1_s:"Curto",
ring1_d:"Detalhe",
ring2_t:"Anel 2",
ring2_s:"Curto",
ring2_d:"Detalhe",
ring3_t:"Anel 3",
ring3_s:"Curto",
ring3_d:"Detalhe",
ring4_t:"Anel 4",
ring4_s:"Curto",
ring4_d:"Detalhe",
ring5_t:"Anel 5",
ring5_s:"Curto",
ring5_d:"Detalhe",
sug1:"Melhores fones com cancelamento de ruído abaixo de $150",
 sug2:"Comparar iPhone 16 vs Samsung S25",
 sug3:"Melhor notebook para programar 2025" },
    ja: { search_btn:"検索",
 searching:"検索中...",
 prog_elapsed:"経過時間",
 prog_complete:"完了",
 actual_time:"時間",
 prog_used:"ソース使用",
 err_net:"ネットワークエラー。もう一度お試しください。",
 err_trial:"無料トライアルは使用済みです。",
 err_daily:"無料検索を使用済みか、本日の無料枠の上限に達しました。",
 err_license:"無効なライセンスキーです。",
 saved_empty:"保存するものがありません",
 saved_ok:"レポートを保存しました",
 skill_save_hint:"検索後にレポートが保存されます",
 buy_btn:"ソースコードを入手 — $19",
 nav_buy:"ソースコードを入手 — $19",
 st_left:"残りの無料検索",
 case_title:"レポート例",
 law1_t:"法則 1",
law1_s:"短い説明",
law1_d:"詳しい説明",
law2_t:"法則 2",
law2_s:"短い説明",
law2_d:"詳しい説明",
law3_t:"法則 3",
law3_s:"短い説明",
law3_d:"詳しい説明",
law4_t:"法則 4",
law4_s:"短い説明",
law4_d:"詳しい説明",
ring1_t:"リング 1",
ring1_s:"短い",
ring1_d:"詳細",
ring2_t:"リング 2",
ring2_s:"短い",
ring2_d:"詳細",
ring3_t:"リング 3",
ring3_s:"短い",
ring3_d:"詳細",
ring4_t:"リング 4",
ring4_s:"短い",
ring4_d:"詳細",
ring5_t:"リング 5",
ring5_s:"短い",
ring5_d:"詳細",
sug1:"150ドル以下のベストノイズキャンセリングヘッドホン",
 sug2:"iPhone 16 vs Samsung S25 比較",
 sug3:"プログラミングに最適なノートPC 2025" },
    zh: { search_btn:"搜索",
 searching:"搜索中...",
 prog_elapsed:"已用时间",
 prog_complete:"完成",
 actual_time:"时间",
 prog_used:"个来源",
 err_net:"网络错误，请重试。",
 err_trial:"您的免费试用已使用。",
 err_daily:"您的免费搜索已使用，或今日免费额度已达上限。",
 err_license:"许可证密钥无效。",
 saved_empty:"没有可保存的内容",
 saved_ok:"报告已保存",
 skill_save_hint:"搜索后将保存报告",
 buy_btn:"获取源代码 — $19",
 nav_buy:"获取源代码 — $19",
 st_left:"剩余免费搜索",
 case_title:"报告示例",
 law1_t:"法则 1",
law1_s:"简短描述",
law1_d:"详细描述",
law2_t:"法则 2",
law2_s:"简短描述",
law2_d:"详细描述",
law3_t:"法则 3",
law3_s:"简短描述",
law3_d:"详细描述",
law4_t:"法则 4",
law4_s:"简短描述",
law4_d:"详细描述",
ring1_t:"环 1",
ring1_s:"简短",
ring1_d:"详情",
ring2_t:"环 2",
ring2_s:"简短",
ring2_d:"详情",
ring3_t:"环 3",
ring3_s:"简短",
ring3_d:"详情",
ring4_t:"环 4",
ring4_s:"简短",
ring4_d:"详情",
ring5_t:"环 5",
ring5_s:"简短",
ring5_d:"详情",
sug1:"150美元以下最佳降噪耳机",
 sug2:"对比 iPhone 16 与 Samsung S25",
 sug3:"2025年最佳编程笔记本" }
  };
Object.keys(FALLBACK_T).forEach(function(lang){ if(!T[lang]) T[lang]={}; Object.keys(FALLBACK_T[lang]).forEach(function(k){ if(T[lang][k]==null) T[lang][k]=FALLBACK_T[lang][k]; }); });
if(!T.en) T.en=FALLBACK_T.en;
// Fix translations (modal + daily) - overwrites intentionally
const fix = {
  en:{ case_title:"Example Report",
 err_daily:"Your free search was used, or today's free limit was reached.",
 t2:"✓ Free searches capped at 100/day (all visitors)",
 meta2:"Daily cap (all visitors): 100",
 st_left:"Your free searches left",
 nav_buy:"Get Source Code — $19",
 buy_btn:"Get the Source Code — $19",
 f1:"Full source code (frontend + Cloudflare Worker)" },
  ar:{ case_title:"مثال على تقرير",
 err_daily:"تم استخدام بحثك المجاني، أو انتهى الحد المجاني لليوم.",
 t2:"✓ سقف يومي 100 بحث مجاني (لكل الزوار)",
 meta2:"السقف اليومي (لكل الزوار): 100",
 st_left:"متبقي لك من البحث المجاني",
 nav_buy:"احصل على الكود المصدري — $19",
 buy_btn:"احصل على الكود المصدري — $19",
 f1:"الكود المصدري الكامل (واجهة + Cloudflare Worker)" },
  fr:{ case_title:"Exemple de rapport",
 case_sources:"Exemple illustratif uniquement. Les prix sont indiqués dans la devise de la source citée et peuvent être obsolètes.",
 err_daily:"Votre recherche gratuite a été utilisée, ou la limite gratuite du jour est atteinte.",
 modal_title:"Rapport complet — Casques sous 150 $",
 modal_q:"Requête : meilleurs casques à réduction de bruit sous 150 $",
 modal_winner:"Gagnant : Sony WH-CH720N",
 modal_summary:"Meilleur équilibre réduction de bruit, confort et autonomie. Le JBL Tune 770NC offre le meilleur rapport qualité-prix.",
 modal_sources_list:"1. SoundGuys (0.75)<br>2. CNET (0.76)<br>3. TechRadar (0.76)<br>4. Annonces du marché local",
 modal_rec_text:"Choisissez le Sony WH-CH720N si le budget le permet. Choisissez le JBL Tune 770NC pour le meilleur rapport qualité-prix." },
  de:{ case_title:"Beispielbericht",
 case_sources:"Nur ein Beispiel. Preise werden in der Währung der zitierten Quelle angezeigt und können veraltet sein.",
 err_daily:"Ihre kostenlose Suche wurde genutzt, oder das heutige Gratis-Limit ist erreicht.",
 modal_title:"Vollständiger Bericht — Kopfhörer unter 150 $",
 modal_q:"Anfrage: Beste Noise-Cancelling-Kopfhörer unter 150 $",
 modal_winner:"Sieger: Sony WH-CH720N",
 modal_summary:"Bestes Gesamtpaket aus Geräuschunterdrückung, Komfort und Akku. Der JBL Tune 770NC bietet das beste Preis-Leistungs-Verhältnis.",
 modal_sources_list:"1. SoundGuys (0.75)<br>2. CNET (0.76)<br>3. TechRadar (0.76)<br>4. Lokale Marktangebote",
 modal_rec_text:"Wählen Sie den Sony WH-CH720N, wenn das Budget es zulässt. Wählen Sie den JBL Tune 770NC für das beste Preis-Leistungs-Verhältnis." },
  es:{ case_title:"Informe de ejemplo",
 case_sources:"Solo un ejemplo ilustrativo. Los precios se muestran en la moneda de la fuente citada y pueden estar desactualizados.",
 err_daily:"Ya usaste tu búsqueda gratuita, o se alcanzó el límite gratuito de hoy.",
 modal_title:"Informe completo — Auriculares por menos de $150",
 modal_q:"Consulta: mejores auriculares con cancelación de ruido por menos de $150",
 modal_winner:"Ganador: Sony WH-CH720N",
 modal_summary:"Mejor equilibrio de cancelación de ruido, comodidad y batería. El JBL Tune 770NC ofrece la mejor relación calidad-precio.",
 modal_sources_list:"1. SoundGuys (0.75)<br>2. CNET (0.76)<br>3. TechRadar (0.76)<br>4. Anuncios del mercado local",
 modal_rec_text:"Elige el Sony WH-CH720N si el presupuesto lo permite. Elige el JBL Tune 770NC para la mejor relación calidad-precio." },
  pt:{ case_title:"Relatório de exemplo",
 case_sources:"Apenas um exemplo ilustrativo. Os preços aparecem na moeda da fonte citada e podem estar desatualizados.",
 err_daily:"Você já usou sua pesquisa grátis, ou o limite grátis de hoje foi atingido.",
 modal_title:"Relatório completo — Fones abaixo de $150",
 modal_q:"Consulta: melhores fones com cancelamento de ruído abaixo de $150",
 modal_winner:"Vencedor: Sony WH-CH720N",
 modal_summary:"Melhor equilíbrio entre cancelamento de ruído, conforto e bateria. O JBL Tune 770NC tem o melhor custo-benefício.",
 modal_sources_list:"1. SoundGuys (0.75)<br>2. CNET (0.76)<br>3. TechRadar (0.76)<br>4. Anúncios do mercado local",
 modal_rec_text:"Escolha o Sony WH-CH720N se o orçamento permitir. Escolha o JBL Tune 770NC pelo melhor custo-benefício." },
  ja:{ case_title:"レポート例",
 case_sources:"あくまで例示です。価格は引用元の通貨で表示され、最新でない場合があります。",
 err_daily:"無料検索を使用済みか、本日の無料枠の上限に達しました。",
 modal_title:"完全レポート — 150ドル以下のヘッドホン",
 modal_q:"質問：150ドル以下のベストノイズキャンセリングヘッドホン",
 modal_winner:"最優秀：Sony WH-CH720N",
 modal_summary:"ノイズキャンセリング・快適性・バッテリーのバランスが最良。JBL Tune 770NCはコスパが最も高い。",
 modal_sources_list:"1. SoundGuys (0.75)<br>2. CNET (0.76)<br>3. TechRadar (0.76)<br>4. 現地市場の掲載情報",
 modal_rec_text:"予算が許せばSony WH-CH720Nを。コスパ重視ならJBL Tune 770NCを選んでください。" },
  zh:{ case_title:"报告示例",
 case_sources:"仅为示例。价格以所引用来源的货币显示，可能已过时。",
 err_daily:"您的免费搜索已使用，或今日免费额度已达上限。",
 modal_title:"完整报告 — 150美元以下耳机",
 modal_q:"问题：150美元以下最佳降噪耳机",
 modal_winner:"优胜：Sony WH-CH720N",
 modal_summary:"降噪、舒适度和电池的综合表现最佳。JBL Tune 770NC 性价比最高。",
 modal_sources_list:"1. SoundGuys (0.75)<br>2. CNET (0.76)<br>3. TechRadar (0.76)<br>4. 本地市场报价",
 modal_rec_text:"预算允许时选择 Sony WH-CH720N。追求性价比选择 JBL Tune 770NC。" }
};
Object.keys(fix).forEach(function(lang){ if(!T[lang]) T[lang]={}; Object.assign(T[lang], fix[lang]); });
// ===== STATE (local, not window globals) =====
let currentLang = "en";
try { const s = localStorage.getItem("mido_lang"); if (s && T[s]) currentLang = s; }
catch(e){}
let skill = "deep_search";
let searching = false;
let lastReportText = "";
let lastReportSources = [];
let lastReportQuery = "";
let lastReportCountry = "";
let lastReportLang = "en";
let baseReportText = "";
let baseReportSources = [];
let transformCache = {};
let activeTransformSkill = "deep_search";
let adminKey = "";
try { adminKey = sessionStorage.getItem("mido_admin_key") || ""; }
catch(e){}
// ===== عنوان الـ Worker (WORKER_URL) =====
// غيّر الرابط هنا فقط لو اتغير عنوان الـ Worker
// FIX 2: real defaults
const WORKER_URL = (window.WORKER_URL && window.WORKER_URL !== "") ? window.WORKER_URL : "https://mido-deepsearch.midoaistore.workers.dev";
const BUY_URL = (window.BUY_URL && window.BUY_URL !== "#") ? window.BUY_URL : "https://midoaistore.gumroad.com/l/dtqpvka";
window.WORKER_URL = WORKER_URL; window.BUY_URL = BUY_URL;
// Keep legacy window.* in sync for other scripts that read them
Object.defineProperty(window, "currentLang", { get(){return currentLang;}, set(v){currentLang=v;}, configurable:true });
window.__midoState = { get currentLang(){return currentLang;}, get skill(){return skill;}, get searching(){return searching;} };
function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function adminText(k){ return (window.__adminDict && window.__adminDict[k]) || k; }
function updateAdminBadge(){ if (typeof window.__updateAdminBadge === "function") window.__updateAdminBadge(); }
// FIX: real parseMarkdown (headings, bold, lists, tables, links) with escaping
function parseMarkdown(t){
  if (window.__origParseMarkdown && window.__origParseMarkdown !== parseMarkdown) return window.__origParseMarkdown(t);
  let src = String(t||"");
  const lines = src.split("\n"); let html=""; let inList=false; let inTable=false;
  function inline(s){ let e=esc(s); e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`(.+?)`/g,"<code>$1</code>").replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    return e;
  }
for (let i=0;i<lines.length;i++){ const line=lines[i];
  if (/^\|.*\|$/.test(line.trim())){ if(!inTable){html+="<table>"; inTable=true;} if(/^\|[\s:|-]+\|$/.test(line.trim())) continue; const cells=line.trim().replace(/^\|/,"").replace(/\|$/,"").split("|").map(c=>"<td>"+inline(c.trim())+"</td>").join(""); html+="<tr>"+cells+"</tr>"; continue; } else if(inTable){html+="</table>"; inTable=false;}
  if (/^#{1,3}\s/.test(line)){ if(inList){html+="</ul>"; inList=false;} const lvl=line.match(/^#+/)[0].length; html+="<h"+lvl+">"+inline(line.replace(/^#+\s*/,""))+"</h"+lvl+">"; continue; }
  if (/^[-*]\s/.test(line)){ if(!inList){html+="<ul>"; inList=true;} html+="<li>"+inline(line.replace(/^[-*]\s*/,""))+"</li>"; continue; } else if(inList){html+="</ul>"; inList=false;}
  if(line.trim()===""){ html+="<br>"; continue; }
  html+="<p>"+inline(line)+"</p>"; }
if(inList) html+="</ul>"; if(inTable) html+="</table>"; return html;
}
window.parseMarkdown = parseMarkdown;
function glowPulse(el){ if(!el) return; try{ el.classList.add("glow-on"); setTimeout(()=>el.classList.remove("glow-on"), 800); }catch(e){} }
window.glowPulse = window.glowPulse || glowPulse;
function toast(msg){ if(window.__origToast) return window.__origToast(msg); const t=document.createElement("div"); t.textContent=msg; t.style.cssText="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 16px;border-radius:10px;z-index:99999;font-size:14px"; document.body.appendChild(t); setTimeout(()=>t.remove(),2600); }
window.toast = window.toast || toast;
const SEARCH_TIMEOUT=55000, STATS_INTERVAL=30000, QUOTA_INTERVAL=60000, MAX_SAVED_REPORTS=50;
const SAVED_REPORTS_KEY="mido_saved_reports_v1", LANG_KEY="mido_lang", VISITOR_KEY="mido_vid", ADMIN_KEY_STORAGE="mido_admin_key";
function $(id){ return document.getElementById(id); }
function safeOn(sel,ev,fn,opt){ let el=(typeof sel==="string")?(document.getElementById(sel)||document.querySelector(sel)):sel; if(el&&el.addEventListener) el.addEventListener(ev,fn,opt||false); return el; }
function D(){ return T[currentLang]||T.en||{}; }
function safeUrl(v){ try{ const u=new URL(String(v||""),location.origin); return (u.protocol==="http:"||u.protocol==="https:")?u.href:"#"; }catch(e){ return "#"; } }
function getVisitorId(){ try{ let id=localStorage.getItem(VISITOR_KEY); if(!id){ id="v_"+Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem(VISITOR_KEY,id);} return id; }catch(e){ return "v_"+Date.now(); } }
const VISITOR_ID=getVisitorId();
// ===== showConfigBanner — إصلاح paddingTop =====
// المشكلة القديمة: paddingTop ثابت 48px، فلو البانر لف سطرين على شاشة ضيقة كان بيغطي على العناصر الثابتة.
// الإصلاح: بنقيس ارتفاع البانر الفعلي بعد ما يترسم (offsetHeight) وبنظبط paddingTop عليه، وبنحدثه مع الـ resize.
let __origBodyPaddingTop = null;
let __bannerResizeHandler = null;
function showConfigBanner(message, type){
  const old = document.getElementById("mido-config-banner");
  if (old) old.remove();
  if (__origBodyPaddingTop === null) __origBodyPaddingTop = document.body.style.paddingTop || "";
  const banner = document.createElement("div");
  banner.id = "mido-config-banner";
  banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;padding:12px 16px;font-family:system-ui,sans-serif;font-size:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,.25);box-sizing:border-box;";
  if (type === "error") { banner.style.background = "rgba(239,68,68,.95)"; banner.style.color = "#fff"; }
  else { banner.style.background = "rgba(245,158,11,.95)"; banner.style.color = "#1f2937"; }
  banner.innerHTML = '<span style="flex:1">' + esc(message) + '</span>' + '<button type="button" id="mido-banner-close" style="background:transparent;border:1px solid currentColor;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:13px;color:inherit;flex-shrink:0;">✕</button>';
  document.body.appendChild(banner);
  function syncPadding(){ if (document.getElementById("mido-config-banner")) document.body.style.paddingTop = banner.offsetHeight + "px"; }
  syncPadding();
  requestAnimationFrame(syncPadding);
  if (__bannerResizeHandler) window.removeEventListener("resize", __bannerResizeHandler);
  __bannerResizeHandler = syncPadding;
  window.addEventListener("resize", __bannerResizeHandler);
  const closeBtn = document.getElementById("mido-banner-close");
  function closeBanner(){ banner.remove(); if (__bannerResizeHandler) { window.removeEventListener("resize", __bannerResizeHandler); __bannerResizeHandler = null; } document.body.style.paddingTop = __origBodyPaddingTop || ""; __origBodyPaddingTop = null; }
  if (closeBtn) closeBtn.addEventListener("click", closeBanner);
  return { close: closeBanner, sync: syncPadding };
}
// ===== checkConfig — إصلاح التوقيت =====
// المشكلة القديمة: كان بيفحص currentLang لحظة تشغيل السكربت (قبل applyLang)، فلو اللغة المحفوظة "ar" كان ممكن يعرض الرسالة بالإنجليزي أو العكس.
// الإصلاح: بنقرأ اللغة المحفوظة من localStorage أولاً (effectiveLang)، وبنأجل الفحص لحد ما الـ DOM يبقى جاهز.
function checkConfig(){
  let effectiveLang = currentLang || "en";
  try { const saved = localStorage.getItem(LANG_KEY); if (saved && T[saved]) effectiveLang = saved; }
  catch(e){}
  const issues = [];
  if (!WORKER_URL) issues.push(effectiveLang === "ar" ? "WORKER_URL غير معرّف — وظائف البحث والأدمن لن تعمل" : "WORKER_URL is not set — search and admin features will not work");
  const missing = ["search_btn","searching","err_net"].filter(function(k){ return !T[effectiveLang] || T[effectiveLang][k] == null; });
  if (missing.length) issues.push(effectiveLang === "ar" ? "بعض مفاتيح الترجمة ناقصة: " + missing.join(", ") : "Some translation keys are missing: " + missing.join(", "));
  if (issues.length) {
    console.warn("[Mido Config]", issues.join(" | "));
    // البانر بيظهر بس لو فيه مشكلة حقيقية، وباللغة المحفوظة فعلاً
    if (document.body) showConfigBanner(issues.join(" — "), WORKER_URL ? "warn" : "error");
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", checkConfig, { once: true });
else checkConfig();
// FIX 1: LIB_TEXT + ACTION_TEXT BEFORE applyLang (was TDZ crash)
const LIB_TEXT = {
  en:{title:"Saved Reports",clear:"Clear all",close:"Close",empty:"No saved reports yet.",open:"Open",delete:"Delete",deleted:"Report deleted",cleared:"Saved reports cleared"},
  ar:{title:"التقارير المحفوظة",clear:"حذف الكل",close:"إغلاق",empty:"لا توجد تقارير محفوظة بعد.",open:"فتح",delete:"حذف",deleted:"تم حذف التقرير",cleared:"تم حذف التقارير المحفوظة"},
  fr:{title:"Rapports enregistrés",clear:"Tout effacer",close:"Fermer",empty:"Aucun rapport enregistré.",open:"Ouvrir",delete:"Supprimer",deleted:"Rapport supprimé",cleared:"Rapports supprimés"},
  de:{title:"Gespeicherte Berichte",clear:"Alle löschen",close:"Schließen",empty:"Noch keine Berichte.",open:"Öffnen",delete:"Löschen",deleted:"Bericht gelöscht",cleared:"Gespeicherte Berichte gelöscht"},
  es:{title:"Informes guardados",clear:"Borrar todo",close:"Cerrar",empty:"Aún no hay informes.",open:"Abrir",delete:"Eliminar",deleted:"Informe eliminado",cleared:"Informes eliminados"},
  pt:{title:"Relatórios salvos",clear:"Apagar tudo",close:"Fechar",empty:"Nenhum relatório salvo.",open:"Abrir",delete:"Excluir",deleted:"Relatório excluído",cleared:"Relatórios excluídos"},
  ja:{title:"保存したレポート",clear:"すべて削除",close:"閉じる",empty:"保存されたレポートはありません。",open:"開く",delete:"削除",deleted:"削除しました",cleared:"保存レポートを削除しました"},
  zh:{title:"已保存报告",clear:"全部清除",close:"关闭",empty:"暂无保存的报告。",open:"打开",delete:"删除",deleted:"报告已删除",cleared:"已清除保存的报告"}
};
function libText(k){ const d=LIB_TEXT[currentLang]||LIB_TEXT.en; return (d&&d[k])||LIB_TEXT.en[k]||k; }
const ACTION_TEXT = {
  en:{copy:"Copy Report",download:"Download",save:"Save Report",share:"Share Report",copied:"Report copied",downloaded:"Report downloaded",shared:"Share menu opened",pdfopened:"Print dialog opened — choose Save as PDF",worddownloaded:"Word file downloaded"},
  ar:{copy:"نسخ التقرير",download:"تنزيل التقرير",save:"حفظ التقرير",share:"مشاركة التقرير",copied:"تم نسخ التقرير",downloaded:"تم تنزيل التقرير",shared:"تم فتح قائمة المشاركة",pdfopened:"تم فتح الطباعة — اختر حفظ بصيغة PDF",worddownloaded:"تم تنزيل ملف Word"},
  fr:{copy:"Copier le rapport",download:"Télécharger",save:"Enregistrer",share:"Partager",copied:"Rapport copié",downloaded:"Rapport téléchargé",shared:"Menu de partage ouvert",pdfopened:"Fenêtre d’impression ouverte — choisissez Enregistrer en PDF",worddownloaded:"Fichier Word téléchargé"},
  de:{copy:"Bericht kopieren",download:"Herunterladen",save:"Bericht speichern",share:"Bericht teilen",copied:"Bericht kopiert",downloaded:"Bericht heruntergeladen",shared:"Teilen geöffnet",pdfopened:"Druckdialog geöffnet — Als PDF speichern wählen",worddownloaded:"Word-Datei heruntergeladen"},
  es:{copy:"Copiar informe",download:"Descargar",save:"Guardar informe",share:"Compartir informe",copied:"Informe copiado",downloaded:"Informe descargado",shared:"Menú de compartir abierto",pdfopened:"Impresión abierta — elige Guardar como PDF",worddownloaded:"Archivo Word descargado"},
  pt:{copy:"Copiar relatório",download:"Baixar",save:"Salvar relatório",share:"Compartilhar",copied:"Relatório copiado",downloaded:"Relatório baixado",shared:"Menu de compartilhamento aberto",pdfopened:"Impressão aberta — escolha Salvar como PDF",worddownloaded:"Arquivo Word baixado"},
  ja:{copy:"レポートをコピー",download:"ダウンロード",save:"レポートを保存",share:"レポートを共有",copied:"コピーしました",downloaded:"ダウンロードしました",shared:"共有メニューを開きました",pdfopened:"印刷画面を開きました — PDFとして保存を選択してください",worddownloaded:"Wordファイルをダウンロードしました"},
  zh:{copy:"复制报告",download:"下载",save:"保存报告",share:"分享报告",copied:"报告已复制",downloaded:"报告已下载",shared:"已打开分享菜单",pdfopened:"已打开打印 — 请选择另存为 PDF",worddownloaded:"Word 文件已下载"}
};
function actionText(k){ const d=ACTION_TEXT[currentLang]||ACTION_TEXT.en; return (d&&d[k])||ACTION_TEXT.en[k]||k; }
const SKILL_NAMES={ en:["Deep Search","Summarize","Compare","Recommend","Price Check","Save Report","Fact Check","Pros & Cons","Buying Guide","Local Price Check","Source Audit","Risk Check","Extract Facts","Outline","Decision Matrix"],
 ar:["بحث عميق","تلخيص","مقارنة","توصية","فحص السعر","حفظ التقرير","تدقيق الحقائق","الإيجابيات والسلبيات","دليل الشراء","فحص السعر المحلي","تدقيق المصادر","فحص المخاطر","استخراج الحقائق","إنشاء مخطط","مصفوفة القرار"],
 fr:["Recherche approfondie","Résumé","Comparer","Recommander","Vérifier le prix","Enregistrer","Vérifier les faits","Pour et contre","Guide d’achat","Prix local","Audit des sources","Risques","Extraire les faits","Plan détaillé","Matrice de décision"],
 de:["Tiefensuche","Zusammenfassen","Vergleichen","Empfehlen","Preisprüfung","Bericht speichern","Fakten prüfen","Vor- und Nachteile","Kaufratgeber","Lokaler Preis","Quellenprüfung","Risiken prüfen","Fakten extrahieren","Gliederung","Entscheidungsmatrix"],
 es:["Búsqueda profunda","Resumir","Comparar","Recomendar","Revisar precio","Guardar informe","Verificar hechos","Pros y contras","Guía de compra","Precio local","Auditar fuentes","Revisar riesgos","Extraer hechos","Esquema","Matriz de decisión"],
 pt:["Busca profunda","Resumir","Comparar","Recomendar","Verificar preço","Salvar relatório","Verificar fatos","Prós e contras","Guia de compra","Preço local","Auditar fontes","Verificar riscos","Extrair fatos","Esquema","Matriz de decisão"],
 ja:["ディープサーチ","要約","比較","推奨","価格確認","レポート保存","事実確認","長所と短所","購入ガイド","現地価格","ソース監査","リスク確認","事実抽出","アウトライン","意思決定マトリクス"],
 zh:["深度搜索","摘要","对比","推荐","价格检查","保存报告","事实核查","优缺点","购买指南","本地价格检查","来源审计","风险检查","提取事实","内容大纲","决策矩阵"] };
const SKILL_IDS=["deep_search","summarize","compare","recommend","price_check","save","fact_check","pros_cons","buying_guide","local_price_check","source_audit","risk_check","extract_facts","outline","decision_matrix"];
function renderSkills(){ const c=$("skills"); if(!c) return; const names=SKILL_NAMES[currentLang]||SKILL_NAMES.en; c.innerHTML=SKILL_IDS.map((id,i)=>{ const name=names[i]||SKILL_NAMES.en[i]||id; return '<button type="button" class="skill'+(id===skill?" on":"")+'" data-skill="'+id+'">'+esc(name)+'</button>'; }).join(""); }
function renderLaws(){ const list=$("lawsList"); if(!list) return; const d=D(); const items=[["01",d.law1_t,d.law1_s,d.law1_d],["02",d.law2_t,d.law2_s,d.law2_d],["03",d.law3_t,d.law3_s,d.law3_d],["04",d.law4_t,d.law4_s,d.law4_d]]; list.innerHTML=items.map((it,i)=>'<div class="xcard" data-xcard="law'+i+'"><div class="top"><span class="num">LAW '+it[0]+'</span><span class="chev">▼</span></div><h3>'+esc(it[1]||"")+'</h3><div class="short">'+esc(it[2]||"")+'</div><div class="detail">'+esc(it[3]||"")+'</div></div>').join(""); }
function renderRings(){ const list=$("ringsList"); if(!list) return; const d=D(); const colors=["#ef4444","#7c5cff","#10b981","#f59e0b","#8b5cf6"]; const items=[[d.ring1_t,d.ring1_s,d.ring1_d],[d.ring2_t,d.ring2_s,d.ring2_d],[d.ring3_t,d.ring3_s,d.ring3_d],[d.ring4_t,d.ring4_s,d.ring4_d],[d.ring5_t,d.ring5_s,d.ring5_d]]; list.innerHTML=items.map((it,i)=>'<div class="xcard ring-card" data-ring="'+i+'" data-xcard="ring'+i+'"><div class="top"><span class="num" style="color:'+colors[i]+'">RING 0'+(i+1)+'</span><span class="chev">▼</span></div><h3>'+esc(it[0]||"")+'</h3><div class="short">'+esc(it[1]||"")+'</div><div class="detail">'+esc(it[2]||"")+'</div></div>').join(""); }
function renderSugs(){ const c=$("sugs"); if(!c) return; const d=D(); c.innerHTML=[d.sug1,d.sug2,d.sug3].filter(Boolean).map(s=>'<button type="button" class="sug">'+esc(s)+'</button>').join(""); }
function getSavedReports(){ try{ const raw=localStorage.getItem(SAVED_REPORTS_KEY); if(raw){ const a=JSON.parse(raw); return Array.isArray(a)?a:[]; } const old=localStorage.getItem("mido_saved_report"); if(old){ const m=[{id:"migrated-"+Date.now(),title:"Migrated report",text:old,createdAt:localStorage.getItem("mido_saved_at")||new Date().toISOString(),skill:"deep_search",lang:currentLang}]; localStorage.setItem(SAVED_REPORTS_KEY,JSON.stringify(m)); return m; } }catch(e){} return []; }
function putSavedReports(list){ try{ localStorage.setItem(SAVED_REPORTS_KEY,JSON.stringify(list.slice(0,MAX_SAVED_REPORTS))); }catch(e){ toast(D().err_net||"Storage error"); } }
function renderSavedReports(){ const listEl=$("savedReportsList"); if(!listEl) return; const items=getSavedReports(); const t=$("libraryTitle"); if(t) t.textContent=libText("title"); const tg=$("libraryToggle"); if(tg) tg.textContent="▤ "+libText("title"); const cl=$("clearReports"); if(cl) cl.textContent=libText("clear"); const co=$("closeLibrary"); if(co) co.title=libText("close"); if(!items.length){ listEl.innerHTML='<div class="library-empty">'+esc(libText("empty"))+'</div>'; return; } listEl.innerHTML=items.map(item=>{ let date=""; try{ date=new Date(item.createdAt).toLocaleString(currentLang||"en"); }catch(e){ date=item.createdAt||""; } return '<article class="saved-card" data-report-id="'+esc(item.id)+'"><h4>'+esc(item.title||"Mido Report")+'</h4><time>'+esc(date)+'</time><div class="saved-actions"><button type="button" data-library-action="open">'+esc(libText("open"))+'</button><button type="button" data-library-action="delete">'+esc(libText("delete"))+'</button></div></article>'; }).join(""); }
function saveReport(text,
title){ if(!text){ toast(D().saved_empty||"Nothing to save"); return; } const items=getSavedReports(); const item={ id:(window.crypto&&window.crypto.randomUUID)?window.crypto.randomUUID():"r_"+Date.now().toString(36)+Math.random().toString(36).slice(2), title:String(title||($("q")&&$("q").value)||"Mido Deep Search Report").trim().slice(0,120), text:String(text), createdAt:new Date().toISOString(), skill:skill, lang:currentLang }; const f=items.filter(x=>x.text!==item.text); f.unshift(item); putSavedReports(f); renderSavedReports(); toast(D().saved_ok||"Saved"); }
function applyLang(lang){ if(!T[lang]) lang="en"; currentLang=lang; try{ localStorage.setItem(LANG_KEY,lang); }catch(e){} const rtl=lang==="ar"; document.documentElement.lang=lang; document.documentElement.dir=rtl?"rtl":"ltr"; document.body.style.fontFamily=rtl?"'Cairo','Inter',system-ui,sans-serif":"'Inter','Cairo',system-ui,sans-serif"; const dict=D(); document.querySelectorAll("[data-i18n]").forEach(el=>{ const k=el.getAttribute("data-i18n"); if(dict[k]!=null) el.textContent=dict[k]; }); document.querySelectorAll("[data-i18n-html]").forEach(el=>{ const k=el.getAttribute("data-i18n-html"); if(dict[k]!=null) el.innerHTML=dict[k]; }); document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{ const k=el.getAttribute("data-i18n-placeholder"); if(dict[k]!=null) el.placeholder=dict[k]; }); const goBtn=$("go"); if(goBtn&&!goBtn.classList.contains("loading")) goBtn.textContent=dict.search_btn||"Search"; renderLaws(); renderRings(); renderSugs(); renderSkills(); renderSavedReports(); }
// Init language AFTER all render fns + LIB_TEXT defined
try{ const saved=localStorage.getItem(LANG_KEY)||"en"; const m=document.querySelector('.lang-option[data-l="'+saved+'"]'); if(m){ const fl=$("flag"); if(fl) fl.textContent=m.getAttribute("data-f")||""; const ln=$("langName"); if(ln) ln.textContent=m.getAttribute("data-n")||""; document.querySelectorAll(".lang-option").forEach(o=>o.classList.remove("active")); m.classList.add("active"); } applyLang(saved); }catch(e){ applyLang("en"); }
document.addEventListener("click",
 function(e){ const card=e.target.closest(".xcard[data-xcard]"); if(!card) return; const was=card.classList.contains("open"); const p=card.parentElement; if(p) p.querySelectorAll(".xcard").forEach(c=>c.classList.remove("open","glow-on")); if(!was){ card.classList.add("open"); glowPulse(card); } if(card.classList.contains("ring-card")) illuminateAllRings(); });
const langBtn=$("langBtn"), langMenu=$("langMenu");
safeOn(langBtn,"click",function(e){ e.stopPropagation(); if(langMenu) langMenu.classList.toggle("open"); glowPulse(langBtn); });
document.addEventListener("click",function(e){ if(langMenu&&langBtn&&!langMenu.contains(e.target)&&!langBtn.contains(e.target)) langMenu.classList.remove("open"); });
safeOn(langMenu,"click",function(e){ e.stopPropagation(); const opt=e.target.closest(".lang-option"); if(!opt) return; const fl=$("flag"); if(fl) fl.textContent=opt.getAttribute("data-f")||""; const ln=$("langName"); if(ln) ln.textContent=opt.getAttribute("data-n")||""; if(langMenu) langMenu.querySelectorAll(".lang-option").forEach(o=>o.classList.remove("active")); opt.classList.add("active"); if(langMenu) langMenu.classList.remove("open"); applyLang(opt.getAttribute("data-l")||"en"); glowPulse(langBtn); });
safeOn("skills","click",function(e){ const btn=e.target.closest(".skill"); if(!btn) return; document.querySelectorAll(".skill").forEach(x=>x.classList.remove("on","glow-on")); btn.classList.add("on"); glowPulse(btn); skill=btn.getAttribute("data-skill")||"deep_search"; if(skill==="save"){ toast(D().skill_save_hint||"Report will be saved"); if(lastReportText) saveReport(lastReportText); } else if(lastReportText&&!searching){ transformCurrentReport(skill); } });
safeOn("sugs","click",function(e){ const btn=e.target.closest(".sug"); if(!btn) return; const qEl=$("q"); if(qEl) qEl.value=btn.textContent; glowPulse(btn); });
function openLibrary(){ renderSavedReports(); const lib=$("reportLibrary"),
 bd=$("libraryBackdrop"); if(lib){ lib.classList.add("open"); lib.setAttribute("aria-hidden","false"); } if(bd) bd.classList.add("open"); }
function closeLibrary(){ const lib=$("reportLibrary"), bd=$("libraryBackdrop"); if(lib){ lib.classList.remove("open"); lib.setAttribute("aria-hidden","true"); } if(bd) bd.classList.remove("open"); }
renderSavedReports();
safeOn("saveExample",
"click",
function(){ const d=D(); const txt=[d.case_h||"",d.case_quick||"",(d.cq1||"").replace(/<[^>]+>/g,""),(d.cq2||"").replace(/<[^>]+>/g,""),(d.cq3||"").replace(/<[^>]+>/g,""),d.modal_rec_text||""].join("\n"); lastReportText=txt; baseReportText=txt; baseReportSources=[]; transformCache={}; activeTransformSkill="deep_search"; saveReport(txt, d.case_title||"Example Report"); glowPulse(this); });
safeOn("libraryToggle","click",openLibrary); safeOn("closeLibrary","click",closeLibrary); safeOn("libraryBackdrop","click",closeLibrary);
safeOn("clearReports","click",function(){ if(!getSavedReports().length) return; localStorage.removeItem(SAVED_REPORTS_KEY); renderSavedReports(); toast(libText("cleared")); });
safeOn("savedReportsList","click",function(e){ const btn=e.target.closest("[data-library-action]"); if(!btn) return; const card=btn.closest(".saved-card"); if(!card) return; const id=card.getAttribute("data-report-id"); const items=getSavedReports(); const item=items.find(x=>x.id===id); if(!item) return; if(btn.getAttribute("data-library-action")==="delete"){ putSavedReports(items.filter(x=>x.id!==id)); renderSavedReports(); toast(libText("deleted")); return; } lastReportText=item.text; baseReportText=item.text; baseReportSources=[]; transformCache={}; activeTransformSkill="deep_search"; const resEl=$("res"); if(resEl) resEl.innerHTML='<div class="ans">'+parseMarkdown(item.text)+"</div>"+reportActions(); closeLibrary(); });
function reportActions(){ return '<div class="report-actions"><button type="button" class="btn btn-ghost" data-report-action="copy">⧉ '+esc(actionText("copy"))+'</button><button type="button" class="btn btn-ghost" data-report-action="download">⇩ '+esc(actionText("download"))+'</button><button type="button" class="btn btn-ghost" data-report-action="pdf">PDF</button><button type="button" class="btn btn-ghost" data-report-action="word">Word</button><button type="button" class="btn btn-ghost" data-report-action="share">↗ '+esc(actionText("share"))+'</button><button type="button" class="btn btn-p" data-report-action="save">▣ '+esc(actionText("save"))+'</button></div>'; }
function fallbackCopy(text){ const a=document.createElement("textarea"); a.value=text; a.setAttribute("readonly",""); a.style.position="fixed"; a.style.opacity="0"; document.body.appendChild(a); a.select(); let ok=false; try{ ok=document.execCommand("copy"); }catch(e){} document.body.removeChild(a); return ok; }
function copyReport(){ if(!lastReportText){ toast(D().saved_empty||"Nothing to copy"); return; } if(navigator.clipboard&&window.isSecureContext){ navigator.clipboard.writeText(lastReportText).then(()=>toast(actionText("copied"))).catch(()=>{ if(fallbackCopy(lastReportText)) toast(actionText("copied")); }); } else if(fallbackCopy(lastReportText)) toast(actionText("copied")); else toast(D().err_net||"Copy failed"); }
function downloadReport(){ if(!lastReportText){ toast(D().saved_empty); return; } const blob=new Blob([lastReportText],{type:"text/plain;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="mido-deep-search-report-"+new Date().toISOString().slice(0,10)+".txt"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast(actionText("downloaded")); }
function shareReport(){ if(!lastReportText){ toast(D().saved_empty); return; } if(navigator.share){ navigator.share({title:"Mido Deep Search Report",text:lastReportText}).then(()=>toast(actionText("shared"))).catch(err=>{ if(err&&err.name!=="AbortError") fallbackShare(); }); } else fallbackShare(); }
function fallbackShare(){ window.open("https://wa.me/?text="+encodeURIComponent(lastReportText),"_blank","noopener,noreferrer"); toast(actionText("shared")); }
function exportReportHTML(){ if(!lastReportText) return ""; const ans=parseMarkdown(lastReportText); const s=document.querySelector("#res .srcs"); return ans+(s?s.outerHTML:""); }
function exportPDF(){ if(!lastReportText){ toast(D().saved_empty); return; } const w=window.open("","_blank"); if(!w){ toast(D().err_net||"Popup blocked"); return; } const dir=document.documentElement.dir||"rtl"; w.document.write('<!doctype html><html dir="'+dir+'"><head><meta charset="utf-8"><title>Mido Deep Search Report</title><style>body{font-family:Arial,Cairo,sans-serif;line-height:1.7;padding:28px;color:#111}table{width:100%;border-collapse:collapse}th,td{border:1px solid #aaa;padding:7px}th{background:#eee}.src{display:block;color:#0645ad;margin:8px 0}</style></head><body><h1>Mido Deep Search</h1>'+exportReportHTML()+'</body></html>'); w.document.close(); w.onload=()=>setTimeout(()=>{w.focus();w.print();},250); toast(actionText("pdfopened")); }
function exportWord(){ if(!lastReportText){ toast(D().saved_empty); return; } const dir=document.documentElement.dir||"rtl"; const doc='<!doctype html><html dir="'+dir+'"><head><meta charset="utf-8"><style>body{font-family:Arial,Cairo,sans-serif;line-height:1.7}table{width:100%;border-collapse:collapse}th,td{border:1px solid #aaa;padding:6px}</style></head><body><h1>Mido Deep Search</h1>'+exportReportHTML()+'</body></html>'; const blob=new Blob(["\ufeff",doc],{type:"application/msword"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="mido-deep-search-report-"+new Date().toISOString().slice(0,10)+".doc"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast(actionText("worddownloaded")); }
async function fetchStats(){ if(!WORKER_URL) return; try{ const r=await fetch(WORKER_URL+"/stats",{cache:"no-store"}); if(!r.ok) return; const d=await r.json(); const a=$("stVisitors"); if(a) a.textContent=d.total_visitors||0; const b=$("stSearches"); if(b) b.textContent=d.today_searches||0; const c=$("stOk"); if(c) c.textContent=d.successful_trials||0; const e=$("stFail"); if(e) e.textContent=d.failed_trials||0; }catch(e){} }
fetchStats(); setInterval(fetchStats, STATS_INTERVAL);
if(WORKER_URL){ try{ fetch(WORKER_URL+"/visit",{method:"POST",headers:{"Content-Type":"text/plain"},body:VISITOR_ID,cache:"no-store"}).catch(()=>{}); }catch(e){} }
async function fetchMyQuota(){ if(!WORKER_URL) return; try{ const headers={"Content-Type":"application/json"}; if(adminKey) headers["X-Admin-Key"]=adminKey; const r=await fetch(WORKER_URL+"/me",{method:"POST",headers:headers,body:JSON.stringify({visitor_id:VISITOR_ID}),cache:"no-store"}); if(r.status===401){ try{ sessionStorage.removeItem(ADMIN_KEY_STORAGE); }catch(e){} adminKey=""; updateAdminBadge(); return; } if(!r.ok) return; const d=await r.json(); if(!d.ok) return; const leftEl=$("stLeft"); if(leftEl&&d.remaining!=null&&d.remaining>=0){ if(d.is_admin||d.unlimited){ leftEl.textContent="∞"; leftEl.title=(d.user_type||"admin")+" · Unlimited"; }
      else { leftEl.textContent=d.remaining; leftEl.title=(d.user_type||"free")+" · "+d.remaining+"/"+d.limit+" left today"; } } }catch(e){} }
fetchMyQuota(); setInterval(fetchMyQuota, QUOTA_INTERVAL);
function setStages(n){ document.querySelectorAll("#stages .stage").forEach((el,i)=>{ el.classList.toggle("on",i<=n); if(i===n) glowPulse(el); }); document.querySelectorAll(".ring-card").forEach((el,i)=>{ if(i<=n) el.classList.add("glow-on"); else el.classList.remove("glow-on"); }); try{ if(typeof notifyBio==="function") notifyBio(Math.max(0,Math.min(4,n)),true); }catch(e){} }
function illuminateAllRings(){ document.querySelectorAll(".ring-card").forEach(c=>c.classList.add("glow-on")); }
function applyLogs(logs){ let max=0; (Array.isArray(logs)?logs:[]).forEach(log=>{ const n=Number(log.ring||log.stage||0); if(n>max&&(log.status==="done"||log.status==="complete"||log.completed===true)) max=n; }); if(max>0) setStages(Math.min(4,max-1)); }
safeOn("stages","click",function(e){ const st=e.target.closest(".stage"); if(st) glowPulse(st); });
function showProgressUI(label){ const resEl=$("res"); if(!resEl) return; resEl.innerHTML='<div class="progress-container"><div class="progress-label"><span>'+esc(label||D().searching||"Searching...")+'</span><span id="pct">0s</span></div><div class="progress-bar-outer"><div class="progress-bar-inner" id="progBar" style="width:10%"></div></div><div class="progress-timer" id="timerInfo">...</div></div>'; }
const go=$("go"), q=$("q"), res=$("res");
function renderSources(sources){ if(!sources||!sources.length) return ""; return '<div class="srcs">'+sources.slice(0,12).map((s,i)=>{ const href=safeUrl(s.url); return '<a class="src" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer"><h5>['+(i+1)+'] '+esc(s.title||"")+'</h5><p>'+esc(String(s.content||s.snippet||"").slice(0,160))+'</p></a>'; }).join("")+"</div>"; }
async function doSearch(){
  if(!q||!res) return; const text=(q.value||"").trim(); if(!text||searching) return;
  if(!WORKER_URL){ toast(currentLang==="ar"?"WORKER_URL غير معرّف":"WORKER_URL is not configured"); return; }
  searching=true; if(go){ go.classList.add("loading","glow"); go.innerHTML='<span class="spin"></span> '+esc(D().searching||"Searching..."); }
  const startTime=Date.now(); let activeStage=0; showProgressUI(D().searching||"Searching..."); setStages(0);
  const timerInterval=setInterval(()=>{ const elapsed=Math.floor((Date.now()-startTime)/1000); const est=Math.min(4,Math.floor(elapsed/2)); if(est>activeStage){ activeStage=est; setStages(activeStage); } const pb=$("progBar"), pe=$("pct"); if(pb&&parseFloat(pb.style.width)<85) pb.style.width=(parseFloat(pb.style.width)+2)+"%"; if(pe) pe.textContent=elapsed+"s"; const ti=$("timerInfo"); if(ti) ti.innerHTML=esc(D().prog_elapsed||"Elapsed")+": "+elapsed+"s..."; },
500);
  let outcome;
  try{
    const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),SEARCH_TIMEOUT);
    const headers={"Content-Type":"application/json"}; if(adminKey) headers["X-Admin-Key"]=adminKey;
    const countrySel=$("countrySel");
    const r=await fetch(WORKER_URL,{method:"POST",headers:headers,body:JSON.stringify({query:text,visitor_id:VISITOR_ID,skill:skill,country:countrySel?countrySel.value:"",lang:currentLang}),signal:ctrl.signal});
    clearTimeout(to); let data={}; try{ data=await r.json(); }catch(e){}
    try{ const remH=r.headers.get("X-RateLimit-Remaining"),
 limH=r.headers.get("X-RateLimit-Limit"); if(remH!==null&&remH!=="-1"){ const le=$("stLeft"); if(le){ le.textContent=remH; if(limH) le.title=remH+"/"+limH+" left today"; } } }catch(e){}
    if(!r.ok){ const apiError=String(data.error||data.reason||"http"); if(r.status===429||apiError==="rate_limit_exceeded") throw new Error("rate_limit_exceeded"); if(r.status===401||apiError==="invalid_license") throw new Error("invalid_license"); if(apiError==="admin_key_in_url") throw new Error("admin_key_in_url"); if(apiError==="missing_api_key") throw new Error("missing_api_key"); const pe2=new Error(apiError); pe2.providerMessage=String(data.message||""); throw pe2; }
    if(data.ok===false||(data.success===false&&(data.error||data.reason))) throw new Error(String(data.error||data.reason||"http"));
    outcome={ok:true,answer:String(data.answer||data.deep_answer||""),sources:Array.isArray(data.sources)?data.sources:(Array.isArray(data.top_sources)?data.top_sources:[]),logs:Array.isArray(data.logs)?data.logs:[],meta:data.meta||{}};
  }catch(err){ clearInterval(timerInterval); outcome={ok:false,msg:String(err&&err.message||err),detail:String(err&&err.providerMessage||"")}; }
if(outcome.ok){
  clearInterval(timerInterval); const totalTime=Math.floor((Date.now()-startTime)/1000);
  if(outcome.logs.length) applyLogs(outcome.logs); else setStages(4); illuminateAllRings();
  lastReportText=outcome.answer;
  lastReportSources=outcome.sources||[];
  lastReportQuery=text;
  lastReportCountry=($("countrySel")&&$("countrySel").value)||"";
  lastReportLang=currentLang;
  baseReportText=outcome.answer;
  baseReportSources=(outcome.sources||[]).slice();
  transformCache={};
  activeTransformSkill="deep_search";
  if(res) res.innerHTML='<div style="margin-bottom:12px;padding:10px;border-radius:10px;background:rgba(0,255,163,.1);border:1px solid rgba(0,255,163,.3);text-align:center;font-size:12px;color:#6ee7b7">✅ '+esc(D().prog_complete||"Complete")+" - "+esc(D().actual_time||"Time")+": "+totalTime+"s | "+outcome.sources.length+" "+esc(D().prog_used||"sources")+"</div>"+'<div class="ans">'+parseMarkdown(outcome.answer)+"</div>"+renderSources(outcome.sources)+reportActions();
  if(typeof fbq==="function") fbq("track","Lead"); if(skill==="save") saveReport(outcome.answer);
  try{ if(typeof notifyBio==="function") notifyBio(4,false); }catch(e){} fetchStats(); fetchMyQuota();
}
else {
  let em=D().err_net||"Network error";
  if(outcome.msg==="trial_used"||String(outcome.msg).indexOf("trial")>-1) em=D().err_trial||em;
  if(outcome.msg==="rate_limit_exceeded"||outcome.msg==="daily_cap") em=D().err_daily||em;
  if(outcome.msg==="invalid_license") em=D().err_license||"Invalid license key.";
  if(outcome.msg==="search_failed") em=currentLang==="ar"?"خدمة البحث أو مزود الذكاء الاصطناعي غير متاح حاليًا. حاول لاحقًا.":"The search or AI provider is currently unavailable. Please try again later.";
  if(outcome.msg==="origin_not_allowed") em="Origin not allowed. Please check your settings.";
  if(outcome.msg==="admin_key_in_url") em=currentLang==="ar"?"مفتاح الأدمن يجب أن يُرسل في header X-Admin-Key، وليس في الرابط. اضغط 🔑 لتسجيل الدخول.":"Admin key must not be in the URL. Use the 🔑 button to log in.";
  if(outcome.msg==="missing_api_key") em=currentLang==="ar"?"خطأ في إعداد الخادم. يرجى التواصل مع الدعم.":"Server configuration error. Please contact support.";
  const adminDetail=(adminKey&&outcome.detail)?'<br><small style="opacity:.8">'+esc(outcome.detail)+"</small>":"";
  if(res) res.innerHTML='<div class="err"><b>'+esc(em)+"</b>"+adminDetail+'<br><br><a class="btn btn-w" href="'+esc(BUY_URL)+'" target="_blank" rel="noopener">'+esc(D().buy_btn||"Get Source Code")+"</a></div>";
}
searching=false; if(go){ go.classList.remove("loading","glow"); go.textContent=D().search_btn||"Search"; }
}
function renderTransformResult(targetSkill,fromCache){ if(!res) return; let header=""; if(targetSkill){ const cacheMsg=fromCache?(currentLang==="ar"?"من الكاش — بدون استهلاك توكنات":"Cached — no API call"):""; header='<div style="margin-bottom:12px;padding:10px;border-radius:10px;background:rgba(124,92,255,.12);border:1px solid rgba(124,92,255,.35);text-align:center;font-size:12px;color:#c4b5fd">✓ '+esc(cacheMsg)+" | Skill: "+esc(targetSkill)+"</div>"; } res.innerHTML=header+'<div class="ans">'+parseMarkdown(lastReportText)+"</div>"+renderSources(lastReportSources)+reportActions(); }
async function transformCurrentReport(targetSkill){
  if(!lastReportText||searching) return; if(!WORKER_URL){ toast(currentLang==="ar"?"WORKER_URL غير معرّف":"WORKER_URL is not configured"); return; }
  if(targetSkill==="deep_search"){ if(baseReportText&&lastReportText!==baseReportText){ lastReportText=baseReportText; lastReportSources=baseReportSources.slice(); activeTransformSkill="deep_search"; renderTransformResult(null,false); toast(currentLang==="ar"?"تم استرجاع التقرير الأصلي (بدون استهلاك توكنات)":"Original restored (no API call)"); } return; }
  if(activeTransformSkill===targetSkill&&transformCache[targetSkill]) return;
  if(transformCache[targetSkill]){ lastReportText=transformCache[targetSkill].text; lastReportSources=(transformCache[targetSkill].sources||[]).slice(); activeTransformSkill=targetSkill; renderTransformResult(targetSkill,true); toast(currentLang==="ar"?"تم استرجاع نتيجة المهارة من الكاش (بدون توكنات)":"Skill result restored from cache (no tokens)"); return; }
  searching=true; if(go){ go.classList.add("loading","glow"); go.innerHTML='<span class="spin"></span> '+esc(D().searching||"Processing..."); }
  const started=Date.now(); let stage=0; showProgressUI(D().searching||"Processing..."); setStages(0);
  const pulse=setInterval(()=>{ stage=Math.min(4,stage+1); setStages(stage); const elapsed=Math.floor((Date.now()-started)/1000); const pb=$("progBar"), pe=$("pct"); if(pb) pb.style.width=Math.min(88,18+stage*16)+"%"; if(pe) pe.textContent=elapsed+"s"; },
700);
  try{
    const ctrl=new AbortController(); const timeout=setTimeout(()=>ctrl.abort(),SEARCH_TIMEOUT);
    const headers={"Content-Type":"application/json"}; if(adminKey) headers["X-Admin-Key"]=adminKey; const countrySel=$("countrySel");
    const r=await fetch(WORKER_URL,{method:"POST",headers:headers,signal:ctrl.signal,body:JSON.stringify({mode:"transform",query:lastReportQuery||(q&&q.value)||"",base_answer:lastReportText,base_sources:lastReportSources,visitor_id:VISITOR_ID,skill:targetSkill,country:(countrySel&&countrySel.value)||lastReportCountry||"",lang:currentLang})});
    clearTimeout(timeout); let data={}; try{ data=await r.json(); }catch(e){}
    try{ const remH=r.headers.get("X-RateLimit-Remaining"); if(remH!==null&&remH!=="-1"){ const le=$("stLeft"); if(le) le.textContent=remH; } }catch(e){}
    if(!r.ok){ const err=new Error(String(data.error||"transform_failed")); err.providerMessage=String(data.message||""); throw err; }
    const newText=String(data.answer||""); if(!newText) throw new Error("transform_empty");
    lastReportText=newText;
    lastReportSources=Array.isArray(data.sources)?data.sources:lastReportSources;
    transformCache[targetSkill]={text:newText,sources:(lastReportSources||[]).slice()};
    activeTransformSkill=targetSkill;
    illuminateAllRings();
    setStages(4);
    renderTransformResult(targetSkill,false);
  }catch(err){ const detail=(adminKey&&err&&err.providerMessage)?'<br><small style="opacity:.8">'+esc(err.providerMessage)+"</small>":""; if(res) res.innerHTML='<div class="err"><b>'+esc(currentLang==="ar"?"تعذر تطبيق المهارة على التقرير الحالي.":"Could not apply this skill to the current report.")+"</b>"+detail+"</div>"; }
finally{ clearInterval(pulse); searching=false; if(go){ go.classList.remove("loading","glow"); go.textContent=D().search_btn||"Search"; } }
}
safeOn(go,"click",function(){ glowPulse(go); doSearch(); });
safeOn(q,"keydown",function(e){ if(e.key==="Enter") doSearch(); });
safeOn(res,"click",function(e){ const btn=e.target.closest("[data-report-action]"); if(!btn) return; const a=btn.getAttribute("data-report-action"); if(a==="copy") copyReport(); else if(a==="download") downloadReport(); else if(a==="save") saveReport(lastReportText); else if(a==="share") shareReport(); else if(a==="pdf") exportPDF(); else if(a==="word") exportWord(); });
const modal=$("reportModal");
safeOn("openReport","click",function(){ if(modal) modal.classList.add("open"); glowPulse(this); });
safeOn("closeModal","click",function(){ if(modal) modal.classList.remove("open"); });
safeOn("modalBg","click",function(){ if(modal) modal.classList.remove("open"); });
safeOn("navBuy","click",function(){ glowPulse(this); });
safeOn("adminBtn",
"click",
function(){ const m=$("adminModal"),
 input=$("adminKeyInput"),
 status=$("adminKeyStatus"); if(!m) return; if(adminKey){ if(input) input.value=adminKey; if(status){ status.textContent="Active"; status.style.color="#6ee7b7"; } }
  else { if(input) input.value=""; if(status){ status.textContent="No key"; status.style.color="#fbbf24"; } } m.classList.add("open");
  setTimeout(()=>{ if(input) input.focus(); },100);
});
safeOn("adminModalClose","click",function(){ const m=$("adminModal"); if(m) m.classList.remove("open"); });
safeOn("adminKeySave",
"click",
async function(){ const input=$("adminKeyInput"),
 status=$("adminKeyStatus"); if(!input||!status) return; const val=(input.value||"").trim(); if(!val){ try{ sessionStorage.removeItem(ADMIN_KEY_STORAGE); }catch(e){} adminKey=""; updateAdminBadge(); toast("Key removed"); const m=$("adminModal"); if(m) m.classList.remove("open"); return; } if(!WORKER_URL){ status.textContent="WORKER_URL is not configured"; status.style.color="#fca5a5"; return; } status.textContent="Validating..."; status.style.color="#a5b4fc"; try{ const r=await fetch(WORKER_URL+"/me",{method:"POST",headers:{"Content-Type":"application/json","X-Admin-Key":val},body:JSON.stringify({visitor_id:VISITOR_ID})}); let data={}; try{ data=await r.json(); }catch(e){} if(r.ok&&data.ok){ try{ sessionStorage.setItem(ADMIN_KEY_STORAGE,val); }catch(e){} adminKey=val; updateAdminBadge(); status.textContent="Valid: "+(data.user_type||"admin"); status.style.color="#6ee7b7"; toast("Saved"); fetchMyQuota(); setTimeout(()=>{ const m=$("adminModal"); if(m) m.classList.remove("open"); },800); }
    else { status.textContent="Invalid: "+(data.message||data.error||"Invalid key"); status.style.color="#fca5a5"; } }catch(err){ status.textContent="Network error: "+(err.message||"unknown"); status.style.color="#fca5a5"; } });
safeOn("adminKeyLogout","click",function(){ try{ sessionStorage.removeItem(ADMIN_KEY_STORAGE); }catch(e){} adminKey=""; updateAdminBadge(); toast("Key removed"); const m=$("adminModal"); if(m) m.classList.remove("open"); fetchMyQuota(); });
safeOn("adminModal","transitionend",updateAdminBadge);
// Spider: kept, but pause when tab hidden + respect reduced motion
(function(){ const canvas=$("spider"); if(!canvas) return; const ctx=canvas.getContext("2d"); if(!ctx) return; if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){ canvas.style.display="none"; return; } let W,H,dpr,last=performance.now(),actx=null,rafId=null,running=true; function resize(){ W=innerWidth; H=innerHeight; dpr=devicePixelRatio||1; canvas.width=W*dpr; canvas.height=H*dpr; canvas.style.width=W+"px"; canvas.style.height=H+"px"; ctx.setTransform(dpr,0,0,dpr,0,0); } resize(); addEventListener("resize",resize); document.addEventListener("visibilitychange",()=>{ if(document.hidden){ running=false; if(rafId) cancelAnimationFrame(rafId); } else if(!running){ running=true; last=performance.now(); rafId=requestAnimationFrame(draw); } }); function mkGrid(){ const g=[]; for(let r=0;r<4;r++) for(let c=0;c<6;c++) g.push({x:90+(c+0.5)*((W-180)/6),y:120+(r+0.5)*((H-180)/4)}); return g; } let targets=mkGrid(); const sp={x:W*0.5,y:90,tx:targets[0].x,ty:targets[0].y}; const legs=[-75,-38,38,75,105,142,-142,-105].map(d=>{ const a=d*Math.PI/180; return {ang:a,fx:sp.x+Math.cos(a)*30,fy:sp.y+Math.sin(a)*30,tx:sp.x+Math.cos(a)*30,ty:sp.y+Math.sin(a)*30}; }); let moving=false,moveTimer=0; const L1=34,L2=34,LIM=46; function snd(){ try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==="suspended") actx.resume().catch(()=>{}); const n=actx.currentTime,o=actx.createOscillator(),g=actx.createGain(),f=actx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=2400; f.Q.value=1.4; o.type="square"; o.frequency.setValueAtTime(2400,n); g.gain.setValueAtTime(0,n); g.gain.linearRampToValueAtTime(0.06,n+0.004); g.gain.exponentialRampToValueAtTime(0.0001,n+0.07); o.connect(f); f.connect(g); g.connect(actx.destination); o.start(n); o.stop(n+0.07); }catch(e){} } function draw(now){ if(!running) return; const dt=Math.min(50,now-last); last=now; if(moving){ moveTimer-=dt/1000; if(moveTimer<=0){ moving=false; targets.shift(); if(!targets.length) targets=mkGrid(); sp.tx=targets[0].x; sp.ty=targets[0].y; } }
    else { const dx=sp.tx-sp.x, dy=sp.ty-sp.y, dist=Math.hypot(dx,dy); if(dist<6){ moving=true; moveTimer=1; snd(); }
      else { const spd=Math.max(180,dist*3+30)*dt/1000; if(spd>=dist){ sp.x=sp.tx; sp.y=sp.ty; }
        else { sp.x+=dx/dist*spd; sp.y+=dy/dist*spd; } } } ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(214,217,224,.1)";
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(sp.x,0);
    ctx.lineTo(sp.x,sp.y-12);
    ctx.stroke();
    legs.forEach((l,i)=>{ const bx=sp.x+Math.cos(l.ang)*12, by=sp.y+Math.sin(l.ang)*10; const dx=l.fx-bx, dy=l.fy-by; const dist=Math.min(Math.hypot(dx,dy),L1+L2-0.5); if(dist<0.001) return; const ca=(dist*dist-L1*L1-L2*L2)/(2*L1*L2); const an=Math.acos(Math.max(-1,Math.min(1,ca))); const kd=L1+L2*Math.cos(an), kh=L2*Math.sin(an); const ba=Math.atan2(dy,dx)-Math.atan2(kh,kd); const kx=bx+Math.cos(ba)*L1, ky=by+Math.sin(ba)*L1; ctx.strokeStyle="#2a2f3c"; ctx.lineWidth=2; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(kx,ky); ctx.lineTo(l.fx,l.fy); ctx.stroke(); ctx.fillStyle="#0d1018"; ctx.strokeStyle="#232733"; ctx.beginPath(); ctx.arc(kx,ky,2.8,0,6.28); ctx.fill(); ctx.stroke(); ctx.fillStyle=i%2===0?"#8a90a0":"#6b7280"; ctx.beginPath(); ctx.arc(l.fx,l.fy,2.3,0,6.28); ctx.fill(); });
    ctx.fillStyle="rgba(0,0,0,.35)";
    ctx.beginPath();
    ctx.ellipse(sp.x,sp.y+22,18,6,0,0,6.28);
    ctx.fill();
    ctx.fillStyle="#0d1018";
    ctx.strokeStyle="#2c313f";
    ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.ellipse(sp.x,sp.y+12,13,17,0,0,6.28);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle="#151821";
    ctx.beginPath();
    ctx.ellipse(sp.x,sp.y-5,10.5,10.5,0,0,6.28);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle="#ff4d9a";
    ctx.beginPath();
    ctx.arc(sp.x-3.2,sp.y-8,1.7,0,6.28);
    ctx.fill();
    ctx.fillStyle="#4fe0ff";
    ctx.beginPath();
    ctx.arc(sp.x+3.2,sp.y-8,1.7,0,6.28);
    ctx.fill();
    if(moving){ ctx.strokeStyle="rgba(255,77,154,.25)"; ctx.beginPath(); ctx.arc(sp.x,sp.y+3,10+(1-moveTimer)*18,0,6.28); ctx.stroke(); } legs.forEach((l,i)=>{ const bx=sp.x+Math.cos(l.ang)*12, by=sp.y+Math.sin(l.ang)*10; if(Math.hypot(l.fx-bx,l.fy-by)>LIM){ const td=28+(i%3)*6+Math.random()*6; l.tx=sp.x+Math.cos(l.ang)*td; l.ty=sp.y+Math.sin(l.ang)*td; } const dx=l.tx-l.fx, dy=l.ty-l.fy, d=Math.hypot(dx,dy); if(d>0.5){ const mv=Math.min(d,420*dt/1000); l.fx+=dx/d*mv; l.fy+=dy/d*mv; if(d>3&&mv>=d-0.1&&Math.random()<0.85) snd(); } });
    rafId=requestAnimationFrame(draw);
  } rafId=requestAnimationFrame(draw);
})();
(function diagnoseI18n(){ try{ if(!T.en) return; const ref=Object.keys(T.en); Object.keys(T).forEach(lang=>{ if(lang==="en") return; const missing=ref.filter(k=>T[lang][k]==null); if(missing.length) console.warn('[i18n] Missing keys in "'+lang+'":',missing.join(", ")); }); }catch(e){} })();
})();
// Bio Frame
const bioFrame=document.getElementById("bioFrame");
window.notifyBio=function(stage,isSearching){ try{ if(bioFrame&&bioFrame.contentWindow){ const origin=location.origin; const msgs=[{type:"mido-stage",stage:stage,searching:isSearching},{type:"stage",stage:stage,value:stage,searching:isSearching},{type:"mido:stage",payload:{stage:stage,searching:isSearching}},{action:"setStage",stage:stage},{cmd:"stage",value:stage}]; for(let i=0;i<msgs.length;i++){ try{ bioFrame.contentWindow.postMessage(msgs[i],origin); }catch(e){} } window.midoStage=stage; window.midoSearching=isSearching; } }catch(e){} if(isSearching){ document.body.classList.add("searching"); } else if(stage===4||stage===-1){ setTimeout(()=>document.body.classList.remove("searching"),2500); } };
if(bioFrame){ bioFrame.addEventListener("load",function(){ try{ const d=bioFrame.contentDocument; if(!d||!d.body||d.body.innerHTML.trim()===""){ console.warn("[Mido] bacterium-lite.html loaded but appears empty."); }
      else { console.log("[Mido] bacterium-lite.html loaded OK."); } }catch(e){ console.warn("[Mido] Could not inspect bacterium-lite.html:",e.message); } if(typeof notifyBio==="function") notifyBio(4,false);
  },{once:true});
bioFrame.addEventListener("error",function(){ console.error("[Mido] bacterium-lite.html failed to load."); });
}

