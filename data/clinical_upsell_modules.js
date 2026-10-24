// PMG Clinical Upsell Modules & Master Indication Mapping
// Grounded in official PMG Clinical Upsell Knowledge Base (Google Sheet 1PUPjLzf9uy-FLDf0J0MgMF5nMavwvfQ_kz-hB4_hk_8)

window.PMG_CLINICAL_UPSELL_MODULES = [
  {
    "id": 1,
    "condition": "Cough & Cold Symptoms",
    "chineseTitle": "感冒与咳嗽症状",
    "assessmentQuestions": [
      "1. Are you suffering from a dry or wet cough?",
      "2. Do you have a runny nose or nasal congestion?",
      "3. How many days have symptoms lasted?"
    ],
    "standardOtc": "Biowell Bmusol Ambroxol 30mg (wet cough) OR Atrizine Tablet 10mg (runny nose) OR Medicplast Terracool Sheets (fever)",
    "hbProduct": "JH Nutrition Citazinc (Vit C + Zinc) OR Nutribridge Suppflora Capsule OR JH Nutrition P2 Powder",
    "script": "This relief will control your immediate symptoms, but adding JH Nutrition Citazinc and Suppflora provides clinical-grade immune and gut microbiome support to help your body flush the virus out faster and prevent recurrence.",
    "scriptZh": "这能快速缓解目前的流鼻涕与咳嗽，但搭配 JH Nutrition Citazinc (维他命C+锌) 和 Suppflora 益生菌能提供临床级免疫与肠道屏障支持，帮助身体更快清除病毒并防止反复发作。",
    "redFlags": "Fever >38.5°C for >3 days, chest tightness, severe breathlessness, or coughing up blood.",
    "keywords": [
      "cough",
      "cold",
      "flu",
      "fever",
      "runny nose",
      "throat",
      "phlegm",
      "感冒",
      "咳嗽",
      "发烧",
      "喉咙"
    ],
    "msTitle": "Gejala Batuk & Selesema",
    "scriptMs": "Ubat ini melegakan gejala serta-merta, tetapi penambahan JH Nutrition Citazinc dan Suppflora memberi sokongan imun dan mikrobiom usus gred klinikal untuk membasmi virus dengan lebih cepat dan mengelakkan berulang.",
    "redFlagsZh": "发烧 >38.5°C 超过 3 天、胸闷呼吸急促、或咳嗽带血。",
    "redFlagsMs": "Demam >38.5°C melebihi 3 hari, sesak dada, nafas tercungap-cungap, atau batuk berdarah."
  },
  {
    "id": 2,
    "condition": "Allergic Rhinitis",
    "chineseTitle": "过敏性鼻炎与鼻敏感",
    "assessmentQuestions": [
      "1. How many days have you been sneezing or having a runny nose?",
      "2. Is the mucus clear and watery, or thick/colored?",
      "3. Is there a fever?"
    ],
    "standardOtc": "Atrizine Tablet 10mg (Biowell)",
    "hbProduct": "JH Nutrition Flvright Vegecap (Elderberry + Immune bioflavonoids)",
    "script": "This antihistamine will stop the sneezing now, but adding this Elderberry supplement will kill the virus faster and strengthen your immunity so you don't get sick again.",
    "scriptZh": "抗过敏药能立刻止住打喷嚏与流清水鼻涕，但每天加服 JH Nutrition Flvright 黑接骨木莓胶囊能深层抗炎、调节过敏体质，从根本减少天气变化时的反复鼻敏感。",
    "redFlags": "Patient is experiencing shortness of breath or chest pain. High fever lasting more than 3 days, or thick green phlegm.",
    "keywords": [
      "rhinitis",
      "allergy",
      "sneezing",
      "sinus",
      "nose",
      "鼻炎",
      "鼻敏感",
      "打喷嚏",
      "鼻塞"
    ],
    "msTitle": "Rinitis Alahan & Resdung",
    "scriptMs": "Ubat antihistamin ini melegakan bersin sekarang, tetapi penambahan kapsul Elderberry ini mengurangkan radang dan menguatkan daya tahan badan agar alahan tidak mudah berulang.",
    "redFlagsZh": "呼吸急促或胸痛、高烧持续超过 3 天、或咳出浓稠黄绿痰。",
    "redFlagsMs": "Sesak nafas atau sakit dada, demam tinggi berlarutan melebihi 3 hari, atau kahak pekat kehijauan."
  },
  {
    "id": 3,
    "condition": "Diabetic Neuropathy & Nerve Pain",
    "chineseTitle": "糖尿病神经病变与手脚麻痹",
    "assessmentQuestions": [
      "1. Are you feeling numbness, burning, or pins/needles in feet/hands?",
      "2. Are you currently diabetic?",
      "3. Do you have any non-healing foot ulcers?"
    ],
    "standardOtc": "Biowell Terrafast 500mg Tablet OR topical analgesic rub",
    "hbProduct": "V-Infinity Neuright 927mg Tablet (Alpha-Lipoic Acid + B-Complex)",
    "script": "The painkiller gives you temporary relief, but this specific nerve vitamin contains Alpha-Lipoic Acid to actively repair your damaged nerves and protect your limbs from getting worse.",
    "scriptZh": "止痛药只能暂时麻痹疼痛，但这款专为糖尿病设计的 V-Infinity Neuright 含有高浓度硫辛酸 (ALA) 与活性神经维生素，能主动修复受损神经鞘膜，防止手脚麻木与刺痛恶化。",
    "redFlags": "Black or infected, non-healing ulcers on feet, or total loss of feeling in legs leading to falls.",
    "keywords": [
      "nerve",
      "diabetic",
      "numbness",
      "tingling",
      "sugar",
      "neuropathy",
      "神经",
      "手脚麻木",
      "刺痛",
      "糖尿"
    ],
    "msTitle": "Neuropati Diabetik & Sakit Saraf",
    "scriptMs": "Ubat penahan sakit memberi kelegaan sementara, tetapi vitamin saraf khusus V-Infinity Neuright ini mengandungi Asid Alfa-Lipoik untuk membaiki saraf yang rosak dan mengelakkan rasa kebas kaki tangan bertambah teruk.",
    "redFlagsZh": "足部出现发黑、溃烂不愈的伤口，或双腿失去知觉导致跌倒。",
    "redFlagsMs": "Luka kaki yang hitam, dijangkiti atau tidak sembuh, atau hilang deria rasa sepenuhnya pada kaki."
  },
  {
    "id": 4,
    "condition": "Osteoarthritis & Joint Pain",
    "chineseTitle": "退化性关节炎与膝盖酸痛",
    "assessmentQuestions": [
      "1. Is joint stiff when you wake up, or hurt more after moving?",
      "2. Which joints hurt and are they swollen?",
      "3. Are you on stomach meds or blood thinners?"
    ],
    "standardOtc": "Medicplast Thermo Patch OR OTC NSAID Gel",
    "hbProduct": "V-Infinity Neoflex Softgel (Green Lipped Mussel + Pomegranate)",
    "script": "The patch stops the pain from the outside, but taking Neoflex daily provides Green Lipped Mussel extract to lubricate your joints and rebuild your cartilage from the inside.",
    "scriptZh": "止痛贴膏从外部暂时止痛，但每天配合口服 V-Infinity Neoflex 绿唇贻贝软胶囊，能补充高活性关节滑液、修复受损软骨，真正消除关节摩擦僵硬与咔咔响。",
    "redFlags": "Joint is bright red, hot to the touch, and severely swollen, or fever is present alongside joint pain.",
    "keywords": [
      "joint",
      "knee",
      "osteoarthritis",
      "cartilage",
      "stiffness",
      "pain",
      "关节",
      "膝盖",
      "风湿",
      "软骨"
    ],
    "msTitle": "Osteoartritis & Sakit Sendi",
    "scriptMs": "Ubat tahan sakit merawat keradangan sementara, tetapi suplemen sendi Flexson/Flexmore ini membina semula rawan sendi dan cecair pelincir agar sendi lutut tidak haus.",
    "redFlagsZh": "关节红肿发热伴高烧、或无法负重行走。",
    "redFlagsMs": "Sendi merah, bengkak panas berserta demam, atau langsung tidak mampu berdiri."
  },
  {
    "id": 5,
    "condition": "Gastric Pain & Dyspepsia",
    "chineseTitle": "胃痛与消化不良 (Gastric & Dyspepsia)",
    "assessmentQuestions": [
      "1. Is it a sharp pain or burning chest/stomach sensation?",
      "2. Does eating make it better or worse?",
      "3. Have you passed black, sticky stools?"
    ],
    "standardOtc": "Biowell B'llox Suspension OR Biowell Famotac 40mg",
    "hbProduct": "JH Nutrition Progutor Sachet (mucosal coating & barrier repair)",
    "script": "The liquid antacid will put out the fire immediately, but taking Progutor will heal your stomach lining so the gastric pain doesn't return the next time you skip a meal.",
    "scriptZh": "液体制酸剂能马上中和胃酸熄灭灼热感，但搭配服用 JH Nutrition Progutor Sachet 能在胃壁形成生物保护膜并修复溃疡黏膜，避免下次少吃一餐又复发胃痛。",
    "redFlags": "Black, tarry stools, vomiting blood (coffee grounds), or chest pain radiating to back/left arm with sweating.",
    "keywords": [
      "gastric",
      "stomach",
      "gerd",
      "acid",
      "heartburn",
      "indigestion",
      "胃痛",
      "胃酸",
      "胃胀",
      "灼热"
    ],
    "msTitle": "Sakit Gastrik & Ketidakhadaman",
    "scriptMs": "Antasid meneutralkan asid perut sementara, tetapi penambahan probiotik pelindung perut ini membaiki lapisan mukosa dan mencegah serangan gastrik berulang.",
    "redFlagsZh": "吐血、黑便沥青便、或吞咽困难剧烈绞痛。",
    "redFlagsMs": "Muntah darah, najis hitam gelap, atau sakit perut yang teramat sangat berserta kesukaran menelan."
  },
  {
    "id": 6,
    "condition": "Acute Diarrhea & Dehydration",
    "chineseTitle": "急性腹泻与水分电解质流失",
    "assessmentQuestions": [
      "1. How many loose bowel movements have you had today?",
      "2. Is there blood or mucus in stool?",
      "3. Do you feel dizzy or very weak?"
    ],
    "standardOtc": "OTC Loperamide (if adult) or basic rehydration",
    "hbProduct": "V-Infinity ORT Lemon Sachet (Probiotics + Zinc + Electrolytes)",
    "script": "This medicine stops the diarrhea, but you must drink V-Infinity ORT because it replaces your lost energy and contains specific probiotics and Zinc to flush the bad stomach bug out of your system.",
    "scriptZh": "止泻药能止住急泻，但务必配合饮用 V-Infinity ORT 电解质包，它不仅能补足体力水分，还含有特定益生菌与锌元素，能加速排出肠道坏菌并修复受损肠黏膜。",
    "redFlags": "Patient is an infant, pregnant, or elderly and looking very weak. Red blood or black colour in stool.",
    "keywords": [
      "diarrhea",
      "stool",
      "dehydration",
      "electrolytes",
      "gut",
      "腹泻",
      "拉肚子",
      "脱水",
      "电解质"
    ],
    "msTitle": "Cirit-Birit Akut & Dehidrasi",
    "scriptMs": "Garam hidrasi menggantikan air, dan probiotik rintang antibiotik ini memulihkan flora usus agar cirit-birit berhenti lebih cepat.",
    "redFlagsZh": "大便带血、剧烈脱水、高烧或腹泻超过 48 小时。",
    "redFlagsMs": "Najis berdarah, dehidrasi teruk, demam panas atau cirit-birit melebihi 48 jam."
  },
  {
    "id": 7,
    "condition": "Insomnia & Sleep Disturbances",
    "chineseTitle": "失眠与睡眠障碍",
    "assessmentQuestions": [
      "1. Trouble falling asleep, or waking up frequently?",
      "2. Mind racing due to stress/anxiety?",
      "3. On prescription sleeping pills/psych meds?"
    ],
    "standardOtc": "OTC Sedating Antihistamine (Short-term only)",
    "hbProduct": "JH Nutrition Sleepright Capsule (Valerian + Passionflower)",
    "script": "The pharmacy sleep aid is okay for tonight, but for a long-term fix, JH Nutrition Sleepright uses natural Valerian Root to calm your nervous system so you wake up feeling refreshed, not groggy.",
    "scriptZh": "一般助眠药虽能让人快速入睡但容易产生依赖和白天昏沉，JH Nutrition Sleepright 采用天然颉草根与西番莲萃取，能温和放松神经中枢，让你睡得深沉、次日精神清爽且无依赖性。",
    "redFlags": "Severe anxiety, depression, suicidal ideation, or already taking prescribed sedatives (e.g., Alprazolam, Zolpidem).",
    "keywords": [
      "insomnia",
      "sleep",
      "stress",
      "anxiety",
      "valerian",
      "失眠",
      "睡不着",
      "多梦",
      "焦虑"
    ],
    "msTitle": "Insomnia & Gangguan Tidur",
    "scriptMs": "Daripada bergantung pada ubat tidur sintetik, formula herba semula jadi JH Nutrition Sleepright ini menenangkan sistem saraf dan membantu kitaran tidur nyenyak tanpa rasa pening keesokan hari.",
    "redFlagsZh": "伴随严重抑郁、幻觉、或因窒息惊醒（疑似睡眠呼吸暂停）。",
    "redFlagsMs": "Disertai kemurungan teruk, halusinasi, atau kerap tercekik nafas semasa tidur."
  },
  {
    "id": 8,
    "condition": "Eczema & Dry Skin",
    "chineseTitle": "湿疹与皮肤干燥屏障受损",
    "assessmentQuestions": [
      "1. Is the itch keeping you awake?",
      "2. Is skin cracked, bleeding, or oozing?",
      "3. Are you using normal commercial soap?"
    ],
    "standardOtc": "OTC 1% Hydrocortisone Cream (for active flares)",
    "hbProduct": "VK Dermsolve Moisturizing Lotion OR AI Cream",
    "script": "The steroid cream will stop the red itch today, but you must apply VK Dermsolve Lotion every day afterward to rebuild your skin barrier so the eczema doesn't come back.",
    "scriptZh": "类固醇药膏能快速压制急性红肿发痒，但停药后务必每天涂抹 VK Dermsolve 医美保湿乳液，它能重建角质皮脂膜，阻止外界过敏原侵入，从根本杜绝湿疹复发。",
    "redFlags": "Skin lesion is oozing yellow pus or has honey-colored crusts (infection), or rash is spreading rapidly.",
    "keywords": [
      "eczema",
      "skin",
      "itch",
      "dry",
      "dermatitis",
      "lotion",
      "湿疹",
      "皮肤痒",
      "干燥",
      "脱皮",
      "乳液"
    ],
    "msTitle": "Ekzema & Kulit Kering Sensitif",
    "scriptMs": "Krim steroid menenangkan kegatalan radang sementara, tetapi sapuan pelembap berlipas ceramide ini membina semula pelindung kulit untuk mengelakkan gatal berulang.",
    "redFlagsZh": "皮肤渗出黄色脓液、蜂窝织炎红肿发烫扩散。",
    "redFlagsMs": "Kulit bernanah kuning, bengkak panas yang merebak pantas (selulitis)."
  },
  {
    "id": 9,
    "condition": "High Cholesterol",
    "chineseTitle": "高胆固醇与血脂健康",
    "assessmentQuestions": [
      "1. Do you know your current reading?",
      "2. Already on a prescribed statin?",
      "3. Experiencing chest tightness or muscle pain?"
    ],
    "standardOtc": "Lifestyle & Diet Modification (Refer for Statins)",
    "hbProduct": "Nutribridge Lipicholin Vegecap (Red Yeast Rice + Black Garlic)",
    "script": "To help bring your numbers down naturally before your next blood test, Nutribridge Lipicholin uses Red Yeast Rice and Black Garlic to actively dissolve the bad fats blocking your blood vessels.",
    "scriptZh": "在下一次验血前帮助指标平稳达标，Nutribridge Lipicholin 采用天然红曲与发酵黑大蒜萃取，能主动清除附着在血管壁上的坏胆固醇 (LDL)，保护心脑血管通畅。",
    "redFlags": "Chest tightness, jaw pain, shortness of breath, or severe muscle weakness on high-dose statins.",
    "keywords": [
      "cholesterol",
      "lipid",
      "statin",
      "ldl",
      "heart",
      "blood vessel",
      "胆固醇",
      "血脂",
      "血管"
    ],
    "msTitle": "Kolesterol Tinggi & Kesihatan Lipid",
    "scriptMs": "Selain diet, penambahan Fitosterol dan CoQ10 membantu menyekat penyerapan kolesterol dalam usus dan menyokong tenaga jantung.",
    "redFlagsZh": "突发心前区压迫感、胸骨后剧烈胸痛放射至左臂（疑似心梗）。",
    "redFlagsMs": "Sakit dada menekan yang merebak ke lengan kiri atau leher (tanda serangan jantung)."
  },
  {
    "id": 10,
    "condition": "Fatigue & Low Energy",
    "chineseTitle": "慢性疲劳与活力透支",
    "assessmentQuestions": [
      "1. Tired from lack of sleep, or physically drained all day?",
      "2. On a prescribed statin?",
      "3. Feeling dizzy/pale?"
    ],
    "standardOtc": "JH Nutrition Multivitamins & Minerals",
    "hbProduct": "Livemore Co-Q10 Plus Capsule (Cellular mitochondria support)",
    "script": "B-vitamins are good for daily health, but Livemore Co-Q10 Plus actually acts like a spark plug for your heart and muscles, giving you true physical energy, especially if you are over 40.",
    "scriptZh": "基础维生素B群只提供日常代谢，而 Livemore Co-Q10 Plus 是心脏与肌肉线粒体的'能量点火器'，能显著改善全身沉重无力，特别是经常熬夜或40岁以上常服降脂药的长辈。",
    "redFlags": "Chest pain, palpitations, irregular heartbeat, or extreme paleness and fainting.",
    "keywords": [
      "fatigue",
      "energy",
      "tired",
      "coq10",
      "heart",
      "stamina",
      "疲劳",
      "乏力",
      "没有精神",
      "心力"
    ],
    "msTitle": "Keletihan Kronik & Kurang Tenaga",
    "scriptMs": "Daripada bergantung pada kafein berlebihan, kompleks vitamin B bertenaga tinggi bersama CoQ10 menjana tenaga semula jadi di peringkat sel.",
    "redFlagsZh": "不明原因严重消瘦、持续盗汗发烧、或伴随明显淋巴结肿大。",
    "redFlagsMs": "Susut berat badan mendadak tanpa sebab, berpeluh malam berserta demam berpanjangan."
  },
  {
    "id": 11,
    "condition": "Menopause Symptoms",
    "chineseTitle": "更年期潮热与荷尔蒙失衡",
    "assessmentQuestions": [
      "1. Sudden hot flushes or sweating at night?",
      "2. Affecting sleep or mood?",
      "3. Personal/family history of breast cancer?"
    ],
    "standardOtc": "OTC Evening Primrose Oil (EPO)",
    "hbProduct": "JH Nutrition Mamavia Capsule (Natural plant estrogens & cooling herbs)",
    "script": "EPO is a great start, but JH Nutrition Mamavia is specifically designed with natural herbs to cool down your body's thermostat, stopping the hot flushes and helping you sleep through the night.",
    "scriptZh": "月见草油仅能滋润基础体质，而 JH Nutrition Mamavia 专为更年期调配天然植物荷尔蒙与降火草本，能调节体温中枢，彻底抚平潮热盗汗、心烦易怒并改善睡眠质量。",
    "redFlags": "Post-menopausal bleeding reoccurring, or personal history of hormone-related cancers.",
    "keywords": [
      "menopause",
      "hot flushes",
      "sweat",
      "hormone",
      "women",
      "更年期",
      "潮热",
      "盗汗",
      "荷尔蒙"
    ],
    "msTitle": "Gejala Menopaus & Ketidakseimbangan Hormon",
    "scriptMs": "Formula isoflavon kacang soya dan herba semula jadi ini mengimbangi turun naik hormon untuk meredakan rasa panas tiba-tiba (hot flashes) dan perubahan emosi.",
    "redFlagsZh": "绝经后再次异常阴道出血（必须紧急转介妇科排查）。",
    "redFlagsMs": "Pendarahan faraj abnormal selepas menopaus (perlu rujukan pakar segera)."
  },
  {
    "id": 12,
    "condition": "Men's Vitality & Fatigue",
    "chineseTitle": "男性体力透支与活力调理",
    "assessmentQuestions": [
      "1. Stress from work draining your stamina?",
      "2. Feel like you lack physical strength?",
      "3. Taking heart/BP meds?"
    ],
    "standardOtc": "General OTC Multivitamin",
    "hbProduct": "Nutribridge Menz Capsule (Ashwagandha + Shilajit)",
    "script": "A daily vitamin is fine, but Nutribridge Menz uses clinical-grade Ashwagandha to crush your stress levels, allowing your body to naturally boost its testosterone and restore your physical drive.",
    "scriptZh": "普通维生素无法缓解高压导致的疲态，Nutribridge Menz 选用临床级南非醉茄与喜马拉雅沥青草提取物，能大幅降低皮质醇压力，激活男性精力与耐力恢复。",
    "redFlags": "History of heart attacks, or taking nitrate medications for angina (chest pain).",
    "keywords": [
      "men",
      "vitality",
      "stamina",
      "ashwagandha",
      "energy",
      "男性",
      "体力",
      "精力",
      "男士调理"
    ],
    "msTitle": "Kecergasan Lelaki & Tenaga Fizikal",
    "scriptMs": "Nutribridge Menz menggabungkan ekstrak herba tongkat ali dan zink untuk memulihkan stamina harian dan menyokong metabolisme lelaki.",
    "redFlagsZh": "严重勃起功能障碍伴心血管疾病症状、严重排尿滴沥困难。",
    "redFlagsMs": "Kesukaran kencing yang teruk atau disertai tanda penyakit kardiovaskular."
  },
  {
    "id": 13,
    "condition": "Blood Sugar Management",
    "chineseTitle": "血糖偏高与糖代谢调理",
    "assessmentQuestions": [
      "1. Elevated blood sugar on recent test?",
      "2. Extremely thirsty or urinating often?",
      "3. On metformin/insulin?"
    ],
    "standardOtc": "Axon Blood Glucose Monitoring System (for tracking)",
    "hbProduct": "Nutribridge Glycoway Capsule (Bitter Melon + plant extracts)",
    "script": "Monitoring your blood is important, but taking Nutribridge Glycoway daily provides natural plant extracts that act like insulin to actively lower your sugar levels after you eat.",
    "scriptZh": "定期验血糖很重要，搭配每日服用 Nutribridge Glycoway 苦瓜胜肽胶囊，其天然植物胰岛素多肽能改善胰岛素敏感度，有效平稳餐后血糖波动，预防并发症。",
    "redFlags": "Hypoglycemia signs (sweating, shaking, fainting), or blurred vision and non-healing wounds.",
    "keywords": [
      "sugar",
      "diabetes",
      "glucose",
      "glycoway",
      "bitter melon",
      "血糖",
      "糖尿病",
      "苦瓜",
      "餐后血糖"
    ],
    "msTitle": "Kawalan Gula Darah & Kesihatan Metabolik",
    "scriptMs": "Penambahan ekstrak peria katak dan kromium menyokong kepekaan insulin dan melancarkan metabolisme glukosa selepas makan.",
    "redFlagsZh": "血糖剧烈飙升 >18mmol/L，伴恶心呕吐脱水（酮症酸中毒风险）。",
    "redFlagsMs": "Paras gula darah melambung tinggi >18 mmol/L disertai loya muntah (risiko DKA)."
  },
  {
    "id": 14,
    "condition": "Poor Blood Circulation",
    "chineseTitle": "血液循环不良与下肢水肿",
    "assessmentQuestions": [
      "1. Legs heavy and swollen at end of day?",
      "2. Visible bulging varicose veins?",
      "3. Swelling only in one leg?"
    ],
    "standardOtc": "OTC Compression Stockings",
    "hbProduct": "JH Nutrition Systoright Vegecap (Grape Seed Extract 300mg)",
    "script": "Stockings help squeeze the blood back up, but JH Nutrition Systoright uses Grape Seed Extract to actually repair the weakened blood vessels so the swelling stops happening in the first place.",
    "scriptZh": "压力袜只能从外部挤压血液回流，而 JH Nutrition Systoright 含有高浓度 300mg 原花青素葡萄籽萃取，能直接增强静脉血管壁弹性与瓣膜功能，根本消除双腿沉重酸胀与静脉曲张。",
    "redFlags": "Swelling only in one leg which is red, hot, and highly painful (Deep Vein Thrombosis risk), or heart failure history.",
    "keywords": [
      "circulation",
      "swelling",
      "legs",
      "varicose",
      "grape seed",
      "systoright",
      "循环",
      "水肿",
      "脚肿",
      "静脉曲张"
    ],
    "msTitle": "Peredaran Darah Lemah & Kebas Kaki",
    "scriptMs": "Ekstrak Ginkgo Biloba dan minyak ikan omega-3 menyokong keanjalan saluran darah dan membantu peredaran darah mikro ke hujung jari kaki dan tangan.",
    "redFlagsZh": "单侧小腿突发剧烈红肿热痛（疑似下肢深静脉血栓 DVT）。",
    "redFlagsMs": "Satu belah betis bengkak merah panas secara tiba-tiba (risiko DVT)."
  },
  {
    "id": 15,
    "condition": "Pediatric Picky Eating & Growth",
    "chineseTitle": "儿童挑食厌食与发育迟缓",
    "assessmentQuestions": [
      "1. Age of child & missing milestones?",
      "2. Constantly refusing regular meals?",
      "3. Rapid weight loss/lethargy?"
    ],
    "standardOtc": "OTC Pediatric Multivitamin Syrup",
    "hbProduct": "Nutribridge Kids Grow (Vanilla) (protein, DHA, calcium)",
    "script": "A vitamin syrup is good, but mixing a glass of Nutribridge Kids Grow gives them the exact protein, calcium, and brain nutrients they need to catch up on their growth, even on days they refuse to eat food.",
    "scriptZh": "维他命糖浆无法补充生长所需的宏量营养，每天一杯 Nutribridge Kids Grow 优质蛋白营养粉，含有完整的浓缩乳清蛋白、钙质和脑黄金 DHA，能确保挑食孩子每日发育达标。",
    "redFlags": "Child is exhibiting severe lethargy, developmental delays, or chronic vomiting after eating.",
    "keywords": [
      "pediatric",
      "kids",
      "growth",
      "picky eating",
      "protein",
      "child",
      "儿童",
      "挑食",
      "长高",
      "厌食",
      "营养奶粉"
    ],
    "msTitle": "Kanak-Kanak Memilih Makanan & Tumbesaran",
    "scriptMs": "Sirap multivitamin berserta lisin ini merangsang selera makan secara semula jadi dan membekalkan nutrien lengkap untuk tumbesaran aktif si manja.",
    "redFlagsZh": "体重百分位数持续下滑、伴持续嗜睡或慢性腹泻。",
    "redFlagsMs": "Pertumbuhan terbantut ketara, lesu berterusan atau cirit-birit kronik."
  },
  {
    "id": 16,
    "condition": "Adult Malnutrition & Sarcopenia",
    "chineseTitle": "中老年肌少症与营养不良",
    "assessmentQuestions": [
      "1. Elder losing muscle strength / chair struggle?",
      "2. Skipping meals / lack of appetite?",
      "3. Choking on food/liquids?"
    ],
    "standardOtc": "OTC Standard Whey Protein",
    "hbProduct": "Nutribridge Nutrenmax (Ca-HMB complete nutrition for seniors)",
    "script": "Normal protein is okay, but Nutribridge Nutrenmax contains a special nutrient called Ca-HMB designed specifically for seniors to stop muscle loss and quickly rebuild strength so you can stay active.",
    "scriptZh": "一般蛋白粉吸收率有限，Nutribridge Nutrenmax 专为长辈添加临床级 Ca-HMB 肌力修复因子与全营养素，能强效锁住肌肉流失、快速重建双腿支撑力，防止跌倒与消瘦。",
    "redFlags": "Choking/coughing heavily while eating/drinking, or unexplained rapid weight loss.",
    "keywords": [
      "senior",
      "sarcopenia",
      "muscle",
      "nutrenmax",
      "hmb",
      "elderly",
      "肌少症",
      "老人消瘦",
      "没力气",
      "蛋白粉"
    ],
    "msTitle": "Kekurangan Nutrisi Dewasa & Kemerosotan Otot",
    "scriptMs": "Susu nutrisi tinggi protein berserta HMB ini membantu mengekalkan jisim otot dan membina semula kekuatan fizikal warga emas.",
    "redFlagsZh": "短期内体重下降超 10%、频繁跌倒卧床不起。",
    "redFlagsMs": "Penurunan berat badan drastik melebihi 10%, kerap jatuh atau sukar berjalan."
  },
  {
    "id": 17,
    "condition": "Skin Aging & Cellular Health",
    "chineseTitle": "皮肤抗老暗沉与细胞水润",
    "assessmentQuestions": [
      "1. Trying to reduce wrinkles & improve moisture?",
      "2. Hair/nails feeling weak/brittle?",
      "3. Any animal-derived allergies?"
    ],
    "standardOtc": "OTC Vitamin C / Basic Collagen Powder",
    "hbProduct": "Nutribridge Sheep Placenta 600mg (with grape seed extract)",
    "script": "Vitamin C is great for basic skin health, but this pure New Zealand Sheep Placenta provides deep cellular growth factors that actively hydrate your skin from the inside and slow down the aging process.",
    "scriptZh": "普通胶原蛋白作用较表层，纽西兰纯正 Nutribridge 羊胎素 600mg 蕴含高活性细胞生长因子与葡萄籽多酚，能深入真皮层激活细胞再生，恢复皮肤弹性光泽并淡化细纹色斑。",
    "redFlags": "Moles that have suddenly changed color or shape, or severe undiagnosed inflammatory skin conditions.",
    "keywords": [
      "skin",
      "aging",
      "wrinkles",
      "placenta",
      "beauty",
      "collagen",
      "皮肤抗老",
      "美白",
      "羊胎素",
      "皱纹"
    ],
    "msTitle": "Penuaan Kulit & Kesihatan Selular",
    "scriptMs": "Vitamin C sangat baik untuk kesihatan kulit asas, tetapi Nutribridge Sheep Placenta tulen dari New Zealand ini membekalkan faktor pertumbuhan sel yang melembapkan kulit secara mendalam dari dalam dan melambatkan proses penuaan.",
    "redFlagsZh": "突然改变颜色或形状的黑痣，或严重未确诊的炎性皮肤病变。",
    "redFlagsMs": "Tahi lalat yang tiba-tiba berubah warna atau bentuk, atau radang kulit teruk yang belum didiagnosis."
  },
  {
    "id": 18,
    "condition": "Vitamin D & Bone Health",
    "chineseTitle": "骨质疏松与维生素D缺乏",
    "assessmentQuestions": [
      "1. Indoors all day with minimal sunlight?",
      "2. Concerned about bone density?",
      "3. History of kidney stones?"
    ],
    "standardOtc": "OTC Calcium Carbonate Tablet",
    "hbProduct": "Livemore Neo-D3 1000IU Tablet (Active Cholecalciferol)",
    "script": "Taking calcium alone isn't enough; you must pair it with Livemore Neo-D3 to act as the 'key' that unlocks your bones so they can actually absorb the calcium and get stronger.",
    "scriptZh": "单吃钙片吸收率极低且容易引起便秘，必须搭配 Livemore Neo-D3 1000IU 活性维生素D，它就像开启骨骼吸收大门的'钥匙'，能引钙入骨，真正提升骨密度、预防骨折。",
    "redFlags": "Fracturing a bone from a minor trip or fall, advanced kidney disease, or history of calcium kidney stones.",
    "keywords": [
      "bone",
      "calcium",
      "vitamin d",
      "d3",
      "osteoporosis",
      "骨质疏松",
      "钙片",
      "维他命D",
      "骨密度"
    ],
    "msTitle": "Kesihatan Tulang & Kalsium Vitamin D",
    "scriptMs": "Kalsium sahaja tidak mencukupi; penambahan Vitamin D3 dan K2 memastikan kalsium diserap terus ke dalam tulang dan tidak mendap di saluran darah.",
    "redFlagsZh": "轻微磕碰即发生骨折、脊柱严重压迫性畸形剧痛。",
    "redFlagsMs": "Patah tulang akibat hentakan kecil, atau sakit belakang melampau."
  },
  {
    "id": 19,
    "condition": "Presbyopia & Eye Strain",
    "chineseTitle": "老花眼视力疲劳与蓝光护眼",
    "assessmentQuestions": [
      "1. Holding phone far away to read?",
      "2. Eyes dry/tired after computer work?",
      "3. Experiencing sudden flashes or floaters?"
    ],
    "standardOtc": "Synergy Neovis Lubricating Eye Drops",
    "hbProduct": "Victoria Anti-Blue Light Reading Glasses",
    "script": "The eye drops will soothe the dryness, but wearing these Victoria reading glasses will block the harmful blue light from your screens, which is the actual cause of your eye fatigue and headaches.",
    "scriptZh": "眼药水能暂时舒缓干涩，但长时间看手机和屏幕，配戴 Victoria 防蓝光高清老花镜能阻隔伤害视网膜的高能蓝光，从源头消除眼疲劳、头痛及视力模糊。",
    "redFlags": "Sudden painless loss of vision in one/both eyes, or seeing flashing lights / shower of floaters.",
    "keywords": [
      "eye",
      "vision",
      "presbyopia",
      "blue light",
      "glasses",
      "strain",
      "眼睛干涩",
      "老花镜",
      "防蓝光",
      "视力模糊"
    ],
    "msTitle": "Presbiopia, Keletihan Mata & Cahaya Biru",
    "scriptMs": "Lutein dan Zeaxanthin gred klinikal bertindak sebagai cermin mata semula jadi dari dalam untuk menyaring cahaya biru telefon dan mengurangkan mata kering kabur.",
    "redFlagsZh": "突发眼前黑影飘动、闪光感或视野缺损（疑似视网膜脱落）。",
    "redFlagsMs": "Melihat kilatan cahaya tiba-tiba, bintik hitam melayang atau hilang penglihatan sebelah mata."
  },
  {
    "id": 20,
    "condition": "Minor Cuts & Wound Care",
    "chineseTitle": "日常擦伤创口处理与抗感染",
    "assessmentQuestions": [
      "1. Shallow scrape or deep puncture?",
      "2. Bleeding heavily / starting to clot?",
      "3. Signs of infection / red streaks?"
    ],
    "standardOtc": "Basic OTC Plaster / Iodine Cream",
    "hbProduct": "Medicplast Wound Cleansing Spray & Elastic Crepe Bandage",
    "script": "Before putting a plaster on, you must use this Medicplast cleansing spray to painlessly flush out bacteria, and wrap it with this crepe bandage to keep the swelling down so it heals twice as fast.",
    "scriptZh": "贴胶布前务必先用 Medicplast 抑菌创口喷雾无痛冲洗掉附着细菌，再用 Medicplast 弹性绷带加压包扎，能有效抑制水肿发炎，愈合速度快一倍且不易留疤。",
    "redFlags": "Deep puncture from rusty object or animal bite, red streaks radiating from wound, or fever present.",
    "keywords": [
      "wound",
      "cut",
      "scrape",
      "bandage",
      "spray",
      "plaster",
      "伤口",
      "擦伤",
      "包扎",
      "绷带",
      "创口贴"
    ],
    "msTitle": "Luka Ringan, Calar & Rawatan Antiseptik",
    "scriptMs": "Selepas membersihkan luka dengan antiseptik, gel penyembuh luka hidrogel ini mempercepat pemulihan tisu dan mengelakkan parut tebal.",
    "redFlagsZh": "伤口深达肌肉骨骼、生锈铁器刺伤未接种破伤风、或红肿化脓高烧。",
    "redFlagsMs": "Luka dalam sampai tulang, tercucuk besi berkarat tanpa suntikan tetanus, atau luka bernanah merebak."
  }
];

// Dynamic recommendation helper: Picks best module based on day of month or active clinical theme
window.getPmgHouseBrandRecommendation = function(dateObj, activeTheme) {
  const modules = window.PMG_CLINICAL_UPSELL_MODULES;
  if (!modules || modules.length === 0) return null;
  
  // 1. If active clinical theme matches keyword in any module, prioritize it
  if (activeTheme && typeof activeTheme === 'string') {
    const themeLower = activeTheme.toLowerCase();
    const matched = modules.find(m => {
      const condLower = m.condition.toLowerCase();
      const zhLower = (m.chineseTitle || '').toLowerCase();
      const msLower = (m.msTitle || '').toLowerCase();
      return themeLower.includes(condLower) || condLower.includes(themeLower) || 
             (zhLower && themeLower.includes(zhLower)) || 
             (msLower && themeLower.includes(msLower)) ||
             m.keywords.some(k => themeLower.includes(k.toLowerCase()));
    });
    if (matched) return matched;
  }
  
  // 2. Fallback: cycle through modules deterministically by day of the month
  const d = dateObj ? new Date(dateObj).getDate() : new Date().getDate();
  const index = (d - 1) % modules.length;
  return modules[index];
};
