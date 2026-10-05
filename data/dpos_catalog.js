/* ============================================================================
   DPOS ACADEMY – INFINITE CLINICAL CHALLENGE CATALOG (10 Domains)
   ----------------------------------------------------------------------------
   Comprehensive clinical repository of 10 minor ailment categories & emergency
   red flag cases for on-the-fly random scenario generation at PMG Pharmacy.
   ============================================================================ */

window.DPOS_CLINICAL_CATALOG = {
  // ─── 1. GASTROINTESTINAL (GIT) ─────────────────────────────────────────────
  git: {
    id: "git",
    name: "Gastrointestinal (GIT)",
    icon: "🫄",
    conditions: [
      {
        id: "gerd",
        name: "GERD & Heartburn (Acid Reflux)",
        emergency: false,
        persona: {
          name: "Ken (22)",
          age: 22,
          gender: "male",
          role: "College Student",
          language: "en",
          visible: "VISIBLE: Ken, a 22-year-old university student, walks in holding his chest and throat. He complains of a painful burning sensation in his chest and sour fluid rising into his throat after late-night study meals.",
          hidden: "You are Ken, 22, an engineering student. You have burning chest pain behind your breastbone after eating oily supper and lying down. No black stools, no difficulty swallowing, no heart history. You want fast relief because you have an exam tomorrow. You are not a PMG member."
        },
        summaryMd: "## 🫄 GERD & Heartburn in 60s\n- **Pattern:** Burning sensation behind breastbone (pyrosis), acid regurgitation, worse lying down or bending after meals.\n- **🚩 Red Flags (Send to Doctor):** Difficulty swallowing (dysphagia), black tarry stools (melena), vomiting blood, unexplained weight loss, new onset in age >50.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Antacid / Liquid Sodium Alginate.\n  - **S (Root Cause):** **Nutribridge Gastrocared** / **Nutribridge Multi-Strain Probiotics**.\n- **🛒 Counter Close:** Free PMG membership, PWP digestive add-on.",
        skus: "Nutribridge Gastrocared, Nutribridge Probiotics 10 Strains, Liquid Antacid / Alginate",
        promo: "Counter PWP: add-on digestive aid or plester with RM20+ spend.",
        quiz: [
          {
            q: "Which symptom in a heartburn customer is a RED FLAG requiring immediate medical referral rather than counter antacids?",
            options: ["Difficulty or pain when swallowing food (dysphagia)", "Sour burping after meals", "Burning after eating spicy food", "Discomfort eased by drinking water"],
            answer: 0,
            rationale: "Dysphagia is an alarm red flag that could indicate esophageal stricture or malignancy and requires endoscopic medical assessment.",
            safety: "Screen for dysphagia, weight loss, and dark black stools before recommending OTC acid suppressants."
          },
          {
            q: "In the DPOS protocol, what is the best pairing for a customer suffering from chronic acid reflux?",
            options: ["Antibiotics + Painkillers", "O (Immediate antacid/alginate) + S (Nutribridge Gastrocared / Probiotics)", "Supplements only, no antacid", "Steroid cream"],
            answer: 1,
            rationale: "Immediate relief comes from neutralizing acid or alginate barriers (O), while long-term gastric mucosal support comes from house brand probiotics/gastric botanicals (S).",
            safety: "Take antacids 2 hours apart from other medicines to avoid absorption interactions."
          },
          {
            q: "What essential lifestyle advice should accompany every GERD recommendation?",
            options: ["Sleep immediately after heavy dinners", "Avoid lying down for 2-3 hours after eating, raise bed head, and reduce late-night greasy meals", "Drink 2 cups of strong coffee before sleeping", "Lie completely flat on stomach"],
            answer: 1,
            rationale: "Gravity and lifestyle modifications prevent nocturnal acid reflux.",
            safety: "Non-drug advice builds long-term customer trust."
          }
        ]
      },
      {
        id: "diarrhea",
        name: "Acute Diarrhea (Non-Infectious Triage)",
        emergency: false,
        persona: {
          name: "Puan Siti (34)",
          age: 34,
          gender: "female",
          role: "Working Mother",
          language: "ms",
          visible: "VISIBLE: Puan Siti, 34, berjalan masuk memegang perutnya yang memulas. Dia mengalami cirit-birit cair 4 kali sejak pagi selepas makan di gerai malam tadi.",
          hidden: "Anda Puan Siti, 34 tahun, seorang kerani. Sejak pagi perut memulas dan membuang air besar cair 4 kali. Tiada darah dalam najis, tiada demam tinggi, tetapi rasa sangat letih dan dahaga. Tidak mengandung. Bukan ahli PMG lagi."
        },
        summaryMd: "## 🫄 Acute Diarrhea Triage\n- **Pattern:** Frequent loose/watery stools. Main risk is dehydration and electrolyte loss.\n- **🚩 Red Flags:** Blood or pus in stool (dysentery), high fever >38.5°C, severe dehydration (dry mouth, dark urine, sunken eyes), diarrhea >48 hours.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Oral Rehydration Salts (ORS), Smecta (Diosmectite).\n  - **S (Support):** **Nutribridge Probiotics 10 Strains** to restore gut microflora.\n- **🛒 Counter Close:** Free PMG membership, PWP wet wipes or hand sanitizer.",
        skus: "Nutribridge Probiotics 10 Strains, Oral Rehydration Salts (ORS), Smecta",
        promo: "Counter PWP: antibacterial wipes or electrolyte drink with RM20+ purchase.",
        quiz: [
          {
            q: "Apakah keutamaan NOMBOR SATU dalam pengurusan cirit-birit akut di kaunter farmasi?",
            options: ["Memberi antibiotik serta-merta", "Penggantian cecair dan elektrolit dengan Oral Rehydration Salts (ORS)", "Menyuruh pesakit tidak makan dan tidak minum selama 24 jam", "Memberi julap"],
            answer: 1,
            rationale: "Dehidrasi adalah punca utama komplikasi cirit-birit. ORS menggantikan air dan garam mineral yang hilang.",
            safety: "Sentiasa bekalkan ORS bersama sebarang ubat cirit-birit."
          },
          {
            q: "Antara berikut, yang manakah merupakan TANDA BAHAYA (Red Flag) cirit-birit yang memerlukan rujukan doktor segera?",
            options: ["Najis bercampur darah atau nanah dengan demam tinggi", "Najis sedikit cair selepas makan sambal", "Perut berbunyi", "Rasa lapar"],
            answer: 0,
            rationale: "Najis berdarah (disenteri) menandakan jangkitan invasif bakteria atau keradangan usus yang memerlukan rawatan doktor.",
            safety: "Jangan beri ubat anti-motiliti (loperamide) jika ada darah dalam najis atau demam tinggi."
          },
          {
            q: "Bagaimanakah suplemen House Brand Nutribridge Probiotics membantu pesakit cirit-birit?",
            options: ["Ia membunuh semua bakteria dalam usus", "Ia menghentikan pergerakan usus serta-merta", "Ia memulihkan keseimbangan flora usus baik dan memendekkan tempoh cirit-birit", "Ia menurunkan berat badan"],
            answer: 2,
            rationale: "Probiotik multi-strain memulihkan mikrobioma usus yang terganggu semasa cirit-birit.",
            safety: "Jarakkan 2 jam daripada sebarang antibiotik jika pesakit mengambilnya."
          }
        ]
      },
      {
        id: "constipation",
        name: "Chronic Constipation & Bowel Regularity",
        emergency: false,
        persona: {
          name: "Auntie Mary (65)",
          age: 65,
          gender: "female",
          role: "Senior Homemaker",
          language: "en",
          visible: "VISIBLE: Auntie Mary, a 65-year-old lady, approaches quietly asking for something to help her pass motion. She says she has not had a bowel movement for 4 days and feels uncomfortably bloated.",
          hidden: "You are Auntie Mary, 65. You have had hard, pebble-like stools and only pass motion once every 4-5 days. No rectal bleeding, no vomiting, no sudden weight loss. You take blood pressure medicine (Amlodipine). You don't drink enough water. You are not a PMG member."
        },
        summaryMd: "## 🫄 Constipation Care\n- **Pattern:** Infrequent bowel movements (<3/week), hard dry stools, excessive straining.\n- **🚩 Red Flags:** Rectal bleeding, unexplained bowel habit changes in age >50, severe abdominal distension with vomiting (obstruction).\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Lactulose syrup / Bisacodyl / Glycerin suppository.\n  - **S (Support):** **Nutribridge Botanical Fiber Drink** / **Nutribridge Probiotics**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th free glucose test.",
        skus: "Nutribridge Botanical Fiber Drink, Nutribridge Probiotics, Lactulose, Bisacodyl",
        promo: "Senior Care Plus: FREE blood glucose test on 28th. PWP prune drink.",
        quiz: [
          {
            q: "Auntie Mary (65) mentions severe constipation for 4 days. Which red flag must you rule out first?",
            options: ["Rectal bleeding, vomiting, or sudden unexplained weight loss", "Drinking 1 cup of coffee in the morning", "Eating banana", "Walking in the garden"],
            answer: 0,
            rationale: "Bleeding, vomiting, or recent unexplained bowel habit change in seniors can indicate mechanical bowel obstruction or colorectal pathology.",
            safety: "Screen red flags before selling stimulant laxatives."
          },
          {
            q: "What is the best House Brand recommendation to promote gentle, natural bowel regularity over the long term?",
            options: ["Nutribridge Botanical Fiber Drink + Probiotics with plenty of water", "High dose aspirin", "Antacid chewable tablets", "Paracetamol 500mg"],
            answer: 0,
            rationale: "Soluble and insoluble dietary fiber paired with probiotics restores stool bulk and normal transit without causing laxative dependency.",
            safety: "Remind customer to drink at least 2 liters of water daily when taking dietary fiber."
          },
          {
            q: "Since Auntie Mary is 65 years old, which PMG counter loyalty service should you introduce?",
            options: ["None, just ring up the sale", "Senior Care Plus with FREE monthly blood glucose screening on the 28th", "A paid credit card", "Special baby formula promotion"],
            answer: 1,
            rationale: "Every customer aged 55+ qualifies for PMG Senior Care Plus and free blood glucose screening on the 28th of every month.",
            safety: "Build loyalty by offering free health screenings."
          }
        ]
      },
      {
        id: "hemorrhoids",
        name: "Hemorrhoids (Buasir) Management",
        emergency: false,
        persona: {
          name: "Ah Keong (48)",
          age: 48,
          gender: "male",
          role: "Lorry Driver",
          language: "zh",
          visible: "VISIBLE: Ah Keong, 48岁罗里司机，神色尴尬地走到柜台，压低声音询问有没有消肿的痔疮药膏，说最近开车久坐屁股痛，大便后擦纸有鲜血。",
          hidden: "你是Ah Keong，48岁，长途罗里司机。坐着开车很久，经常忍便。大便很硬，肛门肿胀疼痛，擦屁股纸巾有鲜红色血迹。没有发烧，没有腹泻，没有排出大量黑便。还不是PMG会员。"
        },
        summaryMd: "## 🫄 Hemorrhoids (Buasir) Triage\n- **Pattern:** Swollen veins in lower rectum/anus. Pain, itching, bright red blood on toilet paper.\n- **🚩 Red Flags:** Large volume dark blood (melena), fever, excruciating sudden pain (thrombosed pile), feeling of rectal prolapse that cannot be pushed back.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Topical soothing ointment / suppository / Paracetamol for pain.\n  - **S (Support):** **Nutribridge Citrus Bioflavonoids / Rutin** (venous support) + **Nutribridge Fiber**.\n- **🛒 Counter Close:** Free PMG membership, PWP antiseptic wipes.",
        skus: "Nutribridge Citrus Bioflavonoids, Nutribridge Botanical Fiber, Hemorrhoid Ointment",
        promo: "Counter PWP: add-on wet flushable wipes or fiber supplement with RM20+ purchase.",
        quiz: [
          {
            q: "一名顾客询问痔疮药膏，表示大便后擦拭有少许鲜红血。以下哪项属于必须看医生的危险警讯（Red Flag）？",
            options: ["大量暗黑色沥青样血便（Melena）或剧烈突发绞痛", "大便干硬", "久坐后轻微肿胀", "擦拭纸巾有少许淡红血迹"],
            answer: 0,
            rationale: "大量出血或黑便可能代表上消化道出血或严重内痔出血，必须由医生进行直肠镜检查。",
            safety: "先排除严重大出血或血栓性痔疮，再推荐外用药膏。"
          },
          {
            q: "哪类PMG House Brand成分对于改善静脉曲张和痔疮静脉弹性最有效？",
            options: ["柑橘类生物黄酮素（Citrus Bioflavonoids / Rutin / Diosmin）搭配高纤维", "纯维生素D3", "退烧糖浆", "外用薄荷膏"],
            answer: 0,
            rationale: "生物类黄酮素（Bioflavonoids）能够强化静脉微血管管壁、抗水肿，搭配纤维预防便秘加重摩擦。",
            safety: "提醒顾客切勿用力屏气排便（strain），多饮水配合纤维。"
          },
          {
            q: "对于长途司机Ah Keong，除了药膏外，最实用的非药物生活建议是什么？",
            options: ["每天继续坐着12小时不起来", "定时饮水、避免憋便、使用坐垫，并增加膳食纤维", "完全不吃蔬菜", "每天喝大量烈酒"],
            answer: 1,
            rationale: "避免久坐、定时排便及充足水分是根治痔疮复发的关键基础。",
            safety: "全人关怀，由生活习惯着手。"
          }
        ]
      },
      {
        id: "bloating",
        name: "Abdominal Bloating & Dyspepsia (Angin)",
        emergency: false,
        persona: {
          name: "Madam Florence (39)",
          age: 39,
          gender: "female",
          role: "Office Executive",
          language: "en",
          visible: "VISIBLE: Madam Florence, a 39-year-old bank manager, walks in holding her upper abdomen. She complains of feeling bloated, gaseous, and full even after eating a small lunch.",
          hidden: "You are Madam Florence, 39, working in a busy bank. You eat quickly at your desk. You have persistent bloating, excessive burping (angin), and upper abdominal tightness for 2 weeks. No weight loss, no vomiting, no black stools. You want something quick to relieve the trapped gas."
        },
        summaryMd: "## 🫄 Bloating & Dyspepsia Care\n- **Pattern:** Sensation of trapped gas, distension, excessive belching or flatulence.\n- **🚩 Red Flags:** Unexplained weight loss, severe persistent vomiting, palpable abdominal mass, jaundice.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Simethicone / Activated Charcoal / Digestive Enzymes.\n  - **S (Support):** **Nutribridge Multi-Strain Probiotics** / **Biowell Digestive Enzyme Blend**.\n- **🛒 Counter Close:** Free PMG membership, PWP herbal tea or hot patch.",
        skus: "Nutribridge Probiotics 10 Strains, Biowell Digestive Enzymes, Simethicone 80mg",
        promo: "Counter PWP: Medicplast Thermo Patch or herbal tea with RM20+ purchase.",
        quiz: [
          {
            q: "How does Simethicone work to relieve uncomfortable abdominal gas and bloating?",
            options: ["It neutralizes stomach acid like an antacid", "It reduces the surface tension of gas bubbles, causing them to coalesce into larger bubbles easily expelled", "It kills all bacteria in the stomach", "It acts as a strong sedative"],
            answer: 1,
            rationale: "Simethicone is an anti-foaming agent that breaks gas bubble surface tension without being absorbed into systemic circulation.",
            safety: "Safe in pregnancy and lactation as it acts locally in the gut lumen."
          },
          {
            q: "Which PMG House Brand supplement is best for patients with recurring post-meal bloating and poor digestion?",
            options: ["Nutribridge Multi-Strain Probiotics + Biowell Digestive Enzymes", "Calcium tablets only", "Glucosamine 1500mg", "Paracetamol 500mg"],
            answer: 0,
            rationale: "Digestive enzymes help break down complex carbohydrates and proteins, while probiotics balance gut fermentation.",
            safety: "Advise taking enzymes right before or during meals for best efficacy."
          },
          {
            q: "What non-drug advice is most effective for an office worker who eats hastily at her desk?",
            options: ["Eat faster and drink carbonated sodas", "Chew food thoroughly, avoid talking while eating, limit carbonated drinks, and take a 10-minute stroll after lunch", "Skip meals completely", "Drink iced milkshakes with every meal"],
            answer: 1,
            rationale: "Eating slowly prevents aerophagia (air swallowing) which is the primary cause of functional belching.",
            safety: "Empathetic communication builds loyal customer relationships."
          }
        ]
      }
    ]
  },

  // ─── 2. RESPIRATORY & ENT ──────────────────────────────────────────────────
  respiratory: {
    id: "respiratory",
    name: "Respiratory & ENT",
    icon: "🫁",
    conditions: [
      {
        id: "cough",
        name: "Dry vs Wet Cough Differentiation",
        emergency: false,
        persona: {
          name: "Encik Razak (42)",
          age: 42,
          gender: "male",
          role: "Sales Representative",
          language: "ms",
          visible: "VISIBLE: Encik Razak, 42, batuk berdehem-dehem semasa masuk ke farmasi. Dia mengadu tekak terasa gatal kering seperti berhabuk dan batuk mengganggu tidurnya.",
          hidden: "Anda Encik Razak, 42 tahun. Batuk kering berterusan sejak 5 hari lepas selepas sembuh selesema. Tiada kahak, tiada darah, tiada demam, dada tidak sakit. Mengambil ubat darah tinggi (Perindopril/ACEi baru mula bulan lepas). Bukan ahli PMG."
        },
        summaryMd: "## 🫁 Cough Triage (Dry vs Wet)\n- **Dry Cough:** Tickly, non-productive, often post-viral or drug-induced (e.g. ACE inhibitors like Perindopril).\n- **Wet/Chesty Cough:** Thick mucus/phlegm in airway, needs expectorant/mucolytic.\n- **🚩 Red Flags:** Coughing blood (hemoptysis), cough >3 weeks, shortness of breath, unexplained weight loss, chest pain.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Dextromethorphan / Ivy Leaf extract (dry); Bromhexine / Ambroxol / Guaifenesin (wet).\n  - **S (Support):** **Biowell Ivy Leaf Herbal Cough Syrup** / **Nutribridge Vitamin C 1000mg + Zinc**.\n- **🛒 Counter Close:** Free PMG membership, PWP herbal lozenges.",
        skus: "Biowell Ivy Leaf Herbal Syrup, Nutribridge Vitamin C + Zinc, Bromhexine 8mg",
        promo: "Counter PWP: herbal soothing lozenges with RM20+ purchase.",
        quiz: [
          {
            q: "Encik Razak batuk kering sejak memulakan ubat darah tinggi baru (Perindopril). Apakah tindakan farmasi yang paling tepat?",
            options: ["Menyuruhnya berhenti semua ubat darah tinggi serta-merta tanpa beritahu sesiapa", "Mengenalpasti batuk kering sebagai kesan sampingan klasik ACE-inhibitor, bekalkan pelega tekak, dan rujuk doktor untuk pertukaran ubat (cth: ARB)", "Memberi antibiotik dos tinggi", "Mengabaikan sejarah ubat darah tinggi"],
            answer: 1,
            rationale: "Batuk kering tanpa kahak adalah kesan sampingan biasa ACE-inhibitor akibat pengumpulan bradykinin. Rujukan doktor diperlukan untuk menukar kepada ARB (cth: Losartan).",
            safety: "Sentiasa semak sejarah ubat-ubatan kronik bagi pesakit batuk kering."
          },
          {
            q: "Antara tanda berikut, yang manakah merupakan TANDA BAHAYA (Red Flag) batuk yang mesti dirujuk segera ke hospital/klinik?",
            options: ["Batuk mengeluarkan kahak berdarah (hemoptysis) atau batuk berlarutan lebih 3 minggu", "Tekak rasa kering selepas makan gorengan", "Batuk reda selepas minum air suam", "Bersin sekali di waktu pagi"],
            answer: 0,
            rationale: "Kahak berdarah dan batuk kronik >3 minggu adalah tanda amaran kanser paru-paru, tuberkulosis (TB), atau bronkiektasis.",
            safety: "Jangan sesekali merawat kahak berdarah dengan ubat batuk kaunter biasa."
          },
          {
            q: "Apakah perbezaan utama rawatan antara batuk basah (chesty) dan batuk kering (dry)?",
            options: ["Batuk basah perlukan mukolitik/ekspektoran untuk mencairkan kahak; batuk kering perlukan penenang batuk/herba pelega tekak", "Kedua-duanya dirawat dengan ubat julap", "Batuk basah perlukan penahan batuk kuat untuk menyekat kahak dalam paru-paru", "Tiada perbezaan langsung"],
            answer: 0,
            rationale: "Menyekat batuk basah dengan antitusif boleh menyebabkan kahak terperangkap dan jangkitan kuman dada.",
            safety: "Jangan beri penahan batuk (dextromethorphan) kepada pesakit batuk berkahak pekat."
          }
        ]
      },
      {
        id: "sinusitis",
        name: "Sinusitis & Allergic Rhinitis",
        emergency: false,
        persona: {
          name: "Xiao Ling (24)",
          age: 24,
          gender: "female",
          role: "Accounting Assistant",
          language: "zh",
          visible: "VISIBLE: Xiao Ling, 24岁白领，一边拿着纸巾擤鼻涕一边走进店里，说每天早上一醒来就狂打喷嚏、流清鼻水，鼻塞严重，眼睛发痒，工作无法集中。",
          hidden: "你是Xiao Ling，24岁。长期受过敏性鼻炎困扰，最近冷气房久坐加重。鼻子极度堵塞，打喷嚏流清鼻涕，眼皮发痒。没有发烧，鼻涕没有黄绿恶臭浓脓，没有面部剧烈胀痛。还不是PMG会员。"
        },
        summaryMd: "## 🫁 Allergic Rhinitis & Sinusitis\n- **Pattern:** Paroxysmal sneezing, clear rhinorrhea, nasal congestion, itchy eyes/palate.\n- **🚩 Red Flags:** Periorbital swelling/redness, high fever, severe unilateral facial pain, stiff neck, double vision.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Non-drowsy 2nd gen Antihistamine (Cetirizine / Loratadine), Saline nasal wash.\n  - **S (Support):** **Shieldmax Nasal Relief Spray** / **Nutribridge Vitamin C + Zinc**.\n- **🛒 Counter Close:** Free PMG membership, PWP facial tissues or surgical masks.",
        skus: "Shieldmax Nasal Spray, Nutribridge Vitamin C 1000mg + Zinc, Cetirizine 10mg",
        promo: "Counter PWP: surgical 3-ply masks or soothing saline rinse with RM20+ purchase.",
        quiz: [
          {
            q: "过敏性鼻炎（Allergic Rhinitis）与急性细菌性鼻窦炎（Bacterial Sinusitis）的主要区别是什么？",
            options: ["过敏性鼻炎多为清鼻涕、打喷嚏伴眼痒；细菌性鼻窦炎多为浓稠黄绿鼻涕、伴面部压痛与发烧", "没有区别，全用抗生素", "过敏性鼻炎一定会全身发紫", "鼻窦炎不需要任何治疗"],
            answer: 0,
            rationale: "清亮水样鼻涕伴痒是典型过敏表现；黄绿脓涕、面部骨痛与发热提示细菌感染。",
            safety: "普通轻微鼻炎切忌滥用抗生素。"
          },
          {
            q: "为什么减充血滴鼻剂（如Oxymetazoline）在柜台指导中严格限制连续使用不可超过5-7天？",
            options: ["容易引起药物性鼻炎（Rhinitis Medicamentosa）和反跳性严重鼻塞", "它会把鼻毛完全脱光", "它会让皮肤变黑", "它会导致蛀牙"],
            answer: 0,
            rationale: "外用血管收缩剂连续超过5-7天会导致鼻腔黏膜受体脱敏，停药时出现更严重的反跳性充血肿胀。",
            safety: "推荐生理盐水鼻腔喷雾（Saline wash）作为每日长期安全清洗护理。"
          },
          {
            q: "对于经常受过敏困扰的Xiao Ling，PMG House Brand哪种组合最适合支持其免疫防线？",
            options: ["Shieldmax天然洗鼻液 + Nutribridge维生素C与锌", "大剂量泻药", "关节软骨素", "外用降温贴布"],
            answer: 0,
            rationale: "生理盐水物理冲洗过敏原配合维生素C+锌增强呼吸道黏膜免疫屏障。",
            safety: "过敏护理以冲洗为先，药物辅助。"
          }
        ]
      },
      {
        id: "sore_throat",
        name: "Acute Sore Throat & Pharyngitis",
        emergency: false,
        persona: {
          name: "Brandon (29)",
          age: 29,
          gender: "male",
          role: "Marketing Specialist",
          language: "en",
          visible: "VISIBLE: Brandon, a 29-year-old marketing executive, speaks with a raspy voice. He winces as he swallows, explaining that his throat has felt like sandpaper for the past 2 days after hosting a launch event.",
          hidden: "You are Brandon, 29. You spoke loudly at a corporate event 2 days ago. Your throat is raw and painful when swallowing. No difficulty breathing, no drooling, no neck stiffness, temperature is 37.4°C (mild). You need to talk at work tomorrow. Not a PMG member."
        },
        summaryMd: "## 🫁 Sore Throat Triage\n- **Pattern:** Pharyngeal pain on swallowing, dryness, often viral or vocal overuse.\n- **🚩 Red Flags:** Inability to swallow fluids/drooling, difficulty breathing/stridor, inability to open mouth fully (trismus / quinsy), high persistent fever.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Anti-inflammatory throat lozenges / Paracetamol 500mg.\n  - **S (Support):** **Biowell Propolis Throat Spray** / **Nutribridge Effervescent Vitamin C**.\n- **🛒 Counter Close:** Free PMG membership, PWP honey drink or lozenges.",
        skus: "Biowell Propolis Throat Spray, Nutribridge Vitamin C 1000mg, Difflam lozenges",
        promo: "Counter PWP: add-on soothing lozenges or honey tea with RM20+ purchase.",
        quiz: [
          {
            q: "Which symptom in a sore throat patient is an URGENT RED FLAG requiring immediate hospital referral?",
            options: ["Difficulty breathing, drooling saliva, or inability to open mouth (trismus)", "Mild scratchiness after singing", "Throat feels better after warm honey water", "Mild dry cough"],
            answer: 0,
            rationale: "Drooling and trismus indicate potential peritonsillar abscess (quinsy) or epiglottitis which can rapidly compromise the airway.",
            safety: "Always verify airway patency and swallowing ability before treating sore throat at the counter."
          },
          {
            q: "Why are oral antibiotics NOT recommended as first-line treatment for the vast majority of sore throats?",
            options: ["Over 85-90% of sore throats are viral or mechanical in origin, where antibiotics provide no benefit and cause resistance", "Antibiotics cure sore throats in 10 minutes", "Antibiotics are too cheap", "Viruses respond best to amoxicillin"],
            answer: 0,
            rationale: "Viral pharyngitis is self-limiting. Symptomatic anti-inflammatories, paracetamol, and propolis spray are the evidence-based protocol.",
            safety: "Preserve antibiotic stewardship in retail pharmacy."
          },
          {
            q: "How does PMG Biowell Propolis Throat Spray benefit Brandon's vocal recovery?",
            options: ["It provides natural soothing anti-inflammatory and antibacterial properties directly to the irritated pharyngeal mucosa", "It numbs the vocal cords permanently", "It replaces the need for sleep", "It raises blood pressure"],
            answer: 0,
            rationale: "Propolis delivers bioflavonoid antioxidants that calm local mucosal inflammation and promote epithelial recovery.",
            safety: "Check for bee product or honey allergies before recommending propolis."
          }
        ]
      },
      {
        id: "cold_flu",
        name: "Common Cold & Flu Triage",
        emergency: false,
        persona: {
          name: "Auntie Fatimah (58)",
          age: 58,
          gender: "female",
          role: "Grandmother",
          language: "ms",
          visible: "VISIBLE: Mak Cik Fatimah, 58, berbalut selendang tebal dan batuk kecil. Dia berasa seram sejuk, hidung berair dan seluruh badan lenguh-lenguh sejak semalam.",
          hidden: "Anda Mak Cik Fatimah, 58 tahun. Badan rasa lesu, hidung tersumbat, bersin, dan sedikit panas badan (37.9°C). Tiada sesak nafas, tiada sakit dada. Mengambil ubat darah tinggi (Amlodipine). Bukan ahli PMG lagi."
        },
        summaryMd: "## 🫁 Common Cold & Flu\n- **Pattern:** Rhinitis, sneezing, low-grade fever, malaise, myalgia. Viral self-limiting (7-10 days).\n- **🚩 Red Flags:** Shortness of breath, persistent fever >38.5°C >3 days, chest pain, confusion in elderly.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Paracetamol 500mg (Terrafast) / Antihistamine-decongestant.\n  - **S (Support):** **Nutribridge Effervescent Vitamin C + Zinc** / **Livemore Tiger Milk Mushroom**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th free glucose test.",
        skus: "Biowell Terrafast 500mg, Nutribridge Vitamin C + Zinc, Livemore Tiger Milk Mushroom",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP cooling patch.",
        quiz: [
          {
            q: "Mak Cik Fatimah mengambil ubat darah tinggi (Amlodipine). Antara ubat selesema berikut, yang manakah PERLU DIELAKKAN atau dipantau ketat?",
            options: ["Dekongestan oral seperti Pseudoephedrine / Phenylephrine", "Paracetamol 500mg dalam dos terapeutik", "Vitamin C larut air", "Madu suam"],
            answer: 0,
            rationale: "Dekongestan oral menyebabkan vasokonstriksi sistemik yang boleh melonjakkan tekanan darah pesakit hipertensi.",
            safety: "Gunakan semburan hidung saline (air garam) atau antihistamin generasi ke-2 bagi pesakit darah tinggi."
          },
          {
            q: "Berapakah had maksimum pengambilan Paracetamol dalam tempoh 24 jam untuk orang dewasa yang sihat?",
            options: ["4 gram (8 biji tablet 500mg)", "10 gram (20 biji tablet)", "1 gram (2 biji tablet)", "6 gram"],
            answer: 0,
            rationale: "Dos maksimum paracetamol ialah 4g/hari. Melebihi dos ini berisiko menyebabkan kerosakan hati toksik yang teruk.",
            safety: "Sentiasa semak sama ada pesakit mengambil ubat kombinasi selesema lain yang turut mengandungi paracetamol."
          },
          {
            q: "Memandangkan Mak Cik Fatimah berumur 58 tahun, program PMG apakah yang wajib diperkenalkan di kaunter pembayaran?",
            options: ["Senior Care Plus dengan ujian gula darah PERCUMA setiap 28hb", "Pinjaman bank", "Insurans kenderaan", "Kelab sukan lasak"],
            answer: 0,
            rationale: "Pelanggan berumur 55 tahun ke atas layak mendaftar Senior Care Plus dengan keistimewaan ujian glukosa darah percuma setiap 28 hari bulan.",
            safety: "Perkhidmatan proaktif mencipta kesetiaan pelanggan."
          }
        ]
      },
      {
        id: "asthma",
        name: "Asthma Triage (Acute Bronchospasm)",
        emergency: true, // 🚨 EMERGENCY RED FLAG
        persona: {
          name: "Mrs. Tan & Xiao Ming (12)",
          age: 12,
          gender: "male",
          role: "Schoolboy with Mother",
          language: "zh",
          visible: "VISIBLE: 🚨 紧急红旗：一位母亲焦急万分地搀扶着12岁的儿子走进来。男孩呼吸急促、喘息声明显（Wheezing），小脸通红发白，说话断断续续，无法一次讲完一整句话！",
          hidden: "【🚨 紧急情况】你是母亲，儿子哮喘发作，呼吸非常困难，胸口剧烈起伏，喉咙有哮鸣音，讲两三个字就必须大口喘气。家里的蓝色吸入剂刚好用完了。你非常慌张，想买点药水先给他喝。"
        },
        summaryMd: "## 🚨 EMERGENCY: Acute Asthma Triage\n- **Pattern:** Acute bronchospasm, severe wheezing, dyspnea, tachypnea.\n- **🚩 CRITICAL RED FLAGS:** Breathless at rest, unable to speak full sentences in one breath, cyanosis (blue lips/nails), silent chest, accessory muscle use.\n- **⚠️ IMMEDIATE ACTION:** **CALL 999 / DIRECT TO EMERGENCY ROOM!** Use emergency blue Salbutamol reliever if available immediately while arranging urgent hospital transport. **STRICTLY DO NOT SELL COUGH SYRUPS OR SUPPLEMENTS!**",
        skus: "NONE - EMERGENCY REFERRAL ONLY! (Salbutamol inhaler only if medically verified while awaiting ER)",
        promo: "EMERGENCY SAFETY FIRST - Immediate referral!",
        quiz: [
          {
            q: "一名12岁哮喘发作男孩呼吸急促，说话断断续续无法完成整句，有明显喘鸣音。药剂店助理第一时间的绝对正确反应是什么？",
            options: ["立刻启动急救与就医程序：协助坐直身体，安排立刻前往医院急诊室（A&E）或联络999急救", "向母亲推销止咳草药糖浆和维生素C", "叫男孩在角落躺平睡觉", "建议下星期再来看医生"],
            answer: 0,
            rationale: "无法说出完整句子、呼吸窘迫是重度哮喘发作的危急生命警讯，必须在急诊室接受高浓度氧气与雾化药物治疗，延误治疗可致命！",
            safety: "生命安全第一！绝对禁止尝试用普通止咳水或保健品应付急性哮喘发作！"
          },
          {
            q: "在急性重度哮喘发作时，若药房助理试图向家长推销止咳药水或补充剂而延误就医，在PMG SOP评估中会得到什么结果？",
            options: ["严重失职扣至不及格（0分），因严重违反患者生命安全原则", "满分奖励", "银牌奖励", "额外加分"],
            answer: 0,
            rationale: "延误急症转介属于重大安全红线，必须严格判处零分并进行临床再培训。",
            safety: "不当销售延误就医是不可容忍的医疗安全违规。"
          },
          {
            q: "以下哪项是哮喘恶化至极度危殆的体征（Life-threatening Asthma）？",
            options: ["口唇发绀（Cyanosis）、意识模糊或胸部呼吸音完全消失（Silent Chest）", "只是轻微打喷嚏", "食欲很好", "声音洪亮"],
            answer: 0,
            rationale: "无呼吸音（Silent Chest）代表气道气流几乎彻底受阻，随时可能心跳骤停，属于最高级别急症。",
            safety: "牢记Silent Chest危急征兆。"
          }
        ]
      }
    ]
  },

  // ─── 3. MUSCULOSKELETAL ────────────────────────────────────────────────────
  musculoskeletal: {
    id: "musculoskeletal",
    name: "Musculoskeletal & Pain",
    icon: "🦴",
    conditions: [
      {
        id: "oa_knee",
        name: "Osteoarthritis Knee (Joint Care)",
        emergency: false,
        persona: {
          name: "Uncle Tan (67)",
          age: 67,
          gender: "male",
          role: "Retired Lorry Driver",
          language: "ms",
          visible: "VISIBLE: Uncle Tan, 67, berjalan perlahan sambil memegang lutut kanannya. Dia mengadu lututnya sangat sakit dan berbunyi 'kruk-kruk' bila turun tangga dan bangun dari kerusi.",
          hidden: "Anda Uncle Tan, 67 tahun, pesara pemandu lori tinggal di 7th Mile Kuching. Lutut kanan sakit 6 bulan, makin teruk bila naik turun tangga. Tiada bengkak merah atau demam. Ada sejarah gastrik pedih ulu hati bila makan ubat tahan sakit lama dulu. Mengambil ubat darah tinggi amlodipine. Bukan ahli PMG."
        },
        summaryMd: "## 🦴 Osteoarthritis (OA) Care\n- **Pattern:** Wear-and-tear cartilage loss, pain on activity/stairs, morning stiffness <30 mins, crepitus.\n- **🚩 Red Flags:** Joint hot/red/swollen (infection/gout), unable to bear weight after fall, joint locks/gives way.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Biowell Terrafast (paracetamol 500mg), Medicplast Heat Therapy Patch on intact skin.\n  - **S (Root Cause):** **JH Nutrition Flexson** (Turmeric + Boswellia) / **Livemore Flexmore** (Fish collagen + eggshell membrane).\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th free glucose test, counter PWP.",
        skus: "JH Nutrition Flexson, Livemore Flexmore, Biowell Terrafast 500mg, Medicplast Heat Patch",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP counter relief patch.",
        quiz: [
          {
            q: "Uncle Tan ada sejarah pedih ulu hati / gastrik teruk akibat ubat tahan sakit. Apakah pilihan ubat pelega tahan sakit segera (O) yang PALING SELAMAT?",
            options: ["Paracetamol (Terrafast 500mg) dalam dos betul, atau patch haba luaran Medicplast", "Ibuprofen 400mg dos tinggi", "Aspirin 300mg semasa perut kosong", "Mefenamic acid tanpa pelapik perut"],
            answer: 0,
            rationale: "NSAID oral (ibuprofen, mefenamic acid) menghalang prostaglandin pelindung perut dan boleh mencetuskan pendarahan gastrik. Paracetamol dan terapi haba luaran jauh lebih selamat.",
            safety: "Sentiasa semak sejarah gastrik dan buah pinggang sebelum mencadangkan sebarang ubat sakit sendi."
          },
          {
            q: "Apakah fungsi utama suplemen House Brand JH Nutrition Flexson dalam protokol DPOS?",
            options: ["Memberi sokongan jangka panjang untuk mengurangkan keradangan sendi secara semulajadi dengan ekstrak Curcuma longa dan Boswellia", "Ia menggantikan pembedahan lutut dalam masa 1 jam", "Ia adalah ubat bius pengsan", "Ia antibiotik pembunuh kuman"],
            answer: 0,
            rationale: "Flexson menggabungkan kurkumin dan boswellia serrata yang terbukti secara klinikal membantu meredakan keradangan rawan secara semulajadi tanpa merosakkan perut.",
            safety: "Jelaskan bahawa suplemen memerlukan masa 2-4 minggu untuk kesan optimum yang berpanjangan."
          },
          {
            q: "Berapakah berat beban pada sendi lutut yang dapat dikurangkan bagi setiap 1 kg berat badan yang berjaya diturunkan?",
            options: ["Kira-kira 4 kg beban pada lutut", "Tiada apa-apa kesan", "0.1 kg sahaja", "50 kg"],
            answer: 0,
            rationale: "Bukti biomekanik membuktikan pengurangan 1 kg berat badan mengurangkan 4 kali ganda beban mekanikal pada sendi lutut ketika berjalan.",
            safety: "Nasihat kawalan berat badan dan senaman peha kuadrisep amat berharga untuk pesakit OA."
          }
        ]
      },
      {
        id: "gout",
        name: "Acute Gout Flare Triage",
        emergency: false,
        persona: {
          name: "Encik Daud (50)",
          age: 50,
          gender: "male",
          role: "Site Supervisor",
          language: "ms",
          visible: "VISIBLE: Encik Daud, 50, berjalan terhincut-hincut dengan selipar longgar. Ibu jari kaki kanannya bengkak, merah berkilat, dan berdenyut-denyut sangat sakit selepas makan malam stimbot makanan laut semalam.",
          hidden: "Anda Encik Daud, 50 tahun. Ibu jari kaki kanan tiba-tiba bengkak merah dan panas berdenyut sejak 3 pagi tadi. Sentuh selimut pun menjerit sakit. Semalam makan banyak ketam dan udang. Pernah kena gout 2 tahun lepas. Bukan ahli PMG."
        },
        summaryMd: "## 🦴 Acute Gout Flare\n- **Pattern:** Sudden excruciating inflammatory arthritis, classically 1st metatarsophalangeal (big toe). Red, hot, swollen.\n- **🚩 Red Flags:** Septic arthritis (infection with high fever, multiple joints), open tophi with discharge.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Urine alkalizer (Ural) to dissolve crystals, Paracetamol (avoid Aspirin - it worsens uric acid retention!).\n  - **S (Support):** **Nutribridge Tart Cherry / Celery Seed Extract**.\n- **🛒 Counter Close:** Free PMG membership, PWP mineral water.",
        skus: "Nutribridge Tart Cherry Extract, Ural Effervescent Granules, Paracetamol 500mg",
        promo: "Counter PWP: mineral water or cooling gel with RM20+ purchase.",
        quiz: [
          {
            q: "Mengapakah pesakit serangan gout akut dilarang keras mengambil ubat Aspirin sebagai ubat tahan sakit?",
            options: ["Aspirin dos rendah bersaing dengan asid urik di buah pinggang dan merencat perkumuhan asid urik, memburukkan serangan gout", "Aspirin membuat gigi kuning", "Aspirin tidak dijual di Malaysia", "Aspirin menyebabkan kaki bertukar hijau"],
            answer: 0,
            rationale: "Salisilat dos analgesik menghalang rembesan asid urik di tubul renal, menyebabkan paras asid urik darah melonjak naik.",
            safety: "Elakkan aspirin untuk pesakit gout; rujuk ahli farmasi untuk pilihan selamat."
          },
          {
            q: "Bagaimanakah agen pengalkali air kencing (seperti Ural) membantu pesakit gout?",
            options: ["Meningkatkan pH air kencing kepada 6.5-7.0 untuk melarutkan hablur asid urik dan mencegah pembentukan batu karang", "Ia membakar kulit", "Ia menurunkan kolesterol", "Ia menyembuhkan gout serta-merta"],
            answer: 0,
            rationale: "Asid urik lebih mudah larut dalam air kencing beralkali, mengurangkan pemendapan kristal urat dalam saluran kencing dan tisu.",
            safety: "Minum sekurang-kurangnya 2-3 liter air kosong sehari semasa serangan gout."
          },
          {
            q: "Apakah peranan suplemen Nutribridge Tart Cherry dalam penjagaan jangka panjang pesakit gout?",
            options: ["Kaya dengan anthocyanin antioksidan yang membantu mengekalkan paras asid urik yang sihat dan meredakan radang", "Ia menggantikan semua makanan harian", "Ia pewarna sirap sahaja", "Ia ubat tidur"],
            answer: 0,
            rationale: "Ekstrak tart cherry mengandungi antioksidan anthocyanin semulajadi yang menghalang enzim xanthine oxidase dan membantu metabolisme urat.",
            safety: "Nasihatkan pantang makanan tinggi purin (makanan laut bercengkerang, organ dalaman, alkohol)."
          }
        ]
      },
      {
        id: "sprain",
        name: "Ankle Sprain & Muscle Strain",
        emergency: false,
        persona: {
          name: "Ken (21)",
          age: 21,
          gender: "male",
          role: "College Student",
          language: "en",
          visible: "VISIBLE: Ken, a 21-year-old student, limps in wearing sports shorts. His outer right ankle is swollen and bruised after twisting it during a basketball game 2 hours ago.",
          hidden: "You are Ken, 21. You landed awkwardly on someone's foot. Outer ankle is swollen, bruised, and tender. You CAN bear weight and take 4 steps, although it hurts. No bone deformity. You want something to bring down the swelling fast."
        },
        summaryMd: "## 🦴 Acute Sprains & Strains (R.I.C.E.)\n- **Pattern:** Ligament stretch/tear (sprain) or muscle tendon injury (strain). Bruising, swelling.\n- **🚩 Red Flags (Ottawa Ankle Rules):** Inability to take 4 weight-bearing steps, bone tenderness at posterior edge of malleoli or navicular/base of 5th metatarsal (possible fracture).\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Cold therapy (Medicplast Terracool Patch) for first 48h (NO HEAT!), compression elastic bandage, Paracetamol.\n  - **S (Support):** **Nutribridge Magnesium** / Joint recovery nutrients.\n- **🛒 Counter Close:** Free PMG membership, PWP crepe bandage.",
        skus: "Medicplast Terracool Cold Patch, Elastic Crepe Bandage, Biowell Terrafast 500mg",
        promo: "Counter PWP: elastic compression bandage or cool gel with RM20+ purchase.",
        quiz: [
          {
            q: "Ken twisted his ankle 2 hours ago. Why is applying a HEAT patch or hot balm strictly contraindicated in the first 48 hours?",
            options: ["Heat causes vasodilation, increasing blood flow and significantly worsening internal bleeding, swelling, and edema", "Heat freezes the joint", "Heat makes the skin turn purple", "Heat causes hair growth"],
            answer: 0,
            rationale: "Acute injuries need cold therapy (cryotherapy) to vasoconstrict and limit swelling for the first 48 hours. Heat is only used for chronic stiffness.",
            safety: "Remember R.I.C.E. - Rest, Ice, Compression, Elevation. No heat, no alcohol, no vigorous massage in the first 48 hours."
          },
          {
            q: "Under the Ottawa Ankle Rules, when should an ankle injury be sent for an X-ray to rule out fracture?",
            options: ["Inability to bear weight for 4 steps OR bone tenderness along posterior malleoli or 5th metatarsal base", "Any mild redness after running", "If the ankle can move normally", "If the shoes are dirty"],
            answer: 0,
            rationale: "Ottawa rules specify bone tenderness at the malleolar margins or inability to bear weight as high-sensitivity criteria for ankle fracture.",
            safety: "Screen for fracture before strapping or selling topical patches."
          },
          {
            q: "Which PMG House Brand product pairing fits Ken's acute ankle sprain perfectly?",
            options: ["Medicplast Terracool Cold Patch + Elastic Crepe Bandage for compression", "Medicplast Heat Therapy Patch", "Boiling water compress", "Strong chili rub"],
            answer: 0,
            rationale: "Terracool provides soothing cold relief without ice burn risk, while the crepe bandage provides necessary stability and edema compression.",
            safety: "Ensure crepe bandage is not wrapped so tightly that it compromises distal circulation."
          }
        ]
      },
      {
        id: "tension_headache",
        name: "Tension-Type Headache & Neck Strain",
        emergency: false,
        persona: {
          name: "Michelle (28)",
          age: 28,
          gender: "female",
          role: "IT Specialist",
          language: "en",
          visible: "VISIBLE: Michelle, a 28-year-old software developer, enters massaging both sides of her head and neck. She describes a tight, dull, band-like squeezing pressure across her forehead and temples that has lingered all day.",
          hidden: "You are Michelle, 28, working 10 hours a day in front of computer monitors. Dull squeezing headache across forehead and tight shoulders. No nausea, no vomiting, no sensitivity to light/sound, no visual flashes, no fever. You take no chronic meds. Not a PMG member."
        },
        summaryMd: "## 🦴 Tension Headache Care\n- **Pattern:** Bilateral, non-pulsatile, band-like squeezing pressure. Mild-to-moderate intensity, related to stress, neck posture, screen fatigue.\n- **🚩 Red Flags:** Thunderclap headache (sudden peak within seconds), 'worst headache of my life' (subarachnoid hemorrhage), neurological weakness/numbness, stiff neck with high fever, new headache in age >50.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Paracetamol (Terrafast 500mg) within limits, cooling forehead gel patch, Peppermint balm.\n  - **S (Support):** **Nutribridge Magnesium 150mg** / **Livemore B-Complex**.\n- **🛒 Counter Close:** Free PMG membership, PWP cooling eye mask.",
        skus: "Biowell Terrafast 500mg, Nutribridge Magnesium 150mg, Peppermint cooling balm",
        promo: "Counter PWP: soothing eye mask or aromatherapy roll-on with RM20+ purchase.",
        quiz: [
          {
            q: "Which headache characteristic represents a critical RED FLAG requiring emergency department transport?",
            options: ["Sudden severe 'thunderclap' onset reaching maximum intensity within seconds ('worst headache of life')", "Dull band-like pressure after staring at computer", "Ache that eases after a nap", "Tightness relieved by drinking water"],
            answer: 0,
            rationale: "Thunderclap headache is pathognomonic of subarachnoid hemorrhage (ruptured cerebral aneurysm) and requires urgent CT imaging.",
            safety: "Always screen onset speed: thunderclap = emergency!"
          },
          {
            q: "Why should Michelle be cautioned against taking combination painkillers (e.g., paracetamol + caffeine + codeine) every day?",
            options: ["Frequent analgesic use (>10-15 days/month) can paradoxically cause Medication Overuse Headaches (MOH / Rebound headaches)", "It causes hair to turn white", "It makes people too tall", "It stops the heart immediately"],
            answer: 0,
            rationale: "Chronic analgesic intake resets pain thresholds causing daily rebound headaches that perpetuate medication dependence.",
            safety: "Limit acute analgesic use to fewer than 2-3 days per week."
          },
          {
            q: "How does Nutribridge Magnesium 150mg support patients with recurrent tension headaches and muscle tightness?",
            options: ["Magnesium acts as a natural neuromuscular relaxant, modulating vascular tone and reducing muscle spasm", "It acts as a brain bleach", "It permanently freezes the neck", "It is an antibiotic"],
            answer: 0,
            rationale: "Magnesium deficiency is strongly linked to neuronal excitability and muscle hyper-reactivity; oral supplementation relieves chronic tension.",
            safety: "Suggest regular ergonomic breaks (20-20-20 rule) and hydration."
          }
        ]
      },
      {
        id: "back_pain",
        name: "Acute Low Back Pain (Mechanical Lumbago)",
        emergency: false,
        persona: {
          name: "Ah Keong (52)",
          age: 52,
          gender: "male",
          role: "Construction Worker",
          language: "zh",
          visible: "VISIBLE: Ah Keong, 52岁建筑工人，手扶着腰部一瘸一拐地走进来，表情痛苦。说今早在工地上弯腰搬水泥时，腰部突然‘咔’一声闪到，剧烈酸痛无法弯腰。",
          hidden: "你是Ah Keong，52岁。今早弯腰搬重物闪到腰，下背部肌肉剧痛僵硬。没有双脚发麻无力，大小便完全正常自控，没有发烧。以前吃止痛药偶尔胃不舒服。还不是PMG会员。"
        },
        summaryMd: "## 🦴 Low Back Pain (Lumbago)\n- **Pattern:** Acute mechanical muscular strain, worse with bending/lifting, localized to lumbar region.\n- **🚩 Red Flags (Cauda Equina Syndrome):** Loss of bowel/bladder control, saddle anesthesia (numbness in groin/buttocks), progressive lower limb weakness, fever, history of cancer.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Medicplast Thermo Patch / Paracetamol (Terrafast) / Topical analgesic gel.\n  - **S (Support):** **Nutribridge Magnesium** / **Calcium Plus D3 & K2**.\n- **🛒 Counter Close:** Free PMG membership, PWP lumbar support or patch.",
        skus: "Medicplast Thermo Patch, Biowell Terrafast 500mg, Nutribridge Magnesium 150mg",
        promo: "Counter PWP: lumbar hot therapy patch or back balm with RM20+ purchase.",
        quiz: [
          {
            q: "腰痛患者若出现以下哪组症状，代表‘马尾神经综合征（Cauda Equina Syndrome）’必须立刻急诊转介？",
            options: ["大小便失禁、会阴部鞍区麻木（Saddle anesthesia）、双下肢进行性无力", "弯腰搬重物后肌肉酸痛", "久坐后腰部发僵", "按压腰部肌肉有酸痛感"],
            answer: 0,
            rationale: "马尾综合征是神经外科紧急重症，若延误减压手术可能导致永久性大小便失禁和瘫痪。",
            safety: "问诊腰痛务必筛查：大小便有无失控？会阴处有没有麻木？"
          },
          {
            q: "对于急性非特异性腰肌扭伤，现代循证医学推荐的最佳康复建议是什么？",
            options: ["在疼痛允许范围内保持轻度日常活动，避免长期卧床不起", "绝对在床上躺平2个星期不准动", "立刻做大重量深蹲", "完全不准走路"],
            answer: 0,
            rationale: "长期卧床超过48小时会导致背部核心肌肉萎缩僵硬，加长病程；保持适当走动恢复更快。",
            safety: "教导正确搬重物姿势（屈膝不弯腰，贴近身体）。"
          },
          {
            q: "对于有轻微胃部不适病史的Ah Keong，最适合的PMG House Brand止痛舒缓方案是什么？",
            options: ["外用Medicplast温热镇痛贴布（Thermo Patch）搭配口服扑热息痛与镁片肌肉放松", "空腹口服大剂量双氯芬酸钠（Diclofenac）", "完全不提供任何缓解", "使用开水烫腰部"],
            answer: 0,
            rationale: "外用温热贴布直达局部痛点放松肌肉，全身吸收极低不伤胃；口服扑热息痛安全性高。",
            safety: "贴布切勿直接贴在破损或麻木皮肤上。"
          }
        ]
      },
      {
        id: "osteoporosis",
        name: "Osteoporosis & Bone Fragility Care",
        emergency: false,
        persona: {
          name: "Mrs. Wong (71)",
          age: 71,
          gender: "female",
          role: "Retired Teacher",
          language: "en",
          visible: "VISIBLE: Mrs. Wong, a 71-year-old retired teacher with a slightly stooped posture, walks in with an umbrella for support. She asks for a good bone supplement, mentioning her doctor said her bone density score is low.",
          hidden: "You are Mrs. Wong, 71. Post-menopausal for 20 years. DXA scan showed T-score -2.8 (osteoporosis). You had a minor wrist fracture after a trip last year. You eat little dairy because of lactose intolerance. No kidney stones. You take high blood pressure medicine. Not a PMG member."
        },
        summaryMd: "## 🦴 Osteoporosis Care\n- **Pattern:** 'Silent thief' of bone mass. Asymptomatic until a fragility fracture occurs (hip, spine, wrist).\n- **🚩 Red Flags:** Sudden acute severe back pain after minor movement (vertebral compression fracture), inability to bear weight after fall (hip fracture).\n- **💊 House Brand & OTC:**\n  - **S (Bone Support):** **Nutribridge Calcium Plus Vitamin D3 & K2** (Vitamin K2 directs calcium to bone, away from arteries!).\n  - **S (Cartilage Support):** **JH Nutrition Collagen Type II**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th free glucose test.",
        skus: "Nutribridge Calcium Plus Vitamin D3 & K2, JH Nutrition Collagen, Ensure Milk",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP adult calcium milk.",
        quiz: [
          {
            q: "Why is Vitamin K2 (Menaquinone-7) essential when taking a Calcium + Vitamin D3 supplement?",
            options: ["Vitamin K2 activates osteocalcin to bind calcium into bone matrix and prevents calcium deposition in arterial walls", "Vitamin K2 is just food coloring", "Vitamin K2 makes bones grow 5 meters", "Vitamin K2 dissolves calcium in the stomach"],
            answer: 0,
            rationale: "Without K2, excess calcium can calcify blood vessels; K2 acts as the 'traffic controller' ensuring calcium enters bone mineral tissue.",
            safety: "Check if the patient is taking Warfarin (Coumadin) before recommending high-dose Vitamin K supplements."
          },
          {
            q: "What non-drug fall prevention advice should be shared with elderly osteoporotic customers like Mrs. Wong?",
            options: ["Remove loose floor rugs, ensure bright bathroom lighting, install grab bars, and wear non-slip footwear", "Walk in dark rooms at night", "Wax the floor slippery", "Wear loose socks on tiled stairs"],
            answer: 0,
            rationale: "Preventing falls is the number one intervention to prevent catastrophic fragility hip fractures in seniors.",
            safety: "Comprehensive care: medication + home safety screening."
          },
          {
            q: "As Mrs. Wong is 71 years old, what free monthly service under PMG Senior Care Plus should you invite her to?",
            options: ["FREE monthly blood glucose screening on the 28th of every month", "Free casino ticket", "Free high-impact karate lesson", "Free ladder climbing class"],
            answer: 0,
            rationale: "Senior Care Plus offers free blood glucose screening on the 28th of every month for all registered seniors aged 55+.",
            safety: "Warmly invite seniors to regular monthly health tracking."
          }
        ]
      }
    ]
  },

  // ─── 4. DERMATOLOGY & WOUND CARE ───────────────────────────────────────────
  dermatology: {
    id: "dermatology",
    name: "Dermatology & Wound",
    icon: "🧴",
    conditions: [
      {
        id: "eczema",
        name: "Atopic Eczema & Dry Itchy Skin",
        emergency: false,
        persona: {
          name: "Puan Siti & Aiman (5)",
          age: 29,
          gender: "female",
          role: "Mother with Child",
          language: "ms",
          visible: "VISIBLE: Puan Siti membawa anaknya Aiman (5 tahun) yang asyik menggaru pelipat siku dan belakang lutut. Kulitnya kering bersisik, merah dan mempunyai kesan calar garuan yang pedih.",
          hidden: "Anda Puan Siti, 29 tahun. Anak anda Aiman (5 tahun) ada ekzema sejak bayi. Cuaca panas sekarang menyebabkan pelipat siku dan lutut sangat gatal dan merah. Tiada nanah kuning madu, tiada demam. Anak susah tidur malam kerana asyik menggaru. Bukan ahli PMG."
        },
        summaryMd: "## 🧴 Atopic Eczema Triage\n- **Pattern:** Pruritic, dry, erythematous lesions in flexural folds. Defective skin barrier.\n- **🚩 Red Flags:** Signs of secondary bacterial infection (honey-colored crusting / impetigo, fever), eczema herpeticum (painful punched-out vesicles).\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Mild topical hydrocortisone 1% (short course on intact inflamed skin), oral antihistamine for sleep.\n  - **S (Barrier Repair):** **VK Dermsolve Calming Cream** / **Victoria Gentle Body Wash** (ceramide-rich).\n- **🛒 Counter Close:** Free PMG membership, PWP gentle baby wash or lotion.",
        skus: "VK Dermsolve Calming Cream, Victoria Gentle Wash, Hydrocortisone 1% cream",
        promo: "Counter PWP: gentle moisturizing lotion or bath wash with RM20+ purchase.",
        quiz: [
          {
            q: "Apakah asas PALING UTAMA dalam pengurusan kulit ekzema setiap hari (The cornerstone of eczema care)?",
            options: ["Penggunaan pelembap intensif (emolien) berulang kali setiap hari untuk membaiki sawar kulit (skin barrier)", "Mandi air panas mendidih 5 kali sehari", "Menggosok kulit dengan span kasar", "Mengelakkan minum air"],
            answer: 0,
            rationale: "Kegagalan sawar kulit membenarkan alergen masuk dan kelembapan hilang; pelembap berterusan adalah rawatan asas paling penting.",
            safety: "Sapu pelembap dalam masa 3 minit selepas mandi air suam (soak and seal)."
          },
          {
            q: "Tanda manakah yang menunjukkan ekzema telah dijangkiti kuman bakteria dan memerlukan rawatan doktor?",
            options: ["Luka berair dengan kerak kuning keemasan seperti madu (honey-colored crusts / impetigo) atau demam", "Kulit kering bersisik", "Rasa sedikit gatal waktu malam", "Kulit berwarna sedikit merah"],
            answer: 0,
            rationale: "Kerak kuning madu adalah tanda klasik jangkitan bakteria Staphylococcus aureus yang memerlukan antibiotik dari doktor.",
            safety: "Jangan sapu krim steroid kuat pada kawasan luka yang dijangkiti kuman."
          },
          {
            q: "Bagaimanakah PMG House Brand VK Dermsolve Calming Cream membantu kulit ekzema Aiman?",
            options: ["Ia membekalkan ceramide dan lipid fisiologi untuk memulihkan kelembapan dan menenangkan rasa gatal", "Ia mengandungi merkuri peluntur", "Ia merengsakan kulit", "Ia mengandungi asid kuat"],
            answer: 0,
            rationale: "Krim ceramide-dominant memulihkan kekurangan lipid semulajadi pada sawar kulit ekzema tanpa bahan kimia perengsa.",
            safety: "Pilih produk bebas pewangi tiruan dan bebas paraben untuk kulit sensitif."
          }
        ]
      },
      {
        id: "fungal",
        name: "Fungal Infection (Kurap / Panau / Tinea)",
        emergency: false,
        persona: {
          name: "Encik Rosli (45)",
          age: 45,
          gender: "male",
          role: "Factory Operator",
          language: "ms",
          visible: "VISIBLE: Encik Rosli, 45, mengadu bahagian celah paha dan lengannya sangat gatal, terutama bila berpeluh di tempat kerja. Dia menunjukkan tompokan merah bulat bersisik dengan bahagian tepi yang timbul.",
          hidden: "Anda Encik Rosli, 45 tahun, bekerja di kilang plastik yang panas. Celah paha (groin) merah gatal dan ada corak bulat cincin bersisik (tinea cruris / kurap). Tiada nanah, tiada kencing manis. Bukan ahli PMG."
        },
        summaryMd: "## 🧴 Fungal Skin Infections\n- **Pattern:** Annular (ring-shaped) erythematous scaling plaque with active raised border and central clearing (tinea corporis/cruris) or hypo/hyperpigmented scaly macules (pityriasis versicolor/panau).\n- **🚩 Red Flags:** Spreading cellulitis, diabetic foot ulcer, immunosuppression, secondary bacterial infection.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Topical Antifungal (Clotrimazole 1% / Terbinafine 1% cream).\n  - **S (Hygiene):** **Shieldmax Antifungal / Antibacterial Body Wash**.\n- **🛒 Counter Close:** Free PMG membership, PWP antifungal wash or socks.",
        skus: "Shieldmax Antifungal Cream, Clotrimazole 1% cream, Shieldmax Medicated Soap",
        promo: "Counter PWP: antibacterial wash or cotton socks with RM20+ purchase.",
        quiz: [
          {
            q: "Mengapakah krim steroid (seperti Betamethasone) DILARANG digunakan bersendirian untuk merawat kurap kulat (Fungal Tinea)?",
            options: ["Steroid merencat imuniti setempat, menyebabkan kulat membiak lebih subur dan merosakkan corak klinikal (Tinea Incognito)", "Steroid membunuh kulat terlalu cepat", "Steroid mewarnakan kulit biru", "Tiada apa-apa kesan"],
            answer: 0,
            rationale: "Menyapu steroid pada jangkitan kulat mengurangkan gatal seketika tetapi membiakkan kulat dengan ganas ke lapisan dalam kulit (Tinea Incognito).",
            safety: "Gunakan krim antikulat tulen (Clotrimazole, Terbinafine) dan bukannya steroid."
          },
          {
            q: "Berapa lamakah pesakit kurap perlu meneruskan sapuan krim antikulat selepas tompok merah dan gatal telah hilang sepenuhnya?",
            options: ["Teruskan sapuan selama 1 hingga 2 minggu lagi untuk membasmi spora kulat yang tertanam di bawah lapisan keratin", "Berhenti pada hari pertama rasa lega", "Sapu setahun tanpa henti", "Hanya sapu seminggu sekali"],
            answer: 0,
            rationale: "Spora kulat mikroskopik boleh bertahan dalam stratum corneum; menghentikan rawatan terlalu awal mengakibatkan kurap berulang (relapse).",
            safety: "Nasihatkan pesakit agar menghabiskan tempoh rawatan antikulat sehingga bersih sepenuhnya."
          },
          {
            q: "Nasihat kebersihan harian apakah yang paling penting bagi Encik Rosli untuk mengelakkan jangkitan kulat berulang?",
            options: ["Pastikan kawasan celah paha sentiasa kering, pakai pakaian dalam kapas yang longgar dan tukar pakaian selepas berpeluh", "Pakai seluar basah sepanjang hari", "Kongsi tuala mandi dengan rakan sekerja", "Jangan mandi seminggu"],
            answer: 0,
            rationale: "Kulat membiak dalam suasana gelap, lembap, dan panas; menjaga kekeringan dan kebersihan pakaian memotong kitaran hidup kulat.",
            safety: "Aspek pencegahan dan kebersihan adalah sebahagian penting protokol DPOS."
          }
        ]
      },
      {
        id: "scabies",
        name: "Scabies Infestation (Kudis Buta)",
        emergency: false,
        persona: {
          name: "Ken (20)",
          age: 20,
          gender: "male",
          role: "Hostel Student",
          language: "en",
          visible: "VISIBLE: Ken, a 20-year-old college student staying in a hostel dormitory, enters constantly scratching his wrists and between his fingers. He says the itch is unbearable at night and his roommates have the same symptoms.",
          hidden: "You are Ken, 20, living in a college hostel. Intense itching especially at night in bed. Tiny red bumps and burrows in web spaces between fingers, wrists, and belt line. Two of your roommates are also scratching. No high fever, no thick yellow crusts. Not a PMG member."
        },
        summaryMd: "## 🧴 Scabies Triage & Protocol\n- **Pattern:** Sarcoptes scabiei mite infestation. Severe nocturnal pruritus, burrows in finger webs, wrists, axillae, groin.\n- **🚩 Red Flags:** Crusted (Norwegian) scabies in immunocompromised, secondary bacterial cellulitis.\n- **💊 House Brand & OTC:**\n  - **O (Eradication):** Permethrin 5% lotion (apply neck-to-toe, leave on for 8-12 hours, wash off. Repeat in 7 days!).\n  - **Crucial Rule:** TREAT ALL HOUSEHOLD / HOSTEL CONTACTS SIMULTANEOUSLY!\n  - **S (Support):** Oral antihistamine for night itch, **Medicplast soothing wash**.\n- **🛒 Counter Close:** Free PMG membership, PWP laundry wash or disinfectant.",
        skus: "Permethrin 5% lotion, Chlorpheniramine 4mg, Calamine lotion",
        promo: "Counter PWP: antiseptic disinfectant wash with RM20+ purchase.",
        quiz: [
          {
            q: "What is the single most important rule to guarantee successful eradication of a scabies outbreak?",
            options: ["All household members and close contacts must be treated at the same time, even if they have no itch yet", "Only treat the person who complains the loudest", "Treat one finger only", "Wait 6 months before treating anyone"],
            answer: 0,
            rationale: "Scabies has a 2 to 6 week incubation period; asymptomatic contacts will re-infest the treated patient unless everyone is treated simultaneously.",
            safety: "Treat the whole room/family together + wash all bedding in hot water >60°C."
          },
          {
            q: "How should Permethrin 5% lotion be correctly applied by an adult patient?",
            options: ["Apply thoroughly from the neck down to the soles of the feet, leave on for 8 to 12 hours (overnight), then wash off. Repeat in 7 days", "Apply only like face cream for 5 minutes", "Drink 1 spoonful", "Dab only on itchy spots"],
            answer: 0,
            rationale: "Permethrin must cover all skin folds, finger webs, and under nails for 8-12 hours to kill mites and emerging larvae.",
            safety: "Re-apply on hands if hands are washed during the 8-12 hour period."
          },
          {
            q: "Why might a patient continue to feel itchy for 1 to 2 weeks even after scabies mites are completely killed?",
            options: ["The dead mites and feces remain in the skin layers, triggering an ongoing allergic hypersensitivity reaction until the skin sheds", "Permethrin creates new mites", "The medicine has failed", "It is psychological"],
            answer: 0,
            rationale: "Post-scabetic itch is an immunological allergic response that persists until epidermal turnover replaces the stratum corneum.",
            safety: "Reassure patient and provide soothing calamine lotion and oral antihistamines."
          }
        ]
      },
      {
        id: "acne",
        name: "Facial Acne Vulgaris & Blemish Care",
        emergency: false,
        persona: {
          name: "Xiao Hui (19)",
          age: 19,
          gender: "female",
          role: "College Student",
          language: "zh",
          visible: "VISIBLE: Xiao Hui, 19岁大专生，戴着口罩神色害羞，说最近熬夜备考额头和下巴爆出很多红肿痘痘和粉刺，甚至有些化脓，一碰就痛，询问有没有见效快的祛痘凝胶。",
          hidden: "你是Xiao Hui，19岁。平时爱吃甜品奶茶，最近考试熬夜脸上油脂分泌旺盛，额头和面颊爆发丘疹和脓疱。常忍不住用手挤痘痘导致红印。没有全身发烧，没有深层大囊肿。还不是PMG会员。"
        },
        summaryMd: "## 🧴 Acne Vulgaris Care\n- **Pattern:** Comedones, inflammatory papules, pustules on face/chest. Cutibacterium acnes + sebum excess.\n- **🚩 Red Flags:** Severe nodulocystic acne with scarring, fever with acute ulcerating acne (acne fulminans).\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Benzoyl peroxide 2.5-5% / Salicylic acid / Hydrocolloid pimple patches.\n  - **S (Blemish Care):** **VK Dermsolve Anti-Blemish Gel** / **Nutribridge Zinc & Vitamin C**.\n- **🛒 Counter Close:** Free PMG membership, PWP hydrocolloid pimple patch pack.",
        skus: "VK Dermsolve Blemish Gel, Benzoyl Peroxide 5%, Medicplast Pimple Patch",
        promo: "Counter PWP: waterproof hydrocolloid pimple patch pack with RM20+ purchase.",
        quiz: [
          {
            q: "使用过氧化苯甲酰（Benzoyl Peroxide）治疗痤疮时，药剂助理必须给予顾客哪项重要用药安全指引？",
            options: ["初次使用从小浓度（2.5%-5%）开始点涂，可能有轻微脱皮发红，且会漂白深色衣物和毛巾", "必须涂满全脸当做睡眠面膜厚敷", "口服吞服效果更好", "可以在强阳光下暴晒"],
            answer: 0,
            rationale: "过氧化苯甲酰具有强氧化脱色性并有轻微角质剥脱作用，必须提醒顾客避开眼周并注意衣物漂白。",
            safety: "建议夜间点涂，白天配合防晒霜。"
          },
          {
            q: "水胶体痘痘贴（Hydrocolloid Pimple Patch）对成熟脓包痘痘的主要好处是什么？",
            options: ["吸收渗出脓液，保护创口阻隔外界细菌与手部摩擦抠挤，减少色素沉淀与疤痕", "能彻底改变基因", "会让痘痘变成黑色", "它是一个无线电发射器"],
            answer: 0,
            rationale: "水胶体形成湿润愈合环境吸附脓液，并有效阻止手部不洁挤压导致的继发细菌感染和痘印。",
            safety: "推荐作为柜台PWP加购商品，既实用又促进快速愈合。"
          },
          {
            q: "对于经常熬夜长痘的年轻人，PMG House Brand哪种微量元素补充剂最有助于调控皮脂分泌和黏膜修复？",
            options: ["Nutribridge锌（Zinc）与维生素C", "大剂量安眠药", "强效泻药", "关节葡萄糖胺"],
            answer: 0,
            rationale: "锌元素具有抗炎抑菌和调控雄激素皮脂腺活性的临床功效，与维生素C协同促进胶原蛋白再生。",
            safety: "锌补充剂宜在餐后服用以避免胃部恶心感。"
          }
        ]
      },
      {
        id: "scalds_burns",
        name: "Minor Scalds & Superficial Burns",
        emergency: false,
        persona: {
          name: "Madam Florence (38)",
          age: 38,
          gender: "female",
          role: "Working Mother",
          language: "en",
          visible: "VISIBLE: Madam Florence, 38, enters holding her left forearm wrapped in a wet paper towel. She accidentally splashed boiling soup on her arm 20 minutes ago. The skin is red, hot, and stinging, with a few small intact blisters.",
          hidden: "You are Madam Florence, 38. Splashed hot soup while cooking. Red stinging skin on outer forearm about the size of 3 fingers. A couple of small blisters (1cm), no broken skin, no charring, no numbness. You ran it under the tap for 2 minutes. You want a soothing cream to stop the burning pain."
        },
        summaryMd: "## 🧴 Minor Burns & Scalds Triage\n- **Pattern:** Superficial (1st degree: red, dry, painful) or superficial partial-thickness (2nd degree: blisters, moist, very painful).\n- **🚩 CRITICAL RED FLAGS (Send to Hospital ER):** Burn > size of patient's palm, chemical/electrical burns, burns on face, hands, feet, groin, or major joints, circumferential burns, painless leathery white/charred skin (3rd degree).\n- **⚠️ Golden First Aid:** Cool running tap water for a FULL 20 MINUTES! (NO ICE! NO TOOTHPASTE! NO BUTTER! NO SOY SAUCE!).\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Hydrogel burn dressing / Sterile non-adherent dressing / Paracetamol.\n  - **S (Healing):** **Medicplast Hydrogel Burn Dressing** / Antiseptic cream.\n- **🛒 Counter Close:** Free PMG membership, PWP sterile gauze pack.",
        skus: "Medicplast Hydrogel Burn Dressing, Biowell Terrafast 500mg, Chlorhexidine wash",
        promo: "Counter PWP: sterile gauze swabs or micropore tape with RM20+ purchase.",
        quiz: [
          {
            q: "What is the single most vital immediate FIRST AID action for any thermal burn or scald?",
            options: ["Immediately cool under running tap water for a full 20 minutes (within 3 hours of injury)", "Apply ice cubes directly on the burn", "Smear toothpaste, butter, or soy sauce on the wound", "Pop all blisters immediately with a needle"],
            answer: 0,
            rationale: "20 minutes of cool running water halts the heat progression, reduces burn depth, minimizes scarring, and dramatically reduces pain.",
            safety: "Never use ice (causes vasoconstriction and frostbite) and never apply food substances (causes severe infection!)."
          },
          {
            q: "Which burn presentation requires IMMEDIATE HOSPITAL EMERGENCY referral rather than community pharmacy treatment?",
            options: ["Burn involving the face, hands, genitals, or larger than the size of the patient's palm", "A red spot the size of a coin on the forearm", "Mild sunburn with intact skin", "A small 5mm blister on the finger"],
            answer: 0,
            rationale: "Burns in sensitive areas or >1% body surface area in children / >2% in adults risk functional contractures, airway compromise, and systemic shock.",
            safety: "Assess burn size and location first before offering hydrogel dressings."
          },
          {
            q: "Why should burn blisters NOT be deliberately popped or burst at home?",
            options: ["The intact blister roof is a sterile biological dressing that protects the fragile dermis underneath from bacterial infection", "Popping blisters makes the arm fall off", "Blisters contain acid", "Blisters will turn into metal"],
            answer: 0,
            rationale: "Bursting blisters creates an open portal for bacterial entry. Keep blisters intact and dress with non-adherent hydrogel dressing.",
            safety: "If a blister bursts spontaneously, gently clean with saline and cover with sterile non-stick dressing."
          }
        ]
      },
      {
        id: "wound",
        name: "Minor Cuts & Wound Dressing Triage",
        emergency: false,
        persona: {
          name: "Ah Keong (46)",
          age: 46,
          gender: "male",
          role: "Renovation Carpenter",
          language: "zh",
          visible: "VISIBLE: Ah Keong, 46岁装修木工，右手指缠着沾血的纸巾，神色匆忙地走进来。他在锯木板时被美工刀割伤食指，伤口约2厘米长，按压后出血已经减缓，询问买什么药水和胶布包扎。",
          hidden: "你是Ah Keong，46岁木工。被干净美工刀浅浅划破食指，伤口整齐，按压5分钟后血基本止住了。手指感觉正常，能弯曲活动，没有发麻，伤口内没有残留木屑刀片。5年前在诊所打过破伤风针。还不是PMG会员。"
        },
        summaryMd: "## 🧴 Minor Cuts & Wound Dressing\n- **Pattern:** Superficial clean lacerations or abrasions. Capillary oozing.\n- **🚩 Red Flags (Send to Doctor):** Pulsatile/spurting bleeding (arterial), deep wound with gaping edges requiring sutures, numbness/inability to move tendon, animal/human bite, rusty puncture wound without tetanus vaccine in past 5-10 years.\n- **💊 House Brand & OTC:**\n  - **O (Cleanse & Protect):** Sterile Saline wash / Povidone Iodine / Chlorhexidine.\n  - **S (Dressings):** **Medicplast Waterproof Plasters** / **Medicplast Sterile Gauze**.\n- **🛒 Counter Close:** Free PMG membership, PWP antiseptic liquid or bandages.",
        skus: "Medicplast Waterproof Plasters, Medicplast Gauze Swabs, Povidone Iodine 10%",
        promo: "Counter PWP: antiseptic wound wipe or adhesive tape with RM20+ purchase.",
        quiz: [
          {
            q: "处理割伤伤口时，第一步正确的止血操作是什么？",
            options: ["用无菌纱布或清洁布直接按压伤口5至10分钟并抬高受伤部位", "在伤口上倒大量面粉止血", "用力甩动手指", "立刻把手泡在污水里"],
            answer: 0,
            rationale: "直接压迫止血（Direct pressure）配合抬高伤口能有效促使血小板凝聚止血，切忌使用灰尘或粉末造成异物污染。",
            safety: "按压期间切勿频繁揭开查看，以免破坏初凝血块。"
          },
          {
            q: "以下哪种伤口特征代表需要前往诊所/医院缝针（Sutures）或打破伤风针（Tetanus toxoid）？",
            options: ["伤口深度较深、边缘裂开（Gaping）、被生锈铁钉深刺穿、或喷射状出血", "表皮轻微划痕，血已止住", "按压后不再渗血的浅表划伤", "指甲缝轻微脏污"],
            answer: 0,
            rationale: "裂开伤口需在6-8小时黄金时间内缝合以减少疤痕并加快愈合；铁钉刺伤属厌氧菌环境，破伤风风险高。",
            safety: "详细询问致伤器具（生锈物/动物咬伤）及上一次破伤风疫苗注射年份。"
          },
          {
            q: "清洗和消毒浅表割伤伤口的最推荐循证医学步骤是什么？",
            options: ["先用无菌生理盐水（Saline）彻底冲洗异物污垢，再涂抹适量聚维酮碘（Povidone Iodine）或抗菌膏，贴上防水敷贴", "用浓盐水和高度烈酒用力摩擦创面", "不用清洗直接贴胶布", "涂抹风油精"],
            answer: 0,
            rationale: "温和生理盐水物理冲洗是清洁创面的金标准，配合温和杀菌剂及防水透气敷贴创造湿润无菌愈合环境。",
            safety: "避免使用高浓度酒精直接倾倒在开放创口内，会灼伤健康新生肉芽组织。"
          }
        ]
      }
    ]
  },

  // ─── 5. CARDIOMETABOLIC CARE ───────────────────────────────────────────────
  cardiometabolic: {
    id: "cardiometabolic",
    name: "Cardiometabolic Care",
    icon: "❤️",
    conditions: [
      {
        id: "diabetic_neuropathy",
        name: "Diabetic Peripheral Neuropathy (Kesemutan)",
        emergency: false,
        persona: {
          name: "Uncle Lim (68)",
          age: 68,
          gender: "male",
          role: "Retired Clerk",
          language: "zh",
          visible: "VISIBLE: Uncle Lim, 68岁华裔老伯，慢慢走进来询问有没有‘补神经’的药。他说双脚脚趾和脚板经常感觉麻痹、刺痛，好像‘蚂蚁在咬’，穿拖鞋有时脱落了自己都不知道。",
          hidden: "你是Uncle Lim，68岁。患有2型糖尿病12年，平时在政府诊所拿Metformin和Gliclazide。双脚远端感觉减退、麻木麻痹（Kesemutan），夜间刺痛较多。没有脚部伤口溃烂，没有脚趾变黑发臭，双脚有脉搏。还不是PMG会员。"
        },
        summaryMd: "## ❤️ Diabetic Peripheral Neuropathy\n- **Pattern:** 'Glove-and-stocking' distal symmetrical sensory loss, paresthesias (tingling/pins & needles), burning foot pain.\n- **🚩 Red Flags:** Non-healing diabetic foot ulcer, black discoloration/necrosis (gangrene), spreading redness/cellulitis, loss of pedal pulses.\n- **💊 House Brand & OTC:**\n  - **O (Foot Care):** Daily visual foot inspection, moisturizing urea cream (never between toes).\n  - **S (Neuro-Protection):** **Nutribridge Alpha Lipoic Acid (ALA 300mg)** / **Livemore Neuro B-Complex (B1, B6, B12)**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th FREE blood glucose test.",
        skus: "Nutribridge Alpha Lipoic Acid 300mg, Livemore Neuro B-Complex, Urea Foot Cream",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP diabetic socks.",
        quiz: [
          {
            q: "糖尿病患者因神经病变感觉减退，药剂助理必须反复强调的每日护足习惯是什么？",
            options: ["每天用镜子检查足底有无破皮、水泡或红肿，绝不赤脚走路，洗脚后擦干指缝", "每天用很热的水泡脚半小时", "用指甲剪随意挖剪鸡眼", "赤脚在石子路上走以‘刺激血液循环’"],
            answer: 0,
            rationale: "糖尿病足神经麻木患者无法感知痛觉，水泡或小伤口极易恶化为坏疽溃疡而面临截肢风险。",
            safety: "绝不可用热水袋直接敷脚（极易导致严重无痛烫伤！）。"
          },
          {
            q: "为何硫辛酸（Alpha Lipoic Acid - ALA）被广泛推荐用于糖尿病周围神经病变？",
            options: ["它是强效抗氧化剂，能清除自由基、改善神经末梢微血管内皮血流，缓解麻木与刺痛", "它是一种强效抗生素", "它能把糖尿病彻底根治不需服药", "它是一种外用麻醉药"],
            answer: 0,
            rationale: "ALA能穿越血脑屏障，临床试验证实口服300-600mg能显著改善糖尿病末梢神经传导速率和刺痛感。",
            safety: "强调ALA是辅助神经代谢，不能擅自停用降糖处方药。"
          },
          {
            q: "对于68岁的Uncle Lim，PMG药房每月28号有什么特别关怀活动可以邀请他参加？",
            options: ["Senior Care Plus每月28号免费验血糖活动", "免费爬山比赛", "购买烟草折扣", "免费啤酒品尝"],
            answer: 0,
            rationale: "PMG关爱乐龄人士，每月28日提供免费血糖检测，帮助糖尿病长者追踪控糖达标情况。",
            safety: "主动关怀并记录长者血糖数值。"
          }
        ]
      },
      {
        id: "high_bp",
        name: "High Blood Pressure Triage & Care",
        emergency: false,
        persona: {
          name: "Pak Cik Hassan (64)",
          age: 64,
          gender: "male",
          role: "Retiree",
          language: "ms",
          visible: "VISIBLE: Pak Cik Hassan, 64, masuk meminta pembantu farmasi mengukur tekanan darahnya. Dia berasa sedikit tegang di bahagian belakang tengkuk. Bacaan meter menunjukkan 152/94 mmHg.",
          hidden: "Anda Pak Cik Hassan, 64 tahun. Tengkuk rasa berat bila letih berkebun. Tekanan darah 152/94 mmHg (Gred 1 Hipertensi). Tiada sakit dada menekan, tiada sesak nafas, tiada muntah, tiada pandangan kabur. Mengambil ubat darah tinggi di klinik desa tetapi kadang-kadang terlupa makan. Bukan ahli PMG."
        },
        summaryMd: "## ❤️ High Blood Pressure Triage\n- **Pattern:** Chronic asymptomatic 'silent killer'. Target BP generally <140/90 mmHg (<130/80 in diabetes/CKD).\n- **🚩 Hypertensive Emergency (Immediate ER):** BP >180/120 mmHg accompanied by chest pain, shortness of breath, severe headache with blurred vision, neurological deficit, or seizure.\n- **💊 House Brand & OTC:**\n  - **O (Monitoring):** Accurate home BP monitoring log, DASH diet, sodium restriction (<2000mg/day).\n  - **S (Cardio-Support):** **Nutribridge CoQ10 150mg** / **JH Nutrition Fish Oil 1000mg** / **Garlic Extract**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th free glucose test.",
        skus: "Nutribridge CoQ10 150mg, JH Nutrition Fish Oil 1000mg, Digital BP Monitor",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP digital BP monitor.",
        quiz: [
          {
            q: "Antara keadaan berikut, yang manakah merupakan KECEMASAN HIPERTENSI (Hypertensive Emergency) yang perlu dihantar ke Jabatan Kecemasan hospital serta-merta?",
            options: ["Tekanan darah >180/120 mmHg disertai sakit dada menekan, sesak nafas, atau kabur penglihatan", "Tekanan darah 135/85 mmHg waktu petang", "Tekanan darah naik sedikit selepas minum kopi", "Rasa sedikit lapar"],
            answer: 0,
            rationale: "Tekanan darah lampau tinggi (>180/120) dengan kerosakan organ sasaran (jantung, otak, buah pinggang) berisiko strok atau serangan jantung akut.",
            safety: "Bezakan antara hipertensi tanpa gejala dengan krisis hipertensi kecemasan."
          },
          {
            q: "Apakah punca utama mengapa pesakit tekanan darah tinggi tidak patut berhenti mengambil ubat walaupun berasa sihat?",
            options: ["Hipertensi adalah pembunuh senyap (Silent Killer) tanpa gejala, ubat diperlukan untuk melindungi salur darah otak dan buah pinggang secara berterusan", "Ubat darah tinggi hanya perlu dimakan bila pening sahaja", "Tekanan darah akan sembuh sendiri selepas seminggu", "Ubat darah tinggi adalah vitamin biasa"],
            answer: 0,
            rationale: "Kerosakan vaskular berlaku secara senyap; kepatuhan ubat harian menurunkan risiko strok sebanyak 35-40%.",
            safety: "Tekankan kepatuhan ubat (adherence) dan jangan sesekali menghentikan ubat doktor."
          },
          {
            q: "Bagaimanakah suplemen House Brand Nutribridge CoQ10 150mg menyokong kesihatan kardiovaskular Pak Cik Hassan?",
            options: ["CoQ10 membekalkan tenaga selular ATP kepada otot jantung dan bertindak sebagai antioksidan saluran darah", "Ia membekalkan gula darah", "Ia menidurkan pesakit serta-merta", "Ia ubat penenang saraf"],
            answer: 0,
            rationale: "Otot jantung memerlukan kepekatan CoQ10 yang tinggi untuk fungsi pengepaman optimum, terutamanya bagi warga emas atau pengguna ubat kolesterol statin.",
            safety: "Sangat sesuai digandingkan bagi pelanggan yang mengambil ubat statin."
          }
        ]
      },
      {
        id: "high_cholesterol",
        name: "High Cholesterol & Cardiovascular Wellness",
        emergency: false,
        persona: {
          name: "Mr. Brandon & Dad (60)",
          age: 60,
          gender: "male",
          role: "Retiree with Son",
          language: "en",
          visible: "VISIBLE: Mr. Brandon brings his 60-year-old father who recently received medical checkup results showing elevated Total Cholesterol (6.8 mmol/L) and LDL (4.5 mmol/L). The father wants a natural supplement to support healthy cholesterol levels.",
          hidden: "You are Brandon's father, 60. Retired. Doctor advised lifestyle and diet changes before starting statin meds. No chest tightness, no shortness of breath, no history of stroke. You eat a lot of local hawker food. You take no chronic medicines yet. Not a PMG member."
        },
        summaryMd: "## ❤️ High Cholesterol & Lipid Care\n- **Pattern:** Atherogenic dyslipidemia, elevated LDL-C, low HDL-C, high triglycerides. Major risk factor for coronary artery disease.\n- **🚩 Red Flags:** Exertional chest tightness, angina radiating to arm/jaw, shortness of breath, sudden neurological weakness.\n- **💊 House Brand & OTC:**\n  - **O (Dietary):** Reduce saturated/trans fats, increase soluble fiber, Mediterranean/oat-rich diet.\n  - **S (Lipid Support):** **JH Nutrition Red Yeast Rice + CoQ10** / **Nutribridge High Strength Omega-3 Fish Oil**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th free glucose test.",
        skus: "JH Nutrition Red Yeast Rice + CoQ10, Nutribridge Fish Oil 1000mg, Oat beta-glucan",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP heart health omega-3.",
        quiz: [
          {
            q: "How does JH Nutrition Red Yeast Rice (Monascus purpureus) naturally support healthy cholesterol metabolism?",
            options: ["It naturally contains monacolin K, which inhibits the HMG-CoA reductase enzyme responsible for hepatic cholesterol synthesis", "It acts as a strong laxative", "It destroys all dietary fat in the stomach", "It bleaches the blood vessels"],
            answer: 0,
            rationale: "Monacolin K is structurally identical to lovastatin, providing natural HMG-CoA reductase inhibition to reduce LDL production.",
            safety: "Should not be combined with prescription statins without doctor/pharmacist oversight to prevent muscle toxicity."
          },
          {
            q: "Why is high-purity Omega-3 Fish Oil (EPA & DHA) an ideal partner in cardiovascular protection?",
            options: ["Omega-3 fatty acids lower blood triglycerides, reduce platelet aggregation, and exert vascular anti-inflammatory benefits", "Fish oil raises cholesterol levels", "Fish oil causes blood to clot faster", "Fish oil replaces all vegetables"],
            answer: 0,
            rationale: "Clinical trials prove EPA and DHA reduce elevated triglycerides and support endothelial arterial flexibility.",
            safety: "Check if the patient is on Warfarin or scheduled for major surgery (mild anti-platelet effect)."
          },
          {
            q: "What lifestyle dietary modification has the strongest clinical evidence for lowering LDL cholesterol by 5-10%?",
            options: ["Consuming 3g of oat beta-glucan soluble fiber daily and replacing saturated animal fats with plant sterols and unsaturated oils", "Eating 3 deep-fried chicken wings daily", "Drinking sweetened carbonated drinks", "Skipping water"],
            answer: 0,
            rationale: "Soluble viscous fiber binds bile acids in the gut lumen, forcing the liver to consume circulating LDL to synthesize new bile.",
            safety: "Combine evidence-based supplements with proven nutrition advice."
          }
        ]
      },
      {
        id: "blood_sugar",
        name: "Blood Sugar Monitoring & Pre-Diabetes",
        emergency: false,
        persona: {
          name: "Auntie Mary (59)",
          age: 59,
          gender: "female",
          role: "Homemaker",
          language: "en",
          visible: "VISIBLE: Auntie Mary, a 59-year-old lady, comes in holding a clinic laboratory slip. Her fasting blood sugar came back borderline high at 6.3 mmol/L (impaired fasting glucose). She is anxious about developing full-blown diabetes like her sister.",
          hidden: "You are Auntie Mary, 59. Fasting glucose 6.3 mmol/L (pre-diabetes). Slightly overweight (BMI 27). No excessive thirst, no waking up 5 times to pee, no weight loss. You want to know what supplements and dietary habits can reverse this before you need daily medicines. Not a PMG member."
        },
        summaryMd: "## ❤️ Pre-Diabetes & Glycemic Wellness\n- **Pattern:** Impaired fasting glucose (5.6 - 6.9 mmol/L) or HbA1c 5.7 - 6.4%. Reversible with lifestyle!\n- **🚩 Red Flags (Diabetic Ketoacidosis / HHS):** Extreme polydipsia/polyuria, fruity acetone breath, confusion, deep rapid breathing, dehydration.\n- **💊 House Brand & OTC:**\n  - **O (Monitoring):** Home glucometer self-check, low glycemic index (GI) diet, 150 mins aerobic exercise/week.\n  - **S (Glucose Support):** **Nutribridge Glucocare** (Bitter Melon / Gymnema / Chromium) / **Nutribridge Multi-Strain Probiotics**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+) **HIGHLIGHT 28TH FREE GLUCOSE TEST!**",
        skus: "Nutribridge Glucocare, Accu-Chek / OneTouch Glucometer, Nutribridge Chromium",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP blood glucose test strips.",
        quiz: [
          {
            q: "Auntie Mary's fasting glucose is 6.3 mmol/L (Pre-diabetes). What is the proven benefit of early lifestyle intervention at this stage?",
            options: ["Structured diet and 5-7% weight loss can reduce the risk of progressing to full Type 2 Diabetes by nearly 60%", "Pre-diabetes is incurable and medicines must be taken for life", "Nothing can be done once blood sugar is borderline", "She should completely stop eating carbohydrates forever"],
            answer: 0,
            rationale: "The landmark Diabetes Prevention Program (DPP) trial demonstrated that lifestyle modification reduces diabetes progression risk by 58%.",
            safety: "Empower customers with hope and actionable nutritional steps."
          },
          {
            q: "What is the standout flagship service offered by PMG Pharmacy to support customers like Auntie Mary in tracking their glucose?",
            options: ["Senior Care Plus with FREE monthly blood glucose screening on the 28th of every month across all PMG branches", "Selling high-sugar cordials", "A lucky draw ticket only", "Free movie tickets"],
            answer: 0,
            rationale: "PMG's signature 28th Monthly Free Blood Glucose Test is specifically designed to provide free community screening and chronic disease monitoring.",
            safety: "Always introduce the 28th free screening to customers aged 55+."
          },
          {
            q: "How does Bitter Melon extract (Momordica charantia) and Chromium in Nutribridge Glucocare assist cellular glucose uptake?",
            options: ["Bitter melon contains charantin and polypeptide-p which mimic insulin activity, while chromium enhances insulin receptor sensitivity", "It dissolves sugar in the bloodstream like hot water", "It causes vomiting of sugar", "It turns sugar into bone"],
            answer: 0,
            rationale: "Botanical extracts with chromium picolinate improve peripheral insulin sensitivity and assist post-prandial glycemic regulation.",
            safety: "Advise taking with or immediately after meals."
          }
        ]
      },
      {
        id: "fatty_liver",
        name: "Fatty Liver & Hepatic Wellness",
        emergency: false,
        persona: {
          name: "Encik Daud (49)",
          age: 49,
          gender: "male",
          role: "Civil Servant",
          language: "ms",
          visible: "VISIBLE: Encik Daud, 49, masuk dengan borang pemeriksaan kesihatan. Doktor memberitahu ultrabunyi menunjukkan 'Fatty Liver' (hati berlemak gred 1). Dia bertanya sama ada ada suplemen herba Milk Thistle untuk bersihkan hati.",
          hidden: "Anda Encik Daud, 49 tahun. Berat badan berlebihan, perut buncit (visceral fat). Ujian darah menunjukkan enzim hati ALT sedikit tinggi (58 U/L), ultrasound kata hati berlemak. Tiada mata kuning (jaundice), tiada perut bengkak air (ascites), tiada muntah darah. Suka minum teh tarik manis. Bukan ahli PMG."
        },
        summaryMd: "## ❤️ Non-Alcoholic Fatty Liver (NAFLD)\n- **Pattern:** Hepatic steatosis linked to metabolic syndrome, insulin resistance, visceral obesity, excess fructose/sugar.\n- **🚩 Red Flags (Cirrhosis / Liver Failure):** Jaundice (yellow eyes/skin), ascites (abdominal fluid swelling), confusion (hepatic encephalopathy), vomiting blood (esophageal varices).\n- **💊 House Brand & OTC:**\n  - **O (Lifestyle):** Eliminate sugary drinks/fructose, 7-10% body weight reduction, regular exercise.\n  - **S (Liver Support):** **Nutribridge Milk Thistle Extract (Silymarin)** / **Phosphatidylcholine (Lecithin)** / **CoQ10**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus if 55+, PWP liver tonic supplement.",
        skus: "Nutribridge Milk Thistle Extract 300mg, Nutribridge CoQ10 150mg, Phosphatidylcholine",
        promo: "Counter PWP: antioxidant liver tonic or green tea extract with RM20+ purchase.",
        quiz: [
          {
            q: "Apakah intervensi yang paling terbukti secara saintifik mampu membalikkan (reverse) masalah hati berlemak bukan alkohol (NAFLD)?",
            options: ["Pengurangan 7-10% berat badan melalui kawalan kalori, pemotongan minuman manis bergula/fruktosa, dan senaman tetap", "Minum minyak zaitun 1 botol setiap pagi", "Makan makanan segera berlemak", "Tidur 20 jam sehari"],
            answer: 0,
            rationale: "Pengurangan lemak visceral hati berlaku dengan pantas apabila kalori berlebihan dan fruktosa dipotong daripada diet harian.",
            safety: "Suplemen herba menyokong fungsi hati, tetapi perubahan gaya hidup adalah kunci utama pemulihan."
          },
          {
            q: "Bagaimanakah ekstrak herba Milk Thistle (Silymarin) membantu melindungi sel-sel hati daripada kerosakan radikal bebas?",
            options: ["Silymarin bertindak sebagai antioksidan kuat, menstabilkan membran sel hepatosit, dan merangsang sintesis protein untuk pembaikan tisu hati", "Ia melunturkan warna hati", "Ia membakar lemak dalam masa 5 saat", "Ia adalah ubat bius"],
            answer: 0,
            rationale: "Silymarin menghalang peroksidasi lipid pada membran sel hati dan merangsang RNA polimerase I untuk regenerasi sel hepatosit.",
            safety: "Selamat untuk sokongan jangka panjang bersama amalan pemakanan sihat."
          },
          {
            q: "Antara tanda berikut, yang manakah merupakan TANDA BAHAYA (Red Flag) kerosakan hati tahap akhir (sirosis) yang memerlukan rujukan pakar hospital segera?",
            options: ["Mata dan kulit bertukar kuning (jaundice), perut kembung air membusung (ascites), atau muntah darah", "Rasa sedikit letih selepas kerja", "Perut berbunyi waktu pagi", "Suka makan makanan pedas"],
            answer: 0,
            rationale: "Jaundis, asites, dan pendarahan varises esofagus menandakan kegagalan fungsi hati kronik yang mengancam nyawa.",
            safety: "Rujuk segera sebarang tanda jaundis atau bengkak air abdomen."
          }
        ]
      }
    ]
  },

  // ─── 6. WOMEN'S HEALTH ─────────────────────────────────────────────────────
  women: {
    id: "women",
    name: "Women's Health",
    icon: "🌸",
    conditions: [
      {
        id: "uti",
        name: "Uncomplicated UTI (Kencing Kotor)",
        emergency: false,
        persona: {
          name: "Puan Siti (32)",
          age: 32,
          gender: "female",
          role: "Teacher",
          language: "ms",
          visible: "VISIBLE: Puan Siti, 32, berjalan masuk dalam keadaan tidak selesa. Dia mengadu berasa pedih dan panas seperti terbakar bila membuang air kecil, dan kerap ke tandas tetapi air kencing keluar sedikit-sedikit.",
          hidden: "Anda Puan Siti, 32 tahun, seorang guru. Kurang minum air kerana sibuk mengajar. Sejak semalam terasa pedih semasa kencing (dysuria), rasa kencing tak puas, kerap ke tandas. Air kencing tidak berdarah, tiada demam, tiada sakit pinggang/belakang. Tidak mengandung. Bukan ahli PMG."
        },
        summaryMd: "## 🌸 Uncomplicated UTI Triage\n- **Pattern:** Dysuria (burning on micturition), urinary frequency, urgency, suprapubic discomfort in non-pregnant adult female.\n- **🚩 Red Flags (Send to Doctor):** High fever/rigors, loin/flank pain (pyelonephritis), macroscopic hematuria (blood in urine), pregnancy, male patient, recurrent UTI (>3/year).\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Urine alkalizer (Ural effervescent) to reduce burning pain, plentiful water intake (>2.5L).\n  - **S (Prevention):** **Nutribridge Cranberry D-Mannose Effervescent** / **Women's Flora Probiotics**.\n- **🛒 Counter Close:** Free PMG membership, PWP feminine hygiene wash.",
        skus: "Nutribridge Cranberry D-Mannose, Ural Effervescent Sachets, Women's Probiotics",
        promo: "Counter PWP: feminine hygiene wash or Ural 4s with RM20+ purchase.",
        quiz: [
          {
            q: "Antara tanda berikut, yang manakah merupakan TANDA BAHAYA (Red Flag) jangkitan salur kencing yang menunjukkan kuman telah merebak ke buah pinggang (Pyelonephritis)?",
            options: ["Demam menggigil dan sakit pada bahagian pinggang/belakang (flank/loin pain)", "Rasa sedikit pedih waktu kencing", "Air kencing berwarna kuning pekat kerana kurang minum", "Kerap ke tandas pada waktu siang"],
            answer: 0,
            rationale: "Demam menggigil dan sakit pinggang menunjukkan jangkitan buah pinggang (pielonefritis) yang memerlukan antibiotik sistemik dari doktor segera.",
            safety: "Jangan rawat jangkitan berserta demam dan sakit pinggang di kaunter farmasi sahaja."
          },
          {
            q: "Bagaimanakah gabungan Cranberry berkepekatan tinggi dan D-Mannose membantu mencegah bakteria E. coli daripada melekat?",
            options: ["Proanthocyanidins (PACs) dan D-Mannose mengikat fimbriae pili bakteria E. coli, menghalangnya melekat pada dinding pundi kencing lalu dihanyutkan keluar melalui air kencing", "Ia membakar pundi kencing", "Ia menukar warna air kencing kepada hijau", "Ia menghentikan pengeluaran air kencing"],
            answer: 0,
            rationale: "Mekanisme anti-lekatan (anti-adhesion) semulajadi PACs dan D-mannose terbukti secara klinikal menghalang kolonisasi uropatogen.",
            safety: "Bukan pengganti antibiotik jika pesakit mengalami jangkitan bakteria akut yang teruk."
          },
          {
            q: "Mengapakah pesakit lelaki yang mengalami kencing pedih atau kotor sentiasa dianggap 'Complicated UTI' yang wajib dirujuk ke doktor?",
            options: ["Uretra lelaki lebih panjang; jangkitan salur kencing pada lelaki jarang berlaku dan kerap melibatkan masalah prostat atau anatomi salur kencing", "Lelaki tidak boleh minum air kosong", "Lelaki tidak mempunyai pundi kencing", "Kerana ubat kencing kotor hanya untuk wanita"],
            answer: 0,
            rationale: "UTI pada lelaki luar biasa dan memerlukan pemeriksaan doktor untuk menolak prostatitis, batu karang atau striktur uretra.",
            safety: "UTI pada lelaki = rujuk doktor!"
          }
        ]
      },
      {
        id: "dysmenorrhea",
        name: "Primary Dysmenorrhea (Senggugut)",
        emergency: false,
        persona: {
          name: "Xiao Ling (23)",
          age: 23,
          gender: "female",
          role: "Fresh Graduate",
          language: "zh",
          visible: "VISIBLE: Xiao Ling, 23岁刚毕业的女大学生，面色苍白，手捂着小腹走进来。她说今天来月经第一天，下腹绞痛得非常厉害（Senggugut），甚至直不起腰，询问有没有快速止痛的方法。",
          hidden: "你是Xiao Ling，23岁。每次经期第1-2天下腹剧烈痉挛抽痛，腰酸乏力。从小就有原发性痛经。没有月经周期异常大出血，平时吃止痛药（Mefenamic acid）有效，但今天出来忘了带药。以前没有胃溃疡病史。还不是PMG会员。"
        },
        summaryMd: "## 🌸 Primary Dysmenorrhea Care\n- **Pattern:** Lower abdominal spasmodic cramping pain starting just before or with menses, lasting 48-72h. High prostaglandin F2α.\n- **🚩 Red Flags (Secondary Dysmenorrhea):** Onset of dysmenorrhea in age >25 without prior history, severe dyspareunia (pain during intercourse), abnormal intermenstrual bleeding (endometriosis/fibroids).\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Medicplast Thermo Abdominal Heat Patch / Mefenamic Acid 250-500mg / Paracetamol.\n  - **S (Hormonal Balance):** **Nutribridge Evening Primrose Oil 1000mg** / **Nutribridge Magnesium**.\n- **🛒 Counter Close:** Free PMG membership, PWP abdominal heat therapy patch.",
        skus: "Medicplast Thermo Patch, Nutribridge Evening Primrose Oil 1000mg, Mefenamic acid",
        promo: "Counter PWP: Medicplast soothing abdominal heat patch with RM20+ purchase.",
        quiz: [
          {
            q: "为什么外用温热贴（Medicplast Thermo Patch）敷在小腹部能快速有效缓解原发性经痛？",
            options: ["热力促使腹部平滑肌放松、缓解子宫肌层缺血痉挛，并阻断疼痛神经信号传导", "热力把子宫完全融化", "热力改变月经颜色", "它没有任何科学依据"],
            answer: 0,
            rationale: "局部热敷与镇痛药物疗效相当，能有效增加子宫局部微循环血流，解除前列腺素引起的血管痉挛。",
            safety: "外用热贴不伤胃，非常适合无法耐受口服消炎药的年轻女性。"
          },
          {
            q: "若一名35岁女性此前经期从未痛经，近半年突然出现进行性加剧的严重剧烈经痛伴性交痛，药房助理应警惕什么？",
            options: ["继发性痛经（Secondary Dysmenorrhea），可能由子宫内膜异位症（Endometriosis）或子宫肌瘤引起，需转介妇产科", "纯属心理作用", "不需要理会", "只需喝冰水"],
            answer: 0,
            rationale: "25岁以后新发或进行性加重的经痛常为盆腔器质性病变（如子宫内膜异位、腺肌症），必须由妇产科医生排查。",
            safety: "问清痛经起始年龄与疼痛规律。"
          },
          {
            q: "PMG House Brand Nutribridge月见草油（Evening Primrose Oil - EPO）如何帮助维持女性经期健康？",
            options: ["富含伽马亚麻酸（GLA），有助于调节体内前列腺素平衡，缓解经前综合征（PMS）与乳房胀痛", "它是一种荷尔蒙注射液", "它是避孕药", "它能立刻止住大出血"],
            answer: 0,
            rationale: "GLA是合成抗炎前列腺素PGE1的前体物质，有助于平衡促炎的前列腺素PGE2，缓解经期不适。",
            safety: "建议每日随餐服用1-2粒，经期亦可安全持续保养。"
          }
        ]
      },
      {
        id: "thrush",
        name: "Vaginal Candidiasis (Thrush / Keputihan)",
        emergency: false,
        persona: {
          name: "Madam Florence (36)",
          age: 36,
          gender: "female",
          role: "Corporate Executive",
          language: "en",
          visible: "VISIBLE: Madam Florence, 36, discreetly asks the female pharmacist for advice. She has been experiencing intense vulval itching and a thick, white, cottage cheese-like vaginal discharge since finishing a course of antibiotics last week.",
          hidden: "You are Madam Florence, 36. Finished oral augmentin for a tooth infection 7 days ago. Now intense intimate itch, burning, and thick white curd-like discharge without foul odor. Not pregnant, no fever, no lower abdominal pelvic pain. Embarrassed but needs immediate relief. Not a PMG member."
        },
        summaryMd: "## 🌸 Vaginal Candidiasis (Thrush)\n- **Pattern:** Candida albicans overgrowth following antibiotics, heat, or hormonal changes. Pruritus, thick white curd-like (cottage cheese) discharge, no foul fishy odor.\n- **🚩 Red Flags (Send to Doctor):** Foul/fishy-smelling greenish discharge (bacterial vaginosis/trichomoniasis), fever, pelvic pain, pregnancy, recurrent thrush (>4 episodes/year).\n- **💊 House Brand & OTC:**\n  - **O (Eradication):** Clotrimazole vaginal pessary 500mg (single dose) + Clotrimazole 1-2% cream for external itch.\n  - **S (Restoration):** **Nutribridge Flora Women Probiotics** / **Gentle Intimate Wash**.\n- **🛒 Counter Close:** Free PMG membership, PWP pH-balanced intimate wash.",
        skus: "Clotrimazole 500mg Pessary, Clotrimazole 1% cream, Nutribridge Flora Women Probiotics",
        promo: "Counter PWP: gentle pH 3.8 feminine intimate wash with RM20+ purchase.",
        quiz: [
          {
            q: "Why does a course of broad-spectrum oral antibiotics often trigger vaginal yeast infection (thrush)?",
            options: ["Antibiotics eradicate beneficial protective Lactobacillus bacteria in the vagina, allowing opportunistic Candida yeast to overgrow", "Antibiotics plant yeast seeds in the body", "Antibiotics cause diabetes immediately", "It is purely coincidence"],
            answer: 0,
            rationale: "Normal vaginal lactobacilli maintain an acidic pH (3.8-4.5) that suppresses yeast; antibiotic depletion destroys this protective colonization barrier.",
            safety: "Recommend women's targeted probiotics during or after antibiotic courses."
          },
          {
            q: "Which vaginal discharge characteristic suggests Bacterial Vaginosis or Trichomoniasis rather than fungal thrush?",
            options: ["Thin, watery, grayish-green discharge with a strong offensive 'fishy' odor", "Thick white odorless curd-like cottage cheese discharge", "Completely clear watery discharge during ovulation", "No discharge at all"],
            answer: 0,
            rationale: "Yeast discharge is classically thick, white, and odorless; offensive fishy odor indicates anaerobic bacterial vaginosis requiring oral metronidazole from a doctor.",
            safety: "Screen discharge color, texture, and odor before dispensing antifungal pessaries."
          },
          {
            q: "How should a Clotrimazole 500mg vaginal pessary be correctly administered?",
            options: ["Insert deeply into the vagina at bedtime using the applicator while lying on the back, and avoid sexual intercourse during treatment", "Swallow with a glass of water", "Dissolve in hot water and drink", "Rub on the arms"],
            answer: 0,
            rationale: "Pessaries are for intravaginal insertion only; nighttime administration allows the tablet to dissolve and coat the vaginal mucosa without leakage.",
            safety: "Do not use tampons or spermicides while using vaginal pessaries."
          }
        ]
      },
      {
        id: "prenatal",
        name: "Prenatal Wellness & Folic Acid Triage",
        emergency: false,
        persona: {
          name: "Sarah (27)",
          age: 27,
          gender: "female",
          role: "Newly Pregnant",
          language: "en",
          visible: "VISIBLE: Sarah, a 27-year-old newly married executive, walks in smiling but nervous. She says she just did a home urine pregnancy test that showed two lines (5 weeks pregnant). She asks what essential vitamins she needs to protect her baby.",
          hidden: "You are Sarah, 27. First pregnancy, 5 weeks since last menstrual period. Mild morning nausea, no vomiting, no abdominal cramps, no vaginal spotting or bleeding. Wondering about folic acid dosage and prenatal vitamins. Not a PMG member."
        },
        summaryMd: "## 🌸 Early Prenatal Wellness\n- **Pattern:** First trimester organogenesis. Critical window for neural tube closure (first 28 days).\n- **🚩 Red Flags (Send to Doctor/Hospital immediately):** Any vaginal spotting or bleeding (miscarriage / ectopic risk), sharp unilateral pelvic pain, severe hyperemesis unable to keep fluids down.\n- **💊 House Brand & OTC:**\n  - **O (Essential):** Folic Acid 400mcg - 5mg daily (prevents spina bifida and neural tube defects).\n  - **S (Comprehensive):** **Nutribridge Prenatal Multivitamin with DHA** / **Vitamin B6 for mild nausea**.\n- **🛒 Counter Close:** Free PMG membership, PMG Mom & Baby Club registration, PWP stretch mark cream.",
        skus: "Nutribridge Prenatal DHA Multivitamin, Folic Acid 5mg, Vitamin B6 10mg",
        promo: "PMG Mom & Baby Club: FREE registration perks. PWP stretch mark body cream.",
        quiz: [
          {
            q: "Why is Folic Acid supplementation mandatory before conception and during the first 12 weeks of pregnancy?",
            options: ["It prevents major fetal Neural Tube Defects (NTDs) such as Spina Bifida and anencephaly", "It guarantees the baby has green eyes", "It prevents tooth cavities in the mother", "It stops the baby from crying after birth"],
            answer: 0,
            rationale: "The neural tube closes by day 28 post-conception; adequate folate levels are proven to reduce neural tube defect risk by over 70%.",
            safety: "Standard dose is 400mcg - 5mg daily depending on maternal risk factors."
          },
          {
            q: "Which symptom in a newly pregnant woman (5-8 weeks) is an URGENT RED FLAG requiring immediate medical emergency assessment?",
            options: ["Any vaginal bleeding / spotting or sharp one-sided pelvic pain (ruling out ectopic pregnancy / threatened miscarriage)", "Mild morning food aversion", "Feeling sleepy in the afternoon", "Needing to urinate slightly more often"],
            answer: 0,
            rationale: "Vaginal bleeding with unilateral pelvic pain is a classic triad for ectopic pregnancy, which can rupture and cause life-threatening internal hemorrhage.",
            safety: "Always ask: Any bleeding or spotting? If yes, send to doctor immediately!"
          },
          {
            q: "Why is maternal DHA (Docosahexaenoic Acid) included in quality prenatal formulations like Nutribridge Prenatal?",
            options: ["DHA is an essential omega-3 fatty acid critical for optimal fetal brain development and retinal visual acuity", "It turns hair blonde", "It acts as a sleeping pill", "It replaces the need for protein"],
            answer: 0,
            rationale: "DHA accumulates rapidly in the fetal brain and retina during gestation, supporting neurodevelopmental milestones.",
            safety: "Ensure prenatal fish oil is molecularly distilled and free of heavy metals (mercury)."
          }
        ]
      }
    ]
  },

  // ─── 7. MEN'S HEALTH ───────────────────────────────────────────────────────
  men: {
    id: "men",
    name: "Men's Health",
    icon: "🧔",
    conditions: [
      {
        id: "bph",
        name: "BPH & Frequent Night Urination (Kencing Malam)",
        emergency: false,
        persona: {
          name: "Pak Cik Hassan (66)",
          age: 66,
          gender: "male",
          role: "Retired Civil Servant",
          language: "ms",
          visible: "VISIBLE: Pak Cik Hassan, 66, mendekati kaunter farmasi dan bertanya secara peribadi tentang masalah buang air kecil. Dia mengeluh terpaksa bangun kencing 3-4 kali setiap malam, aliran kencing perlahan dan menitis di hujung.",
          hidden: "Anda Pak Cik Hassan, 66 tahun. Malam bangun kencing 3-4 kali (nocturia) mengganggu tidur. Aliran kencing lemah, teragak-agak (hesitancy), menitis di hujung seluar. Tiada darah dalam kencing, tiada sakit pedih, tiada demam, tiada halangan kencing sepenuhnya (masih boleh kencing). Bukan ahli PMG."
        },
        summaryMd: "## 🧔 Benign Prostatic Hyperplasia (BPH)\n- **Pattern:** Lower urinary tract symptoms (LUTS): poor stream, hesitancy, terminal dribbling, nocturia in men age >50.\n- **🚩 Red Flags (Send to Doctor immediately):** Acute urinary retention (complete inability to pass urine with painful distended bladder), visible blood in urine (hematuria), bone/back pain.\n- **💊 House Brand & OTC:**\n  - **O (Habits):** Limit fluids/caffeine before bedtime, double-voiding technique.\n  - **S (Prostate Support):** **Nutribridge Saw Palmetto Extract + Pumpkin Seed Oil** / **Zinc 15mg**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th free glucose test.",
        skus: "Nutribridge Saw Palmetto Extract, Nutribridge Zinc 15mg, Pumpkin Seed Oil",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP men's vitality supplement.",
        quiz: [
          {
            q: "Antara tanda berikut, yang manakah merupakan KECEMASAN (Red Flag) berkaitan prostat yang memerlukan rujukan hospital serta-merta?",
            options: ["Kegagalan membuang air kecil sepenuhnya (Acute Urinary Retention) dengan pundi kencing bengkak dan sakit teramat sangat", "Bangun kencing sekali pada waktu malam", "Aliran kencing sedikit perlahan", "Kencing warna jernih"],
            answer: 0,
            rationale: "Retensi urin akut menyebabkan pundi kencing meregang lampau dan boleh merosakkan buah pinggang, memerlukan pemasangan kateter kecemasan.",
            safety: "Tanya pesakit: Adakah air kencing boleh keluar langsung atau tersumbat habis?"
          },
          {
            q: "Bagaimanakah ekstrak herba Saw Palmetto (Serenoa repens) membantu melegakan gejala BPH peringkat awal?",
            options: ["Ia menghalang enzim 5-alpha reductase daripada menukarkan testosteron kepada DHT yang merangsang pembengkakan sel prostat", "Ia mengecutkan pundi kencing sepenuhnya", "Ia menggantikan pembedahan kanser", "Ia membius seluruh zakar"],
            answer: 0,
            rationale: "Saw palmetto mengandungi asid lemak fitosteril yang menghalang penukaran DHT dan mempunyai sifat anti-radang prostat.",
            safety: "Rujuk doktor untuk pemeriksaan PSA dan rektal digital (DRE) bagi menolak kanser prostat."
          },
          {
            q: "Nasihat amalan gaya hidup apakah yang paling berkesan untuk mengurangkan kekerapan bangun kencing waktu malam (nocturia)?",
            options: ["Hadkan pengambilan air dan minuman berkafein 2 jam sebelum tidur, dan lakukan kaedah 'double voiding' (kencing kali kedua sebelum masuk tidur)", "Minum 1 liter kopi sebelum tidur", "Makan buah tembikai sebelum tidur", "Menahan kencing selama 24 jam"],
            answer: 0,
            rationale: "Mengurangkan beban cecair nokturnal mengurangkan peregangan pundi kencing semasa fasa tidur nyenyak.",
            safety: "Bimbingan gaya hidup melengkapkan suplemen House Brand."
          }
        ]
      },
      {
        id: "stamina",
        name: "Physical Fatigue & Male Stamina Support",
        emergency: false,
        persona: {
          name: "Encik Razak (44)",
          age: 44,
          gender: "male",
          role: "Logistics Supervisor",
          language: "ms",
          visible: "VISIBLE: Encik Razak, 44, mengadu berasa sangat cepat letih, tidak bertenaga dan lesu sepanjang hari walaupun sudah tidur. Dia bertanya tentang suplemen herba tradisional Tongkat Ali atau vitamin tenaga untuk lelaki.",
          hidden: "Anda Encik Razak, 44 tahun, bekerja syif panjang di gudang logistik. Selalu rasa letih, hilang tumpuan, kurang stamina. Tiada sesak nafas, tiada penurunan berat badan drastik, tiada sakit dada. Mengambil makanan tidak seimbang dan kurang senaman. Bukan ahli PMG."
        },
        summaryMd: "## 🧔 Male Vitality & Fatigue Care\n- **Pattern:** Chronic daytime lethargy, physical fatigue, low vitality linked to stress, sleep disruption, nutrient depletion.\n- **🚩 Red Flags:** Unexplained weight loss, exertional chest pain/shortness of breath (cardiac ischemia), severe pallor (anemia), persistent fever.\n- **💊 House Brand & OTC:**\n  - **O (Habits):** Sleep hygiene, hydration, balanced protein intake.\n  - **S (Vitality Support):** **JH Nutrition Tongkat Ali Plus Extract** / **Nutribridge CoQ10 150mg** / **Livemore B-Complex**.\n- **🛒 Counter Close:** Free PMG membership, PWP effervescent energy booster.",
        skus: "JH Nutrition Tongkat Ali Plus, Nutribridge CoQ10 150mg, Livemore B-Complex",
        promo: "Counter PWP: effervescent energy multivitamin with RM20+ purchase.",
        quiz: [
          {
            q: "Sebelum mencadangkan sebarang suplemen tenaga kepada lelaki pertengahan umur yang mengadu keletihan berterusan, tanda amaran (Red Flag) manakah yang mesti disaring?",
            options: ["Sesak nafas atau ketat dada bila melakukan aktiviti fizikal, penurunan berat badan mendadak, atau pucat anemia", "Rasa mengantuk selepas makan nasi kandar", "Malas bangun pagi pada hari cuti", "Rasa lapar bila tidak makan"],
            answer: 0,
            rationale: "Keletihan kronik boleh menjadi gejala awal penyakit jantung iskemia, kegagalan buah pinggang, diabetes, atau keganasan.",
            safety: "Saring tanda bahaya kardiovaskular sebelum menganggap keletihan hanyalah stres kerja biasa."
          },
          {
            q: "Bagaimanakah ekstrak piawai herba Tongkat Ali (Eurycoma longifolia) menyokong kecergasan fizikal lelaki?",
            options: ["Merangsang pembebasan testosteron bebas aktif dan meningkatkan tenaga mitokondria serta daya tahan fizikal", "Ia adalah steroid sintetik yang merosakkan hati", "Ia menggantikan tidur sepenuhnya", "Ia ubat penenang"],
            answer: 0,
            rationale: "Sebatian eurycomanone membantu mengurangkan SHBG (Sex Hormone Binding Globulin), membebaskan testosteron bioavailable dan meningkatkan sintesis ATP.",
            safety: "Pilih ekstrak yang berdaftar dengan KKM (MAL number) dan bebas daripada racun berjadual."
          },
          {
            q: "Mengapakah vitamin B-Kompleks (B1, B2, B3, B5, B6, B12) dianggap 'enjin metabolisme tenaga' dalam tubuh badan?",
            options: ["Vitamin B bertindak sebagai ko-faktor penting dalam kitaran Krebs untuk menukarkan karbohidrat, lemak dan protein kepada tenaga ATP", "Vitamin B mengandungi kafein tinggi", "Vitamin B menaikkan berat badan serta-merta", "Vitamin B adalah gula ringkas"],
            answer: 0,
            rationale: "Tanpa vitamin B mencukupi, sel tidak dapat mengekstrak tenaga daripada makronutrien makanan secara cekap.",
            safety: "Gandingkan Tongkat Ali dengan B-Kompleks dan CoQ10 untuk pemulihan tenaga menyeluruh."
          }
        ]
      }
    ]
  },

  // ─── 8. PEDIATRICS & SENIORS ───────────────────────────────────────────────
  pediatrics: {
    id: "pediatrics",
    name: "Pediatrics & Seniors",
    icon: "🍼",
    conditions: [
      {
        id: "infant_colic",
        name: "Infant Colic & Tummy Wind (Kembung Bayi)",
        emergency: false,
        persona: {
          name: "Puan Siti & Bayi (2 bulan)",
          age: 30,
          gender: "female",
          role: "Exhausted Mother",
          language: "ms",
          visible: "VISIBLE: Puan Siti masuk mendukung bayinya yang berusia 2 bulan. Dia kelihatan sangat letih dan tidak cukup tidur. Bayinya menangis melengkung badan dan menarik kaki ke perut setiap petang selama berjam-jam.",
          hidden: "Anda Puan Siti, 30 tahun. Bayi sulung 2 bulan menangis berterusan dari pukul 6 petang hingga 9 malam (Rule of Threes colic). Perut bayi rasa tegang dan berangin. Bayi menyusu baik, tiada demam, tiada muntah hijau, najis berwarna kuning biasa. Ibu sangat risau dan letih. Bukan ahli PMG."
        },
        summaryMd: "## 🍼 Infant Colic & Wind Triage\n- **Pattern:** 'Rule of Threes': Crying >3 hours/day, >3 days/week, for >3 weeks in healthy infant. Pulling legs up, clenched fists.\n- **🚩 Red Flags (Emergency):** High fever, projectile/bilious (green) vomiting, blood in stool (red currant jelly - intussusception), bulging fontanelle, lethargy.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Simethicone infant drops, gentle tummy massage ('I Love You' technique), bicycling legs, burping techniques.\n  - **S (Gentle Soothing):** **Omma Baby Tummy Soothing Balm** / **Probiotic Infant Drops**.\n- **🛒 Counter Close:** Free PMG membership, PMG Mom & Baby Club perks, PWP baby wipes.",
        skus: "Omma Baby Tummy Balm, Simethicone Infant Drops, Probiotic Baby Drops",
        promo: "PMG Mom & Baby Club: FREE registration perks. PWP extra-soft baby wipes.",
        quiz: [
          {
            q: "Antara tanda berikut, yang manakah merupakan TANDA BAHAYA (Red Flag) pada bayi menangis yang mesti dikejarkan ke hospital segera?",
            options: ["Muntah memancut berwarna hijau hempedu (bilious) atau najis berdarah seperti jeli merah (intussusception)", "Bayi kentut selepas diurut perut", "Bayi sendawa selepas menyusu", "Bayi tidur lena selepas didodoikan"],
            answer: 0,
            rationale: "Muntah hijau dan najis berdarah menandakan penyumbatan usus akut (cth: intussusception/volvulus) yang merupakan kecemasan pembedahan pediatrik.",
            safety: "Saring tanda muntah hijau dan najis berdarah pada setiap kes bayi menangis berterusan."
          },
          {
            q: "Bagaimanakah titisan Simethicone bayi bertindak untuk melegakan kembung perut bayi?",
            options: ["Memecahkan ketegangan permukaan buih-buih gas dalam usus bayi supaya bergabung menjadi gelembung besar yang mudah disendawakan atau dikentutkan keluar", "Ia membius otak bayi untuk tidur", "Ia mengandungi alkohol", "Ia menghentikan denyutan jantung bayi"],
            answer: 0,
            rationale: "Simethicone bertindak secara fizikal di dalam lumen usus dan tidak diserap ke dalam darah bayi, menjadikannya sangat selamat.",
            safety: "Boleh dititiskan terus ke dalam mulut bayi atau dicampurkan ke dalam susu formula."
          },
          {
            q: "Teknik urutan fizikal manakah yang disyorkan kepada ibu untuk membantu bayi mengeluarkan angin perut?",
            options: ["Urutan perut arah bulatan jam (clockwise) lembut dan senaman mengayuh basikal pada kedua-dua kaki bayi", "Menggoncang badan bayi dengan kuat", "Menekan perut bayi dengan objek berat", "Membiarkan bayi menangis 10 jam"],
            answer: 0,
            rationale: "Urutan mengikut arah peristalsis kolon (arah jam) dan kayuhan kaki melegakan ketegangan otot abdomen dan membantu pengeluaran flatus.",
            safety: "Pemberian sokongan emosi kepada ibu yang keletihan adalah kunci perkhidmatan farmasi prihatin."
          }
        ]
      },
      {
        id: "teething",
        name: "Pediatric Teething & Low-Grade Fever",
        emergency: false,
        persona: {
          name: "Sarah & Baby Adam (8 bulan)",
          age: 26,
          gender: "female",
          role: "Mother",
          language: "en",
          visible: "VISIBLE: Sarah enters holding 8-month-old Baby Adam, who is drooling excessively and chewing furiously on his silicone teether. She says he has been fussy, irritable, and has a mild low-grade fever of 37.8°C.",
          hidden: "You are Sarah, 26. Baby Adam (8 months) is cutting his first two lower incisor teeth. Gums are swollen and red. Drooling heavily, mild temperature 37.8°C. Baby is drinking milk well, alert and interactive, no stiff neck, no rash, no difficulty breathing. You want safe soothing advice. Not a PMG member."
        },
        summaryMd: "## 🍼 Pediatric Teething Triage\n- **Pattern:** Gum swelling, drooling, chewing objects, mild irritability, low-grade temperature (<38.0°C).\n- **🚩 Red Flags (Send to Doctor immediately):** High fever >38.5°C (or any fever >38.0°C in infant <3 months), non-blanching petechial rash, febrile convulsion, lethargy/unresponsive, poor feeding (<50%).\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Paracetamol pediatric syrup (strictly dosed by body weight: 15mg/kg every 4-6h), chilled teething rings (not frozen!).\n  - **S (Gentle Comfort):** **Omma Cooling Gel Patch** / **Medicplast Gentle Patch**.\n- **🛒 Counter Close:** Free PMG membership, PMG Mom & Baby Club, PWP digital thermometer.",
        skus: "Paracetamol infant syrup 120mg/5ml, Omma Cooling Patch, Digital Thermometer",
        promo: "PMG Mom & Baby Club perks. PWP digital thermometer or baby wipes.",
        quiz: [
          {
            q: "How must Paracetamol syrup be accurately dosed for infants and children?",
            options: ["Strictly based on the child's body weight (15 mg/kg per dose, maximum 4 times in 24 hours)", "Always give 1 full tablespoon regardless of age or weight", "Guess based on height", "Give double dose whenever the baby cries"],
            answer: 0,
            rationale: "Pediatric dosing by weight (15mg/kg/dose) prevents toxic accidental overdosing or ineffective sub-therapeutic dosing.",
            safety: "Always verify the baby's actual weight in kilograms before dispensing pediatric syrups."
          },
          {
            q: "Why are oral teething gels containing Benzocaine or Choline Salicylate discouraged in young infants?",
            options: ["Benzocaine can cause life-threatening Methemoglobinemia, and salicylates carry the risk of Reye's Syndrome in viral illness", "They make teeth grow too quickly", "They make the mouth turn blue", "They are too sweet"],
            answer: 0,
            rationale: "FDA and MOH warn against benzocaine in infants due to methemoglobinemia (inability of red blood cells to release oxygen).",
            safety: "Use non-pharmacological chilled teething rings and weight-dosed paracetamol instead."
          },
          {
            q: "Which sign in a feverish infant is a CRITICAL EMERGENCY indicating possible meningitis or sepsis?",
            options: ["Non-blanching purple-red petechial rash (does not fade under a clear glass tumbler test), stiff neck, or extreme lethargy", "Mild drooling while chewing fingers", "Temperature of 37.6°C", "Wanting to be held by mother"],
            answer: 0,
            rationale: "Non-blanching petechiae indicates meningococcal septicemia, an acute medical emergency requiring immediate hospitalization.",
            safety: "Teach mothers the 'Tumbler / Glass test' for feverish rashes."
          }
        ]
      },
      {
        id: "picky_eater",
        name: "Picky Eater & Child Growth Support",
        emergency: false,
        persona: {
          name: "Madam Florence & Lucas (5)",
          age: 37,
          gender: "female",
          role: "Concerned Mother",
          language: "en",
          visible: "VISIBLE: Madam Florence enters with her 5-year-old son Lucas. She looks worried and frustrated, complaining that Lucas refuses to eat vegetables, meat, or proper meals, surviving only on snacks and milk. She asks for a supplement to boost his appetite and growth.",
          hidden: "You are Madam Florence, 37. 5-year-old son Lucas is very picky with food. Mealtime is a battleground. Lucas is active and energetic, but his weight percentile is hovering on the lower 15th percentile. No diarrhea, no chronic illness, milestone development is normal. Not a PMG member."
        },
        summaryMd: "## 🍼 Picky Eater & Pediatric Growth\n- **Pattern:** Food neophobia, selective eating, low micronutrient variety in preschool/school-age children.\n- **🚩 Red Flags:** Failure to thrive (dropping across 2 major growth percentiles), chronic diarrhea/malabsorption, developmental regression.\n- **💊 House Brand & OTC:**\n  - **O (Habits):** Positive mealtime routines, small frequent portions, avoid force-feeding, involve child in cooking.\n  - **S (Appetite & Growth):** **Nutribridge Kids Multivitamin + Lysine Syrup** / **DHA Gummies** / **Calcium + Vitamin D**.\n- **🛒 Counter Close:** Free PMG membership, PMG Mom & Baby Club, PWP chewable Vitamin C.",
        skus: "Nutribridge Kids Multivitamin + Lysine Syrup, Nutribridge DHA Gummies, Chewable Vitamin C",
        promo: "PMG Mom & Baby Club perks. PWP kids chewable Vitamin C with RM20+ purchase.",
        quiz: [
          {
            q: "How does the essential amino acid Lysine in pediatric formulations help picky eaters?",
            options: ["Lysine stimulates natural healthy appetite and is a building block for collagen and protein synthesis essential for childhood growth", "It forces the child to sleep 15 hours", "It turns vegetables into chocolate taste", "It replaces the need for water"],
            answer: 0,
            rationale: "L-lysine is an essential amino acid that cannot be synthesized by the body; supplementation helps stimulate appetite and tissue growth in selective eaters.",
            safety: "Combine with balanced vitamins A, B, C, D, E for comprehensive micronutrient coverage."
          },
          {
            q: "What behavioral advice should the pharmacist share with parents struggling with mealtime tantrums?",
            options: ["Establish consistent meal routines, do not bribe with junk food snacks, offer small colorful portions, and avoid force-feeding battles", "Force the child to sit at the table until midnight", "Give chocolate every time the child refuses rice", "Never let the child see food"],
            answer: 0,
            rationale: "Pressuring or force-feeding increases food anxiety and aversion. Repeated neutral exposure (up to 10-15 times) is needed for children to accept new foods.",
            safety: "Support parental wellness and reduce mealtime stress."
          },
          {
            q: "When should a child with poor appetite be referred to a pediatrician for medical evaluation?",
            options: ["If the child shows crossing down across 2 major growth percentiles (failure to thrive), severe lethargy, or chronic diarrhea", "If the child dislikes broccoli but eats other foods", "If the child gains weight normally", "If the child plays actively"],
            answer: 0,
            rationale: "Faltering growth on standard WHO growth charts requires medical investigation to exclude celiac disease, cystic fibrosis, or organic pathology.",
            safety: "Track growth percentiles objectively."
          }
        ]
      },
      {
        id: "sarcopenia",
        name: "Elderly Sarcopenia & Muscle Preservation",
        emergency: false,
        persona: {
          name: "Mrs. Wong & Uncle Wong (72)",
          age: 72,
          gender: "male",
          role: "Elderly Couple",
          language: "zh",
          visible: "VISIBLE: Mrs. Wong陪着72岁的黄伯伯走进来。伯伯两只手臂和大腿明显消瘦，走路缓慢，从椅子上站起来需要双手用力撑好几次。老伴担心他日益消瘦、容易跌倒，询问有什么高蛋白补品能够长肉长力气。",
          hidden: "你是黄伯伯，72岁。过去一年体重无缘无故掉了4公斤，两腿无力，握力变差，走路容易拖地。牙齿不好，平时只吃清汤面和白粥，极少吃肉蛋鱼。没有发烧，没有咳血，没有黑便。患有轻度高血压。还不是PMG会员。"
        },
        summaryMd: "## 🍼 Sarcopenia & Senior Nutrition\n- **Pattern:** Age-related progressive loss of skeletal muscle mass and strength. Risk of falls, fractures, physical disability.\n- **🚩 Red Flags:** Rapid unintentional weight loss (>5% in 6 months - rule out malignancy), recurrent unexplained falls, dysphagia (swallowing difficulty).\n- **💊 House Brand & OTC:**\n  - **O (Habits):** Resistance exercise (chair stands, gentle resistance bands), adequate dietary protein (1.2 - 1.5g/kg/day).\n  - **S (Nutritional Support):** **Nutribridge Complete Nutrition Adult Formula / Whey Protein** + **Calcium D3 K2**.\n- **🛒 Counter Close:** Free PMG membership, Senior Care Plus (55+), 28th free glucose test.",
        skus: "Nutribridge Complete Adult Nutrition Formula, Whey Protein, Calcium D3 K2",
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. PWP protein shaker or milk.",
        quiz: [
          {
            q: "肌少症（Sarcopenia）在长者中带来的最危险健康风险是什么？",
            options: ["下肢肌肉萎缩导致身体平衡能力下降，跌倒与髋部骨折（Hip fracture）风险大幅飙升", "只是衣服穿起来变宽松而已", "头发会长得更快", "牙齿变多"],
            answer: 0,
            rationale: "老年人跌倒后髋部骨折的一年内死亡率高达20-30%，肌肉是长者的‘防摔铠甲’。",
            safety: "筛查跌倒风险，保障居家防滑安全。"
          },
          {
            q: "为了刺激长者肌肉蛋白质合成（Muscle Protein Synthesis），每日推荐的蛋白质摄入量是多少？",
            options: ["每公斤体重约 1.2 至 1.5 克高生物价值优质蛋白质（分摊在三餐中）", "每天只喝一碗白粥，不吃肉", "每公斤体重0.1克", "完全不摄入蛋白质"],
            answer: 0,
            rationale: "长者存在‘合成代谢抵抗’（Anabolic resistance），需要比年轻人更高比例的蛋白质（每餐25-30g）才能有效刺激肌肉再生。",
            safety: "有严重肾功能衰竭（CKD stage 4-5）未透析长者除外，需在医生指导下微调。"
          },
          {
            q: "哪项运动对防治长者肌少症最具有循证医学效果？",
            options: ["渐进式阻力运动（如坐站练习、轻量弹力带）搭配日常散步", "长期卧床睡觉不出门", "完全静止不动", "极限跳伞"],
            answer: 0,
            rationale: "营养补充必须配合阻力训练才能将摄入的氨基酸转化为骨骼肌纤维力量。",
            safety: "量力而行，循序渐进，安全第一。"
          }
        ]
      }
    ]
  },

  // ─── 9. EYES & ORAL CARE ───────────────────────────────────────────────────
  eyes_oral: {
    id: "eyes_oral",
    name: "Eyes & Oral Care",
    icon: "👁️",
    conditions: [
      {
        id: "dry_eyes",
        name: "Dry Eyes & Digital Eye Strain (Asthenopia)",
        emergency: false,
        persona: {
          name: "Michelle (29)",
          age: 29,
          gender: "female",
          role: "Graphic Designer",
          language: "en",
          visible: "VISIBLE: Michelle, a 29-year-old graphic designer, rubs her eyes with a tissue. Her eyes are slightly bloodshot. She complains of a gritty, burning, sandy sensation in both eyes after working on her dual-monitor setup all day.",
          hidden: "You are Michelle, 29. Staring at computer screens for 9 hours daily. Burning gritty feeling, transient blurred vision relieved by blinking, sensitivity to bright screen light. No eye discharge/pus, no severe deep eye pain, no sudden vision loss, no rainbow halos around lights. Not a PMG member."
        },
        summaryMd: "## 👁️ Dry Eyes & Digital Eye Strain\n- **Pattern:** Tear film instability, evaporative dry eye (reduced blink rate in front of screens), asthenopia.\n- **🚩 Red Flags (Send to Eye Doctor immediately):** Severe ocular pain, sudden loss or reduction of visual acuity, rainbow halos around lights (acute glaucoma), foreign body sensation that will not flush out, copious purulent discharge.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Preservative-free lubricating eye drops (Artificial tears / Sodium Hyaluronate), 20-20-20 rule.\n  - **S (Retinal & Tear Support):** **Nutribridge Bilberry + Lutein Zeaxanthin** / **Omega-3 Fish Oil**.\n- **🛒 Counter Close:** Free PMG membership, PWP soothing eye steam mask.",
        skus: "Nutribridge Bilberry + Lutein, Systane / Rohto Artificial Tears, Omega-3 Fish Oil",
        promo: "Counter PWP: soothing chamomile eye steam mask with RM20+ purchase.",
        quiz: [
          {
            q: "What is the evidence-based '20-20-20 rule' recommended for digital screen workers to alleviate eye strain?",
            options: ["Every 20 minutes, look at an object at least 20 feet (6 meters) away for at least 20 seconds", "Work 20 hours a day without blinking", "Eat 20 carrots every 20 minutes", "Close both eyes for 20 hours"],
            answer: 0,
            rationale: "Looking 20 feet into the distance completely relaxes the ciliary accommodation muscles in the eye and restores normal blinking rates.",
            safety: "Simple non-drug habits prevent progressive accommodative spasm."
          },
          {
            q: "Which symptom in an eye complaint is a MEDICAL EMERGENCY requiring immediate ophthalmologist evaluation?",
            options: ["Severe deep eye pain, sudden drop in vision, or seeing rainbow halos around light sources (Acute Angle-Closure Glaucoma)", "Mild dry gritty sensation at 5 PM", "Eyes feeling tired after reading", "Occasional watery eyes in the wind"],
            answer: 0,
            rationale: "Acute glaucoma causes intraocular pressure to spike, which can permanently destroy the optic nerve within hours if untreated.",
            safety: "Always verify: Is there sudden vision loss or severe deep pain? Red flag!"
          },
          {
            q: "How do Lutein and Zeaxanthin in Nutribridge Bilberry Eye Care support visual health?",
            options: ["They deposit as macular pigments in the retina, filtering high-energy damaging blue light and acting as powerful antioxidants", "They dye the eyeball yellow", "They replace the need for spectacles", "They are antibiotics"],
            answer: 0,
            rationale: "Lutein and zeaxanthin are the only carotenoids concentrated in the human macula, proven to protect against blue light photo-oxidation.",
            safety: "Pair lubricating drops (O) with antioxidant macular nutrients (S)."
          }
        ]
      },
      {
        id: "mouth_ulcer",
        name: "Mouth Ulcers (Mata Ikan / Aphthous Stomatitis)",
        emergency: false,
        persona: {
          name: "Brandon (31)",
          age: 31,
          gender: "male",
          role: "Restaurant Manager",
          language: "zh",
          visible: "VISIBLE: Brandon, 31岁餐馆经理，说话时半边嘴唇不敢大幅度张开。他指着下唇内侧一个白色凹陷的小圆溃疡（俗称‘马眼 / Mata Ikan’），说一碰到咸辣热汤就痛得跳起来，想找见效快的药膏或喷剂。",
          hidden: "你是Brandon，31岁。两天前吃炸鸡不小心咬到下唇内侧，随后发展成一个约4毫米的圆形浅溃疡，边缘泛红发痛。没有发烧，口周没有成群小水疱，身体没有皮疹。以前偶尔长过口疮，一般一周自愈。还不是PMG会员。"
        },
        summaryMd: "## 👁️ Mouth Ulcers (Aphthous Stomatitis)\n- **Pattern:** Painful, round/oval shallow ulcers with white/yellowish base and red erythematous border. Often triggered by stress, trauma, spicy foods, B-vitamin deficiency.\n- **🚩 Red Flags (Send to Doctor/Dentist):** Ulcer lasting >2-3 weeks without healing (risk of oral squamous cell carcinoma), multiple large (>1cm) ulcerating lesions with high fever, painless hard ulcer, ulcer accompanied by genital sores.\n- **💊 House Brand & OTC:**\n  - **O (Relief):** Topical Triamcinolone acetonide in oral paste (protective adhesive barrier) / Choline Salicylate oral gel / Antiseptic Chlorhexidine mouthwash.\n  - **S (Mucosal Healing):** **Biowell Propolis Oral Soothing Gel** / **Nutribridge Vitamin B12 + C**.\n- **🛒 Counter Close:** Free PMG membership, PWP antiseptic mouthwash.",
        skus: "Biowell Propolis Oral Gel, Triamcinolone Oral Paste, Chlorhexidine 0.12% Mouthwash",
        promo: "Counter PWP: antiseptic mouthwash or soft toothbrush with RM20+ purchase.",
        quiz: [
          {
            q: "口腔溃疡如果出现以下哪项特征，必须高度警惕并强烈建议看牙医或专科排查口腔恶性肿瘤（Oral Cancer）？",
            options: ["同一位置的溃疡持续超过2至3星期没有自愈，或者边缘坚硬隆起无痛感", "吃火锅咬破嘴唇后痛了2天", "涂抹口疮膏后疼痛减轻", "直径2毫米的小溃疡"],
            answer: 0,
            rationale: "良性口疮通常在7-14天内自行愈合；任何不愈合超过3星期的溃疡都是口腔癌的经典警讯。",
            safety: "绝不可放任慢性不愈合溃疡反复只买药膏，必须强调就医活检排查。"
          },
          {
            q: "涂抹曲安奈德口腔软膏（Triamcinolone Acetonide Oral Paste）时的正确使用方法是什么？",
            options: ["先用棉签吸干溃疡表面的唾液，挤出少量药膏轻轻按压点涂在溃疡上形成保护膜，切忌来回用力摩擦涂抹", "大力把药膏揉进伤口里", "吞服一整管药膏", "用热水冲掉"],
            answer: 0,
            rationale: "口膏采用碳酸纤维素基质，遇水变黏形成物理保护膜。摩擦涂抹会破坏保护膜颗粒，使其脱落失效。",
            safety: "建议在睡前或餐后使用，让药膏留在创面发挥消炎消肿作用。"
          },
          {
            q: "对于经常反复长‘马眼/口疮’的顾客，PMG House Brand哪种营养组合最有助于促进口腔黏膜上皮再生？",
            options: ["Biowell蜂胶口腔凝胶 + Nutribridge维生素B群与维生素C", "大剂量泻药", "纯冰块", "高浓度辣椒精"],
            answer: 0,
            rationale: "维生素B12与叶酸是黏膜上皮细胞更新的核心辅酶，蜂胶天然抑菌并加速创面肉芽形成。",
            safety: "充足睡眠与水分摄入对预防口疮复发同样关键。"
          }
        ]
      }
    ]
  },

  // ─── 10. EMERGENCY RED FLAGS (DOCTOR / HOSPITAL REFERRAL ONLY) ─────────────
  emergency: {
    id: "emergency",
    name: "Emergency Red Flags",
    icon: "🚨",
    conditions: [
      {
        id: "dengue",
        name: "Suspected Dengue Fever (Bengkak & Ruam)",
        emergency: true, // 🚨 CRITICAL EMERGENCY
        persona: {
          name: "Encik Farid (38)",
          age: 38,
          gender: "male",
          role: "Site Contractor",
          language: "ms",
          visible: "VISIBLE: 🚨 KECEMASAN RED FLAG: Encik Farid, 38, berjalan terhuyung-hayang dipapah isterinya. Mukanya merah menyala dan matanya layu. Dia mengalami demam panas mendadak (39.8°C) selama 4 hari, sakit kepala teruk di belakang biji mata, sakit sendi dan tulang hingga tidak boleh berdiri, dan pagi ini gusinya berdarah semasa menggosok gigi!",
          hidden: "【🚨 AMARAN KECEMASAN MERAH】Anda Encik Farid, 38 tahun. Demam panas mengejut 4 hari (39.8°C). Sakit kepala di belakang bebola mata (retro-orbital pain), seluruh tulang dan otot rasa patah-patah (breakbone fever). Muncul bintik-bintik merah kecil di lengan (petechiae). Pagi ini gusi berdarah. Isteri sangat cemas ingin membeli ubat tahan sakit kuat atau antibiotik di kaunter farmasi."
        },
        summaryMd: "## 🚨 EMERGENCY: Suspected Dengue Fever\n- **Pattern:** Sudden high fever (39-40°C), retro-orbital headache, intense arthralgia/myalgia ('breakbone'), petechial skin rash, bleeding manifestations.\n- **🚩 CRITICAL RED FLAGS (Warning Signs):** Severe abdominal pain, persistent vomiting, mucosal bleeding (gums, nose), lethargy/restlessness, clinical fluid accumulation.\n- **⚠️ CRITICAL PROTOCOL:**\n  - **MANDATORY:** **IMMEDIATE REFERRAL TO CLINIC/HOSPITAL ER** for Full Blood Count (platelet count) and Dengue NS1/IgM test.\n  - **STRICTLY CONTRAINDICATED:** **DO NOT SELL NSAIDs** (Aspirin, Ibuprofen, Mefenamic Acid, Voltaren) due to high risk of fatal GI bleeding!\n  - **STRICTLY FORBIDDEN:** Do NOT attempt to treat at home with supplements or delay medical triage!",
        skus: "NONE - EMERGENCY DOCTOR REFERRAL! (Paracetamol only if doctor confirmed while awaiting transport)",
        promo: "EMERGENCY SAFETY FIRST - Immediate hospital referral!",
        quiz: [
          {
            q: "Seorang pesakit demam panas 4 hari dengan bintik merah petechiae dan gusi berdarah datang ke farmasi. Apakah tindakan WAJIB yang mesti diambil oleh staf PMG?",
            options: ["Mengenalpasti tanda amaran DENGGI dan merujuk pesakit ke Hospital / Klinik Kesihatan dengan KADAR SEGERA untuk ujian darah (FBC) dan pemantauan platelet", "Menjual ubat tahan sakit ibuprofen dos tinggi", "Menjual suplemen herba dan suruh balik tidur di rumah", "Menyuruh pesakit datang minggu depan"],
            answer: 0,
            rationale: "Denggi berdarah boleh menyebabkan kebocoran plasma, thrombocytopenia teruk, renjatan (Dengue Shock Syndrome) dan kematian dalam beberapa jam jika tidak dipantau di hospital.",
            safety: "Kecemasan perubatan! Jangan sesekali berlengah di kaunter farmasi!"
          },
          {
            q: "Mengapakah ubat tahan sakit golongan NSAID (seperti Ibuprofen, Mefenamic Acid, Aspirin, Diclofenac) DIHARAMKAN SAMA SEKALI untuk disyaki denggi?",
            options: ["NSAID merencat fungsi platelet darah dan menghakis lapisan perut, menyebabkan pendarahan dalaman gastrousus yang membawa maut", "NSAID membuatkan demam bertukar warna", "NSAID terlalu sedap", "Tiada apa-apa bahaya"],
            answer: 0,
            rationale: "NSAID merosakkan hemostasis; dalam pesakit denggi dengan paras platelet rendah, NSAID boleh mencetuskan pendarahan perut yang membunuh pesakit.",
            safety: "HANYA Paracetamol dalam dos selamat dibenarkan untuk mengawal demam sementara menunggu penilaian doktor."
          },
          {
            q: "Dalam penilaian SOP PMG Frontline Rubric, apakah markah yang akan diberikan jika pembantu farmasi cuba menjual ubat kaunter/suplemen bagi kes denggi berdarah tanpa merujuk ke hospital?",
            options: ["GAGAL MUTLAK (0 Markah) dengan amaran keselamatan kritikal kerana membahayakan nyawa pesakit", "100 Markah Emas", "70 Markah Perak", "Diberi komisen jualan"],
            answer: 0,
            rationale: "Keselamatan pesakit adalah prinsip tertinggi PMG. Sebarang cubaan menjual ubat kaunter pada kes kecemasan maut adalah pelanggaran etika dan keselamatan yang serius.",
            safety: "Keselamatan pesakit sentiasa diutamakan mendahului jualan."
          }
        ]
      },
      {
        id: "mi_chest_pain",
        name: "Acute Chest Pain (Suspected Myocardial Infarction)",
        emergency: true, // 🚨 CRITICAL EMERGENCY
        persona: {
          name: "Uncle George (62)",
          age: 62,
          gender: "male",
          role: "Retiree",
          language: "en",
          visible: "VISIBLE: 🚨 CRITICAL EMERGENCY RED FLAG: Uncle George, 62, enters clutching the center of his chest with a clenched fist. His face is pale and ashen, covered in cold beads of sweat. He is breathing shallowly, describing a terrifying heavy crushing tightness 'like an elephant sitting on my chest', radiating up into his left jaw and down his left arm!",
          hidden: "【🚨 LIFE-THREATENING EMERGENCY】You are Uncle George, 62. Heavy retrosternal squeezing chest pressure started 25 minutes ago while climbing stairs. Radiates to left jaw and inner left arm. Cold diaphoresis, dyspnea, nausea. You feel a sense of impending doom. You have hypertension and high cholesterol. You think it might just be bad gastric gas and want an antacid quickly."
        },
        summaryMd: "## 🚨 EMERGENCY: Acute Chest Pain (Suspected Heart Attack / MI)\n- **Pattern:** Acute coronary syndrome. Retrosternal crushing chest heaviness, radiation to left arm/jaw/neck, diaphoresis, dyspnea, nausea, sense of impending doom.\n- **🚩 CRITICAL ACTION:**\n  - **CALL 999 AMBULANCE IMMEDIATELY!**\n  - Keep patient seated upright, calm, and resting completely. Do NOT let them walk or exert!\n  - Inquire if they have prescribed sublingual Glyceryl Trinitrate (GTN).\n  - **STRICTLY FORBIDDEN:** Do NOT sell antacids, paracetamol, or joint supplements! Do NOT dismiss as 'gastric angin'! Every minute delayed = dead heart muscle!",
        skus: "NONE - CALL 999 / EMERGENCY ROOM TRANSPORT DIRECTLY!",
        promo: "EMERGENCY SAFETY FIRST - Call 999 Immediately!",
        quiz: [
          {
            q: "A 62-year-old gentleman walks in pale, sweating cold sweat, clenching his chest with pain radiating to his left jaw and arm. What is your MANDATORY FIRST ACTION?",
            options: ["CALL 999 AMBULANCE IMMEDIATELY, keep the patient seated and calm, and prepare for urgent hospital emergency room transfer", "Sell him an antacid liquid thinking it is gastric gas", "Tell him to go home and lie down", "Sell him a joint supplement"],
            answer: 0,
            rationale: "Time is muscle (Door-to-balloon time). Immediate emergency activation and PCI transfer within the golden 90-120 minutes saves the patient's life.",
            safety: "Never dismiss acute crushing retrosternal chest pain as gastric gas!"
          },
          {
            q: "Why is it dangerous to let a suspected myocardial infarction patient walk around or drive themselves to the clinic?",
            options: ["Physical exertion dramatically increases cardiac oxygen demand and can trigger fatal ventricular fibrillation or sudden cardiac arrest", "It wastes shoe leather", "It makes them hungry", "It causes high blood sugar"],
            answer: 0,
            rationale: "Complete physical rest minimizes ischemic myocardium stress. Keep the patient comfortably seated while ambulance paramedics arrive.",
            safety: "Keep patient seated, loosen tight collar, and stay by their side."
          },
          {
            q: "If an assistant attempts to sell OTC heartburn syrup or painkillers to this customer instead of calling 999, what is the score outcome in the PMG DPOS evaluation?",
            options: ["STRICT ZERO / FAIL (0 pts) with urgent safety re-training for catastrophic failure to triage a life-threatening medical emergency", "Awarded bonus marks for making a sale", "Awarded 85 points Gold badge", "Awarded a certificate"],
            answer: 0,
            rationale: "Failing to recognize an acute heart attack and attempting a counter sale is a catastrophic safety violation.",
            safety: "PMG culture: Ethical professional triage overrides retail sales."
          }
        ]
      },
      {
        id: "stroke_fast",
        name: "Acute Stroke (F.A.S.T. Protocol Triage)",
        emergency: true, // 🚨 CRITICAL EMERGENCY
        persona: {
          name: "Madam Shirley & Daughter (68)",
          age: 68,
          gender: "female",
          role: "Senior with Daughter",
          language: "zh",
          visible: "VISIBLE: 🚨 极度危急红旗（F.A.S.T. 中风急症）：一位女儿极其慌张地扶着68岁的母亲走进来。母亲右侧嘴角明显歪斜流口水，右手无力下垂无法抬起，说话含糊不清、口齿吞吐像大舌头，发病刚刚发生约40分钟！",
          hidden: "【🚨 极危急脑中风发作】你是女儿，母亲40分钟前在吃早餐时突然右侧脸部下垂歪斜（Facial droop），右手臂完全无力拿不住杯子（Arm weakness），说话含糊不清听不懂（Slurred speech）。母亲有高血压。女儿慌乱以为是‘中风受风寒面瘫’，想买活血药丸或补品。"
        },
        summaryMd: "## 🚨 EMERGENCY: Acute Stroke (F.A.S.T. Protocol)\n- **F.A.S.T. Triaging:**\n  - **F (Face):** Facial drooping, uneven smile.\n  - **A (Arms):** Arm weakness or drift, cannot raise both arms evenly.\n  - **S (Speech):** Slurred, garbled speech, difficulty repeating a simple sentence.\n  - **T (Time):** **TIME TO CALL 999 / RUSH TO STROKE-READY HOSPITAL!** (Golden thrombolysis window <4.5 hours!).\n- **⚠️ CRITICAL RULES:**\n  - **ZERO ORAL INTAKE:** Do NOT give any food, water, or oral medicines (high aspiration / choking risk due to impaired swallowing reflex!).\n  - **DO NOT GIVE ASPIRIN:** Ischemic vs Hemorrhagic stroke cannot be determined without urgent CT brain scan! Aspirin can be fatal in brain hemorrhage.\n  - **STRICTLY FORBIDDEN:** Do NOT delay for counter herbal sales!",
        skus: "NONE - ZERO ORAL INTAKE! CALL 999 / RUSH TO STROKE EMERGENCY HOSPITAL!",
        promo: "EMERGENCY SAFETY FIRST - Immediate Stroke Center Transport!",
        quiz: [
          {
            q: "面对一名嘴角歪斜（Face）、单侧手臂无力（Arm）、言语含糊不清（Speech）的长者，药剂店第一时间的黄金急救法则是：",
            options: ["立刻启动F.A.S.T.脑中风紧急程序：记下发病时间，立即安排救护车或火速送往具备CT脑部扫描与溶栓能力的综合医院（4.5小时溶栓黄金窗口）", "给长者喂水和止痛药", "向女儿推销通血管中药丸", "让长者坐在药房等候2小时"],
            answer: 0,
            rationale: "缺血性中风每延误1分钟就会死亡190万个脑神经元。在4.5小时内抵达医院接受静脉溶栓（tPA）或机械取栓能逆转瘫痪。",
            safety: "时间就是大脑（Time is Brain）！发病时间（Time of onset）至关重要！"
          },
          {
            q: "为什么在未经医院CT脑部扫描前，绝对禁止给疑似中风患者喂服阿司匹林（Aspirin）、温水或任何食物？",
            options: ["吞咽神经受损极易导致食物窒息吸入性肺炎；且若是脑出血（出血液型中风），阿司匹林会引起大出血致命", "因为药房没有水", "长者不喜欢阿司匹林味道", "阿司匹林太便宜"],
            answer: 0,
            rationale: "中风包括缺血性和出血性两种，未经CT确诊前严禁抗血小板药；吞咽反射受损时进食会导致窒息死亡。",
            safety: "中风急救铁律：禁食禁饮，保持呼吸道通畅！"
          },
          {
            q: "在PMG DPOS考核中，若员工对疑似中风患者尝试兜售保健品或让其回家休息，考核结果如何认定？",
            options: ["直接判定严重违规不及格（0分），因其行为对患者造成不可逆的脑残疾或死亡风险", "认定为金牌销售", "给予80分鼓励", "给予产品提成"],
            answer: 0,
            rationale: "保护患者生命安全是医疗从业人员的底线天职。对脑中风患者进行商业推销而延误抢救，是严重背离专业伦理的行为。",
            safety: "始终恪守专业医德，急症面前生命至上。"
          }
        ]
      }
    ]
  }
};
