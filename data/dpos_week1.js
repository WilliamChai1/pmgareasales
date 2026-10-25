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

  quizZh: [
  {
    "q": "陈叔叔（67岁）表示上下楼梯和久坐后右膝盖酸痛，早晨关节僵硬约10分钟。无红肿、无发热、无外伤史。这最符合哪种临床表现？",
    "options": [
      "化脓性（感染性）关节炎",
      "退化性骨关节炎 (Osteoarthritis) —— 机械性磨损退化",
      "急性痛风发作",
      "类风湿性关节炎"
    ],
    "answer": 1,
    "rationale": "活动后加剧、早晨僵硬时间少于30分钟且无红肿发烫或发烧，是典型的退化性骨关节炎 (OA) 特征。感染性关节炎和急性痛风通常发红发烫剧痛，而类风湿关节炎通常伴有多关节僵硬超过1小时。",
    "safety": "即使是典型的退化性关节炎表现，在推荐任何产品前仍必须先排除红旗警示（发热、红肿、外伤）。"
  },
  {
    "q": "Mary 阿姨想买一款护膝关节保健品。在问诊评估（Diagnosis）中，她提到膝盖昨晚突然变得又红又烫、严重肿胀，并伴有发热感。你应当如何处理？",
    "options": [
      "推销 Flexson 和发热贴来舒缓发炎",
      "仅售卖扑热息痛 (Paracetamol) 并让她下周复诊",
      "建议她今天立即就医或前往诊所，切勿热敷",
      "推荐 Flexmore 以加速软骨修复"
    ],
    "answer": 2,
    "rationale": "关节红肿发烫并伴有发热感属于紧急红旗指征（疑似化脓性感染或急性痛风），必须当天就医评估。热敷会加剧炎性水肿，而保健品更不能延误就医。安全第一，销售第二。",
    "safety": "红 + 肿 + 烫 + 发热 = 当天转介就医。切勿热敷，切勿先推销保健品。"
  },
  {
    "q": "林叔叔正在长期服用抗凝血药华法林（Warfarin），膝盖退化性关节酸痛。他要求购买布洛芬（Ibuprofen），因为朋友推荐。最专业的应对方式是什么？",
    "options": [
      "售卖布洛芬并叮嘱他饭后服用",
      "向他解释 NSAIDs 止痛药合用华法林会显著增加出血风险，推荐扑热息痛（例如 Terrafast，在每日安全剂量内），并请药剂师介入审核",
      "让他服用布洛芬期间先自行暂停华法林",
      "建议将姜黄提取物保健品剂量加倍服用替代"
    ],
    "answer": 1,
    "rationale": "NSAIDs（如布洛芬）与华法林合用会显著增加胃肠道严重出血风险。扑热息痛是更安全的一线止痛选择（24小时内不超过 4g）。切勿建议顾客擅自停用处方抗凝药，姜黄或乳香成分也需药剂师审核。",
    "safety": "推荐任何止痛产品或草本提取物之前，必须先核查抗凝血药用药史！"
  },
  {
    "q": "对于健康成年人，24小时内所有来源合并计算的扑热息痛（Paracetamol）最高安全上限剂量是多少？",
    "options": [
      "2 g（4 × 500 mg 药片）",
      "3 g（6 × 500 mg 药片）",
      "6 g（12 × 500 mg 药片）",
      "4 g（8 × 500 mg 药片）"
    ],
    "answer": 3,
    "rationale": "健康成年人24小时内最高极限剂量为 4g（8片 500mg 药片），每次服药需间隔4到6小时。许多复方感冒药也含有扑热息痛，因此必须询问顾客是否还在服用其他药物。",
    "safety": "必须核查其他含扑热息痛的药物。对肝功能不全或长期饮酒者应采取更严格的剂量限制。"
  },
  {
    "q": "在 PMG DPOS 门市问诊标准流程中，PMG 自家品牌关节保健品（如 Flexson）属于哪一个核心步骤？",
    "options": [
      "D – 问诊与红旗排查 (Diagnosis triage)",
      "P – 处方调配与药剂师用药指导 (Prescribe / Pharmacist line)",
      "O – 柜台急症快速缓解 (OTC immediate relief)",
      "S – 根源调理与长效滋养保健品 (Supplement for root cause)"
    ],
    "answer": 3,
    "rationale": "D 是问诊排查红旗。P 是药剂师专属处方线药物。O 是即时舒缓急症（如 Terrafast 或发热贴）。S 是自家品牌长效滋养保健品，深层支持数周改善根源。",
    "safety": "S（保健品推荐）必须排在最后，只有在 D（排查与安全核对）确认安全后才能进入。"
  },
  {
    "q": "关于 JH Nutrition Flexson 的成分配方与产品定位，以下哪项描述完全正确？",
    "options": [
      "姜黄提取物 250mg + 乳香提取物 200mg，传统用于缓解关节酸痛",
      "葡萄籽提取物 300mg 用于促进下肢血液循环",
      "扑热息痛 500mg 用于退烧与快速镇痛",
      "维生素 D3 1000 IU 用于强化骨密度"
    ],
    "answer": 0,
    "rationale": "Flexson 结合了姜黄（Curcuma longa 250mg）和乳香（Boswellia serrata 200mg）植物提取物，协同抗炎舒缓关节。务必严格根据包装标注介绍，切勿夸大宣称能够治愈关节炎或让软骨再生。",
    "safety": "推荐姜黄或乳香成分前，必须核实抗凝药、孕期以及胆结石/胆道疾病史。"
  },
  {
    "q": "一位已知对鱼类和鸡蛋严重过敏的顾客前来选购 Livemore Flexmore 冲剂。你应当如何处理？",
    "options": [
      "照常售卖，因为食物过敏只对吞服药丸有影响",
      "建议她每次只喝半包以减轻反应",
      "切勿推荐，因其含有深海鱼胶原蛋白肽和蛋壳膜原料。请药剂师审核后提供安全替代方案（如素食适用的 Flexson）",
      "建议每天喝两包以建立免疫耐受"
    ],
    "answer": 2,
    "rationale": "Flexmore 含有水解鱼胶原蛋白肽和鸡蛋壳膜，因此绝对不适用于对鱼类或鸡蛋过敏的人群。推荐前务必核对成分表与顾客过敏史。",
    "safety": "过敏排查是 Diagnosis 的核心必查项：鱼类、鸡蛋、甲壳贝类、坚果。"
  },
  {
    "q": "对于膝盖退化性关节炎（OA），以下哪项非药物生活建议具有最权威的循证医学支持？",
    "options": [
      "绝对卧床休息，直到膝盖完全不痛为止",
      "超重者循序渐进减轻体重，配合低冲击温和运动及大腿股四头肌肌力训练",
      "每天做深度深蹲以“润滑”磨损的膝关节",
      "从此停止步行，日常全面改乘电梯或扶梯"
    ],
    "answer": 1,
    "rationale": "减轻体重与规律的有氧低冲击运动及大腿肌力强化能显著减轻膝盖承重并改善功能。每减重 1kg 可减少膝盖约 4kg 压力，而长期卧床反而会导致肌肉萎缩和关节僵硬。",
    "safety": "若关节疼痛剧烈、夜间痛醒或行走功能持续恶化，应转介医生或物理治疗师。"
  },
  {
    "q": "Rose 阿姨每天早晨双膝慢性僵硬酸痛。无红肿、无外伤、局部皮肤完好无破损。以下哪种局部 OTC 缓解方案最合适？",
    "options": [
      "在确认皮肤完整无知觉麻木后，推荐 Medicplast 热疗发热贴以舒缓僵硬",
      "只推荐冰敷袋，因为发热疗法永远是危险的",
      "在刚扭伤、严重肿胀的脚踝上贴发热贴",
      "在破损发炎的皮肤表面用力涂抹强力止痛药膏"
    ],
    "answer": 0,
    "rationale": "温和热敷适合慢性关节僵硬酸痛。急性扭伤或48小时内的新红肿应使用冰敷。发热贴切忌用于破损、皮疹或无感觉麻木部位（如糖尿病神经病变）。",
    "safety": "切勿贴在破损或麻木皮肤上。若皮肤产生灼痛或发红发痒应立即停用。"
  },
  {
    "q": "陈叔叔（68岁）带着 Flexson 和 Terrafast 来到收银台结账。哪种是 PMG 标准的柜台关怀结账方式？",
    "options": [
      "快速收钱打单，因为顾客已经决定买单",
      "只询问是否需要塑料袋",
      "询问是否已是 PMG 会员（免费入会），介绍 55 岁以上专属 Senior Care Plus 福利（每月 28 号免费血糖筛查），并在结算前介绍当前 PWP / GWP 优惠",
      "不过问会员，直接给予更大幅度折扣"
    ],
    "answer": 2,
    "rationale": "收银台是专业服务转化为顾客忠诚度的核心场景。免费入会、55岁以上长辈 Senior Care Plus 专属关怀（每月28日免费测血糖）以及当前满额换购 PWP/GWP 能为顾客创造实际价值并带来复购。",
    "safety": "用简练亲切的一句话介绍益处，尊重顾客意愿，切勿强推。"
  }
],

  quizMs: [
  {
    "q": "Uncle Tan (67 tahun) memberitahu lutut kanannya sakit semasa naik tangga dan selepas duduk lama. Kekakuan pagi berlangsung kira-kira 10 minit. Tiada bengkak, tiada demam, tiada kecederaan. Apakah corak klinikal yang paling berkemungkinan?",
    "options": [
      "Sendi septik (dijangkiti kuman)",
      "Osteoartritis – corak haus dan lusuh mekanikal",
      "Serangan gout akut",
      "Artritis reumatoid"
    ],
    "answer": 1,
    "rationale": "Sakit yang bertambah teruk dengan penggunaan, kekakuan pagi kurang dari 30 minit dan tiada rasa panas, kemerahan atau demam adalah ciri klasik OA. Jangkitan kuman dan gout sangat panas, merah dan sakit, manakala artritis reumatoid biasanya bermaksud kekakuan pagi lebih 1 jam pada banyak sendi kecil.",
    "safety": "Walaupun dengan cerita OA klasik, tetap tanya tentang tanda amaran (panas, merah, demam, kecederaan) sebelum mengesyorkan apa-apa."
  },
  {
    "q": "Aunty Mary ingin membeli suplemen sendi untuk lututnya. Semasa Diagnosis, beliau memberitahu lututnya menjadi merah, panas dan sangat bengkak malam tadi serta rasa demam. Apakah tindakan anda?",
    "options": [
      "Jual Flexson dan pelekat haba untuk tenangkannya",
      "Jual parasetamol sahaja dan minta dia datang minggu depan",
      "Nasihatkan beliau berjumpa doktor atau ke klinik hari ini dan jangan tuam haba",
      "Cadangkan Flexmore untuk pembaikan rawan yang lebih pantas"
    ],
    "answer": 2,
    "rationale": "Sendi yang panas, merah dan bengkak berserta demam adalah tanda amaran kecemasan (kemungkinan artritis septik atau gout) yang memerlukan penilaian perubatan pada hari yang sama. Haba boleh memburukkan lagi keradangan dan suplemen hanya melengahkan rawatan. Keselamatan dahulu, jualan kedua.",
    "safety": "Panas + merah + bengkak + demam = rujuk pada hari yang sama. Jangan tuam haba dan jangan jual suplemen dahulu."
  },
  {
    "q": "Uncle Lim mengambil warfarin dan mengalami sakit OA lutut. Dia meminta ibuprofen kerana rakannya menggunakannya. Apakah respons terbaik?",
    "options": [
      "Jual ibuprofen dan beritahu dia ambil selepas makan",
      "Terangkan bahawa NSAID meningkatkan risiko pendarahan bersama warfarin, cadangkan parasetamol (contohnya Terrafast, dalam had maksimum harian) dan rujuk ahli farmasi",
      "Beritahu dia berhenti ambil warfarin semasa mengambil ibuprofen",
      "Cadangkan dos berganda suplemen kunyit sebagai ganti"
    ],
    "answer": 1,
    "rationale": "NSAID bersama warfarin meningkatkan risiko pendarahan gastrousus dengan ketara. Parasetamol adalah pilihan pertama yang lebih selamat selagi berada dalam had 4 g dalam 24 jam. Jangan sesekali menasihati pemberhentian ubat cair darah preskripsi, dan produk kunyit atau boswellia juga memerlukan semakan ahli farmasi.",
    "safety": "Periksa ubat cair darah sebelum sebarang produk penahan sakit atau herba."
  },
  {
    "q": "Berapakah dos maksimum parasetamol untuk orang dewasa sihat dalam tempoh 24 jam, mengira SEMUA produk gabungan?",
    "options": [
      "2 g (4 × 500 mg tablet)",
      "3 g (6 × 500 mg tablet)",
      "6 g (12 × 500 mg tablet)",
      "4 g (8 × 500 mg tablet)"
    ],
    "answer": 3,
    "rationale": "Maksimum ialah 4 g dalam 24 jam (8 × 500 mg tablet) dengan dos dijarakkan 4 hingga 6 jam. Banyak produk selsema dan batuk juga mengandungi parasetamol, jadi sentiasa tanya apa lagi yang diambil pelanggan.",
    "safety": "Tanya tentang produk parasetamol lain. Gunakan had lebih rendah untuk penyakit hati atau pengambilan alkohol berlebihan."
  },
  {
    "q": "Dalam protokol DPOS, langkah manakah tempat terletaknya suplemen Jenama Sendiri PMG seperti Flexson?",
    "options": [
      "D – Diagnosis dan saringan tanda amaran",
      "P – Preskripsi / barisan ahli farmasi",
      "O – Pelepasan segera OTC",
      "S – Suplemen untuk punca utama (sokongan jangka panjang)"
    ],
    "answer": 3,
    "rationale": "D adalah bertanya dan menyaring tanda amaran. P adalah ubat barisan ahli farmasi. O adalah kelegaan gejala cepat seperti Terrafast atau Pelekat Haba. S adalah suplemen House Brand yang menyokong masalah asas selama berminggu-minggu.",
    "safety": "S berada di tempat terakhir, hanya selepas D (saringan) dan semakan keselamatan selesai."
  },
  {
    "q": "Penerangan manakah mengenai JH Nutrition Flexson yang betul?",
    "options": [
      "Ekstrak Curcuma longa 250 mg + ekstrak Boswellia serrata 200 mg, digunakan secara tradisional untuk melegakan sakit sendi",
      "Ekstrak biji anggur 300 mg untuk peredaran darah",
      "Parasetamol 500 mg untuk demam dan kesakitan",
      "Vitamin D3 1000 IU untuk kesihatan tulang"
    ],
    "answer": 0,
    "rationale": "Flexson menggabungkan ekstrak kunyit (Curcuma longa 250mg) dan boswellia (Boswellia serrata 200mg) untuk keselesaan sendi. Nyatakan hanya apa yang tertera pada kotak dan jangan janji menyembuhkan artritis atau menumbuhkan semula rawan.",
    "safety": "Semak ubat cair darah, kehamilan dan masalah hempedu sebelum mengesyorkan kunyit atau boswellia."
  },
  {
    "q": "Seorang pelanggan yang diketahui mempunyai alahan ikan dan telur meminta paket Livemore Flexmore. Apakah tindakan anda?",
    "options": [
      "Jual sahaja, kerana alahan hanya penting untuk tablet",
      "Beritahu dia ambil separuh paket",
      "Jangan syorkan, kerana ia mengandungi peptida kolagen ikan dan membran kulit telur. Tawarkan alternatif selamat selepas disemak ahli farmasi (contohnya Flexson)",
      "Cadangkan dua paket sehari untuk membina toleransi"
    ],
    "answer": 2,
    "rationale": "Flexmore mengandungi kolagen ikan terhidrolisis dan membran kulit telur ayam, jadi ia langsung tidak sesuai untuk individu yang alah kepada ikan atau telur. Sentiasa baca senarai ramuan berbanding alahan pelanggan.",
    "safety": "Pemeriksaan alahan adalah sebahagian daripada Diagnosis: ikan, telur, makanan laut, kekacang."
  },
  {
    "q": "Nasihat bukan ubat manakah yang mempunyai bukti paling kukuh untuk osteoartritis lutut?",
    "options": [
      "Rehat di atas katil sepenuhnya sehingga sakit hilang",
      "Pengurangan berat badan secara beransur-ansur (jika berlebihan berat badan) serta senaman berimpak rendah dan penguatan otot paha",
      "Mencangkung dalam (deep squats) setiap hari untuk 'melincirkan' lutut",
      "Berhenti berjalan dan gunakan lif atau eskalator mulai sekarang"
    ],
    "answer": 1,
    "rationale": "Penurunan berat badan dan senaman penguatan paha atau berimpak rendah yang teratur mengurangkan kesakitan dan meningkatkan fungsi. Setiap 1 kg berat badan dikurangkan mengurangkan kira-kira 4 kg beban pada lutut, manakala rehat berpanjangan melemahkan otot dan menegangkan sendi.",
    "safety": "Rujuk kepada doktor atau ahli fisioterapi jika kesakitan teruk, membangunkan pesakit pada waktu malam atau fungsi semakin merosot."
  },
  {
    "q": "Aunty Rose mengalami lutut kaku dan sakit kronik setiap pagi. Tiada bengkak, tiada kecederaan dan kulitnya tidak luka. Pilihan OTC tempatan manakah yang paling sesuai?",
    "options": [
      "Pelekat Haba Medicplast (Heat Therapy Patch) untuk melegakan kekakuan, selepas memeriksa kulit dan deria rasa",
      "Pek sejuk sahaja, kerana haba sentiasa berbahaya",
      "Pelekat haba pada buku lali yang baru terseliuh dan bengkak",
      "Salap kuat disapu pada kulit yang luka"
    ],
    "answer": 0,
    "rationale": "Haba lembut sesuai untuk kekakuan dan sakit kronik. Gunakan sejuk untuk bengkak atau kecederaan baru dalam 48 jam pertama. Elakkan pelekat pada kulit yang luka, radang atau kebas (contohnya neuropati diabetik).",
    "safety": "Jangan sekali-kali pada kulit yang luka, merengsa atau kebas. Hentikan jika kulit terbakar atau menjadi merah."
  },
  {
    "q": "Uncle Tan (68 tahun) berada di kaunter dengan Flexson dan Terrafast. Apakah cara terbaik untuk menutup jualan?",
    "options": [
      "Kira bayaran dengan pantas, kerana dia sudah membuat keputusan",
      "Tanya sahaja sama ada dia mahukan beg plastik",
      "Tanya adakah dia ahli (keahlian PERCUMA), perkenalkan Senior Care Plus dengan ujian glukosa darah PERCUMA pada 28hb, dan sebutkan tawaran GWP/PWP semasa",
      "Tawarkan diskaun lebih besar tanpa bertanya tentang keahlian"
    ],
    "answer": 2,
    "rationale": "Kaunter adalah tempat perkhidmatan bertukar menjadi kesetiaan. Keahlian percuma, Senior Care Plus untuk pelanggan berumur 55+ (ujian glukosa darah PERCUMA pada 28hb setiap bulan) dan tawaran GWP/PWP semasa menambah nilai sebenar untuk pelanggan dan membawa mereka kembali.",
    "safety": "Tawarkan, jangan paksa. Terangkan manfaatnya dalam satu ayat dan biarkan pelanggan membuat keputusan."
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
