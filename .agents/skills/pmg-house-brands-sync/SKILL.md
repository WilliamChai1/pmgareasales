---
name: pmg-house-brands-sync
description: Runbook for syncing the PMG House Brands product catalog from Jase Healthcare WordPress REST API into repository data files cleanly from Antigravity Cloud or GitHub Actions.
---

# PMG House Brands Catalog Sync Skill

Use this skill when refreshing House Brand SKUs, prices, descriptions, or category mappings in `data/house_brands.js` and `data/house_brands_catalog.json`.

## Key Files
- `scripts/sync_house_brands.js` — Fetches product data from `https://jasehealthcare.com/wp-json/wp/v2` and updates both catalog files relative to `__dirname`:
  - `data/house_brands_catalog.json`
  - `data/house_brands.js`
- `.github/workflows/sync_house_brands.yml` — Automated weekly GitHub Action running `node scripts/sync_house_brands.js` and pushing changes back to `origin/main`.

## Running & Validating in Antigravity Cloud
1. Ensure Node.js 18+ (`fetch` built-in) is available (`node -v`).
2. Validate script syntax first:
   ```bash
   node --check scripts/sync_house_brands.js
   ```
3. Execute the sync script from the repository root:
   ```bash
   node scripts/sync_house_brands.js
   ```
4. Validate generated JS module and JSON:
   ```bash
   node --check data/house_brands.js
   ```
5. Never introduce local OS paths (`C:\Users\...`, Desktop, OneDrive); keep all paths relative via `path.join(__dirname, '..', 'data', ...)`.
6. If the frontend PWA should immediately bypass cached catalog assets on devices, bump `CACHE_NAME` in `sw.js` and matching query strings in `index.html`.
