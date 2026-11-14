---
name: dpos-clinical-academy
description: Guidance for DPOS Academy clinical training modules, 100-point PMG Frontline Rubric, 8-Scheme PA standards, multilingual quizzes, Malaysian/Sarawak customer role-play, and ethical House Brand upselling.
---

# DPOS Clinical Academy & Frontline Upsell Skill

Use this skill when maintaining DPOS training modules, localized quizzes, clinical role-play prompts, or House Brand upselling guides.

## Key Files
- `dpos.js` — Core DPOS Academy runtime, rubric evaluation, and clinical quiz/role-play flows.
- `data/dpos_catalog.js` — Module catalog metadata.
- `data/dpos_week1.js` — Week 1 clinical training content.
- `data/dpos_localized_quizzes.js` — Multilingual quiz bank.
- `data/clinical_upsell_modules.js` — Symptom-to-product clinical upselling modules.
- `data/house_brands.js` — House Brands dataset consumed by frontend modules.

## Clinical & Training Standards
1. **Rubric & Feedback Discipline**:
   - Follow the **100-point PMG Frontline Rubric** and **8-Scheme Pharmacist Assistant** standards.
   - Never output contradictory scores and feedback: every deducted point must have an explicit line-item explanation, while verified strengths stay highlighted clearly in green.
2. **Pharmacology Accuracy**:
   - Clearly separate **NSAID adverse effects** (e.g., gastric upset) from **true drug allergy**.
   - Distinguish **vegetarian** joint care (`JH Nutrition Flexson`) from **marine/collagen** formulations (`Livemore Flexmore`).
   - Enforce **antibiotic stewardship** and safe OTC maximum dosage caps.
3. **Malaysian / Sarawak Customer Personas**:
   - Role-play realistic walk-in customers: budget-conscious, skeptical (`minyak angin` preference), gastric/NSAID-cautious, rushed, anxious, or elderly/hearing-impaired.
   - Maintain realistic objections before accepting pharmacist/PA advice.
4. **Ethical Upsell Pairings & Programs**:
   - **Cough**: `Biowell Terrafast` / `Shieldmax`
   - **Joint Pain**: `JH Nutrition Flexson` / `Livemore Flexmore`
   - **Insomnia**: `JH Nutrition Sleepright`
   - **PWP**: Add-on pitches for baskets **above RM20**; **GWP**: Threshold pitches at **RM250+**.
   - **Senior Care Plus (SCP)**: Promote membership perks and the **28th monthly free blood glucose screening**.

## Verification
- After editing `dpos.js` or JS data modules under `data/`, run `node --check dpos.js` (and `node --check` on any modified JS files).
