---
description: Standard Antigravity Cloud workflow for validating, cache-busting, auditing, and pushing pmgareasales changes to origin/main.
---

# PMG Sales Hub — Cloud Workspace Maintenance Workflow

Follow this checklist when working in Antigravity Cloud after cloning `WilliamChai1/pmgareasales`:

1. **Check Repository Status**
   ```bash
   git status
   ```

2. **Validate JavaScript Syntax**
   Run syntax checks across modified application and automation scripts:
   ```bash
   node --check app.js
   node --check dpos.js
   node --check sw.js
   node --check scripts/send_daily_briefing_cron.js
   node --check scripts/sync_house_brands.js
   ```

3. **PWA Cache Versioning (When Frontend Assets Change)**
   If `index.html`, `app.js`, `dpos.js`, `styles.css`, `sw.js`, or `data/*.js` were modified:
   - Increment `CACHE_NAME` in `sw.js` (e.g., `pmg-hub-v79.1` -> next version).
   - Update matching `?v=...` asset query strings and displayed version label in `index.html`.

4. **Backend (`backend/Code.gs`) Reminder**
   - GitHub Pages (`https://williamchai1.github.io/pmgareasales/`) serves static frontend assets automatically after `git push`.
   - Any edits inside `backend/Code.gs` must also be pasted/deployed to the bound Google Apps Script Web App project (`API_URL`) to go live.

5. **Cloud Portability & Secret Audit**
   Verify no local PC paths (`C:\Users\...`, OneDrive, Desktop), raw API secrets, or PDPA-sensitive patient exports are staged.

6. **Commit & Push**
   ```bash
   git add <intended-files>
   git status
   git commit -m "<descriptive message>"
   git push origin main
   ```
