---
name: pmg-daily-sales-briefing
description: Workflow and calculation guide for PMG Sales Hub daily/MTD sales tracking, November 2026 Kota Sentosa targets, MTD progress markers, 5-point PIC briefings, EN/ZH/BM localization, and automated cron/push alerts.
---

# PMG Daily Sales Briefing & Target Pacing Skill

Use this skill whenever updating monthly outlet sales targets, editing the Daily Briefing UI/canvas report, formatting multilingual briefings, or troubleshooting daily briefing cron notifications.

## Key Files & Symbols
- Frontend logic: `app.js`
  - `normalizeNovemberTargets` — Enforces November 2026 Kota Sentosa targets (`t.ts = 350000`, `t.hb = 182200`, `t.t1 = 161900`, `t.t2 = 171700`, `t.t3 = 182200`).
  - `findBranchKey`, `loadDashboardData`, `renderDashboard` — Loads live branch data from `API_URL` and renders outlet Total Sales & House Brand progress bars.
  - `computeBriefingSec1Text`, `openDailyBriefingModal`, `reconcileBriefingFinancials` — Builds and reconciles Section 1 financial metrics and MTD pacing gaps (Ahead / Behind).
  - `openReportModal`, `renderReportCanvasNative` — Generates downloadable native PNG briefing reports.
  - `dispatchPushNotification`, `subscribeToNativePush` — Dispatches teammate web/native push alerts.
- Frontend markup: `index.html` (`#outletTsMarker`, `#outletHbMarker` MTD pacing markers).
- Cloud cron & workflow:
  - `scripts/send_daily_briefing_cron.js` — Fetches `getDailyBriefing` from `PMG_API_URL` (fallback: default Apps Script `API_URL`) for `PMG_BRANCH` / CLI arg (default: `"Kota Sentosa"`), broadcasts via `https://ntfy.sh/`, and records via `sendBackendNativePush`.
  - `.github/workflows/daily_briefing_cron.yml` — Scheduled daily at `15:00 UTC` (`23:00 MYT`).

## Standard 5-Point PIC Daily Briefing Structure
Always organize briefings into these 5 numbered sections and translate cleanly into **English**, **Simplified Chinese (简体中文)**, and **Bahasa Melayu**:
1. **Yesterday's Operational & Financial Review** (TS, HB, HM, Customer Count, Average Basket Size, MTD pacing vs target).
2. **Today's Key Priorities** (default: Sales Focus & priority House Brand / clinical campaigns).
3. **HQ Directives & Target Alignment** (default: Incentive tier tracking).
4. **Operational Precautions & Compliance** (FEFO rotation, gondola front-to-back clean photo, shelf refill photo, price tag photo).
5. **Recognition & Team Encouragement** (House Brand Top Performers podium).

## Cloud Verification Steps
- After editing `app.js` or `scripts/send_daily_briefing_cron.js`, run `node --check app.js` and `node --check scripts/send_daily_briefing_cron.js`.
- If `app.js` or `index.html` changed, bump the PWA version consistently in `sw.js` (`CACHE_NAME`) and `index.html` (`?v=...`).
