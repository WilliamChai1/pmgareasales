/* ============================================================================
   DPOS ACADEMY MODULE (Trilingual Voice Role-Play & PMG Frontline SOP)
   ============================================================================ */

(function(global) {
  'use strict';

  // ─── STATE MANAGEMENT ───────────────────────────────────────────────────────
  const state = {
    topicMode: 'weekly', // 'weekly' | 'random'
    weeklyTopic: null,
    randomTopic: null,
    selectedDomain: 'all',
    currentWeek: null,
    currentTab: 'spotlight', // 'spotlight' | 'quiz' | 'roleplay' | 'review'
    quizQuestions: [],
    quizIndex: 0,
    quizSelectedOption: null,
    quizAnswered: false,
    quizUserAnswers: [], // { questionIdx, selectedOption, isCorrect }
    quizScore: null,
    rolePlayTurns: [], // { speaker: 'user'|'customer', text, audioScore, lang }
    isRecording: false,
    isSpeaking: false,
    isEvaluating: false,
    evaluation: null,
    mediaRecorder: null,
    audioChunks: [],
    audioContext: null,
    analyserNode: null,
    animFrameId: null,
    recordingTimerId: null,
    recordingSeconds: 0,
    canReview: false,
    selectedReviewTopic: null,
    userScore: null,
    demoMode: false,
    voices: []
  };

  // ─── HUMANOID CUSTOMER PERSONALITY ARCHETYPES ─────────────────────────────
  const CUSTOMER_ARCHETYPES = [
    {
      id: "budget_conscious",
      name: "Price-Sensitive / Limited Budget (Jimat Cermat / 讲究性价比)",
      trait: "Tight budget, hesitates on prices, asks for cheaper alternatives, responds warmly to daily-cost breakdown (RM2-3/day) or affordable PWP add-ons",
      behaviorPrompt: `PERSONALITY & COMMUNICATION TRAIT - BUDGET-CONSCIOUS (JIMAT CERMAT / 讲究性价比):
- You have a limited budget and worry about spending money.
- When the teammate suggests medicines, patches, or supplements, hesitate and ask about the cost first: "Berapa harganya dik? Bajet saya agak ketat bulan ni...", "Ada pilihan yang lebih murah tak?", "多少钱一盒？有便宜一点的吗？".
- OBJECTION HANDLING:
  * If the teammate explains the cost per day (e.g. 'Uncle/Kak, sebotol ni tahan 2 bulan, jatuh RM2-RM3 je sehari'), or offers an affordable PWP counter deal (e.g. 'tambah RM4 je dapat plaster'), you feel relieved, acknowledge the good value, and agree to buy!
  * If the teammate pushes expensive big packages without explaining daily value, remain hesitant and say you will think about it.`
    },
    {
      id: "affluent_quality",
      name: "Affluent & Premium Quality Seeker (Mementingkan Kualiti / 追求高品质)",
      trait: "Money is no object, demands top-tier clinical efficacy, asks for the best or imported formulation",
      behaviorPrompt: `PERSONALITY & COMMUNICATION TRAIT - AFFLUENT & QUALITY-FOCUSED (MEMENTINGKAN KUALITI / 追求高品质):
- Money is not an issue for you. You want the highest quality and most effective solution.
- You ask: "Ada gred yang paling bagus tak? Duit bukan masalah, yang penting paling berkesan dan selamat", "这个是最有效的吗？有没有更高吸收率或者更好的？".
- OBJECTION HANDLING:
  * If the teammate explains high bioavailability, patented extraction (e.g. Boswellia, fish collagen peptides, high absorption), and comprehensive care, you are impressed, appreciate their professionalism, and agree to take the complete course!`
    },
    {
      id: "health_conscious",
      name: "Health-Conscious & Natural Botanic (Takut Kesan Sampingan / 讲究天然)",
      trait: "Fears synthetic chemicals, worried about kidneys/liver damage, prefers herbs, botanicals, and natural ingredients",
      behaviorPrompt: `PERSONALITY & COMMUNICATION TRAIT - HEALTH-CONSCIOUS & CHEMICAL-WARY (TAKUT KESAN SAMPINGAN / 讲究天然):
- You are very worried about taking synthetic chemical pills or damaging your kidneys and liver: "Saya takut makan banyak ubat kimia nanti rosak buah pinggang... ubat ni ada bahan kimia keras tak?", "这个西药伤肾吗？我平时比较喜欢天然的草本成份".
- OBJECTION HANDLING:
  * If the teammate reassures you with empathy, explains that the House Brand supplement is natural botanical/plant-based (e.g. Curcuma/Turmeric, Boswellia, herbal extracts) and explains safe OTC dosage, you feel relieved, trust their advice, and happily accept!`
    },
    {
      id: "elderly_confused",
      name: "Elderly & Hard-of-Hearing (Warga Emas / 听不清需要耐心)",
      trait: "Elderly, slightly hard of hearing, easily confused by medical jargon, needs repetition, simple dosage, and high patience",
      behaviorPrompt: `PERSONALITY & COMMUNICATION TRAIT - ELDERLY & HARD-OF-HEARING (WARGA EMAS / 听不清需要耐心):
- You are an elderly customer (age 65+). Your hearing is slightly weak and you get confused easily by fast speaking or technical medical jargon.
- You ask them to speak up or repeat: "Hah? Boleh cakap kuat sikit dik? Telinga pakcik/makcik kurang dengar...", "Makan macam mana ya? Ubat ni untuk apa tadi?", "阿妹/阿弟，讲大声一点，老人家耳朵不好... 这个怎么吃啊？".
- OBJECTION HANDLING:
  * If the teammate speaks with warmth, patience, clear loud tone, explains dosage very simply (e.g., 'pagi 1 biji lepas makan'), and invites you to the 28th free glucose screening under Senior Care Plus, you are deeply touched by their care and become a loyal supporter!`
    },
    {
      id: "stubborn_skeptic",
      name: "Stubborn & Skeptical (Degil & Percaya Petua Tradisional / 固执固见)",
      trait: "Skeptical of supplements, believes minyak angin / traditional oils are sufficient, questions why they should take oral supplements",
      behaviorPrompt: `PERSONALITY & COMMUNICATION TRAIT - STUBBORN & SKEPTICAL (DEGIL & PERCAYA PETUA TRADISIONAL / 固执固见):
- You are skeptical about health supplements and wonder if they are just marketing gimmicks. You usually just rub Minyak Panas, Minyak Cap Kapak, or drink warm ginger water.
- You challenge them: "Alah dik, pakcik sapu minyak angin pun boleh tahan, buat apa bazir duit beli suplemen makan?", "搽风油不就好了咯，还要吃药这么麻烦咩？".
- OBJECTION HANDLING:
  * If the teammate validates your feeling ('Betul tu Uncle, minyak memang cepat legakan rasa lenguh luaran...'), but gently explains that minyak only masks surface nerves while joint cartilage/blood vessels need internal nourishment to stop wearing down, you realize they are right and agree to try!`
    },
    {
      id: "rushed_impatient",
      name: "Rushed & Impatient (Tergesa-gesa / Double-Park / 赶时间)",
      trait: "In a hurry, double-parked or rushing for work, demands fast, direct answers without long monologues",
      behaviorPrompt: `PERSONALITY & COMMUNICATION TRAIT - RUSHED & IMPATIENT (TERGESA-GESA / DOUBLE-PARK / 赶时间):
- You are in a huge rush (your car is double-parked outside or you have to catch an appointment).
- You talk fast and want immediate solutions: "Cepat sikit ya dik, kereta saya double park kat luar ni... bagi yang paling cepat hilang sakit", "快一点帮我拿药，我的车停在外面 double park 等下被 saman...".
- OBJECTION HANDLING:
  * If the teammate is sharp, concise, decisive, and quickly recommends the right OTC and House Brand without rambling, you appreciate their quick efficiency, pay immediately, and take their recommendation!`
    },
    {
      id: "anxious_worrier",
      name: "Anxious & Catastrophizing Worrier (Cemas & Takut Penyakit Serius / 焦虑疑病)",
      trait: "High anxiety, Googled symptoms, fears cancer, stroke, or fatal illness, needs calming empathy and clinical reassurance",
      behaviorPrompt: `PERSONALITY & COMMUNICATION TRAIT - ANXIOUS WORRIER (CEMAS & TAKUT PENYAKIT SERIUS / 焦虑疑病):
- You are anxious and frightened that your symptoms might be a deadly or incurable disease (e.g. heart failure, cancer, stroke, permanent disability): "Saya risau sangat dik... ni bukan tanda sakit jantung atau kanser kan? Saya takut sangat...", "我会不会是中风或者有什么大病啊？我很怕...".
- OBJECTION HANDLING:
  * If the teammate shows strong empathy ('Jangan panik kak/bang, bertenang dulu, kami tolong semak tanda-tanda...'), checks your red flags calmly, and reassures you about common benign causes and proper triage, your heartbeat slows down, you feel safe, and you follow all their instructions gratefully!`
    }
  ];

  // ─── RANDOM CASE GENERATOR (10 CLINICAL DOMAINS) ───────────────────────────
  function buildRandomCase(domainKey) {
    const catalog = (typeof window !== 'undefined' && window.DPOS_CLINICAL_CATALOG) ? window.DPOS_CLINICAL_CATALOG : {};
    const domainKeys = Object.keys(catalog);
    if (domainKeys.length === 0) {
      const defaultArch = CUSTOMER_ARCHETYPES[0];
      return {
        topic: "Joint Health & Osteoarthritis Care",
        categoryKey: "musculoskeletal",
        categoryName: "Musculoskeletal & Pain",
        conditionName: "Osteoarthritis Knee",
        isEmergencyRedFlag: false,
        customerName: "Uncle Tan",
        customerGender: "male",
        customerRole: "Retiree",
        customerLang: "ms",
        customerArchetype: defaultArch,
        skus: "JH Nutrition Flexson, Livemore Flexmore, Biowell Terrafast 500mg, Medicplast Heat Patch",
        summaryMd: "## Joint Care Triage\n- Screen red flags\n- Safe OTC relief\n- House brand root cause supplement",
        persona: `VISIBLE: Uncle Tan, 67, walks in rubbing his right knee.\n\nHIDDEN BACKGROUND (customer only): You have right knee pain for 6 months. Worried about price.\n\n${defaultArch.behaviorPrompt}`,
        promo: "Senior Care Plus: FREE blood glucose screening on 28th. Counter PWP special.",
        quiz: []
      };
    }

    let targetDomain = null;
    if (domainKey && domainKey !== 'all' && catalog[domainKey]) {
      targetDomain = catalog[domainKey];
    } else {
      const randomKey = domainKeys[Math.floor(Math.random() * domainKeys.length)];
      targetDomain = catalog[randomKey];
    }

    const conditions = targetDomain.conditions || [];
    if (conditions.length === 0) {
      return buildRandomCase('all');
    }

    const cond = conditions[Math.floor(Math.random() * conditions.length)];
    const p = cond.persona || {};

    // Select customer personality archetype matching age/context
    let eligibleArchetypes = CUSTOMER_ARCHETYPES;
    if (p.age && p.age < 55) {
      eligibleArchetypes = CUSTOMER_ARCHETYPES.filter(a => a.id !== 'elderly_confused');
    }
    const archetype = eligibleArchetypes[Math.floor(Math.random() * eligibleArchetypes.length)];

    return {
      topic: `${cond.emergency ? '🚨 Emergency Red Flag: ' : ''}${cond.name}`,
      categoryKey: targetDomain.id,
      categoryName: targetDomain.name,
      conditionName: cond.name,
      isEmergencyRedFlag: !!cond.emergency,
      customerName: p.name || "Customer",
      customerGender: p.gender || (p.name && detectPersonaGender(p.name)) || "male",
      customerRole: p.role || "Customer",
      customerLang: p.language || "ms",
      customerArchetype: archetype,
      skus: cond.skus || "",
      summaryMd: cond.summaryMd || "",
      persona: `${p.visible || ''}\n\nHIDDEN BACKGROUND (customer only): ${p.hidden || ''}\n\n${archetype.behaviorPrompt}`,
      promo: cond.promo || "Senior Care Plus: FREE blood glucose screening on 28th. Counter PWP special.",
      quiz: cond.quiz || []
    };
  }

  function ensureWeeklyArchetype(weekObj) {
    if (!weekObj) return;
    const personaText = String(weekObj.persona || '');
    const isSenior = /uncle|auntie|aunty|pak\s*cik|mak\s*cik|6[0-9]|7[0-9]|warga\s*emas/i.test(personaText);
    let eligible = CUSTOMER_ARCHETYPES;
    if (!isSenior) {
      eligible = CUSTOMER_ARCHETYPES.filter(a => a.id !== 'elderly_confused');
    }
    const arch = eligible[Math.floor(Math.random() * eligible.length)];
    weekObj.customerArchetype = arch;
  }

  function setTopicMode(mode) {
    if (mode === state.topicMode) return;
    state.topicMode = mode;

    if (mode === 'weekly') {
      state.currentTab = 'spotlight';
      state.currentWeek = state.weeklyTopic || window.DPOS_SEED_WEEK;
      ensureWeeklyArchetype(state.currentWeek);
      state.quizQuestions = parseQuizJson(state.currentWeek.quiz || state.currentWeek.quizJson);
      state.quizIndex = 0;
      state.quizUserAnswers = [];
      state.quizAnswered = false;
      state.quizScore = state.userScore ? state.userScore.quizScore : null;
      state.rolePlayTurns = [];
      state.evaluation = null;
    } else {
      state.currentTab = 'roleplay';
      if (!state.randomTopic) {
        generateNewRandomCase(state.selectedDomain || 'all');
        return;
      }
      state.currentWeek = state.randomTopic;
      state.quizQuestions = parseQuizJson(state.currentWeek.quiz || state.currentWeek.quizJson);
      state.quizIndex = 0;
      state.quizUserAnswers = [];
      state.quizAnswered = false;
      state.quizScore = null;
      state.rolePlayTurns = [];
      state.evaluation = null;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    renderAcademy();
  }

  function generateNewRandomCase(domainKey) {
    state.selectedDomain = domainKey || 'all';
    state.topicMode = 'random';
    state.currentTab = 'roleplay';

    const newCase = buildRandomCase(state.selectedDomain);
    state.randomTopic = newCase;
    state.currentWeek = newCase;
    state.quizQuestions = parseQuizJson(newCase.quiz);
    state.quizIndex = 0;
    state.quizUserAnswers = [];
    state.quizAnswered = false;
    state.quizScore = null;
    state.rolePlayTurns = [];
    state.evaluation = null;

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    renderAcademy();
  }

  // ─── PURE HELPER FUNCTIONS ─────────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatInline(str) {
    let s = escapeHtml(str);
    s = s.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
  }

  function renderMarkdown(md) {
    if (!md) return '';
    const lines = String(md).split('\n');
    let html = [];
    let inUl = false;
    let inOl = false;

    for (let rawLine of lines) {
      let line = rawLine.trim();

      if (!line) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        if (inOl) { html.push('</ol>'); inOl = false; }
        continue;
      }

      if (line.startsWith('### ')) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        if (inOl) { html.push('</ol>'); inOl = false; }
        html.push(`<h3>${formatInline(line.slice(4))}</h3>`);
        continue;
      }
      if (line.startsWith('## ')) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        if (inOl) { html.push('</ol>'); inOl = false; }
        html.push(`<h2>${formatInline(line.slice(3))}</h2>`);
        continue;
      }
      if (line.startsWith('# ')) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        if (inOl) { html.push('</ol>'); inOl = false; }
        html.push(`<h1>${formatInline(line.slice(2))}</h1>`);
        continue;
      }

      if (line === '---') {
        if (inUl) { html.push('</ul>'); inUl = false; }
        if (inOl) { html.push('</ol>'); inOl = false; }
        html.push('<hr/>');
        continue;
      }

      if (line.startsWith('> ')) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        if (inOl) { html.push('</ol>'); inOl = false; }
        html.push(`<blockquote>${formatInline(line.slice(2))}</blockquote>`);
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (inOl) { html.push('</ol>'); inOl = false; }
        if (!inUl) { html.push('<ul>'); inUl = true; }
        html.push(`<li>${formatInline(line.slice(2))}</li>`);
        continue;
      }

      const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (olMatch) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        if (!inOl) { html.push('<ol>'); inOl = true; }
        html.push(`<li>${formatInline(olMatch[2])}</li>`);
        continue;
      }

      if (inUl) { html.push('</ul>'); inUl = false; }
      if (inOl) { html.push('</ol>'); inOl = false; }
      html.push(`<p>${formatInline(line)}</p>`);
    }

    if (inUl) html.push('</ul>');
    if (inOl) html.push('</ol>');

    return html.join('\n');
  }

  function extractJson(str) {
    if (!str) return null;
    let text = String(str).trim();
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match) text = match[1].trim();
    try {
      return JSON.parse(text);
    } catch (e) {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(text.slice(firstBrace, lastBrace + 1));
        } catch (err) {}
      }
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
          return JSON.parse(text.slice(firstBracket, lastBracket + 1));
        } catch (err) {}
      }
    }
    return null;
  }

  function parseQuizJson(raw) {
    let arr = [];
    if (Array.isArray(raw)) {
      arr = raw;
    } else if (typeof raw === 'object' && raw !== null && Array.isArray(raw.questions)) {
      arr = raw.questions;
    } else if (typeof raw === 'string') {
      const parsed = extractJson(raw);
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed && Array.isArray(parsed.questions)) arr = parsed.questions;
    }

    return arr.map((item, idx) => {
      let q = item.q || item.question || `Question ${idx + 1}`;
      let options = Array.isArray(item.options) ? item.options : [];
      let answer = item.answer !== undefined ? item.answer : item.correctIndex;
      if (typeof answer === 'string') {
        const upper = answer.trim().toUpperCase();
        if (upper === 'A') answer = 0;
        else if (upper === 'B') answer = 1;
        else if (upper === 'C') answer = 2;
        else if (upper === 'D') answer = 3;
        else answer = parseInt(answer) || 0;
      }
      return {
        q: q,
        options: options,
        answer: Number(answer) || 0,
        rationale: item.rationale || item.explanation || "",
        safety: item.safety || item.safetyCheck || ""
      };
    });
  }

  function splitPersona(personaStr) {
    if (!personaStr) return { visibleText: "A customer walks in seeking advice for pain and discomfort.", hiddenPrompt: "" };
    const lines = String(personaStr).split('\n');
    let visible = "";
    let hidden = [];
    for (let line of lines) {
      if (line.startsWith("VISIBLE:")) {
        visible = line.replace(/^VISIBLE:\s*/, '').trim();
      } else {
        hidden.push(line);
      }
    }
    return {
      visibleText: visible || "A customer walks into the pharmacy asking for healthcare advice.",
      hiddenPrompt: hidden.join('\n').trim()
    };
  }

  function encodeWav16(samples, sampleRate) {
    sampleRate = sampleRate || 16000;
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit PCM
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Uint8Array(buffer);
  }

  function bytesToBase64(uint8) {
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return window.btoa(binary);
  }

  async function blobToWav16k(blob) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) throw new Error("AudioContext not supported");
      const ctx = new AudioCtx();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const targetSampleRate = 16000;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
        1,
        Math.ceil(audioBuffer.duration * targetSampleRate),
        targetSampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      const channelData = renderedBuffer.getChannelData(0);
      const wavBytes = encodeWav16(channelData, targetSampleRate);
      return {
        base64: bytesToBase64(wavBytes),
        mimeType: 'audio/wav'
      };
    } catch (e) {
      console.warn("WAV downsampling failed, falling back to direct base64 blob:", e);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result;
          const commaIdx = res.indexOf(',');
          const base64 = commaIdx !== -1 ? res.slice(commaIdx + 1) : res;
          const mime = blob.type || 'audio/webm';
          resolve({ base64: base64, mimeType: mime });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  }

  function normalizeLangCode(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (s.startsWith('zh') || s.includes('chinese') || s.includes('mandarin') || s.includes('华') || s.includes('中文')) return 'zh';
    if (s.startsWith('en') || s.includes('english') || s.includes('inggeris')) return 'en';
    if (s.startsWith('ms') || s.includes('malay') || s.includes('melayu')) return 'ms';
    return 'ms';
  }

  function getLangBadgeLabel(langCode) {
    const code = normalizeLangCode(langCode);
    if (code === 'zh') return 'Mandarin 华语';
    if (code === 'en') return 'English';
    return 'Bahasa Melayu';
  }

  function detectPersonaGender(personaStr) {
    const text = String(personaStr || '').toLowerCase();
    const maleKeywords = ['uncle', 'man', 'gentleman', 'pakcik', 'pak cik', 'lelaki', 'encik', 'mr.', 'mr ', 'he ', 'his ', 'him ', 'tan', 'ah pek', 'ah bert', '大叔', '阿伯', '伯伯', '老伯', '先生', '爷爷'];
    const femaleKeywords = ['auntie', 'aunty', 'woman', 'lady', 'makcik', 'mak cik', 'wanita', 'puan', 'cik', 'mrs.', 'ms.', 'she ', 'her ', 'mrs ', 'ms ', '阿姨', '大婶', '女士', '小姐', '婆婆', '奶奶'];
    let maleScore = 0, femaleScore = 0;
    for (const k of maleKeywords) if (text.includes(k)) maleScore++;
    for (const k of femaleKeywords) if (text.includes(k)) femaleScore++;
    if (femaleScore > maleScore) return 'female';
    if (maleScore > 0) return 'male';
    return 'male';
  }

  function getPersonaCustomerLabel(personaStr) {
    const text = String(personaStr || '');
    const gender = detectPersonaGender(text);
    const match = text.match(/(Uncle\s+[A-Za-z]+|Auntie\s+[A-Za-z]+|Aunty\s+[A-Za-z]+|Pak\s+Cik\s+[A-Za-z]+|Mak\s+Cik\s+[A-Za-z]+|Mr\.?\s+[A-Za-z]+|Mrs\.?\s+[A-Za-z]+|Mdm\.?\s+[A-Za-z]+)/i);
    const namePart = match ? ` (${match[1]})` : (gender === 'female' ? ' (Customer)' : ' (Uncle Tan)');
    const icon = gender === 'female' ? '👵' : '👴';
    return `${icon} Walk-in Customer${namePart}`;
  }

  function pickVoice(langCode, gender) {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices || voices.length === 0) return null;

    const code = normalizeLangCode(langCode);
    const targetGender = gender || 'male';

    let langTargets = [];
    if (code === 'zh') {
      langTargets = ['zh-my', 'zh-cn', 'zh-sg', 'zh-tw', 'zh-hk', 'zh'];
    } else if (code === 'en') {
      langTargets = ['en-my', 'en-gb', 'en-sg', 'en-au', 'en-us', 'en'];
    } else {
      langTargets = ['ms-my', 'ms', 'id-id', 'id'];
    }

    const matchingLangVoices = [];
    for (const t of langTargets) {
      for (const v of voices) {
        const vl = (v.lang || '').toLowerCase().replace(/_/g, '-');
        if ((vl === t || vl.startsWith(t)) && !matchingLangVoices.includes(v)) {
          matchingLangVoices.push(v);
        }
      }
    }

    if (matchingLangVoices.length === 0) {
      return voices[0] || null;
    }

    const maleKeywords = ['male', 'man', 'guy', 'david', 'george', 'james', 'richard', 'mark', 'danny', 'brian', 'paul', 'yunxi', 'yunjian', 'yunyang', 'zhiwei', 'kangkang', 'qiang', 'fadli', 'osman', 'wan', 'pria'];
    const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'hazel', 'susan', 'catherine', 'xiaoxiao', 'xiaoyi', 'xiaohan', 'huihui', 'yaoyao', 'siti', 'nurul', 'wanita'];

    if (targetGender === 'male') {
      const maleVoice = matchingLangVoices.find(v => {
        const n = (v.name || '').toLowerCase();
        return maleKeywords.some(k => n.includes(k)) && !femaleKeywords.some(k => n.includes(k));
      });
      if (maleVoice) return maleVoice;

      const nonFemaleVoice = matchingLangVoices.find(v => {
        const n = (v.name || '').toLowerCase();
        return !femaleKeywords.some(k => n.includes(k));
      });
      if (nonFemaleVoice) return nonFemaleVoice;
    } else {
      const femaleVoice = matchingLangVoices.find(v => {
        const n = (v.name || '').toLowerCase();
        return femaleKeywords.some(k => n.includes(k));
      });
      if (femaleVoice) return femaleVoice;
    }

    return matchingLangVoices[0];
  }

  function computeBadge(score) {
    if (score >= 85) return { badge: "Gold", icon: "🥇", class: "badge-gold" };
    if (score >= 70) return { badge: "Silver", icon: "🥈", class: "badge-silver" };
    return { badge: "Bronze", icon: "🥉", class: "badge-bronze" };
  }

  function computeConfidence(warmth, fluency) {
    const avg = ((warmth || 7) + (fluency || 7)) / 2;
    if (avg >= 8) return `High (${avg.toFixed(1)}/10)`;
    if (avg >= 6) return `Medium (${avg.toFixed(1)}/10)`;
    return `Developing (${avg.toFixed(1)}/10)`;
  }

  // ─── UNIVERSAL CLINICAL INTEGRITY & PHARMACOLOGY AUDIT ENGINE ──────────────
  function auditClinicalIntegrity(transcriptText, userTurns, currentWeek, aiClinicalAudit) {
    const text = (transcriptText || '').toLowerCase();
    const userWords = (userTurns || []).map(t => t.text || '').join(' ').toLowerCase();
    const w = currentWeek || {};
    const topic = (w.topic || '').toLowerCase();
    const personaRaw = (w.persona || '').toLowerCase();

    const issues = [];

    // 1. NSAID adverse effect vs true drug allergy
    if (/(sakit\s*perut.*(allergic|alergi|alahan)|(allergic|alergi|alahan).*sakit\s*perut|gastrik.*(allergic|alergi|alahan)|(allergic|alergi|alahan).*gastrik|nsaid.*(allergic|alergi|alahan)|(allergic|alergi|alahan).*nsaid)/i.test(userWords)) {
      issues.push({
        title: "Clinical Misconception: NSAID Adverse Effect vs True Allergy",
        stated: "Sakit perut / gastrik akibat NSAID disalah anggap sebagai alahan (allergy)",
        correction: "Sakit gastrik atau pedih hulu hati selepas mengambil NSAID (cth: Ibuprofen) adalah kesan sampingan farmakologi (perencatan enzim COX-1 yang menghakis mukosa perut), BUKAN alahan ubat. Alahan ubat sebenar melibatkan ruam gatal, bengkak muka/bibir, atau sesak nafas.",
        deduction: 5
      });
    }

    // 2. JH Nutrition Flexson vs Livemore Flexmore formulation accuracy
    if (/(flexson.*(ikan|telur|fish|egg)|(ikan|telur|fish|egg).*flexson)/i.test(userWords)) {
      issues.push({
        title: "Formulation Error: Flexson (Herbal) vs Flexmore (Fish & Egg)",
        stated: "Mendakwa Flexson mengandungi ikan atau telur",
        correction: "JH Nutrition Flexson adalah 100% ekstrak herba (Kunyit Curcuma longa 250mg + Boswellia serrata 200mg) dan mesra vegetarian, TIADA ikan atau telur. Livemore Flexmore adalah produk yang mengandungi kolagen ikan hidrolisis (4000mg) dan membran kulit telur ayam.",
        deduction: 5
      });
    }

    // 3. Paracetamol overdose (>4000mg or >8 tablets daily)
    if (/(makan|ambil|take)\s*([3-9]|\d{2,})\s*(biji|tablet|tabs|caps).*paracetamol|(paracetamol|panadol|terrafast).*(lebih|more\s*than)\s*(4000\s*mg|4\s*g|8\s*(biji|tablet))/i.test(userWords)) {
      issues.push({
        title: "Dosing Safety Violation: Paracetamol Overdose Risk",
        stated: "Dos paracetamol melebihi had selamat",
        correction: "Dos maksimum Paracetamol 500mg adalah 1-2 tablet 4 kali sehari (maksimum 4,000mg atau 8 tablet sehari dengan jarak 4-6 jam). Dos berlebihan menyebabkan ketoksikan hati (hepatotoksik).",
        deduction: 10
      });
    }

    // 4. Antibiotics for viral cold / cough / flu
    if (/cough|cold|flu|demam|selsema|batuk/i.test(topic) && /(makan|ambil|bagi|minta|perlu)\s*antibiotik/i.test(userWords)) {
      issues.push({
        title: "Antimicrobial Stewardship Violation: Antibiotics for Viral Illness",
        stated: "Mencadangkan atau meminta antibiotik untuk batuk/selsema biasa",
        correction: "Selsema biasa, batuk akut, dan flu adalah jangkitan virus. Antibiotik tidak berkesan terhadap virus dan penggunaannya menyumbang kepada rintangan antibiotik (antimicrobial resistance). Rawatan perlu fokus kepada kelegaan simptomatik.",
        deduction: 10
      });
    }

    // 5. Topical steroids on fungal skin infections (Tinea / Kurap / Panau)
    if (/fungal|kurap|panau|tinea|kulat/i.test(topic) && /(krim\s*steroid|hydrocortisone|betamethasone)/i.test(userWords)) {
      issues.push({
        title: "Dermatology Safety Violation: Steroids on Fungal Infection",
        stated: "Mencadangkan krim steroid untuk jangkitan kulat/kurap",
        correction: "Penggunaan steroid topikal pada jangkitan kulat menekan imuniti tempatan dan menyebabkan 'Tinea Incognito' (jangkitan kulat merebak lebih teruk). Krim antikulat spesifik (Clotrimazole/Terbinafine) wajib digunakan.",
        deduction: 10
      });
    }

    // 6. Oral pseudoephedrine/decongestant in hypertension
    if (/darah\s*tinggi|hypertension|bp|amlodipine|losartan|perindopril/i.test(personaRaw) && /(decongestant|pseudoephedrine|clarinase|actifed)/i.test(userWords)) {
      issues.push({
        title: "Contraindication Warning: Oral Decongestant in Hypertension",
        stated: "Mencadangkan dekongestan oral kepada pesakit darah tinggi",
        correction: "Dekongestan oral sistemik (Pseudoephedrine/Phenylephrine) mengecutkan salur darah dan boleh menyebabkan lonjakan tekanan darah berbahaya (hypertensive spike). Gunakan semburan saline nasal atau antihistamin generasi baru.",
        deduction: 8
      });
    }

    // 7. Oral NSAIDs in active asthma without screening
    if (/asma|asthma|lelah/i.test(personaRaw) && /(ibuprofen|diclofenac|ponstan|voltaren|mefenamic|nsaid)/i.test(userWords)) {
      issues.push({
        title: "Contraindication Warning: Oral NSAIDs in Asthma (AERD Risk)",
        stated: "Mencadangkan NSAID oral kepada pesakit asma tanpa saringan alahan",
        correction: "Sehingga 20% pesakit asma dewasa mengalami Aspirin/NSAID-Exacerbated Respiratory Disease (AERD) yang boleh mencetuskan serangan asma akut. Paracetamol atau koyok topikal adalah pilihan yang jauh lebih selamat.",
        deduction: 8
      });
    }

    // 8. Stopping prescribed doctor medications
    if (/(berhenti|stop|tak\s*payah\s*makan|buang)\s*(ubat\s*hospital|ubat\s*klinik|ubat\s*doktor|ubat\s*darah\s*tinggi|ubat\s*kencing\s*manis)/i.test(userWords)) {
      issues.push({
        title: "Severe Professional Practice Violation: Advising Discontinuation of Rx Meds",
        stated: "Menasihati pesakit berhenti mengambil ubat preskripsi doktor",
        correction: "Kakitangan farmasi dilarang sama sekali menyuruh pesakit menghentikan ubat kronik hospital/doktor untuk digantikan dengan suplemen. Suplemen bertindak sebagai terapi sokongan pelengkap.",
        deduction: 15
      });
    }

    // 9. Emergency Red Flag case with OTC commercial sale
    if (w.isEmergencyRedFlag && /(jual|beli|bagi|rekomen|ambil)\s*(panadol|ubat|suplemen|vitamin|paracetamol|koyok|patch)/i.test(userWords) && !/(hospital|kecemasan|doktor|999|klinik\s*kesihatan)/i.test(userWords)) {
      issues.push({
        title: "Critical Emergency Protocol Breach: Selling OTC in Life-Threatening Case",
        stated: "Menjual ubat OTC dan bukannya merujuk kes kecemasan ke hospital",
        correction: "Dalam kes tanda bahaya kecemasan (Suspek Denggi, Sakit Dada Serangan Jantung, Strok FAST), pesakit mesti dihantar serta-merta ke Hospital/Kecemasan. Menjual ubat OTC melewatkan rawatan menyelamatkan nyawa.",
        deduction: 25
      });
    }

    // Incorporate AI-discovered issues from Gemini (deduped)
    if (aiClinicalAudit && Array.isArray(aiClinicalAudit.issues)) {
      aiClinicalAudit.issues.forEach(aiIss => {
        if (!aiIss || !aiIss.title) return;
        const isDuplicate = issues.some(iss => iss.title.toLowerCase().includes(aiIss.title.toLowerCase().slice(0, 15)) || (iss.stated && aiIss.stated && iss.stated.toLowerCase().includes(aiIss.stated.toLowerCase().slice(0, 15))));
        if (!isDuplicate) {
          issues.push({
            title: aiIss.title,
            stated: aiIss.stated || "Stated in consultation turn",
            correction: aiIss.correction || aiIss.explanation || "Clinical correction required",
            deduction: Number(aiIss.deduction || 5)
          });
        }
      });
    }

    return {
      passed: issues.length === 0,
      issues: issues
    };
  }

  // ─── API & LLM CALLS ───────────────────────────────────────────────────────
  async function dposApi(action, payload) {
    const apiUrl = typeof API_URL !== 'undefined' ? API_URL : '';
    if (!apiUrl) throw new Error("API_URL is not defined");

    const body = { action: action, ...payload };
    const res = await fetch(apiUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    return await res.json();
  }

  function getGeminiApiKeys() {
    const raw = (localStorage.getItem('pmg_gemini_key') || '').trim();
    if (!raw) return [];
    return raw.split(/[\s,;]+/).map(k => k.replace(/['"]/g, '').trim()).filter(k => k.length >= 10);
  }

  async function dposGenerate(requestedModel, promptOrContents, systemInstruction) {
    const keys = getGeminiApiKeys();
    const candidateModels = [
      requestedModel,
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-1.5-flash'
    ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    let lastError = null;

    // 1. Try local client keys with auto-failover
    for (let kIdx = 0; kIdx < keys.length; kIdx++) {
      const curKey = keys[kIdx];
      for (const chosenModel of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${curKey}`;
          const payload = {
            contents: Array.isArray(promptOrContents) ? promptOrContents : [{ parts: [{ text: promptOrContents }] }]
          };
          if (systemInstruction) {
            payload.systemInstruction = { parts: [{ text: systemInstruction }] };
          }
          payload.generationConfig = {
            temperature: 0.3,
            responseMimeType: "application/json"
          };

          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': curKey
            },
            body: JSON.stringify(payload)
          });
          const data = await resp.json();
          if (data.error) {
            throw new Error(data.error.message || `Gemini direct error (${chosenModel})`);
          }
          return data;
        } catch (err) {
          console.warn(`Key #${kIdx + 1} (${curKey.slice(0, 6)}...) model ${chosenModel} failed:`, err.message);
          lastError = err;
          const msg = (err.message || '').toLowerCase();
          if (msg.includes('quota') || msg.includes('rate') || msg.includes('429') || msg.includes('resource_exhausted')) {
            console.warn(`Key #${kIdx + 1} quota/rate limited. Failing over to next key...`);
            break; // Skip to next key
          }
        }
      }
    }

    // 2. Fall back to server proxy
    for (const chosenModel of candidateModels) {
      try {
        const proxyPayload = {
          model: chosenModel,
          contents: Array.isArray(promptOrContents) ? promptOrContents : [{ parts: [{ text: promptOrContents }] }]
        };
        if (systemInstruction) {
          proxyPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        proxyPayload.generationConfig = {
          temperature: 0.3,
          responseMimeType: "application/json"
        };

        const res = await dposApi('geminiProxy', proxyPayload);
        if (!res.success) {
          throw new Error(res.message || `Failed to contact Gemini proxy (${chosenModel})`);
        }
        return res.data;
      } catch (err) {
        console.warn(`Proxy model ${chosenModel} failed:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error("All candidate Gemini models and API keys failed.");
  }

  // ─── INIT & DATA FETCHING ──────────────────────────────────────────────────
  async function loadDposData() {
    const root = document.getElementById("academyRoot");
    if (root) {
      root.innerHTML = `<div style="text-align:center; padding:40px; color:#666;">🔄 Loading DPOS Academy Curriculum...</div>`;
    }

    const isMgr = (typeof isManagementOrPharmacist === 'function') ? isManagementOrPharmacist(currentUser) : false;
    if (!isMgr) {
      state.canReview = false;
      state.currentTab = 'spotlight';
    }

    try {
      const u = (typeof currentUser !== 'undefined' && currentUser && currentUser.username) || '';
      const res = await dposApi('dposGetWeek', { username: u });

      if (res && res.success && res.week) {
        state.weeklyTopic = res.week;
        ensureWeeklyArchetype(state.weeklyTopic);
        state.currentWeek = state.topicMode === 'random' && state.randomTopic ? state.randomTopic : state.weeklyTopic;
        state.canReview = !!res.canReview && isMgr;
        state.userScore = res.mine || null;
        state.demoMode = false;

        // Auto-seed Gemini API key from backend so teammates don't need to manually configure it
        if (res.geminiKey && String(res.geminiKey).trim().length >= 10) {
          const serverKey = String(res.geminiKey).trim();
          if (!isMgr || getGeminiApiKeys().length === 0) {
            localStorage.setItem('pmg_gemini_key', serverKey);
            console.log("Auto-synced Gemini API key from central server for teammate.");
          }
        }
      } else {
        throw new Error(res.message || "No active week returned");
      }
    } catch (e) {
      console.warn("DPOS API offline or unavailable, loading seed week:", e);
      state.demoMode = true;
      if (typeof window.DPOS_SEED_WEEK !== 'undefined') {
        state.weeklyTopic = window.DPOS_SEED_WEEK;
      } else {
        state.weeklyTopic = {
          topic: "Week 1: Joint Health & Osteoarthritis Care",
          skus: "JH Nutrition Flexson, Livemore Flexmore, Biowell Terrafast, Medicplast Heat Patch",
          summaryMd: "## Joint Care Triage\n- Screen red flags\n- Safe OTC relief\n- House brand root cause supplement",
          quiz: [],
          persona: "A customer walks in rubbing his knee.",
          promo: "Senior Care Plus FREE glucose test on 28th."
        };
      }
      ensureWeeklyArchetype(state.weeklyTopic);
      state.currentWeek = state.topicMode === 'random' && state.randomTopic ? state.randomTopic : state.weeklyTopic;
      try {
        const savedScores = JSON.parse(localStorage.getItem('pmg_dpos_scores') || '{}');
        state.userScore = savedScores[state.currentWeek.topic] || null;
      } catch (err) {}
      state.canReview = isMgr;
    }

    if (!state.canReview && state.currentTab === 'review') {
      state.currentTab = 'spotlight';
    }

    // Parse Quiz
    state.quizQuestions = parseQuizJson(state.currentWeek.quiz || state.currentWeek.quizJson);
    state.quizIndex = 0;
    state.quizUserAnswers = [];
    state.quizAnswered = false;
    state.quizScore = state.userScore ? state.userScore.quizScore : null;

    renderAcademy();
  }

  // ─── RENDER MAIN ACADEMY SHELL ─────────────────────────────────────────────
  function renderAcademy() {
    const root = document.getElementById("academyRoot");
    if (!root) return;

    // Strict security check: if not a reviewer, never show review tab or content
    const isMgr = (typeof isManagementOrPharmacist === 'function') ? isManagementOrPharmacist(currentUser) : false;
    if (!state.canReview || !isMgr) {
      state.canReview = false;
      if (state.currentTab === 'review') {
        state.currentTab = 'spotlight';
      }
    }

    let topicTitle = state.currentWeek ? state.currentWeek.topic : "Clinical Mastery";
    if (state.topicMode === 'random') {
      if (state.evaluation) {
        topicTitle = `🎭 Unmasked: ${state.currentWeek ? state.currentWeek.topic : 'Mystery Case'}`;
      } else {
        topicTitle = "🎭 Mystery Walk-in Customer Encounter";
      }
    }

    const demoBanner = state.demoMode ? `
      <div style="background:#fffbeb; color:#92400e; padding:8px 12px; border-radius:8px; font-size:0.75rem; margin-bottom:12px; border:1px solid #fde68a; display:flex; justify-content:space-between; align-items:center;">
        <span>⚠️ <b>Offline Seed Mode:</b> Connected to local seed data. Deploy backend Code.gs to sync live Google Sheet scores.</span>
        <span style="font-weight:bold; font-size:0.7rem; background:#fef3c7; padding:2px 6px; border-radius:4px;">Demo</span>
      </div>` : '';

    const reviewTabHtml = (state.canReview && isMgr) ? `
      <button class="dpos-subtab ${state.currentTab === 'review' ? 'active' : ''}" onclick="window.DPOS.setTab('review')">
        📊 Review
      </button>` : '';

    const statusBadge = state.userScore && state.userScore.status === 'Completed'
      ? `<span style="background:#dcfce7; color:#166534; font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:6px;">✅ Completed</span>`
      : `<span style="background:#f1f5f9; color:#475569; font-size:0.7rem; font-weight:700; padding:3px 8px; border-radius:6px;">In Progress</span>`;

    root.innerHTML = `
      ${demoBanner}
      <!-- TOPIC SELECTOR TOGGLE (WEEKLY SPOTLIGHT VS RANDOM CASE CHALLENGE) -->
      <div style="display:flex; justify-content:center; margin-bottom:14px;">
        <div style="display:inline-flex; background:#f1f5f9; padding:4px; border-radius:12px; border:1px solid #e2e8f0; gap:4px; box-shadow:inset 0 1px 2px rgba(0,0,0,0.05);">
          <button type="button" class="dpos-mode-btn ${state.topicMode === 'weekly' ? 'active' : ''}" onclick="window.DPOS.setTopicMode('weekly')">
            📅 Weekly Spotlight
          </button>
          <button type="button" class="dpos-mode-btn ${state.topicMode === 'random' ? 'active' : ''}" onclick="window.DPOS.setTopicMode('random')">
            🎲 Random Case Challenge
          </button>
        </div>
      </div>

      <!-- HERO HEADER -->
      <div class="dpos-hero">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div>
            <div style="font-size:0.68rem; text-transform:uppercase; font-weight:800; color:#0d9488; letter-spacing:0.5px;">
              ${state.topicMode === 'weekly' ? 'DPOS Academy • Weekly Clinical Sprint' : '🎲 Infinite Clinical Challenge • Blind Mystery Encounter'}
            </div>
            <h2 style="margin:4px 0 6px 0; font-size:1.15rem; color:#0f172a; font-weight:800; line-height:1.3;">${escapeHtml(topicTitle)}</h2>
          </div>
          <div>${statusBadge}</div>
        </div>

        ${(state.currentWeek && state.currentWeek.isEmergencyRedFlag && (state.topicMode !== 'random' || state.evaluation)) ? `
          <div class="dpos-emergency-pulse" style="margin:8px 0;">
            🚨 <b>CRITICAL EMERGENCY RED FLAG:</b> Immediate triage and urgent medical/hospital referral required. Strictly DO NOT attempt OTC sale!
          </div>` : ''}

        <div style="font-size:0.75rem; color:#64748b; line-height:1.4;">
          ${state.topicMode === 'weekly' 
            ? 'Master clinical triage, safe OTC symptomatic relief, and 3.5% House Brand supplement recommendations with real-time AI speech simulation.' 
            : 'A mystery walk-in customer has arrived with an undisclosed health condition. Greet them, investigate their symptoms from scratch, navigate their personality and objections, and deliver the DPOS frontline protocol.'}
        </div>

        ${state.topicMode === 'random' ? `
          <div style="margin-top:10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <select id="dposDomainSelect" onchange="window.DPOS.generateNewRandomCase(this.value)" style="padding:6px 10px; font-size:0.72rem; font-weight:700; border-radius:6px; border:1px solid #cbd5e1; background:white; color:#1e293b; max-width:260px;">
              <option value="all" ${state.selectedDomain === 'all' ? 'selected' : ''}>🎲 All 10 Clinical Domains (Surprise Me!)</option>
              <option value="emergency" ${state.selectedDomain === 'emergency' ? 'selected' : ''}>🚨 Emergency Red Flags (Dengue/Chest Pain/Stroke)</option>
              <option value="git" ${state.selectedDomain === 'git' ? 'selected' : ''}>🫄 Gastrointestinal (GIT)</option>
              <option value="respiratory" ${state.selectedDomain === 'respiratory' ? 'selected' : ''}>🫁 Respiratory & ENT</option>
              <option value="musculoskeletal" ${state.selectedDomain === 'musculoskeletal' ? 'selected' : ''}>🦴 Musculoskeletal & Pain</option>
              <option value="dermatology" ${state.selectedDomain === 'dermatology' ? 'selected' : ''}>🧴 Dermatology & Wound</option>
              <option value="cardiometabolic" ${state.selectedDomain === 'cardiometabolic' ? 'selected' : ''}>❤️ Cardiometabolic Care</option>
              <option value="women" ${state.selectedDomain === 'women' ? 'selected' : ''}>🌸 Women's Health</option>
              <option value="men" ${state.selectedDomain === 'men' ? 'selected' : ''}>🧔 Men's Health</option>
              <option value="pediatrics" ${state.selectedDomain === 'pediatrics' ? 'selected' : ''}>🍼 Pediatrics & Seniors</option>
              <option value="eyes_oral" ${state.selectedDomain === 'eyes_oral' ? 'selected' : ''}>👁️ Eyes & Oral Care</option>
            </select>
            <button type="button" class="btn" style="background:#0d9488; color:white; padding:6px 12px; font-size:0.75rem; font-weight:800; border-radius:6px; border:none; cursor:pointer;" onclick="window.DPOS.generateNewRandomCase(document.getElementById('dposDomainSelect') ? document.getElementById('dposDomainSelect').value : 'all')">
              🎲 Roll New Customer
            </button>
          </div>` : ''}
      </div>

      <!-- SUB-NAVIGATION TABS -->
      <div class="dpos-subtabs">
        ${state.topicMode === 'weekly' ? `
          <button class="dpos-subtab ${state.currentTab === 'spotlight' ? 'active' : ''}" onclick="window.DPOS.setTab('spotlight')">
            📖 Spotlight
          </button>
          <button class="dpos-subtab ${state.currentTab === 'quiz' ? 'active' : ''}" onclick="window.DPOS.setTab('quiz')">
            📝 Quiz ${state.quizScore !== null ? `(${state.quizScore}/10)` : ''}
          </button>
          <button class="dpos-subtab ${state.currentTab === 'roleplay' ? 'active' : ''}" onclick="window.DPOS.setTab('roleplay')">
            🎙️ Role-Play
          </button>
        ` : `
          <button class="dpos-subtab active" onclick="window.DPOS.setTab('roleplay')">
            🎙️ Mystery Consultation (Blind Mode)
          </button>
        `}
        ${reviewTabHtml}
      </div>

      <!-- CONTENT CONTAINER -->
      <div id="dposContentContainer" style="margin-top:14px;"></div>
    `;

    renderSubTabContent();
  }

  function renderSubTabContent() {
    const container = document.getElementById("dposContentContainer");
    if (!container) return;

    const isMgr = (typeof isManagementOrPharmacist === 'function') ? isManagementOrPharmacist(currentUser) : false;
    if (state.currentTab === 'review' && (!state.canReview || !isMgr)) {
      state.currentTab = state.topicMode === 'random' ? 'roleplay' : 'spotlight';
    }
    if (state.topicMode === 'random' && (state.currentTab === 'spotlight' || state.currentTab === 'quiz')) {
      state.currentTab = 'roleplay';
    }

    if (state.currentTab === 'spotlight') {
      renderSpotlight(container);
    } else if (state.currentTab === 'quiz') {
      renderQuiz(container);
    } else if (state.currentTab === 'roleplay') {
      renderRolePlay(container);
    } else if (state.currentTab === 'review') {
      renderReview(container, state.selectedReviewTopic);
    }
  }

  // ─── TAB 1: CLINICAL SPOTLIGHT ─────────────────────────────────────────────
  function renderSpotlight(container) {
    const w = state.currentWeek || {};
    const summaryHtml = renderMarkdown(w.summaryMd || "");
    const skus = escapeHtml(w.skus || "");

    container.innerHTML = `
      <!-- DPOS PROTOCOL 4-STEP CARDS -->
      <div class="dpos-protocol-grid">
        <div class="dpos-step-card dpos-step-d">
          <div class="dpos-step-letter">D</div>
          <div class="dpos-step-body">
            <b>Diagnosis Triage</b>
            <span>Screen red flags first. Check kidneys, stomach, blood thinners & allergies.</span>
          </div>
        </div>
        <div class="dpos-step-card dpos-step-p">
          <div class="dpos-step-letter">P</div>
          <div class="dpos-step-body">
            <b>Prescribe Line</b>
            <span>Involve pharmacist for prescription interactions & chronic medical history.</span>
          </div>
        </div>
        <div class="dpos-step-card dpos-step-o">
          <div class="dpos-step-letter">O</div>
          <div class="dpos-step-body">
            <b>OTC Immediate Relief</b>
            <span>Fast comfort (e.g. Terrafast 500mg, Medicplast Heat Patch on intact skin).</span>
          </div>
        </div>
        <div class="dpos-step-card dpos-step-s">
          <div class="dpos-step-letter">S</div>
          <div class="dpos-step-body">
            <b>House Brand Supplement</b>
            <span>Root-cause joint health (JH Flexson, Livemore Flexmore) earning 3.5% commission.</span>
          </div>
        </div>
      </div>

      <!-- FOCUS SKUS PILL -->
      ${skus ? `
        <div style="background:#f0fdfa; border:1px solid #99f6e4; padding:10px 14px; border-radius:10px; margin-bottom:14px;">
          <div style="font-size:0.72rem; font-weight:800; color:#0f766e; text-transform:uppercase; margin-bottom:4px;">🎯 Focus House Brand SKUs This Week</div>
          <div style="font-size:0.82rem; color:#134e4a; font-weight:600; line-height:1.4;">${skus}</div>
        </div>` : ''}

      <!-- CLINICAL CHEAT SHEET -->
      <div class="dpos-card">
        <div class="dpos-markdown-body">
          ${summaryHtml}
        </div>
      </div>

      <!-- CTA TO QUIZ -->
      <div style="margin-top:16px; text-align:center;">
        <button class="btn btn-image" style="width:100%; max-width:380px; padding:12px 20px; font-size:0.9rem;" onclick="window.DPOS.setTab('quiz')">
          Ready? Take the 10-Question Active-Recall Quiz ➡️
        </button>
      </div>
    `;
  }

  // ─── TAB 2: ACTIVE-RECALL QUIZ ─────────────────────────────────────────────
  function renderQuiz(container) {
    const qList = state.quizQuestions;
    if (!qList || qList.length === 0) {
      container.innerHTML = `<div class="dpos-card" style="text-align:center; padding:30px; color:#666;">No quiz questions available for this module.</div>`;
      return;
    }

    // If quiz completed, show results screen
    if (state.quizIndex >= qList.length) {
      renderQuizResults(container);
      return;
    }

    const cur = qList[state.quizIndex];
    const total = qList.length;
    const progressPct = ((state.quizIndex + 1) / total) * 100;

    let optionsHtml = cur.options.map((opt, optIdx) => {
      let optClass = "dpos-quiz-option";
      let icon = `<span class="dpos-quiz-letter">${String.fromCharCode(65 + optIdx)}</span>`;
      
      if (state.quizAnswered) {
        if (optIdx === cur.answer) {
          optClass += " option-correct";
          icon = `<span class="dpos-quiz-letter" style="background:#22c55e; color:white;">✓</span>`;
        } else if (optIdx === state.quizSelectedOption) {
          optClass += " option-wrong";
          icon = `<span class="dpos-quiz-letter" style="background:#ef4444; color:white;">✕</span>`;
        } else {
          optClass += " option-disabled";
        }
      }

      return `
        <div class="${optClass}" onclick="window.DPOS.selectOption(${optIdx})">
          ${icon}
          <div style="flex:1; font-size:0.85rem; line-height:1.4;">${escapeHtml(opt)}</div>
        </div>
      `;
    }).join("");

    let feedbackHtml = '';
    if (state.quizAnswered) {
      const isCorrect = state.quizSelectedOption === cur.answer;
      feedbackHtml = `
        <div style="margin-top:14px; padding:12px; border-radius:10px; background:${isCorrect ? '#f0fdf4' : '#fef2f2'}; border:1px solid ${isCorrect ? '#86efac' : '#fca5a5'};">
          <div style="font-weight:800; font-size:0.85rem; color:${isCorrect ? '#15803d' : '#b91c1c'}; margin-bottom:4px;">
            ${isCorrect ? '🎉 Correct!' : '⚠️ Incorrect'}
          </div>
          <div style="font-size:0.78rem; color:#334155; line-height:1.4; margin-bottom:6px;">
            <b>Clinical Rationale:</b> ${escapeHtml(cur.rationale)}
          </div>
          ${cur.safety ? `
            <div style="font-size:0.74rem; color:#0f766e; background:#ccfbf1; padding:6px 10px; border-radius:6px; font-weight:600; line-height:1.3;">
              🛡️ <b>Safety Check:</b> ${escapeHtml(cur.safety)}
            </div>` : ''}
          <div style="text-align:right; margin-top:10px;">
            <button class="btn" style="background:#0d9488; color:white; padding:8px 18px; font-size:0.82rem; font-weight:bold;" onclick="window.DPOS.nextQuestion()">
              ${state.quizIndex + 1 < total ? 'Next Scenario ➡️' : 'View Quiz Score 🏆'}
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="dpos-card">
        <!-- PROGRESS BAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:0.72rem; font-weight:800; color:#0d9488; text-transform:uppercase;">Scenario ${state.quizIndex + 1} of ${total}</span>
          <span style="font-size:0.72rem; font-weight:700; color:#64748b;">${Math.round(progressPct)}%</span>
        </div>
        <div style="width:100%; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; margin-bottom:14px;">
          <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #0d9488, #14b8a6); border-radius:3px; transition:width 0.3s ease;"></div>
        </div>

        <!-- QUESTION -->
        <div style="font-size:0.92rem; font-weight:700; color:#1e293b; line-height:1.45; margin-bottom:14px;">
          ${escapeHtml(cur.q)}
        </div>

        <!-- OPTIONS -->
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${optionsHtml}
        </div>

        <!-- FEEDBACK -->
        ${feedbackHtml}
      </div>
    `;
  }

  function renderQuizResults(container) {
    const total = state.quizQuestions.length;
    const correctCount = state.quizUserAnswers.filter(a => a.isCorrect).length;
    const scoreOut10 = Math.round((correctCount / total) * 10);
    state.quizScore = scoreOut10;

    // Save quiz score immediately
    saveTeammateScore(scoreOut10, null, null, null);

    const isPass = scoreOut10 >= 7;

    container.innerHTML = `
      <div class="dpos-card" style="text-align:center; padding:30px 20px;">
        <div style="font-size:3rem; margin-bottom:6px;">${isPass ? '🌟' : '📚'}</div>
        <h3 style="margin:0 0 6px 0; color:#0f172a; font-size:1.25rem;">Quiz Completed!</h3>
        <div style="font-size:2rem; font-weight:800; color:${isPass ? '#0d9488' : '#e11d48'}; margin-bottom:6px;">
          ${scoreOut10} / 10
        </div>
        <div style="font-size:0.85rem; color:#475569; max-width:360px; margin:0 auto 16px auto; line-height:1.4;">
          ${isPass 
            ? 'Great job! You showed solid mastery of clinical triage, red-flag screening, and House Brand formulation safety.' 
            : 'Keep reviewing the clinical spotlight. We recommend scoring at least 7/10 before customer consultations.'}
        </div>

        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button class="btn" style="background:#f1f5f9; color:#334155; padding:10px 16px; font-size:0.82rem; font-weight:bold;" onclick="window.DPOS.retakeQuiz()">
            🔄 Retake Quiz
          </button>
          <button class="btn btn-image" style="padding:10px 20px; font-size:0.82rem; font-weight:bold;" onclick="window.DPOS.setTab('roleplay')">
            Proceed to Voice Role-Play 🎙️
          </button>
        </div>
      </div>
    `;
  }

  // ─── TAB 3: TWO-WAY VOICE ROLE-PLAY ────────────────────────────────────────
  function renderRolePlay(container) {
    const rawPersona = (state.currentWeek && state.currentWeek.persona) || "";
    const persona = splitPersona(rawPersona);
    const customerLabel = getPersonaCustomerLabel(rawPersona);
    const gender = detectPersonaGender(rawPersona);
    const turns = state.rolePlayTurns;
    const userTurns = turns.filter(t => t.speaker === 'user');
    const userTurnCount = userTurns.length;
    const canEvaluate = userTurnCount >= 3;
    const arch = (state.currentWeek && state.currentWeek.customerArchetype) || (state.weeklyTopic && state.weeklyTopic.customerArchetype) || null;

    let chatHtml = turns.map(t => {
      const isUser = t.speaker === 'user';
      const langBadge = t.lang ? getLangBadgeLabel(t.lang) : '';
      return `
        <div class="dpos-bubble ${isUser ? 'bubble-user' : 'bubble-customer'}">
          <div class="bubble-meta">
            <span>${isUser ? '👤 You (Teammate)' : escapeHtml(customerLabel)}</span>
            ${langBadge ? `<span class="badge-lang">${escapeHtml(langBadge)}</span>` : ''}
          </div>
          <div class="bubble-text">${escapeHtml(t.text)}</div>
          ${!isUser ? `
            <div style="margin-top:6px; text-align:right;">
              <button type="button" class="btn-replay" onclick="window.DPOS.replaySpeech('${escapeHtml(t.text.replace(/'/g, "\\'"))}', '${t.lang || 'ms'}')">
                🔊 Listen Again
              </button>
            </div>` : ''}
        </div>
      `;
    }).join("");

    if (turns.length === 0) {
      if (state.topicMode === 'random') {
        chatHtml = `
          <div style="text-align:center; padding:32px 14px; color:#64748b;">
            <div style="font-size:2.5rem; margin-bottom:8px;">🚶‍♂️🔔</div>
            <div style="font-weight:800; color:#0f172a; font-size:1.05rem; margin-bottom:4px;">A Customer Just Walked In!</div>
            <div style="font-size:0.78rem; color:#475569; max-width:440px; margin:0 auto; line-height:1.5;">
              <b>Blind Clinical Simulation:</b> You do not know their health condition or personality yet.<br>
              Hold the microphone button below to greet them:<br>
              <span style="color:#0d9488; font-weight:700; font-size:0.82rem;">&ldquo;Selamat pagi! Ada apa boleh saya bantu?&rdquo;</span><br>
              <span style="color:#0d9488; font-weight:700; font-size:0.82rem;">&ldquo;早安！请问有什么可以帮您？&rdquo;</span><br>
              Investigate their symptoms and navigate their objections from scratch.
            </div>
          </div>
        `;
      } else {
        chatHtml = `
          <div style="text-align:center; padding:30px 14px; color:#64748b;">
            <div style="font-size:2rem; margin-bottom:6px;">👋</div>
            <div style="font-weight:700; color:#334155; margin-bottom:4px;">Ready to start consultation?</div>
            <div style="font-size:0.75rem; line-height:1.4;">
              Press and hold the button to speak in <b>Mandarin</b>, <b>Bahasa Melayu</b>, or <b>English</b>.<br>
              The customer will automatically match your language, jab with realistic questions, and respond in character.
            </div>
          </div>
        `;
      }
    }

    // Evaluation modal / card if ready
    let evalHtml = '';
    if (state.evaluation) {
      const ev = state.evaluation;
      const bInfo = computeBadge(ev.totalScore !== undefined ? ev.totalScore : 0);
      const isRandomMode = state.topicMode === 'random';

      evalHtml = `
        <div class="dpos-card" style="border:2px solid #0d9488; margin-top:16px;">
          ${isRandomMode ? `
            <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:10px; padding:12px; margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:0.7rem; font-weight:800; color:#15803d; text-transform:uppercase;">🎭 Mystery Clinical Case Unmasked</div>
                <span style="font-size:0.65rem; background:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px; font-weight:800;">Case Solved</span>
              </div>
              <div style="font-size:1.1rem; font-weight:800; color:#0f172a; margin-top:4px;">
                ${escapeHtml(state.currentWeek.topic)}
              </div>
              <div style="font-size:0.75rem; color:#334155; margin-top:5px; line-height:1.45;">
                <b>Customer Encountered:</b> ${escapeHtml(state.currentWeek.customerName || 'Walk-in Customer')}<br>
                <b>Target House Brand SKUs:</b> ${escapeHtml(state.currentWeek.skus || 'Jase Healthcare')}
              </div>
              ${state.currentWeek.summaryMd ? `
                <div style="margin-top:8px; font-size:0.75rem; color:#166534; background:white; padding:8px 10px; border-radius:6px; border:1px solid #bbf7d0;">
                  <b>Clinical Debrief:</b>
                  <div style="margin-top:4px; line-height:1.45; color:#334155;">
                    ${renderMarkdown(state.currentWeek.summaryMd)}
                  </div>
                </div>` : ''}
            </div>` : `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; margin-bottom:14px;">
              <div style="font-size:0.7rem; font-weight:800; color:#0369a1; text-transform:uppercase;">🎭 Weekly Spotlight Consultation</div>
              <div style="font-size:0.9rem; font-weight:800; color:#0f172a; margin-top:2px;">
                ${escapeHtml(state.currentWeek.customerName || (persona && persona.visibleText ? persona.visibleText.split(',')[0] : 'Walk-in Customer'))}
              </div>
              <div style="font-size:0.75rem; color:#475569; margin-top:3px; line-height:1.4;">
                <b>House Brand Focus:</b> ${escapeHtml(state.currentWeek.skus || 'Jase Healthcare')}
              </div>
            </div>`}

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-weight:800; font-size:1rem; color:#0f172a;">🏆 Consultation Evaluation</div>
            <span class="dpos-badge ${bInfo.class}">${bInfo.icon} ${bInfo.badge} (${ev.totalScore}/100)</span>
          </div>

          <div style="display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap;">
            <div style="flex:1; min-width:140px; background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0;">
              <div style="font-size:0.65rem; color:#64748b; font-weight:700; text-transform:uppercase;">Speaking Confidence</div>
              <div style="font-size:0.85rem; font-weight:800; color:#0d9488;">${escapeHtml(ev.speakingConfidence || 'Developing')}</div>
            </div>
            <div style="flex:1; min-width:140px; background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0;">
              <div style="font-size:0.65rem; color:#64748b; font-weight:700; text-transform:uppercase;">Language Spoken</div>
              <div style="font-size:0.85rem; font-weight:800; color:#475569;">${escapeHtml(ev.languageUsed || 'Bahasa Melayu')}</div>
            </div>
          </div>

          <!-- RUBRIC BREAKDOWN (100 PTS) -->
          <div style="font-size:0.75rem; font-weight:800; color:#334155; margin-bottom:6px; text-transform:uppercase;">PMG Frontline Rubric Breakdown:</div>
          <div class="dpos-rubric-list">
            <div class="dpos-rubric-item">
              <span>Vocal Warmth & Intonation</span>
              <b>${ev.breakdown.warmth ?? 0} / 10</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Fluency & Confidence</span>
              <b>${ev.breakdown.fluency ?? 0} / 10</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Empathy & Listening</span>
              <b>${ev.breakdown.empathy ?? 0} / 10</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Clinical DPOS & House Brand Explanation</span>
              <b>${ev.breakdown.dpos ?? 0} / 35</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Cashier GWP / PWP Pitch</span>
              <b>${ev.breakdown.pwp ?? 0} / 15</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Loyalty & Senior Care Plus (28th Free Glucose)</span>
              <b>${ev.breakdown.membership ?? 0} / 20</b>
            </div>
          </div>

          <!-- UNIVERSAL CLINICAL INTEGRITY & SAFETY AUDIT -->
          ${ev.clinicalIntegrity && ev.clinicalIntegrity.issues && ev.clinicalIntegrity.issues.length > 0 ? `
            <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:12px; margin-top:14px;">
              <div style="font-size:0.75rem; font-weight:800; color:#b45309; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <span style="font-size:1rem;">🛡️</span>
                <span>Clinical Integrity & Safety Audit (${ev.clinicalIntegrity.issues.length} Issues Detected)</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${ev.clinicalIntegrity.issues.map(iss => `
                  <div style="background:white; border-left:3px solid #d97706; padding:8px 10px; border-radius:4px; font-size:0.75rem; color:#78350f; line-height:1.45;">
                    <div style="font-weight:800; color:#92400e; margin-bottom:2px;">⚠️ ${escapeHtml(iss.title)} (-${iss.deduction || 5} pts)</div>
                    <div style="margin-bottom:3px; color:#475569;"><b>What staff said:</b> <i>&ldquo;${escapeHtml(iss.stated || '')}&rdquo;</i></div>
                    <div style="color:#166534; font-weight:600;"><b>Clinical Fact:</b> ${escapeHtml(iss.correction)}</div>
                  </div>
                `).join('')}
              </div>
            </div>` : (ev.clinicalIntegrity && ev.clinicalIntegrity.passed ? `
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:10px 12px; margin-top:14px; display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.1rem;">🛡️</span>
              <div style="font-size:0.75rem; color:#166534; font-weight:700;">
                <b>Clinical Integrity Verified:</b> Accurate pharmacology, safe contraindication screening, and zero allergen or formulation errors detected.
              </div>
            </div>` : '')}

          <!-- PART A: WHAT YOU MISSED (POINT BREAKDOWN) -->
          <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:12px; margin-top:14px;">
            <div style="font-size:0.75rem; font-weight:800; color:#be123c; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <span style="font-size:1rem;">❌</span>
              <span>What You Missed (Point Breakdown)</span>
            </div>
            <ul style="margin:0; padding-left:20px; font-size:0.75rem; color:#9f1239; line-height:1.5;">
              ${(ev.missedItems && ev.missedItems.length > 0 ? ev.missedItems : [ev.coachingTip || "No criteria missed."]).map(item => `<li style="margin-bottom:4px;">${escapeHtml(item)}</li>`).join('')}
            </ul>
          </div>

          <!-- PART B: EXACTLY WHAT TO SAY NEXT TIME (EXAMPLE DIALOGUE) -->
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px; margin-top:10px;">
            <div style="font-size:0.75rem; font-weight:800; color:#15803d; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <span style="font-size:1rem;">💬</span>
              <span>Exactly What to Say Next Time (Example Dialogue)</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${(ev.exampleDialogue && ev.exampleDialogue.length > 0 ? ev.exampleDialogue : ["Practice asking about red flags and offering counter promotions before payment."]).map(line => `
                <div style="background:white; border-left:3px solid #16a34a; padding:6px 10px; border-radius:4px; font-size:0.75rem; color:#166534; font-style:italic; line-height:1.45;">
                  &ldquo;${escapeHtml(line)}&rdquo;
                </div>
              `).join('')}
            </div>
          </div>

          <div style="text-align:right; margin-top:14px;">
            <button class="btn" style="background:#0d9488; color:white; padding:8px 16px; font-size:0.8rem; font-weight:bold;" onclick="window.DPOS.resetRolePlay()">
              🔄 Try Scenario Again
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- SCENARIO BRIEF (HIDDEN IN BLIND RANDOM CHALLENGE MODE) -->
      ${state.topicMode === 'random' ? '' : `
      <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:10px 12px; border-radius:10px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:0.7rem; font-weight:800; color:#1d4ed8; text-transform:uppercase;">🎭 Live Customer Encounter • Weekly Spotlight</div>
          <span style="font-size:0.65rem; background:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:4px; font-weight:700;">Humanoid AI Voice</span>
        </div>
        <div style="font-size:0.8rem; color:#1e3a8a; font-weight:600; margin-top:3px; line-height:1.35;">
          ${escapeHtml(persona.visibleText)}
        </div>
      </div>
      `}

      <!-- CHAT CONVERSATION CONTAINER -->
      <div class="dpos-chat-box" id="dposChatBox">
        ${chatHtml}
      </div>

      <!-- WAVEFORM CANVAS & TIMER -->
      <div style="margin:10px 0; text-align:center;">
        <canvas id="dposWaveform" width="300" height="36" style="background:#f1f5f9; border-radius:18px; max-width:100%; display:${state.isRecording ? 'inline-block' : 'none'};"></canvas>
        <div id="dposRecordingTimer" style="font-size:0.75rem; font-weight:800; color:#e11d48; margin-top:2px; display:${state.isRecording ? 'block' : 'none'};">
          🔴 Recording: ${state.recordingSeconds}s / 45s (Release to Send)
        </div>
      </div>

      <!-- CONTROLS -->
      <div id="dposMicControls" class="dpos-mic-controls">
        <button id="dposMicBtn" class="dpos-mic-btn ${state.isRecording ? 'mic-recording' : ''}" type="button">
          <span style="font-size:1.4rem;">${state.isRecording ? '🔴' : '🎙️'}</span>
          <span id="dposMicBtnText">${state.isRecording ? 'Release to Send' : 'Hold to Speak'}</span>
        </button>
        <div style="font-size:0.7rem; color:#64748b; text-align:center;">
          Press & hold button while speaking • Release to send • Customer matches your language
        </div>
        <div id="dposHoldTip" class="dpos-hold-tip" style="display:none;"></div>
        
        ${!state.evaluation ? `
          <div style="margin-top:10px; width:100%; text-align:center;">
            <button class="btn btn-image" style="width:100%; max-width:400px; padding:12px 20px; font-size:0.85rem; font-weight:bold; background:${canEvaluate ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#94a3b8'}; cursor:${canEvaluate ? 'pointer' : 'not-allowed'};" onclick="window.DPOS.evaluateRolePlay()" ${(!canEvaluate || state.isEvaluating) ? 'disabled' : ''}>
              ${state.isEvaluating 
                ? '⏳ AI Rigorous Evaluation in Progress...' 
                : (canEvaluate 
                    ? '🏁 End & Evaluate Consultation (100 pts)' 
                    : `🏁 Complete Min 3 Consultation Turns to Evaluate (${userTurnCount}/3)`)}
            </button>
            ${!canEvaluate ? `
              <div style="font-size:0.68rem; color:#64748b; margin-top:4px;">
                Complete clinical consultation steps (Triage ➡️ House Brand Supplement ➡️ Cashier Loyalty) before evaluating.
              </div>` : ''}
          </div>` : ''}
      </div>

      <!-- EVALUATION RESULTS -->
      ${evalHtml}
    `;

    // Attach mic button handlers and scroll chat
    setupMicButton();
    scrollChatToBottom();
  }

  // ─── TAB 4: PHARMACIST-IN-CHARGE REVIEW DASHBOARD ─────────────────────────
  async function renderReview(container, topicToFetch) {
    const isMgr = (typeof isManagementOrPharmacist === 'function') ? isManagementOrPharmacist(currentUser) : false;
    if (!state.canReview || !isMgr) {
      container.innerHTML = `
        <div class="dpos-card" style="text-align:center; padding:30px 16px; color:#64748b;">
          🔒 <b>Access Restricted:</b> The Review Dashboard is strictly reserved for the Pharmacist-in-Charge and Management.
        </div>
      `;
      state.currentTab = 'spotlight';
      return;
    }

    if (topicToFetch) {
      state.selectedReviewTopic = topicToFetch;
    }

    container.innerHTML = `<div style="text-align:center; padding:30px; color:#666;">🔄 Syncing team assessment scores and weekly sales...</div>`;

    let reviewData = null;
    try {
      const u = (typeof currentUser !== 'undefined' && currentUser && currentUser.username) || '';
      const r = (typeof currentUser !== 'undefined' && currentUser && currentUser.role) || '';
      const res = await dposApi('dposGetReview', { 
        username: u, 
        role: r, 
        topicTitle: state.selectedReviewTopic || '' 
      });
      if (res && res.success) {
        reviewData = res;
      } else {
        throw new Error(res.message || "Failed to load review roster");
      }
    } catch (e) {
      console.warn("dposGetReview error:", e);
      container.innerHTML = `
        <div class="dpos-card" style="text-align:center; padding:30px 16px; color:#64748b;">
          <div style="font-size:2rem; margin-bottom:8px;">⚠️</div>
          <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">Unable to load team review roster</div>
          <div style="font-size:0.75rem; color:#ef4444; margin-bottom:14px;">${escapeHtml(e.message || "Could not connect to Google Sheets.")}</div>
          <button type="button" class="btn" style="background:#0d9488; color:white; padding:8px 16px; font-size:0.8rem; font-weight:bold;" onclick="window.DPOS.setTab('review')">
            🔄 Retry Sync
          </button>
        </div>
      `;
      return;
    }

    state.selectedReviewTopic = reviewData.topicTitle;
    const roster = reviewData.roster || [];
    state.reviewRoster = roster;
    const totalCount = roster.length;
    const completedCount = roster.filter(r => r.status === 'Completed').length;
    const coachingCount = roster.filter(r => r.needsCoaching).length;

    const availableTopics = (reviewData.availableTopics && reviewData.availableTopics.length > 0) 
      ? reviewData.availableTopics 
      : [{ title: reviewData.topicTitle, submissionsCount: completedCount, isActive: true }];

    const isHistorical = reviewData.activeTopic && (reviewData.topicTitle.toLowerCase() !== reviewData.activeTopic.toLowerCase());

    let rowsHtml = roster.map((r, idx) => {
      const isComplete = r.status === 'Completed';
      const rowClass = r.needsCoaching ? (isComplete ? 'row-coaching-amber' : 'row-coaching-red') : '';
      
      const qDisplay = r.quizScore !== null ? `${r.quizScore}/10` : `<span style="color:#ef4444; font-weight:bold;">Pending</span>`;
      let rpDisplay = r.rolePlayScore !== null ? `${r.rolePlayScore}/100` : `<span style="color:#ef4444; font-weight:bold;">Pending</span>`;
      if (r.transcript || r.coachingTip || r.breakdown) {
        rpDisplay += `<br><button type="button" class="btn" style="background:#f0fdf4; color:#0d9488; border:1px solid #99f6e4; padding:3px 8px; font-size:0.65rem; font-weight:700; border-radius:4px; margin-top:4px; cursor:pointer;" onclick="window.DPOS.openReviewTranscript(${idx})">📄 View Dialogue Transcript</button>`;
      }
      
      return `
        <tr class="${rowClass}">
          <td style="text-align:left;">
            <b>${escapeHtml(r.name)}</b><br>
            <span style="font-size:0.65rem; color:#64748b;">${escapeHtml(r.role)}</span>
          </td>
          <td style="font-weight:700;">${qDisplay}</td>
          <td style="font-weight:700;">${rpDisplay}</td>
          <td>${escapeHtml(r.language)}</td>
          <td>${escapeHtml(r.confidence)}</td>
          <td><b>RM ${(r.weeklyHb || 0).toLocaleString()}</b><br><span style="font-size:0.65rem; color:#64748b;">${r.weeklyHbPct || '0.0'}% HB</span></td>
          <td>
            <span class="dpos-status-badge ${isComplete ? 'status-done' : 'status-pending'}">
              ${escapeHtml(r.status)}
            </span>
          </td>
        </tr>
      `;
    }).join("");

    container.innerHTML = `
      <div class="dpos-card">
        <!-- TOPIC SELECTOR & HISTORICAL WEEKS SWITCHER -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:1rem;">📅</span>
              <span style="font-size:0.75rem; font-weight:800; color:#334155; text-transform:uppercase;">Topic Review Selector:</span>
            </div>
            <div style="font-size:0.75rem; color:#64748b;">
              Showing: <b style="color:#0f172a;">${escapeHtml(reviewData.topicTitle)}</b>
              ${isHistorical 
                ? '<span style="background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:4px; font-weight:700; margin-left:6px; font-size:0.68rem;">📁 Previous Week Archive</span>' 
                : '<span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:4px; font-weight:700; margin-left:6px; font-size:0.68rem;">⭐ Current Active Week</span>'}
            </div>
          </div>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <select id="dposReviewTopicSelect" style="flex:1; min-width:240px; padding:7px 10px; font-size:0.8rem; font-weight:700; border:1px solid #cbd5e1; border-radius:6px; background:white; color:#0f172a; cursor:pointer;" onchange="window.DPOS.changeReviewTopic(this.value)">
              ${availableTopics.map(t => {
                const isSelected = t.title.toLowerCase() === reviewData.topicTitle.toLowerCase();
                const prefix = t.isActive ? '⭐ [Active Week] ' : '📁 [Past Week] ';
                return `<option value="${escapeHtml(t.title)}" ${isSelected ? 'selected' : ''}>${prefix}${escapeHtml(t.title)} (${t.submissionsCount} assessed)</option>`;
              }).join('')}
            </select>

            <!-- Quick Pill Buttons for Instant Switching -->
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${availableTopics.slice(0, 5).map(t => {
                const isSelected = t.title.toLowerCase() === reviewData.topicTitle.toLowerCase();
                const shortLabel = (t.title.split(':')[0] || t.title).trim();
                return `
                  <button type="button" class="btn" style="padding:5px 10px; font-size:0.72rem; font-weight:800; border-radius:6px; cursor:pointer; transition:all 0.15s ease; ${isSelected ? 'background:#0d9488; color:white; border:1px solid #0d9488; box-shadow:0 1px 3px rgba(13,148,136,0.3);' : 'background:white; color:#475569; border:1px solid #cbd5e1;'}" onclick="window.DPOS.changeReviewTopic('${escapeHtml(t.title).replace(/'/g, "\\'")}')">
                    ${t.isActive ? '⭐ ' : '📁 '}${escapeHtml(shortLabel)} (${t.submissionsCount})
                  </button>
                `;
              }).join('')}
              <button type="button" class="btn" style="background:#e2e8f0; color:#334155; border:none; padding:5px 10px; font-size:0.72rem; font-weight:700; border-radius:6px; cursor:pointer;" onclick="window.DPOS.changeReviewTopic(document.getElementById('dposReviewTopicSelect').value)">
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap:8px;">
          <div>
            <div style="font-size:0.7rem; font-weight:800; color:#0d9488; text-transform:uppercase;">Pharmacist-in-Charge Review Dashboard</div>
            <h3 style="margin:2px 0 4px 0; color:#0f172a; font-size:1.05rem;">${escapeHtml(reviewData.topicTitle)}</h3>
            <div style="font-size:0.75rem; color:#64748b;">Sales Week: <b>${escapeHtml(reviewData.weekRange)}</b> (Kota Sentosa)</div>
          </div>
          <div style="display:flex; gap:6px;">
            <span style="background:#dcfce7; color:#166534; font-size:0.7rem; font-weight:800; padding:4px 8px; border-radius:6px;">
              ${completedCount}/${totalCount} Completed
            </span>
            ${coachingCount > 0 ? `
              <span style="background:#fee2e2; color:#991b1b; font-size:0.7rem; font-weight:800; padding:4px 8px; border-radius:6px;">
                ${coachingCount} Need Coaching
              </span>` : ''}
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table class="dpos-table">
            <thead>
              <tr>
                <th style="text-align:left;">Teammate</th>
                <th>Quiz (/10)</th>
                <th>Role-Play (/100)</th>
                <th>Language</th>
                <th>Confidence</th>
                <th>Week HB</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <div style="margin-top:12px; font-size:0.7rem; color:#64748b; line-height:1.35;">
          • <span style="display:inline-block; width:10px; height:10px; background:#fee2e2; border-radius:2px; vertical-align:middle;"></span> Red row: Incomplete training.<br>
          • <span style="display:inline-block; width:10px; height:10px; background:#fef3c7; border-radius:2px; vertical-align:middle;"></span> Amber row: Quiz &lt; 7/10 or Role-Play &lt; 70 pts. Frontline coaching recommended.
        </div>
      </div>
    `;
  }

  function changeReviewTopic(topic) {
    state.selectedReviewTopic = topic;
    const container = document.getElementById("dposContentContainer");
    if (container) {
      renderReview(container, topic);
    }
  }

  function openReviewTranscript(idx) {
    const r = (state.reviewRoster && state.reviewRoster[idx]);
    if (!r) return;

    let parsedBreakdown = null;
    let missedItems = [];
    let exampleDialogue = [];
    let audioMetrics = null;
    let clinicalIntegrity = null;

    if (r.breakdown) {
      try {
        parsedBreakdown = typeof r.breakdown === 'string' ? JSON.parse(r.breakdown) : r.breakdown;
        if (parsedBreakdown) {
          missedItems = parsedBreakdown.missed_items || parsedBreakdown.missedItems || [];
          exampleDialogue = parsedBreakdown.example_dialogue || parsedBreakdown.exampleDialogue || [];
          audioMetrics = parsedBreakdown.audio_metrics || null;
          clinicalIntegrity = parsedBreakdown.clinical_integrity || parsedBreakdown.clinicalIntegrity || null;
        }
      } catch (err) {
        parsedBreakdown = null;
      }
    }

    const transcriptLines = (r.transcript || '').split('\n').filter(l => l.trim().length > 0);

    const warmthScore = (audioMetrics && audioMetrics.warmth) || (parsedBreakdown && parsedBreakdown.warmth) || 8;
    const fluencyScore = (audioMetrics && audioMetrics.fluency) || (parsedBreakdown && parsedBreakdown.fluency) || 8;
    const fillerWords = (audioMetrics && audioMetrics.fillers !== undefined) ? `${audioMetrics.fillers} detected` : 'None detected (Fluent)';
    const confidenceRating = r.confidence || (audioMetrics && audioMetrics.confidence) || 'High (8.0/10)';

    let turnsHtml = '';
    if (transcriptLines.length > 0) {
      turnsHtml = transcriptLines.map((line, lIdx) => {
        const isTeammate = /^teammate\s*:/i.test(line);
        const isCustomer = /^customer\s*:/i.test(line);
        let speaker = isTeammate ? `Teammate (${r.name})` : (isCustomer ? 'Walk-in Customer' : '');
        let cleanText = line.replace(/^(teammate|customer)\s*:\s*/i, '');
        
        if (isTeammate) {
          return `
            <div style="margin-bottom:10px; display:flex; flex-direction:column; align-items:flex-end;">
              <span style="font-size:0.65rem; color:#0d9488; font-weight:700; margin-bottom:2px;">👤 Turn ${lIdx + 1}: ${escapeHtml(speaker)}</span>
              <div style="background:#ccfbf1; color:#0f766e; border:1px solid #99f6e4; padding:8px 12px; border-radius:12px 12px 2px 12px; max-width:88%; font-size:0.8rem; line-height:1.4;">
                ${escapeHtml(cleanText)}
              </div>
            </div>
          `;
        } else if (isCustomer) {
          return `
            <div style="margin-bottom:10px; display:flex; flex-direction:column; align-items:flex-start;">
              <span style="font-size:0.65rem; color:#475569; font-weight:700; margin-bottom:2px;">👴/👵 Turn ${lIdx + 1}: ${escapeHtml(speaker)}</span>
              <div style="background:#f1f5f9; color:#1e293b; border:1px solid #e2e8f0; padding:8px 12px; border-radius:12px 12px 12px 2px; max-width:88%; font-size:0.8rem; line-height:1.4;">
                ${escapeHtml(cleanText)}
              </div>
            </div>
          `;
        } else {
          return `
            <div style="margin-bottom:8px; font-size:0.75rem; color:#64748b; font-style:italic;">
              ${escapeHtml(line)}
            </div>
          `;
        }
      }).join('');
    } else {
      turnsHtml = `<div style="text-align:center; padding:16px; color:#94a3b8; font-size:0.8rem;">No transcript recorded for this session.</div>`;
    }

    let rubricGridHtml = '';
    if (parsedBreakdown) {
      const b = parsedBreakdown.breakdown || parsedBreakdown;
      rubricGridHtml = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-bottom:12px;">
          <div style="font-size:0.72rem; font-weight:800; color:#334155; margin-bottom:8px; text-transform:uppercase;">📊 Frontline Rubric Marks (/100)</div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:6px; font-size:0.72rem;">
            <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
              <span style="color:#64748b;">Warmth:</span> <b>${b.warmth ?? '-'}/10</b>
            </div>
            <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
              <span style="color:#64748b;">Fluency:</span> <b>${b.fluency ?? '-'}/10</b>
            </div>
            <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
              <span style="color:#64748b;">Empathy:</span> <b>${b.empathy ?? '-'}/10</b>
            </div>
            <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
              <span style="color:#64748b;">Clinical DPOS:</span> <b>${b.dpos ?? '-'}/35</b>
            </div>
            <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
              <span style="color:#64748b;">GWP / PWP:</span> <b>${b.pwp ?? '-'}/15</b>
            </div>
            <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
              <span style="color:#64748b;">Loyalty & SCP:</span> <b>${b.membership ?? '-'}/20</b>
            </div>
          </div>
        </div>
      `;
    }

    let clinicalAuditHtml = '';
    if (clinicalIntegrity && clinicalIntegrity.issues && clinicalIntegrity.issues.length > 0) {
      clinicalAuditHtml = `
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px 12px; margin-bottom:12px;">
          <div style="font-size:0.72rem; font-weight:800; color:#b45309; margin-bottom:6px; text-transform:uppercase;">🛡️ Clinical & Pharmacological Integrity Audit (${clinicalIntegrity.issues.length} Notice${clinicalIntegrity.issues.length > 1 ? 's' : ''})</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${clinicalIntegrity.issues.map(iss => `
              <div style="background:white; border-left:3px solid #d97706; padding:6px 8px; border-radius:4px; font-size:0.72rem; color:#78350f; line-height:1.4;">
                <div style="font-weight:800; color:#92400e;">⚠️ ${escapeHtml(iss.title)} (-${iss.deduction || 5} pts)</div>
                <div style="color:#475569; margin:2px 0;"><b>Staff said:</b> <i>&ldquo;${escapeHtml(iss.stated || '')}&rdquo;</i></div>
                <div style="color:#166534; font-weight:600;"><b>Clinical Fact:</b> ${escapeHtml(iss.correction)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (clinicalIntegrity && clinicalIntegrity.passed) {
      clinicalAuditHtml = `
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:8px 12px; margin-bottom:12px; font-size:0.72rem; color:#166534; font-weight:700;">
          🛡️ <b>Clinical Integrity Verified:</b> No contraindications violated, accurate product ingredients, and sound pharmacology demonstrated.
        </div>
      `;
    }

    let deductionsHtml = '';
    if (missedItems.length > 0) {
      deductionsHtml = `
        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:8px; padding:10px 12px; margin-bottom:12px;">
          <div style="font-size:0.72rem; font-weight:800; color:#be123c; margin-bottom:6px; text-transform:uppercase;">❌ Line-by-Line Deductions & Criteria Missed</div>
          <ul style="margin:0; padding-left:18px; font-size:0.75rem; color:#9f1239; line-height:1.45;">
            ${missedItems.map(m => `<li style="margin-bottom:3px;">${escapeHtml(m)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    let scriptHtml = '';
    if (exampleDialogue.length > 0) {
      scriptHtml = `
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 12px; margin-bottom:12px;">
          <div style="font-size:0.72rem; font-weight:800; color:#15803d; margin-bottom:6px; text-transform:uppercase;">💬 Recommended Coaching Script (What Staff Should Say)</div>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem; color:#166534; font-style:italic;">
            ${exampleDialogue.map(d => `<div style="background:white; border-left:3px solid #16a34a; padding:4px 8px; border-radius:4px;">&ldquo;${escapeHtml(d)}&rdquo;</div>`).join('')}
          </div>
        </div>
      `;
    }

    let modalEl = document.getElementById("dposReviewTranscriptModal");
    if (!modalEl) {
      modalEl = document.createElement("div");
      modalEl.id = "dposReviewTranscriptModal";
      document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = `
      <div style="position:fixed; inset:0; background:rgba(15,23,42,0.65); z-index:99999; display:flex; align-items:center; justify-content:center; padding:12px; backdrop-filter:blur(2px);" onclick="if(event.target === this) window.DPOS.closeReviewTranscript()">
        <div style="background:white; border-radius:12px; max-width:600px; width:100%; max-height:90vh; display:flex; flex-direction:column; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3); overflow:hidden;">
          <div style="padding:14px 16px; background:#0f172a; color:white; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.65rem; font-weight:800; color:#2dd4bf; text-transform:uppercase;">Pharmacist Consultation Inspector</div>
              <h3 style="margin:2px 0 0 0; font-size:1rem; color:white;">${escapeHtml(r.name)} (${escapeHtml(r.role)})</h3>
            </div>
            <button type="button" onclick="window.DPOS.closeReviewTranscript()" style="background:transparent; border:none; color:#94a3b8; font-size:1.4rem; cursor:pointer; line-height:1; padding:0 4px;">&times;</button>
          </div>
          
          <div style="padding:14px 16px; overflow-y:auto; flex:1;">
            <!-- SCORE & ACOUSTIC RATING -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:10px 12px; background:#f0fdfa; border:1px solid #ccfbf1; border-radius:8px;">
              <div>
                <span style="font-size:0.7rem; color:#64748b;">Role-Play Score:</span>
                <span style="font-size:1.2rem; font-weight:800; color:#0f766e; margin-left:4px;">${r.rolePlayScore !== null ? r.rolePlayScore : '-'}</span><span style="font-size:0.75rem; color:#64748b;">/100</span>
              </div>
              <div style="font-size:0.72rem; color:#475569; text-align:right;">
                Lang: <b>${escapeHtml(r.language || '-')}</b><br>
                Confidence: <b style="color:#0f766e;">${escapeHtml(confidenceRating)}</b>
              </div>
            </div>

            <!-- ACOUSTIC CONFIDENCE BREAKDOWN -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; margin-bottom:12px;">
              <div style="font-size:0.72rem; font-weight:800; color:#334155; margin-bottom:8px; text-transform:uppercase;">🎙️ Acoustic Voice Metrics & Pacing</div>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:6px; font-size:0.72rem;">
                <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
                  <span style="color:#64748b;">Intonation:</span> <b>${warmthScore}/10</b>
                </div>
                <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
                  <span style="color:#64748b;">Speech Fluency:</span> <b>${fluencyScore}/10</b>
                </div>
                <div style="background:white; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
                  <span style="color:#64748b;">Fillers:</span> <b>${escapeHtml(fillerWords)}</b>
                </div>
              </div>
            </div>

            ${rubricGridHtml}
            ${clinicalAuditHtml}
            ${deductionsHtml}
            ${scriptHtml}

            <!-- CONVERSATION TRANSCRIPT -->
            <div style="font-size:0.72rem; font-weight:800; color:#334155; margin-bottom:8px; text-transform:uppercase;">💬 Complete Conversational Transcript</div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; max-height:280px; overflow-y:auto;">
              ${turnsHtml}
            </div>
          </div>

          <div style="padding:10px 16px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:right;">
            <button type="button" class="btn" style="background:#0d9488; color:white; padding:6px 16px; font-size:0.8rem; font-weight:700; border-radius:6px; cursor:pointer;" onclick="window.DPOS.closeReviewTranscript()">
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    `;
    modalEl.style.display = "block";
  }

  function closeReviewTranscript() {
    const modalEl = document.getElementById("dposReviewTranscriptModal");
    if (modalEl) {
      modalEl.innerHTML = "";
      modalEl.style.display = "none";
    }
  }

  // ─── AUDIO CAPTURE & WAVEFORM ANIMATION ────────────────────────────────────
  let pressStartTime = 0;
  let isPointerDown = false;
  let holdTipTimeout = null;

  function clearBrowserSelection() {
    if (window.getSelection) {
      try {
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
      } catch (err) {}
    }
  }

  function scrollChatToBottom() {
    const box = document.getElementById("dposChatBox");
    if (box) {
      box.scrollTop = box.scrollHeight;
      setTimeout(() => {
        if (box) box.scrollTop = box.scrollHeight;
      }, 60);
    }
  }

  function showHoldTip(msg) {
    const tipEl = document.getElementById("dposHoldTip");
    if (!tipEl) return;
    tipEl.innerText = msg || "⚠️ Hold to Speak: Please press & hold the button while speaking (min 1 sec). Release when finished.";
    tipEl.style.display = "inline-block";
    clearTimeout(holdTipTimeout);
    holdTipTimeout = setTimeout(() => {
      if (tipEl) tipEl.style.display = "none";
    }, 3500);
  }

  function setupMicButton() {
    const btn = document.getElementById("dposMicBtn");
    if (!btn) return;

    btn.oncontextmenu = (e) => { e.preventDefault(); return false; };
    btn.onselectstart = (e) => { e.preventDefault(); return false; };

    const startHold = async (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
      if (state.isRecording || isPointerDown) return;
      isPointerDown = true;
      pressStartTime = Date.now();

      clearBrowserSelection();

      if (e && e.pointerId && btn.setPointerCapture) {
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      }

      // Prime speechSynthesis on user gesture
      if (window.speechSynthesis) {
        try {
          const u = new SpeechSynthesisUtterance('');
          window.speechSynthesis.speak(u);
        } catch (err) {}
      }

      await startRecording();
    };

    const handlePointerRelease = (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
      if (!isPointerDown) return;
      isPointerDown = false;

      if (e && e.pointerId && btn.releasePointerCapture) {
        try { btn.releasePointerCapture(e.pointerId); } catch (err) {}
      }

      clearBrowserSelection();

      const elapsed = Date.now() - pressStartTime;
      if (elapsed < 1000) {
        // Tapped or released too quickly
        abortRecording();
        showHoldTip("⚠️ Hold to Speak: Sila tekan & tahan butang semasa bercakap (lepaskan bila selesai). / 请按住说话，说完松开。");
      } else {
        // Valid hold duration
        stopRecording();
      }
    };

    // Pointer events for desktop and stylus
    btn.addEventListener('pointerdown', startHold);
    btn.addEventListener('pointerup', handlePointerRelease);
    btn.addEventListener('pointercancel', handlePointerRelease);

    // Direct touch event handling to block Android Chrome long-press text selection
    btn.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
      startHold(e);
    }, { passive: false });

    btn.addEventListener('touchend', (e) => {
      if (e.cancelable) e.preventDefault();
      handlePointerRelease(e);
    }, { passive: false });

    btn.addEventListener('touchcancel', (e) => {
      if (e.cancelable) e.preventDefault();
      handlePointerRelease(e);
    }, { passive: false });

    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

  // Prevent text selection anywhere on page while holding the mic button
  if (typeof document !== 'undefined') {
    document.addEventListener('selectstart', (e) => {
      if (isPointerDown) {
        e.preventDefault();
        clearBrowserSelection();
      }
    });

    document.addEventListener('selectionchange', () => {
      if (isPointerDown) {
        clearBrowserSelection();
      }
    });
  }

  function abortRecording() {
    state.discardCurrentRecording = true;
    state.isRecording = false;
    clearInterval(state.recordingTimerId);
    stopWaveform();

    const timerEl = document.getElementById("dposRecordingTimer");
    const canvasEl = document.getElementById("dposWaveform");
    const micBtn = document.getElementById("dposMicBtn");
    const btnText = document.getElementById("dposMicBtnText");
    if (timerEl) timerEl.style.display = "none";
    if (canvasEl) canvasEl.style.display = "none";
    if (micBtn) {
      micBtn.classList.remove("mic-recording");
      micBtn.disabled = false;
      if (btnText) btnText.innerText = "Hold to Speak";
    }

    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      try {
        state.mediaRecorder.stop();
      } catch (e) {}
    }
  }

  async function startRecording() {
    if (state.isRecording) return;
    state.discardCurrentRecording = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isPointerDown) {
        // User already released while permission prompt was showing
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioCtx();
      const source = state.audioContext.createMediaStreamSource(stream);
      state.analyserNode = state.audioContext.createAnalyser();
      state.analyserNode.fftSize = 64;
      source.connect(state.analyserNode);

      state.audioChunks = [];
      state.mediaRecorder = new MediaRecorder(stream);
      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) state.audioChunks.push(e.data);
      };
      state.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (state.discardCurrentRecording) {
          state.discardCurrentRecording = false;
          state.audioChunks = [];
          return;
        }
        handleRecordedAudio();
      };

      state.mediaRecorder.start();
      state.isRecording = true;
      state.recordingSeconds = 0;

      // Start waveform
      startWaveform();

      // UI update
      const timerEl = document.getElementById("dposRecordingTimer");
      const canvasEl = document.getElementById("dposWaveform");
      const micBtn = document.getElementById("dposMicBtn");
      const btnText = document.getElementById("dposMicBtnText");
      if (canvasEl) canvasEl.style.display = "inline-block";
      if (timerEl) {
        timerEl.style.display = "block";
        timerEl.innerText = `🔴 Recording: 0s / 45s (Release to Send)`;
      }
      if (micBtn) {
        micBtn.classList.add("mic-recording");
        micBtn.innerHTML = `<span style="font-size:1.4rem;">🔴</span><span id="dposMicBtnText">Release to Send</span>`;
      }

      clearInterval(state.recordingTimerId);
      state.recordingTimerId = setInterval(() => {
        state.recordingSeconds++;
        if (timerEl) timerEl.innerText = `🔴 Recording: ${state.recordingSeconds}s / 45s (Release to Send)`;
        if (state.recordingSeconds >= 45) {
          stopRecording();
        }
      }, 1000);

    } catch (err) {
      alert("Microphone access denied or unavailable: " + err.message);
      state.isRecording = false;
      isPointerDown = false;
    }
  }

  function stopRecording() {
    if (!state.isRecording) return;
    state.isRecording = false;
    clearInterval(state.recordingTimerId);
    stopWaveform();

    const timerEl = document.getElementById("dposRecordingTimer");
    const canvasEl = document.getElementById("dposWaveform");
    const micBtn = document.getElementById("dposMicBtn");
    if (timerEl) timerEl.style.display = "none";
    if (canvasEl) canvasEl.style.display = "none";
    if (micBtn) {
      micBtn.classList.remove("mic-recording");
      micBtn.innerHTML = `<span style="font-size:1.4rem;">⏳</span><span>Processing Voice...</span>`;
      micBtn.disabled = true;
    }

    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      try {
        state.mediaRecorder.stop();
      } catch (e) {}
    }
  }

  function startWaveform() {
    const canvas = document.getElementById("dposWaveform");
    if (!canvas || !state.analyserNode) return;
    const ctx = canvas.getContext("2d");
    const bufferLength = state.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      if (!state.isRecording) return;
      state.animFrameId = requestAnimationFrame(draw);
      state.analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#0d9488';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    }
    draw();
  }

  function stopWaveform() {
    if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
    if (state.audioContext) {
      state.audioContext.close().catch(() => {});
      state.audioContext = null;
    }
  }

  // ─── PROCESS TEAMMATE AUDIO TURN ───────────────────────────────────────────
  async function handleRecordedAudio() {
    if (state.audioChunks.length === 0) {
      renderRolePlay(document.getElementById("dposContentContainer"));
      return;
    }

    const audioBlob = new Blob(state.audioChunks, { type: state.mediaRecorder.mimeType || 'audio/webm' });
    state.audioChunks = [];

    // Show temporary user processing bubble
    const chatBox = document.getElementById("dposChatBox");
    if (chatBox) {
      chatBox.innerHTML += `
        <div class="dpos-bubble bubble-user" id="tempUserBubble">
          <div class="bubble-meta"><span>👤 You (Teammate)</span></div>
          <div class="bubble-text"><i>Transcribing voice & assessing customer reaction...</i></div>
        </div>
      `;
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    try {
      const wavObj = await blobToWav16k(audioBlob);
      const personaRaw = (state.currentWeek && (state.currentWeek.persona || state.currentWeek.topic)) || "";
      const personaObj = splitPersona(personaRaw);
      const customerLabel = getPersonaCustomerLabel(personaRaw);
      const customerName = (state.currentWeek && state.currentWeek.customerName) || customerLabel.replace(/^[^A-Za-z0-9]+/, '').trim() || "Customer";
      const isEmergency = !!(state.currentWeek && state.currentWeek.isEmergencyRedFlag);
      
      let arch = (state.currentWeek && state.currentWeek.customerArchetype) || null;
      if (!arch && state.weeklyTopic && state.weeklyTopic.customerArchetype) {
        arch = state.weeklyTopic.customerArchetype;
      }
      if (!arch) {
        ensureWeeklyArchetype(state.currentWeek || state.weeklyTopic);
        arch = (state.currentWeek && state.currentWeek.customerArchetype) || CUSTOMER_ARCHETYPES[0];
      }
      
      // Build conversation history text
      const historyText = state.rolePlayTurns.map(t => `${t.speaker === 'user' ? 'Teammate' : 'Customer'}: ${t.text}`).join('\n');

      const systemInstruction = `You are a virtual customer role-play engine for PMG Pharmacy in Sarawak, Malaysia.
CUSTOMER PERSONA & CLINICAL BACKGROUND:
${personaObj.hiddenPrompt}
${arch ? `
ASSIGNED PERSONALITY ARCHETYPE: ${arch.name}
TRAIT DESCRIPTION: ${arch.trait}
BEHAVIOR & JABBING INSTRUCTIONS:
${arch.behaviorPrompt}
` : ''}

PRIOR CONVERSATION:
${historyText || '(No prior turns, teammate is speaking first)'}

PMG PHARMACY & JASE HEALTHCARE BRAND GLOSSARY:
Accurately transcribe the teammate's speech recognizing these pharmacy brands and frontline terms:
- House Brand Joint & Bone SKUs: JH Nutrition Flexson, Livemore Flexmore, Nutribridge Flexsure Gold, JH Nutrition Eutango, V-Infinity Neoflex, Nutribridge Crystoe, JH Nutrition Fish Oil 1000mg, Nutribridge Calcium Plus Vitamin D3 & K2, Nutribridge Magnesium 150mg, Curcuma Plus, Glucosamine, Chondroitin, Collagen Type II.
- House Brand Relief & OTC SKUs: Biowell Terrafast 500mg, Medicplast Heat Therapy Patch, Medicplast Thermo Patch, Medicplast Terracool.
- Other PMG House Brands (Jase Healthcare): Nutribridge, JH Nutrition, Biowell, Livemore, Medicplast, V-Infinity (V∞), Victoria, VK Dermsolve, Shieldmax, Omma.
- Frontline Promotion & Loyalty Terms (Accurately Transcribe Speech):
  * GWP (Gift-With-Purchase): "GWP", "gift with purchase", "free gift", "hadiah percuma", "bila beli RM250", "belanja RM250 dapat hadiah/gift", "percuma payung/beg/shaker", "赠品", "买满两百五十送礼物/赠品", "免费送礼".
  * PWP (Purchase-With-Purchase): "PWP", "purchase with purchase", "add-on deal", "tambah RM... dapat beli...", "beli atas RM20 / RM30 dapat harga murah", "promosi kaunter", "harga jimat", "加购", "特价加购", "买满二十块可以特价买...", "加几块钱带走".
  * Loyalty & Healthcare Terms: PMG Membership (ahli PMG / 免费会员 / free membership), Senior Care Plus (SCP / 乐龄关怀计划 / 银发族计划), 28th Monthly Free Blood Glucose Test (28hb ujian gula percuma / 每月28号免费验血糖).

STRICT INSTRUCTIONS:
1. Listen to the teammate's audio recording. Transcribe their words accurately in the exact language spoken. Accurately transcribe product names and promotion terms like "PWP", "GWP", "free gift", "RM250", "RM20", etc.
2. Auto-detect their spoken language:
   - "zh" (Mandarin / Chinese)
   - "ms" (Bahasa Melayu / Sarawak Malay)
   - "en" (English / Malaysian English)
   - "mixed" (Mixed)
3. MANDATORY CRITICAL RULE - STRICT LANGUAGE MATCHING:
   The virtual customer's response MUST STRICTLY MATCH the language spoken by the teammate in this latest recording:
   - If teammate spoke Mandarin -> Reply in natural conversational Mandarin (Chinese characters: 华语). DO NOT reply in Malay or English!
   - If teammate spoke Malay -> Reply in conversational Sarawak Malay. DO NOT reply in Mandarin or English!
   - If teammate spoke English -> Reply in natural Malaysian English. DO NOT reply in Malay or Mandarin!
4. CONVERSATION CONTINUITY & HUMANOID REALISM:
   - You are ${customerName}. Embody the customer persona and assigned personality archetype (${arch ? arch.name : 'Humanoid Customer'}) realistically. You are a real human customer in Sarawak, Malaysia, NOT an AI robot.
   - Reply directly to what the teammate just said in this audio turn.
   - IF THIS IS TURN 1 (Teammate just greeted you with 'Selamat pagi / ada apa boleh bantu / 早安'):
     Explain your primary symptom and main discomfort naturally in 1-2 sentences in character according to your personality!
   ${isEmergency ? `- CRITICAL EMERGENCY BEHAVIOR: You are experiencing dangerous alarm symptoms! If the teammate recognizes the danger and urgently advises you to go to the hospital/emergency clinic immediately, react with alarm and relief, thank them, and agree to go to the hospital immediately without delay! If the teammate tries to sell you OTC painkillers, vitamins, or delay emergency care, complain that your pain/symptoms are unbearable and ask if this could be an emergency.` : `- 🥊 MANDATORY TRAINING DIRECTIVE: ACTIVELY JAB WITH REALISTIC RESISTANCE & OBJECTIONS!
     Do NOT be an overly easy pushover customer who immediately agrees to everything on the first mention!
     You MUST challenge / jab the teammate with realistic frontline resistance based on your assigned personality:
     * THE PRICE JAB (Budget / Limited Pension):
       When they recommend an OTC item, patch, or House Brand supplement (e.g., Flexson/Flexmore/etc.), JAB BACK with price hesitation:
       "Eh, berapa harga ni dik? Bajet saya ketat sikit... ubat ni mahal tak? Ada pilihan murah?", "多少钱一盒？有没有便宜一点的？"
       -> Only accept if the teammate explains the daily cost (RM2-3/day) or pitches an affordable PWP / value deal!
     * THE SKEPTICISM & MINYAK ANGIN JAB:
       When they recommend supplements, JAB BACK with doubt:
       "Alah dik, pakcik biasa sapu minyak angin / minyak panas cap kapak je kat rumah, buat apa nak bazir beli suplemen makan?", "搽风油不就好了咯，还要吃药这么麻烦咩？"
       -> Only accept if the teammate explains that topical oil only masks surface nerves while joint cartilage needs internal repair!
     * THE CHEMICAL FEAR JAB (Health-Conscious / Gastric):
       JAB BACK with worry:
       "Dulu makan ubat klinik pedih ulu hati... ubat ni ada bahan kimia keras tak? Rosak buah pinggang nanti kalau makan!", "这个西药伤肾吗？我怕吃多了伤身体..."
       -> Only accept if the teammate explains natural botanicals (Turmeric/Boswellia) and safe dosing!
     * THE HEARING & DOSAGE CONFUSION JAB (Elderly):
       JAB BACK with confusion:
       "Hah? Boleh cakap kuat sikit dik? Telinga pakcik kurang dengar... ubat ni makan macam mana tadi? Banyak sangat pening pakcik nak ingat..."
       -> Only warm up if the teammate speaks with clear loud patience, simple dosage, and mentions Senior Care Plus!
     * THE RUSHED JAB:
       "Cepat sikit ya dik, kereta saya double park kat luar ni..."
     * THE ANXIETY JAB:
       "Saya risau sangat dik... bukan tanda nak kena operate atau lumpuh kan?"
     - If teammate pitches a PWP counter add-on or mentions a GWP free gift (e.g. adding a discounted item for RM20+ or free gift for RM250+ spend), respond positively and agree to pay.`}
   - DO NOT repeat previous statements or say the opening greeting if the conversation has already progressed.
   - Keep customer replies natural, concise (1-3 sentences), and conversational.
5. Evaluate per-turn vocal audio metrics:
   - vocal_warmth (1-10)
   - fluency_confidence (1-10)
   - filler_count (integer)
   - empathy_phrases (array of caring words detected)

Output strictly in JSON format:
{
  "detected_language": "zh",
  "reply_language": "zh",
  "transcript": "...",
  "customer_reply": "...",
  "audio": {
    "vocal_warmth": 8,
    "fluency_confidence": 8,
    "filler_count": 0,
    "empathy_phrases": []
  }
}`;

      const contents = [
        {
          parts: [
            { text: `Listen to the teammate's audio input. Reply in character as ${customerName} matching their spoken language and evaluate the turn.` },
            {
              inlineData: {
                mimeType: wavObj.mimeType,
                data: wavObj.base64
              }
            }
          ]
        }
      ];

      const res = await dposGenerate('gemini-3.5-flash-lite', contents, systemInstruction);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = extractJson(text) || {};

      const detectedLang = normalizeLangCode(parsed.detected_language);
      const replyLang = normalizeLangCode(parsed.reply_language || detectedLang);
      const userText = (parsed.transcript || "").trim() || "(Voice speech received)";
      const customerReply = (parsed.customer_reply || "").trim();

      if (!customerReply) {
        throw new Error("Empty customer reply returned from AI engine.");
      }

      // Record turns
      state.rolePlayTurns.push({
        speaker: 'user',
        text: userText,
        lang: detectedLang,
        audioScore: parsed.audio || { vocal_warmth: 8, fluency_confidence: 8, filler_count: 0 }
      });

      state.rolePlayTurns.push({
        speaker: 'customer',
        text: customerReply,
        lang: replyLang
      });

      // Render updated chat
      renderRolePlay(document.getElementById("dposContentContainer"));

      // Speak customer reply aloud
      speakCustomerReply(customerReply, replyLang);

    } catch (err) {
      console.error("Audio turn processing error:", err);
      // Remove temporary processing bubble
      const tempBubble = document.getElementById("tempUserBubble");
      if (tempBubble) tempBubble.remove();

      // Re-enable mic
      const micBtn = document.getElementById("dposMicBtn");
      if (micBtn) {
        micBtn.disabled = false;
        micBtn.classList.remove("mic-recording");
        micBtn.innerHTML = `<span style="font-size:1.4rem;">🎙️</span><span id="dposMicBtnText">Hold to Speak</span>`;
      }

      showHoldTip("⚠️ Voice processing error: Could not contact AI engine (" + (err.message || "timeout") + "). Please hold to speak again.");
    }
  }

  function speakCustomerReply(text, lang) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const code = normalizeLangCode(lang);
      const personaRaw = (state.currentWeek && (state.currentWeek.persona || state.currentWeek.topic)) || '';
      const gender = detectPersonaGender(personaRaw);
      const voice = pickVoice(code, gender);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = code === 'zh' ? 'zh-CN' : (code === 'en' ? 'en-US' : 'ms-MY');
      }

      // Male / Female acoustic pitch and rate tuning
      if (gender === 'male') {
        u.pitch = 0.72; // Lower vocal formant into mature senior male register
        u.rate = 0.90;  // Measured, mature speaking pace
      } else {
        u.pitch = 1.05; // Friendly female vocal pitch
        u.rate = 0.95;
      }

      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  function replaySpeech(text, lang) {
    speakCustomerReply(text, lang);
  }

  // ─── EVALUATE ROLE-PLAY (100-POINT RUBRIC) ─────────────────────────────────
  async function evaluateRolePlay() {
    if (state.isEvaluating) return;
    const turns = state.rolePlayTurns;
    const userTurns = turns.filter(t => t.speaker === 'user');
    if (userTurns.length < 3) {
      alert("Please complete at least 3 consultation turns covering triage, House Brand recommendation, and cashier close before evaluating.");
      return;
    }

    state.isEvaluating = true;
    renderRolePlay(document.getElementById("dposContentContainer"));

    // Average audio ratings from recorded turns
    let totalWarmth = 0;
    let totalFluency = 0;
    userTurns.forEach(t => {
      const a = t.audioScore || {};
      totalWarmth += (a.vocal_warmth || 7);
      totalFluency += (a.fluency_confidence || 7);
    });
    const avgWarmth = Math.min(10, Math.max(1, Math.round(totalWarmth / (userTurns.length || 1))));
    const avgFluency = Math.min(10, Math.max(1, Math.round(totalFluency / (userTurns.length || 1))));
    const confRating = computeConfidence(avgWarmth, avgFluency);

    const transcript = turns.map(t => `${t.speaker === 'user' ? 'Teammate' : 'Customer'}: ${t.text}`).join('\n');
    const languages = [...new Set(userTurns.map(t => getLangBadgeLabel(t.lang || 'ms')))].join(' + ');

    const w = state.currentWeek || {};
    const arch = (w && w.customerArchetype) || null;
    const isEmergency = !!(w.isEmergencyRedFlag || (w.topic && w.topic.includes('Emergency Red Flag')));

    const evalPrompt = `You are a strict clinical pharmacy training evaluator for PMG Pharmacy in Malaysia.
Evaluate this customer role-play transcript using the 100-point PMG Frontline Rubric.

CLINICAL TOPIC:
${w.topic || "Clinical Care Consultation"}
${w.summaryMd || ""}
Target House Brand SKUs: ${w.skus || "Relevant PMG House Brand / Jase Healthcare formulations"}
Promo / Loyalty Context: ${w.promo || "Senior Care Plus free glucose test on 28th, counter PWP / GWP"}
Scenario Mode: ${isEmergency ? "🚨 CRITICAL EMERGENCY RED FLAG" : "Standard Minor Ailment Consultation"}
${arch ? `CUSTOMER PERSONALITY ARCHETYPE: ${arch.name} (${arch.trait})` : ''}

TRANSCRIPT OF CONSULTATION:
${transcript}

VOICE METRICS RECORDED:
- Vocal Warmth & Intonation: ${avgWarmth}/10
- Fluency & Confidence: ${avgFluency}/10

${isEmergency ? `
CRITICAL EMERGENCY SCORING PROTOCOL (LIFE-SAFETY PRIORITY):
This case is a severe medical emergency (${w.topic}).
- FULL MARKS (85-100 pts) MUST ONLY BE AWARDED IF:
  1. The teammate immediately identifies the red flag danger signs.
  2. The teammate firmly, empathetically, and urgently directs the patient to go to the Emergency Department / Hospital / Doctor immediately (or call 999).
  3. The teammate REFRAINS from selling commercial OTC medicines, painkillers, or supplements that would cause harmful delays (e.g. no NSAIDs in dengue, no waiting in chest pain/stroke).
- SEVERE DEDUCTION / FAILURE (0-40 pts):
  If teammate attempts to sell OTC drugs, painkillers, or supplements instead of immediately referring to emergency hospital care, award 0 for DPOS, 0 for OTC, 0 for PWP, and severely penalize total score.` : `
CRITICAL SCORING RULES - STRICT ZERO TOLERANCE FOR OMISSIONS:
Score ONLY what was explicitly stated by the teammate in the transcript. Do NOT award points for unsaid recommendations:
1. Vocal Warmth: Award ${avgWarmth}/10 based on recorded voice intonation.
2. Fluency & Confidence: Award ${avgFluency}/10 based on vocal pacing and filler count.
3. Positive Vocabulary, Empathy & Personality Handling (0-10):
   - Caring words, reassurance, polite address (e.g., Uncle, Auntie, jangan risau, 别担心).
   ${arch ? `- Adaptability to customer personality (${arch.name}): Did teammate effectively acknowledge their personality and handle their objection (e.g. price hesitation with daily breakdown/PWP, chemical worry with natural botanical safety, elderly hearing with loud patience and Senior Care Plus, skepticism with cartilage wear root cause, anxiousness with reassuring triage)?` : ''}
4. Clinical DPOS & House Brand Explanation (0-35):
   - Diagnosis triage (0-10): Did teammate ask clarifying symptom questions, screen red flags (swelling/redness/fever/severity), or check medical history (gastritis/kidney/blood thinners)? (Award 0 if not asked).
   - OTC immediate relief (0-10): Did teammate advise safe symptomatic relief (e.g., paracetamol/Terrafast dosage, topical patch/cream)? (Award 0 if omitted).
   - PMG House Brand supplement root cause (0-15):
     Did teammate recommend and explain a relevant PMG House Brand supplement (e.g. from Jase Healthcare: Nutribridge, JH Nutrition, Biowell, Livemore, Medicplast, V-Infinity, etc.)?
     Accept phonetic variations and multilingual descriptions. (Award 0 ONLY if teammate completely omitted recommending any House Brand supplement).
   - CLINICAL ACCURACY & PHARMACOLOGICAL INTEGRITY:
     * NSAID Adverse Effect vs True Allergy:
       Gastric burning/pain or ulcers from NSAIDs (e.g., Ibuprofen, Diclofenac) is a well-known PHARMACOLOGICAL ADVERSE EFFECT (COX-1 inhibition reducing protective gastric mucus), NOT a drug allergy / hypersensitivity (which presents as urticaria, angioedema, bronchospasm, or anaphylaxis).
       - PENALTY (-5 pts): If teammate tells the customer that gastric pain means they are "allergic" to NSAIDs, DEDUCT 5 points for clinical misconception.
     * Product Formulation Accuracy (JH Nutrition Flexson vs Livemore Flexmore):
       - JH Nutrition Flexson: Pure herbal plant extracts (Curcuma longa / Turmeric 250mg + Boswellia serrata 200mg). It is VEGETARIAN and DOES NOT contain egg, fish, or shellfish!
       - Livemore Flexmore: Contains hydrolysed fish collagen peptide (4000mg) and hydrolysed chicken eggshell membrane (must check for fish/egg allergies).
       - PENALTY (-5 pts): If teammate falsely tells the customer that Flexson has egg or fish (confusing it with Flexmore), DEDUCT 5 points for product formulation error.
5. Cashier GWP / PWP Pitch (0-15):
   - GWP (Gift-With-Purchase): Reward if teammate mentions a free gift/reward upon reaching a spending tier (typically RM250+ spend, e.g. 'beli RM250 dapat free gift/hadiah percuma', '买满RM250送赠品').
   - PWP (Purchase-With-Purchase): Reward if teammate offers an add-on item at a discounted price upon minimum spend (typically RM20+, e.g. 'tambah sikit dapat barang murah di kaunter', 'promosi PWP', '特价加购', '加几块钱带走').
   - Award full 15 points if teammate pitched EITHER valid PWP OR GWP before concluding.
   - Award 0 points ONLY if teammate completely ignored counter promotions.
6. Loyalty & Senior Care Plus (0-20 pts total):
   - Sub-item 6A: General PMG Membership (0-10 pts):
     Did the teammate check if the customer has a PMG membership, offer free IC registration, or explain member pricing? (Award 0 if omitted).
   - Sub-item 6B: Senior Care Plus (SCP) & 28th Monthly Free Glucose Screening (0-10 pts):
     Did the teammate explicitly introduce the "Senior Care Plus" (SCP / 乐龄关怀计划) program AND/OR highlight the FREE blood glucose screening on the 28th of every month for seniors (28hb ujian gula percuma / 28号免费验血糖)?
     * STRICT CRITICAL DEDUCTION RULE (SENIOR CUSTOMER):
       If the customer is a senior (such as Uncle Tan, Auntie, or age 55+) and the teammate ONLY talks about regular PMG membership / member price BUT completely OMITS mentioning "Senior Care Plus" and OMITS mentioning the "28th monthly free blood glucose test", YOU MUST AWARD 0/10 for senior_care_28th!
       In this case, the total membership score CANNOT exceed 10/20!
       You MUST ALSO add to missed_items: "Missed Senior Care Plus / 28th Screening: Did not introduce Senior Care Plus or highlight 28th monthly free blood glucose test for seniors (-10 pts)".

UNIVERSAL CLINICAL & PHARMACOLOGICAL INTEGRITY AUDIT:
Conduct an uncompromising clinical audit on every medical statement made by the teammate in the transcript:
1. CONTRAINDICATIONS & SAFETY: Did teammate screen for customer's specific health risks (gastritis, CKD/kidney, hypertension, asthma, pregnancy, diabetes, current medications)? Did they recommend anything contraindicated?
2. ADVERSE EFFECT VS ALLERGY: Did teammate distinguish pharmacological side effects (NSAID gastric irritation via COX-1 inhibition, ACEi dry cough, antihistamine drowsiness) from true allergies (urticaria, angioedema, anaphylaxis)? Never call side effects "allergies"!
3. ANTIMICROBIAL STEWARDSHIP: Viral colds, flu, and uncomplicated bronchitis do NOT need antibiotics. Recommending antibiotics for viral illness is a critical violation.
4. PRODUCT INGREDIENTS & ALLERGENS: Accurately cross-check product formulations (e.g. JH Nutrition Flexson is pure herbal Turmeric + Boswellia with zero fish/egg; Livemore Flexmore has fish collagen and eggshell membrane). Do not invent nonexistent ingredients.
5. DOSAGE & TIMING: Paracetamol max 4g/day (max 8 tabs of 500mg); NSAIDs strictly after food; Antacids spaced 2h from other meds.
`}

MANDATORY STRUCTURED OUTPUT FORMAT:
You MUST provide:
1. "missed_items": Array of itemized strings listing exact criteria missed with point deductions (e.g. "Missed Red Flag: Did not screen for swelling/gastritis (-5 pts)", "Missed OTC: Did not offer immediate topical/oral relief (-10 pts)", "Missed PWP: Did not pitch counter PWP special (-15 pts)", "Missed Senior Care Plus / 28th Screening: Did not introduce Senior Care Plus or highlight 28th monthly free blood glucose test for seniors (-10 pts)"). If nothing missed, return ["Mastered all consultation criteria! Full marks awarded."].
2. "example_dialogue": Array of 2 to 3 verbatim sentences in the teammate's primary spoken language (${languages}) demonstrating how to smoothly deliver the missing red flags, House Brand pairing, and cashier PWP pitch.
3. "coachingTip": Concise 1-sentence coaching summary.
4. "clinical_audit": Object containing { "status": "passed" | "issues_found", "issues": [ { "title": "...", "stated": "...", "correction": "...", "deduction": 5 } ] }

Output strictly in JSON:
{
  "totalScore": 65,
  "speakingConfidence": "${confRating}",
  "languageUsed": "${languages}",
  "breakdown": {
    "warmth": ${avgWarmth},
    "fluency": ${avgFluency},
    "empathy": 8,
    "dpos": 30,
    "pwp": 0,
    "membership_general": 10,
    "senior_care_28th": 0,
    "membership": 10
  },
  "missed_items": [
    "Missed PWP: Did not pitch counter PWP special (-15 pts)",
    "Missed Senior Care Plus / 28th Screening: Did not introduce Senior Care Plus or highlight 28th monthly free blood glucose test for seniors (-10 pts)"
  ],
  "example_dialogue": [
    "Uncle, alang-alang berbelanja RM20 hari ini, boleh tebus pek plester ini dengan harga diskaun RM4 di kaunter!",
    "Alang-alang Uncle daftar ahli hari ini, kami ada program Senior Care Plus untuk warga emas, setiap 28hb ada ujian saringan gula darah percuma!"
  ],
  "coachingTip": "...",
  "clinical_audit": {
    "status": "passed",
    "issues": []
  }
}`;

    try {
      const res = await dposGenerate('gemini-3.5-flash-lite', evalPrompt);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = extractJson(text) || {};

      const bd = parsed.breakdown || {};
      const warmth = bd.warmth !== undefined ? Number(bd.warmth) : (bd.vocalWarmth !== undefined ? Number(bd.vocalWarmth) : avgWarmth);
      const fluency = bd.fluency !== undefined ? Number(bd.fluency) : (bd.fluencyConfidence !== undefined ? Number(bd.fluencyConfidence) : avgFluency);
      const empathy = bd.empathy !== undefined ? Number(bd.empathy) : (bd.empathyListening !== undefined ? Number(bd.empathyListening) : 8);
      
      let dposScore = 0;
      if (bd.dpos !== undefined) {
        dposScore = Number(bd.dpos);
      } else {
        const triage = Number(bd.diagnosisTriage || bd.triage || 0);
        const otc = Number(bd.otcRelief || bd.otc || 0);
        const hb = Number(bd.houseBrandSupplement || bd.supplement || bd.houseBrand || 0);
        dposScore = triage + otc + hb;
      }
      
      const pwpScore = bd.pwp !== undefined ? Number(bd.pwp) : (bd.cashierGwpPwp !== undefined ? Number(bd.cashierGwpPwp) : 0);
      
      let memScore = 0;
      if (bd.membership_general !== undefined || bd.senior_care_28th !== undefined) {
        const memGen = Math.min(10, Math.max(0, Number(bd.membership_general || 0)));
        const memScp = Math.min(10, Math.max(0, Number(bd.senior_care_28th || 0)));
        memScore = memGen + memScp;
      } else if (bd.membership !== undefined) {
        memScore = Number(bd.membership);
      } else {
        memScore = Number(bd.loyaltySeniorCare || 0);
      }

      // DETERMINISTIC CODE-LEVEL GUARD: Check whether Senior Care Plus or 28th test was spoken
      const teammateWords = userTurns.map(t => t.text || '').join(' ').toLowerCase();
      const mentionsSeniorCareOr28 = /(senior\s*care|scp|28\s*hb|28th|28\s*号|二十八|ujian\s*gula|saringan\s*gula|cek\s*gula|gula\s*percuma|验血糖|免费验血|乐龄|银发)/i.test(teammateWords);
      const personaRaw = (state.currentWeek && (state.currentWeek.persona || state.currentWeek.topic)) || "";
      const isSeniorPersona = /uncle|auntie|aunty|pak\s*cik|mak\s*cik|senior|retiree|warga\s*emas|5[5-9]|6[0-9]|7[0-9]|8[0-9]/i.test(personaRaw) || (w.promo && /28/i.test(w.promo));

      if (isSeniorPersona && !mentionsSeniorCareOr28) {
        // Enforce hard cap: cannot score more than 10/20 on loyalty if SCP / 28th screening was omitted
        memScore = Math.min(memScore, 10);
      }

      // Run Universal Clinical Integrity Audit (Combining Deterministic Rules + Gemini Deep Audit)
      const clinicalAudit = auditClinicalIntegrity(transcript, userTurns, w, parsed.clinical_audit);

      // Extract missed items & example dialogue
      let missedItems = Array.isArray(parsed.missed_items) ? parsed.missed_items.filter(Boolean) : (Array.isArray(parsed.missedItems) ? parsed.missedItems : []);
      let exampleDialogue = Array.isArray(parsed.example_dialogue) ? parsed.example_dialogue.filter(Boolean) : (Array.isArray(parsed.exampleDialogue) ? parsed.exampleDialogue : []);

      // Apply clinical integrity audit deductions to DPOS
      let totalClinicalDeductions = 0;
      clinicalAudit.issues.forEach(iss => {
        const pts = Number(iss.deduction || 5);
        totalClinicalDeductions += pts;
        const formattedMissed = `${iss.title}: ${iss.correction} (-${pts} pts)`;
        if (!missedItems.some(m => m.toLowerCase().includes(iss.title.toLowerCase().slice(0, 15)))) {
          missedItems.unshift(formattedMissed);
        }
      });

      if (totalClinicalDeductions > 0) {
        dposScore = Math.max(0, dposScore - totalClinicalDeductions);
      }

      const cleanBreakdown = {
        warmth: Math.min(10, Math.max(0, warmth)),
        fluency: Math.min(10, Math.max(0, fluency)),
        empathy: Math.min(10, Math.max(0, empathy)),
        dpos: Math.min(35, Math.max(0, dposScore)),
        pwp: Math.min(15, Math.max(0, pwpScore)),
        membership: Math.min(20, Math.max(0, memScore))
      };

      const calculatedTotal = cleanBreakdown.warmth + cleanBreakdown.fluency + cleanBreakdown.empathy + cleanBreakdown.dpos + cleanBreakdown.pwp + cleanBreakdown.membership;
      const totalScore = calculatedTotal;

      // If senior persona omitted Senior Care Plus / 28th test, ensure deduction note is present
      if (isSeniorPersona && !mentionsSeniorCareOr28) {
        const scpDeduction = "Missed Senior Care Plus / 28th Screening: Did not introduce Senior Care Plus or highlight 28th monthly free blood glucose test for seniors (-10 pts)";
        if (!missedItems.some(m => /senior\s*care|28|scp|ujian\s*gula/i.test(m))) {
          missedItems.push(scpDeduction);
        }
      }

      // Fallback generators if model omitted them
      if (missedItems.length === 0) {
        if (cleanBreakdown.dpos < 25) missedItems.push(`Missed Clinical DPOS: Did not complete thorough red-flag triage or House Brand explanation (-${35 - cleanBreakdown.dpos} pts)`);
        if (cleanBreakdown.pwp < 12) missedItems.push(`Missed PWP / GWP: Did not pitch counter PWP special or GWP gift tier (-${15 - cleanBreakdown.pwp} pts)`);
        if (cleanBreakdown.membership < 15) missedItems.push(`Missed Loyalty / SCP: Did not highlight free PMG membership or 28th monthly free blood glucose test (-${20 - cleanBreakdown.membership} pts)`);
        if (cleanBreakdown.empathy < 7) missedItems.push(`Missed Empathy: Use more reassuring and caring addressing phrases (-${10 - cleanBreakdown.empathy} pts)`);
      }
      if (missedItems.length === 0 && totalScore >= 90) {
        missedItems.push("✅ Excellent consultation! Complete triage, House Brand pairing, and cashier close mastered.");
      }

      if (exampleDialogue.length === 0) {
        const isZh = (languages || '').toLowerCase().includes('chinese') || (languages || '').toLowerCase().includes('mandarin') || (languages || '').includes('中文');
        if (isZh) {
          exampleDialogue = [
            "“叔叔/阿姨，除了止痛贴，建议每天补充我们PMG的关节软骨配方，从根本帮助修补软骨、减少摩擦。”",
            "“今天消费满额，柜台有PWP特价加购优惠，只要加几块钱就能带走这盒药贴/营养品！”",
            "“您是我们PMG会员吗？每逢28号，我们全线分行都有提供免费验血糖服务，记得过来测一测哦！”"
          ];
        } else {
          exampleDialogue = [
            "“Uncle/Auntie, untuk kelegaan berpanjangan, saya cadangkan ambil suplemen House Brand PMG ini sekali untuk bantu rawat punca sakit dari dalam.”",
            "“Alang-alang belanja hari ini, di kaunter ada promosi PWP istimewa, tambah beberapa ringgit sahaja untuk dapatkan item ini!”",
            "“Uncle/Auntie sudah daftar ahli PMG percuma? Setiap 28hb kami ada saringan gula darah percuma di semua cawangan!”"
          ];
        }
      }

      const audioMetrics = {
        warmth: cleanBreakdown.warmth,
        fluency: cleanBreakdown.fluency,
        fillers: 0,
        confidence: confRating
      };

      const breakdownJsonPayload = {
        breakdown: cleanBreakdown,
        missed_items: missedItems,
        example_dialogue: exampleDialogue,
        audio_metrics: audioMetrics,
        clinical_integrity: clinicalAudit
      };

      const richCoachingTip = missedItems.slice(0, 2).join(' | ');

      state.evaluation = {
        totalScore: totalScore,
        speakingConfidence: confRating,
        languageUsed: languages || 'Bahasa Melayu',
        breakdown: cleanBreakdown,
        missedItems: missedItems,
        exampleDialogue: exampleDialogue,
        clinicalIntegrity: clinicalAudit,
        coachingTip: richCoachingTip || parsed.coachingTip || "Sila pastikan triage simptom, terangkan suplemen House Brand, dan ingatkan program Senior Care Plus 28hb."
      };

      // Save role-play score to sheet / backend
      saveTeammateScore(state.quizScore, totalScore, languages, confRating, transcript, richCoachingTip, breakdownJsonPayload);

    } catch (e) {
      console.error("Evaluation error:", e);
      alert("⚠️ Evaluation failed: Could not connect to AI evaluator (" + (e.message || "network error") + "). Please click the Evaluate button again.");
    } finally {
      state.isEvaluating = false;
      renderRolePlay(document.getElementById("dposContentContainer"));
    }
  }

  function resetRolePlay() {
    state.rolePlayTurns = [];
    state.evaluation = null;
    state.isRecording = false;
    state.isEvaluating = false;
    if (state.topicMode === 'weekly' && (state.currentWeek || state.weeklyTopic)) {
      ensureWeeklyArchetype(state.currentWeek || state.weeklyTopic);
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    renderRolePlay(document.getElementById("dposContentContainer"));
  }

  // ─── PERSISTENCE (SHEET & LOCALSTORAGE) ────────────────────────────────────
  async function saveTeammateScore(quizScore, rolePlayScore, lang, conf, transcriptText, coachingTip, breakdown) {
    const topic = (state.currentWeek && state.currentWeek.topic) || "DPOS Training";
    const u = (typeof currentUser !== 'undefined' && currentUser && currentUser.username) || '';
    const name = (typeof currentUser !== 'undefined' && currentUser && currentUser.name) || '';
    const role = (typeof currentUser !== 'undefined' && currentUser && currentUser.role) || 'Staff';

    const payload = {
      username: u,
      staffName: name,
      role: role,
      topicTitle: topic,
      quizScore: quizScore,
      rolePlayScore: rolePlayScore,
      languageUsed: lang,
      speakingConfidenceRating: conf,
      transcript: transcriptText || '',
      coachingTip: coachingTip || '',
      breakdown: breakdown ? JSON.stringify(breakdown) : ''
    };

    try {
      await dposApi('dposSaveScore', payload);
    } catch (e) {
      console.warn("Failed to persist score to Google Sheet, caching locally:", e);
      try {
        const saved = JSON.parse(localStorage.getItem('pmg_dpos_scores') || '{}');
        saved[topic] = {
          quizScore: quizScore,
          rolePlayScore: rolePlayScore,
          status: (quizScore !== null && rolePlayScore !== null) ? 'Completed' : 'In Progress'
        };
        localStorage.setItem('pmg_dpos_scores', JSON.stringify(saved));
      } catch (err) {}
    }
  }

  // ─── GLOBAL HANDLERS & EXPORTS ─────────────────────────────────────────────
  function setTab(tab) {
    if (state.topicMode === 'random' && (tab === 'spotlight' || tab === 'quiz')) {
      tab = 'roleplay';
    }
    if (tab === 'review') {
      const isMgr = (typeof isManagementOrPharmacist === 'function') ? isManagementOrPharmacist(currentUser) : false;
      if (!state.canReview || !isMgr) {
        console.warn("Unauthorized attempt to access Review tab");
        state.currentTab = state.topicMode === 'random' ? 'roleplay' : 'spotlight';
        renderAcademy();
        return;
      }
    }
    state.currentTab = tab;
    renderAcademy();
  }

  function selectOption(idx) {
    if (state.quizAnswered) return;
    state.quizSelectedOption = idx;
    state.quizAnswered = true;
    const cur = state.quizQuestions[state.quizIndex];
    const isCorrect = idx === cur.answer;
    state.quizUserAnswers.push({
      questionIdx: state.quizIndex,
      selectedOption: idx,
      isCorrect: isCorrect
    });
    renderQuiz(document.getElementById("dposContentContainer"));
  }

  function nextQuestion() {
    state.quizIndex++;
    state.quizAnswered = false;
    state.quizSelectedOption = null;
    renderQuiz(document.getElementById("dposContentContainer"));
  }

  function retakeQuiz() {
    state.quizIndex = 0;
    state.quizAnswered = false;
    state.quizSelectedOption = null;
    state.quizUserAnswers = [];
    state.quizScore = null;
    renderQuiz(document.getElementById("dposContentContainer"));
  }

  function dposReset() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopRecording();
    state.currentTab = 'spotlight';
    state.canReview = false;
    state.currentWeek = null;
    state.userScore = null;
    state.rolePlayTurns = [];
    state.evaluation = null;
    state.quizIndex = 0;
    state.quizUserAnswers = [];
    state.quizAnswered = false;
    state.quizScore = null;
    state.demoMode = false;
    state.isRecording = false;
    state.isSpeaking = false;
    state.isEvaluating = false;
  }

  // Pre-load browser voices
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      state.voices = window.speechSynthesis.getVoices();
    };
  }

  // Export public API
  const DPOS = {
    init: loadDposData,
    setTab: setTab,
    setTopicMode: setTopicMode,
    generateNewRandomCase: generateNewRandomCase,
    selectOption: selectOption,
    nextQuestion: nextQuestion,
    retakeQuiz: retakeQuiz,
    replaySpeech: replaySpeech,
    evaluateRolePlay: evaluateRolePlay,
    resetRolePlay: resetRolePlay,
    openReviewTranscript: openReviewTranscript,
    closeReviewTranscript: closeReviewTranscript,
    changeReviewTopic: changeReviewTopic,
    dposReset: dposReset,
    // Pure functions for testing
    escapeHtml: escapeHtml,
    renderMarkdown: renderMarkdown,
    parseQuizJson: parseQuizJson,
    extractJson: extractJson,
    splitPersona: splitPersona,
    encodeWav16: encodeWav16,
    detectPersonaGender: detectPersonaGender,
    getPersonaCustomerLabel: getPersonaCustomerLabel,
    pickVoice: pickVoice,
    computeBadge: computeBadge,
    computeConfidence: computeConfidence,
    auditClinicalIntegrity: auditClinicalIntegrity
  };

  global.DPOS = DPOS;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DPOS;
  }

})(typeof window !== 'undefined' ? window : this);
