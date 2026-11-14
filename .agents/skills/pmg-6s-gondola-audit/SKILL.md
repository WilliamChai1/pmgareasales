---
name: pmg-6s-gondola-audit
description: Architecture and operational SOP reference for PMG 6S Gondola photo capture, Google Drive/Sheet zero-auth sync, thumbnail lightbox display, and PIC approval state persistence.
---

# PMG 6S Gondola Photo Audit & SOP Compliance Skill

Use this skill when debugging or extending 6S gondola photo uploads, image preview rendering, Google Apps Script photo syncing, or supervisor photo approval persistence.

## Key Files & Symbols
- Frontend (`app.js`):
  - `DEFAULT_LEADERS_JOBSCOPE` — Future Leaders & outlet role jobscope defaults (ABM, Pharmacist, PA).
  - `submit6sPhotoToDrive` — Uploads 6S evidence photos via Apps Script backend.
  - `unpack6sPhotoEntry`, `normalize6sPhotosList` — Normalizes sheet/Drive photo metadata payloads.
  - `format6sTimestampForGasAudit`, `format6sDisplayTimestamp` — Formats timestamps consistently between frontend UI and Apps Script row matching.
  - `open6sReviewModal`, `confirmAudit6sPhoto`, `render6sSection` — Supervisor review lightbox and approval/rejection confirmation workflow.
- Frontend markup (`index.html`):
  - `#sixSNoImageCard` — Empty/missing image fallback UI container.
- Backend (`backend/Code.gs`):
  - `doPost` — Web App router (`v79.1`, do NOT overwrite with legacy scripts).
  - `getDashboardData` — Aggregates dashboard state including synced 6S photos.
  - `upload6sPhoto`, `get6sPhotos`, `audit6sPhoto` — Handles Sheet/Drive storage and approval status persistence.

## Operational & Reliability Rules
- Always preserve approval state consistency between `audit6sPhoto` in `backend/Code.gs` and `confirmAudit6sPhoto` / `normalize6sPhotosList` in `app.js` so approved photos do not revert to pending on reload.
- Enforce standard retail SOP checks: **FEFO**, daily gondola **front-to-back wipe photo** (with Google Chat verification), **shelf refill photo**, **price tag photo**, double-checked **prescription dispensing**, **cold-chain temperature logs**, and **cash float handovers**.
- Note: Changes to `backend/Code.gs` must also be deployed in the Google Apps Script Web App (`API_URL`) to take effect in production.
