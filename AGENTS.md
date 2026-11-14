# PMG Sales Hub & DPOS Academy — Agent Workspace Index

Repository: `WilliamChai1/pmgareasales` (live frontend: `https://williamchai1.github.io/pmgareasales/`).

> Follow `GEMINI.md` Directive 1 (**Plan First**: present a structured plan with `RequestFeedback: true` before edits or operational commands) alongside the workspace safety checks below.

---

## 1. Repository Architecture

### Frontend PWA (GitHub Pages)
- `index.html` — Single-page PWA shell (`v79.1`, includes `#outletTsMarker`, `#outletHbMarker`, `#sixSNoImageCard`, and cache-busted `?v=79.1` asset links).
- `app.js` — Main Sales Hub logic: live dashboard loading (`loadDashboardData`, `renderDashboard`), November 2026 Kota Sentosa target normalization (`normalizeNovemberTargets`: TS RM 350,000; HB Tier 1 RM 161,900 / Tier 2 RM 171,700 / Tier 3 RM 182,200), Daily Briefing (`openDailyBriefingModal`, `computeBriefingSec1Text`, `reconcileBriefingFinancials`), native PNG report generation (`openReportModal`, `renderReportCanvasNative`), push alerts (`dispatchPushNotification`, `subscribeToNativePush`), and 6S Gondola Drive/Sheet photo workflows (`submit6sPhotoToDrive`, `open6sReviewModal`, `confirmAudit6sPhoto`, `render6sSection`).
- `dpos.js` — DPOS Clinical Academy training, rubric evaluation, and quiz runtime.
- `styles.css` — Responsive UI styling.
- `sw.js` & `manifest.json` — Service worker (`CACHE_NAME = 'pmg-hub-v79.1'`) and PWA manifest.

### Training & Product Datasets (`data/`)
- `data/clinical_upsell_modules.js`
- `data/dpos_catalog.js`
- `data/dpos_localized_quizzes.js`
- `data/dpos_week1.js`
- `data/house_brands.js`
- `data/house_brands_catalog.json`

### Google Apps Script Backend (`backend/`)
- `backend/Code.gs` — Deployed Google Apps Script backend (`v79.1`; `doPost`, `getDashboardData`, `upload6sPhoto`, `get6sPhotos`, `audit6sPhoto`). Note: updating `backend/Code.gs` in Git requires manual deployment to Apps Script (`API_URL`) to take effect live.
- `backend/appsscript.json` — Apps Script manifest.

### Cloud Automation Scripts & GitHub Actions
- `scripts/send_daily_briefing_cron.js` — Node cron script (supports `PMG_API_URL` and `PMG_BRANCH` env overrides; defaults to live Apps Script `API_URL` and `"Kota Sentosa"`). Invoked daily at `15:00 UTC` (`23:00 MYT`) by `.github/workflows/daily_briefing_cron.yml`.
- `scripts/sync_house_brands.js` — Node sync script using relative `path.join(__dirname, '..', 'data', ...)` to refresh `data/house_brands_catalog.json` and `data/house_brands.js` from `https://jasehealthcare.com/wp-json/wp/v2`. Scheduled weekly by `.github/workflows/sync_house_brands.yml`.

---

## 2. Packaged Antigravity Customizations (`.agents/`)

### Subagents (`.agents/agents/`)
- `.agents/agents/dpos-clinical-simulator.md` — Clinical role-play & Malaysian/Sarawak patient persona trainer (100-point rubric, 8-Scheme PA standards).
- `.agents/agents/pmg-daily-briefing.md` — Daily/MTD performance analyst & EN/Simplified Chinese/Bahasa Melayu briefing specialist.
- `.agents/agents/frontline-upsell-coach.md` — Acute symptom House Brand pairings, PWP (>RM20), GWP (RM250+), and SCP coaching.
- `.agents/agents/operational-compliance-agent.md` — FEFO, daily gondola front-to-back clean photo, refill/price tag verification, and dispensing safety logs.
- `.agents/agents/push-notification-dispatcher.md` — Web Push SDK, HTML5 Notification, and `ntfy.sh` teammate alert coordination.

### Skills (`.agents/skills/`)
- `.agents/skills/pmg-daily-sales-briefing/SKILL.md`
- `.agents/skills/dpos-clinical-academy/SKILL.md`
- `.agents/skills/pmg-6s-gondola-audit/SKILL.md`
- `.agents/skills/pmg-house-brands-sync/SKILL.md`

### Workflows (`.agents/workflows/`)
- `.agents/workflows/cloud-workspace-guide.md`

---

## 3. Cloud Hygiene & Verification Rules
1. Never commit `.env`, private keys, OAuth tokens, `.clasp.json`, `node_modules/`, or PDPA-sensitive patient records (enforced via `.gitignore`).
2. Keep all script paths relative (`__dirname` / repo root) or driven by environment variables; never hardcode local PC paths (`C:\Users\...`, OneDrive, Desktop).
3. Validate modified JS files with `node --check` before committing, and bump `sw.js` `CACHE_NAME` + `index.html` `?v=` parameters consistently when frontend assets change.
