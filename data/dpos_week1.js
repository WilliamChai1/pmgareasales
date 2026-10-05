/* ============================================================================
   DPOS ACADEMY – WEEK 1 SEED CONTENT (Joint Health & Osteoarthritis Care)
   ----------------------------------------------------------------------------
   Used as:
     1. The source for the first row of the 'DPOS_Active_Week' tab in 'PMG Walao'.
     2. An offline DEMO fallback when the Apps Script backend is not deployed yet.
   Product facts below are limited to what is verifiable in the official Jase
   Healthcare catalog (data/house_brands_catalog.json). Where the catalog has no
   composition (V-Infinity Neoflex, Medicplast Heat Therapy Patch) the lesson says
   "read the pack" instead of inventing ingredients.
   ============================================================================ */
window.DPOS_SEED_WEEK = {
  topic: "Week 1: Joint Health & Osteoarthritis Care",

  skus: "JH Nutrition Flexson, Livemore Flexmore, Biowell Terrafast (paracetamol 500mg), Medicplast Heat Therapy Patch, V∞ Neoflex",

  summaryMd: [
    "## 🦵 Osteoarthritis (OA) in 60 seconds",
    "- **What it is:** wear-and-tear of joint cartilage. Commonest in knees, hips, hands and spine, usually **age 50+**, overweight, or after an old injury.",
    "- **Typical pattern:** pain **worse with activity or stairs**, eases with rest; morning stiffness **under 30 minutes**; creaking (crepitus); no fever.",
    "- **Goal at the counter:** reduce pain, keep the person moving, protect the stomach, kidney and heart, and support the joint over the long term.",
    "",
    "## 🚩 Red flags – send to doctor / clinic first (ask BEFORE you sell)",
    "- Joint **hot, red, very swollen**, with or without fever (infection or gout flare)",
    "- Pain after a **fall or twisting injury**, cannot bear weight, or visible deformity",
    "- Joint **locks** or **gives way**; pain that **wakes the person at night**",
    "- Many small joints stiff for **more than 1 hour** in the morning (possible inflammatory arthritis)",
    "- Unexplained weight loss, fever, or a swollen, painful **calf**",
    "",
    "## 🛡️ Safety questions (always ask)",
    "- Kidney disease, stomach ulcer or gastritis, heart failure or uncontrolled blood pressure, asthma?",
    "- On **blood thinners** (warfarin, aspirin, clopidogrel)? No NSAIDs. See the pharmacist before any turmeric or boswellia supplement.",
    "- **Allergies:** fish, egg, shellfish? (Flexmore contains fish collagen and eggshell membrane)",
    "- Other products with **paracetamol**? Maximum **4 g (8 × 500 mg) in 24 hours** from all sources.",
    "- Pregnant or breastfeeding? Is the skin broken or numb where a patch will go?",
    "",
    "## 💊 House Brand picks for this topic",
    "- **O – Immediate relief:** **Biowell Terrafast** (paracetamol 500 mg; the catalog lists it for pain including osteoarthritis) and **Medicplast Heat Therapy Patch** for stiff, aching joints (not for swollen or injured joints, never on broken skin).",
    "- **S – Root-cause support:** **JH Nutrition Flexson** (Curcuma longa extract 250 mg + Boswellia serrata extract 200 mg; traditionally used for relief of joint pain).",
    "- **S – Root-cause support:** **Livemore Flexmore** sachet (fish collagen peptide 4000 mg, sodium hyaluronate, eggshell membrane, boswellia and turmeric extracts, vitamins).",
    "- **V∞ Neoflex:** listed by Jase under Traditional Medicine. Read the pack for ingredients and directions before you recommend it.",
    "- Supplements **support** comfort over weeks. They do **not** replace medicine and are **not** for red-flag cases. Never promise a cure.",
    "",
    "## 🌿 Non-drug advice (say it, it builds trust)",
    "- Every **1 kg** of weight lost takes about **4 kg** of load off the knees.",
    "- Walk, swim or cycle gently and strengthen the thigh (quadriceps) muscles.",
    "- Heat for stiffness, cold pack for a new swelling. Avoid deep squatting and long kneeling.",
    "",
    "## 🛒 The PMG counter close (every customer)",
    "1. **Member check:** \"Ada member PMG tak? Keahlian **PERCUMA** (FREE).\"",
    "2. **Age 55+:** introduce **Senior Care Plus**, including the **FREE blood glucose test on the 28th of every month**.",
    "3. Mention the current **GWP / PWP** before you total the bill."
  ].join("\n"),

  quiz: [
    {
      q: "Uncle Tan, 67, says his right knee hurts when climbing stairs and after sitting for a long time. Morning stiffness lasts about 10 minutes. No swelling, no fever, no injury. What is the most likely pattern?",
      options: [
        "A septic (infected) joint",
        "Osteoarthritis – the mechanical wear-and-tear pattern",
        "An acute gout flare",
        "Rheumatoid arthritis"
      ],
      answer: 1,
      rationale: "Pain that is worse with use, morning stiffness under 30 minutes and no heat, redness or fever are classic OA features. Infection and gout are hot, red and very painful, while rheumatoid arthritis usually means more than 1 hour of morning stiffness in many small joints.",
      safety: "Even with a classic OA story, still ask about red flags (heat, redness, fever, injury) before recommending anything."
    },
    {
      q: "Aunty Mary asks for a joint supplement for her knee. During Diagnosis she says it turned red, hot and very swollen last night and she feels feverish. What do you do?",
      options: [
        "Sell Flexson and a heat patch to calm it down",
        "Sell paracetamol only and ask her to come back next week",
        "Advise her to see a doctor or clinic today and do not apply heat",
        "Recommend Flexmore for faster cartilage repair"
      ],
      answer: 2,
      rationale: "A hot, red, swollen joint with fever is a red flag (possible septic arthritis or gout) that needs same-day medical assessment. Heat can worsen inflammation and a supplement only delays treatment. Safety first, sale second.",
      safety: "Hot + red + swollen + fever = refer the same day. No heat and no supplement first."
    },
    {
      q: "Uncle Lim takes warfarin and has knee OA pain. He asks for ibuprofen because his friend uses it. What is the best response?",
      options: [
        "Sell ibuprofen and tell him to take it after food",
        "Explain that NSAIDs raise bleeding risk with warfarin, suggest paracetamol (for example Terrafast, within the daily maximum) and involve the pharmacist",
        "Tell him to stop warfarin while he takes ibuprofen",
        "Suggest a double dose of a turmeric supplement instead"
      ],
      answer: 1,
      rationale: "NSAIDs plus warfarin significantly increase the risk of bleeding, including stomach bleeding. Paracetamol is the safer first choice as long as he stays within 4 g in 24 hours. Never advise stopping a prescribed blood thinner, and turmeric or boswellia products also need pharmacist review on blood thinners.",
      safety: "Check blood thinners before ANY pain product or herbal supplement."
    },
    {
      q: "What is the maximum paracetamol dose for a healthy adult in 24 hours, counting ALL products combined?",
      options: [
        "2 g (4 × 500 mg tablets)",
        "3 g (6 × 500 mg tablets)",
        "6 g (12 × 500 mg tablets)",
        "4 g (8 × 500 mg tablets)"
      ],
      answer: 3,
      rationale: "The maximum is 4 g in 24 hours (8 × 500 mg tablets) with doses spaced 4 to 6 hours apart. Many cold and flu products also contain paracetamol, so always ask what else the customer is taking.",
      safety: "Ask about other paracetamol products. Use a lower limit for liver disease or regular heavy alcohol use."
    },
    {
      q: "In the DPOS protocol, which step is where PMG House Brand supplements such as Flexson belong?",
      options: [
        "D – Diagnosis triage",
        "P – Prescribe / pharmacist line",
        "O – OTC immediate relief",
        "S – Supplement for the root cause (long-term support)"
      ],
      answer: 3,
      rationale: "D is asking, triaging and screening red flags. P is the pharmacist-line medicines. O is quick symptom relief such as Terrafast or the Heat Therapy Patch. S is the House Brand supplement that supports the underlying problem over weeks.",
      safety: "S comes last, only after D (triage) and the safety checks are done."
    },
    {
      q: "Which description of JH Nutrition Flexson is correct?",
      options: [
        "Curcuma longa extract 250 mg + Boswellia serrata extract 200 mg, traditionally used for relief of joint pain",
        "Grape seed extract 300 mg for circulation",
        "Paracetamol 500 mg for fever and pain",
        "Vitamin D3 1000 IU for bone health"
      ],
      answer: 0,
      rationale: "Flexson combines turmeric (Curcuma longa) and boswellia extracts for joint comfort. Quote only what is on the pack and never promise to cure arthritis or regrow cartilage.",
      safety: "Check blood thinners, pregnancy and gallbladder problems before recommending turmeric or boswellia."
    },
    {
      q: "A customer with a known fish and egg allergy asks for Livemore Flexmore sachets. What should you do?",
      options: [
        "Sell it, because allergies only matter for tablets",
        "Tell her to take half a sachet",
        "Do not recommend it, because it contains fish collagen peptide and eggshell membrane. Offer a safer alternative after the pharmacist checks",
        "Recommend two sachets a day to build tolerance"
      ],
      answer: 2,
      rationale: "Flexmore contains hydrolysed fish collagen and hydrolysed chicken eggshell membrane, so it is unsuitable for someone allergic to fish or egg. Always read the ingredient list against the customer's allergies.",
      safety: "The allergy check is part of Diagnosis: fish, egg, shellfish, nuts."
    },
    {
      q: "Which non-drug advice has the strongest evidence for knee osteoarthritis?",
      options: [
        "Complete bed rest until the pain is gone",
        "Gradual weight loss (if overweight) plus gentle low-impact exercise and thigh strengthening",
        "Deep squats every day to \"lubricate\" the knee",
        "Stop walking and use the lift or escalator from now on"
      ],
      answer: 1,
      rationale: "Weight reduction and regular strengthening or low-impact exercise reduce pain and improve function. Every 1 kg lost removes about 4 kg of load from the knees, while prolonged rest weakens muscles and stiffens joints.",
      safety: "Refer to a doctor or physiotherapist if the pain is severe, wakes the person at night or function keeps getting worse."
    },
    {
      q: "Aunty Rose has chronic stiff, aching knees every morning. No swelling, no injury and the skin is intact. Which local OTC option fits best?",
      options: [
        "Medicplast Heat Therapy Patch to ease stiffness, after checking the skin and sensation",
        "A cold pack only, because heat is always dangerous",
        "A heat patch on a newly twisted, swollen ankle",
        "A strong ointment rubbed over broken skin"
      ],
      answer: 0,
      rationale: "Gentle heat suits chronic stiffness and aching. Use cold for a new swelling or injury in the first 48 hours. Avoid patches on broken, irritated or numb skin (for example diabetic neuropathy) and follow the pack directions on wear time.",
      safety: "Never on broken, irritated or numb skin. Stop if the skin burns or turns red."
    },
    {
      q: "Uncle Tan (68) is at the counter with Flexson and Terrafast. What is the best way to close the sale?",
      options: [
        "Ring up quickly, because he has already decided",
        "Ask only whether he wants a plastic bag",
        "Ask if he is a member (membership is FREE), introduce Senior Care Plus with the FREE blood glucose test on the 28th, and mention the current GWP / PWP",
        "Offer a bigger discount without asking about membership"
      ],
      answer: 2,
      rationale: "The counter is where service becomes loyalty. Free membership, Senior Care Plus for customers aged 55+ (FREE blood glucose test on the 28th of every month) and the current GWP / PWP add real value for the customer and bring them back.",
      safety: "Offer, do not force. Explain the benefit in one sentence and let the customer decide."
    }
  ],

  persona: [
    "VISIBLE: Uncle Tan, a 67-year-old Chinese gentleman, walks into the Kota Sentosa outlet rubbing his right knee. Greet him and find out how you can help.",
    "",
    "HIDDEN BACKGROUND (customer only): You are Mr. Tan Ah Kow, 67, a retired lorry driver living near 7th Mile, Kuching. You have had right knee pain for about 6 months. It is worse on stairs and after sitting for a long time. Morning stiffness lasts about 10 minutes. There is no swelling, redness, fever or injury. You take amlodipine for high blood pressure.",
    "Years ago an ibuprofen from a clinic gave you bad stomach pain. Mention the stomach pain ONLY if the teammate asks about your stomach, gastritis, ulcer or past painkillers. You are on no blood thinners, have no kidney problem and no allergies.",
    "A clinic once told you that your blood sugar was borderline. You take no diabetes medicine. Mention this only if asked, or if the teammate introduces the free glucose test.",
    "You are polite but sceptical about supplements (\"mahal, boleh jalan ke?\"), worried about price, and want quick relief first. You are NOT yet a PMG member.",
    "If the teammate recommends something sensible and explains it well, agree to buy and walk to the cashier. At the counter, react naturally to any membership, Senior Care Plus or GWP / PWP offer and show interest when it is explained clearly."
  ].join("\n"),

  promo: "Mention whichever GWP / PWP is running at the counter this week. (Edit this cell every week with the real offer, for example the product and the price.)"
};
