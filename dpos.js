/* ============================================================================
   DPOS ACADEMY MODULE (Trilingual Voice Role-Play & PMG Frontline SOP)
   ============================================================================ */

(function(global) {
  'use strict';

  // ─── STATE MANAGEMENT ───────────────────────────────────────────────────────
  const state = {
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
    userScore: null,
    demoMode: false,
    voices: []
  };

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
        state.currentWeek = res.week;
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
        state.currentWeek = window.DPOS_SEED_WEEK;
      } else {
        state.currentWeek = {
          topic: "Week 1: Joint Health & Osteoarthritis Care",
          skus: "JH Nutrition Flexson, Livemore Flexmore, Biowell Terrafast, Medicplast Heat Patch",
          summaryMd: "## Joint Care Triage\n- Screen red flags\n- Safe OTC relief\n- House brand root cause supplement",
          quiz: [],
          persona: "A customer walks in rubbing his knee.",
          promo: "Senior Care Plus FREE glucose test on 28th."
        };
      }
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

    const topicTitle = state.currentWeek ? state.currentWeek.topic : "Clinical Mastery";
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
      <!-- HERO HEADER -->
      <div class="dpos-hero">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div>
            <div style="font-size:0.68rem; text-transform:uppercase; font-weight:800; color:#0d9488; letter-spacing:0.5px;">DPOS Academy • Weekly Clinical Sprint</div>
            <h2 style="margin:4px 0 6px 0; font-size:1.15rem; color:#0f172a; font-weight:800; line-height:1.3;">${escapeHtml(topicTitle)}</h2>
          </div>
          <div>${statusBadge}</div>
        </div>
        <div style="font-size:0.75rem; color:#64748b; line-height:1.4;">
          Master clinical triage, safe OTC symptomatic relief, and 3.5% House Brand supplement recommendations with real-time AI speech simulation.
        </div>
      </div>

      <!-- SUB-NAVIGATION TABS -->
      <div class="dpos-subtabs">
        <button class="dpos-subtab ${state.currentTab === 'spotlight' ? 'active' : ''}" onclick="window.DPOS.setTab('spotlight')">
          📖 Spotlight
        </button>
        <button class="dpos-subtab ${state.currentTab === 'quiz' ? 'active' : ''}" onclick="window.DPOS.setTab('quiz')">
          📝 Quiz ${state.quizScore !== null ? `(${state.quizScore}/10)` : ''}
        </button>
        <button class="dpos-subtab ${state.currentTab === 'roleplay' ? 'active' : ''}" onclick="window.DPOS.setTab('roleplay')">
          🎙️ Role-Play
        </button>
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
      state.currentTab = 'spotlight';
    }

    if (state.currentTab === 'spotlight') {
      renderSpotlight(container);
    } else if (state.currentTab === 'quiz') {
      renderQuiz(container);
    } else if (state.currentTab === 'roleplay') {
      renderRolePlay(container);
    } else if (state.currentTab === 'review') {
      renderReview(container);
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
      chatHtml = `
        <div style="text-align:center; padding:30px 14px; color:#64748b;">
          <div style="font-size:2rem; margin-bottom:6px;">👋</div>
          <div style="font-weight:700; color:#334155; margin-bottom:4px;">Ready to start consultation?</div>
          <div style="font-size:0.75rem; line-height:1.4;">
            Press and hold the button to speak in <b>Mandarin</b>, <b>Bahasa Melayu</b>, or <b>English</b>.<br>
            ${gender === 'female' ? 'The customer' : 'Uncle Tan'} will automatically match your language and respond realistically.
          </div>
        </div>
      `;
    }

    // Evaluation modal / card if ready
    let evalHtml = '';
    if (state.evaluation) {
      const ev = state.evaluation;
      const bInfo = computeBadge(ev.totalScore !== undefined ? ev.totalScore : 0);
      evalHtml = `
        <div class="dpos-card" style="border:2px solid #0d9488; margin-top:16px;">
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

          <!-- COACHING TIP -->
          ${ev.coachingTip ? `
            <div style="margin-top:12px; background:#f0fdfa; border:1px solid #99f6e4; padding:10px 12px; border-radius:8px;">
              <div style="font-size:0.72rem; font-weight:800; color:#0f766e; margin-bottom:3px;">💡 Coach Tip (Personalized):</div>
              <div style="font-size:0.8rem; color:#134e4a; line-height:1.4;">${escapeHtml(ev.coachingTip)}</div>
            </div>` : ''}

          <div style="text-align:right; margin-top:12px;">
            <button class="btn" style="background:#0d9488; color:white; padding:8px 16px; font-size:0.8rem; font-weight:bold;" onclick="window.DPOS.resetRolePlay()">
              🔄 Try Scenario Again
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- SCENARIO BRIEF -->
      <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:10px 12px; border-radius:10px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:0.7rem; font-weight:800; color:#1d4ed8; text-transform:uppercase;">🎭 Live Customer Encounter</div>
          <span style="font-size:0.65rem; background:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:4px; font-weight:700;">Speech-to-Speech</span>
        </div>
        <div style="font-size:0.8rem; color:#1e3a8a; font-weight:600; margin-top:3px; line-height:1.35;">
          ${escapeHtml(persona.visibleText)}
        </div>
      </div>

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
  async function renderReview(container) {
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

    container.innerHTML = `<div style="text-align:center; padding:30px; color:#666;">🔄 Syncing team assessment scores and weekly sales...</div>`;

    let reviewData = null;
    try {
      const u = (typeof currentUser !== 'undefined' && currentUser && currentUser.username) || '';
      const r = (typeof currentUser !== 'undefined' && currentUser && currentUser.role) || '';
      const res = await dposApi('dposGetReview', { username: u, role: r });
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

    const roster = reviewData.roster || [];
    const totalCount = roster.length;
    const completedCount = roster.filter(r => r.status === 'Completed').length;
    const coachingCount = roster.filter(r => r.needsCoaching).length;

    let rowsHtml = roster.map(r => {
      const isComplete = r.status === 'Completed';
      const rowClass = r.needsCoaching ? (isComplete ? 'row-coaching-amber' : 'row-coaching-red') : '';
      
      const qDisplay = r.quizScore !== null ? `${r.quizScore}/10` : `<span style="color:#ef4444; font-weight:bold;">Pending</span>`;
      const rpDisplay = r.rolePlayScore !== null ? `${r.rolePlayScore}/100` : `<span style="color:#ef4444; font-weight:bold;">Pending</span>`;
      
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
      const personaObj = splitPersona((state.currentWeek && state.currentWeek.persona) || "");
      
      // Build conversation history text
      const historyText = state.rolePlayTurns.map(t => `${t.speaker === 'user' ? 'Teammate' : 'Customer'}: ${t.text}`).join('\n');

      const systemInstruction = `You are a virtual customer role-play engine for PMG Pharmacy in Sarawak, Malaysia.
CUSTOMER PERSONA:
${personaObj.hiddenPrompt}

PRIOR CONVERSATION:
${historyText || '(No prior turns, teammate is speaking first)'}

PMG PHARMACY & JASE HEALTHCARE BRAND GLOSSARY:
Accurately transcribe the teammate's speech recognizing these pharmacy brands and frontline terms:
- House Brand Joint & Bone SKUs: JH Nutrition Flexson, Livemore Flexmore, Nutribridge Flexsure Gold, JH Nutrition Eutango, V-Infinity Neoflex, Nutribridge Crystoe, JH Nutrition Fish Oil 1000mg, Nutribridge Calcium Plus Vitamin D3 & K2, Nutribridge Magnesium 150mg, Curcuma Plus, Glucosamine, Chondroitin, Collagen Type II.
- House Brand Relief & OTC SKUs: Biowell Terrafast 500mg, Medicplast Heat Therapy Patch, Medicplast Thermo Patch, Medicplast Terracool.
- Other PMG House Brands (Jase Healthcare): Nutribridge, JH Nutrition, Biowell, Livemore, Medicplast, V-Infinity (V∞), Victoria, VK Dermsolve, Shieldmax, Omma.
- Frontline & Loyalty Terms: PMG Membership (ahli PMG / 免费会员 / free membership), Senior Care Plus (SCP / 乐龄关怀计划 / 银发族计划), 28th Monthly Free Blood Glucose Test (28hb ujian gula percuma / 每月28号免费验血糖), Purchase-with-Purchase (PWP), Gift-with-Purchase (GWP).

STRICT INSTRUCTIONS:
1. Listen to the teammate's audio recording. Transcribe their words accurately in the exact language spoken. Accurately transcribe product names like "Flexson", "Flexmore", "Terrafast", "Medicplast", "Senior Care Plus", etc.
2. Auto-detect their spoken language:
   - "zh" (Mandarin / Chinese)
   - "ms" (Bahasa Melayu / Sarawak Malay)
   - "en" (English / Malaysian English)
   - "mixed" (Mixed)
3. MANDATORY CRITICAL RULE - STRICT LANGUAGE MATCHING:
   The virtual customer's response MUST STRICTLY MATCH the language spoken by the teammate in this latest recording:
   - If teammate spoke Mandarin -> Uncle Tan MUST reply in natural conversational Mandarin (Chinese characters: 华语). DO NOT reply in Malay or English!
   - If teammate spoke Malay -> Uncle Tan MUST reply in conversational Sarawak Malay. DO NOT reply in Mandarin or English!
   - If teammate spoke English -> Uncle Tan MUST reply in natural Malaysian English. DO NOT reply in Malay or Mandarin!
4. CONVERSATION CONTINUITY & REALISM:
   - Uncle Tan is 67, has right knee pain climbing stairs, wants fast relief, has past gastritis (reveals stomach issues only if asked), and is open to PMG House Brand recommendations (Flexson, Flexmore, Eutango, Neoflex, Medicplast, etc.).
   - Reply directly to what the teammate just said in this audio turn.
   - If teammate greeted you, explain your knee complaint.
   - If teammate asked about symptoms or past gastric issues, answer honestly.
   - If teammate recommended House Brand or patch, ask about pricing or confirm interest.
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
            { text: "Listen to the teammate's audio input. Reply in character as Uncle Tan matching their spoken language and evaluate the turn." },
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
    const evalPrompt = `You are a strict clinical pharmacy training evaluator for PMG Pharmacy in Malaysia.
Evaluate this customer role-play transcript using the 100-point PMG Frontline Rubric.

WEEKLY CLINICAL TOPIC & FORMULATIONS:
${w.topic || "Week 1: Joint Health & Osteoarthritis Care"}
${w.summaryMd || ""}
House Brand SKUs: ${w.skus || "JH Nutrition Flexson, Livemore Flexmore"}
Promo Context: ${w.promo || "Senior Care Plus free glucose test on 28th"}

TRANSCRIPT OF CONSULTATION:
${transcript}

CRITICAL SCORING RULES - STRICT ZERO TOLERANCE FOR OMISSIONS:
Score ONLY what was explicitly stated by the teammate in the transcript. Do NOT award points for unsaid recommendations:
1. Vocal Warmth: Award ${avgWarmth}/10 based on recorded voice intonation.
2. Fluency & Confidence: Award ${avgFluency}/10 based on vocal pacing and filler count.
3. Positive Vocabulary & Empathy (0-10): Caring words, reassurance, polite address (e.g., Uncle, auntie, jangan risau, 别担心).
4. Clinical DPOS & House Brand Explanation (0-35):
   - Diagnosis triage (0-10): Did teammate ask clarifying symptom questions, screen red flags (swelling/redness/fever), or check medical history (gastritis/kidney/blood thinners)? (Award 0 if not asked).
   - OTC immediate relief (0-10): Did teammate advise safe symptomatic relief (e.g., Terrafast / paracetamol dosage, Medicplast heat patch on intact skin)? (Award 0 if omitted).
   - PMG House Brand supplement root cause (0-15):
     Did teammate recommend and explain a relevant PMG House Brand supplement for joint or cartilage health?
     * Focus SKUs: JH Nutrition Flexson, Livemore Flexmore.
     * ALSO FULLY ACCEPT & REWARD ANY relevant PMG House Brand product from Jase Healthcare (e.g., Nutribridge Flexsure Gold, JH Nutrition Eutango, V-Infinity Neoflex, Nutribridge Crystoe, JH Nutrition Fish Oil 1000mg, Calcium Plus Vitamin D3 & K2, or joint/cartilage supplements like Glucosamine, Chondroitin, Collagen Type II).
     * Phonetic and speech transcription variations (e.g. 'flex son', 'flexon', 'flex more', 'flex-more', 'flexsure', 'eutango', or in Chinese '关节补品', '软骨素', '天然消炎') MUST be recognized and awarded full credit.
     (Award 0 ONLY if teammate completely omitted recommending any House Brand supplement).
5. Cashier GWP / PWP Pitch (0-15): Did teammate proactively offer current cashier Purchase-with-Purchase or Gift-with-Purchase counter deals before closing? (Award 0 if omitted).
6. Loyalty & Senior Care Plus (0-20):
   - PMG Loyalty & Senior Care Plus (0-10):
     Did the teammate check if the customer is a PMG member, mention PMG membership (including that it is free to join), OR introduce the Senior Care Plus (SCP) programme? (Award full 10 points if the teammate checked membership OR introduced Senior Care Plus).
   - 28th Monthly Free Blood Glucose Screening (0-10):
     Did the teammate explicitly highlight the FREE blood glucose test on the 28th of every month for seniors (in any language, e.g. 28号免费验血糖 / 28hb ujian gula darah percuma / free blood glucose test on the 28th)? (Award full 10 points if mentioned).

TOTAL SCORE:
Sum the above breakdown scores strictly (total out of 100). If teammate omitted steps, their total score MUST be low (e.g. 20-50, Bronze badge).

Provide 1 actionable coaching tip in the teammate's primary spoken language (max 35 words).

Output strictly in JSON:
{
  "totalScore": 75,
  "speakingConfidence": "${confRating}",
  "languageUsed": "${languages}",
  "breakdown": {
    "warmth": ${avgWarmth},
    "fluency": ${avgFluency},
    "empathy": 8,
    "dpos": 30,
    "pwp": 0,
    "membership": 20
  },
  "coachingTip": "..."
}`;

    try {
      const res = await dposGenerate('gemini-3.5-flash-lite', evalPrompt);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = extractJson(text) || {};

      const bd = parsed.breakdown || {};
      const warmth = bd.warmth !== undefined ? Number(bd.warmth) : (bd.vocalWarmth !== undefined ? Number(bd.vocalWarmth) : avgWarmth);
      const fluency = bd.fluency !== undefined ? Number(bd.fluency) : (bd.fluencyConfidence !== undefined ? Number(bd.fluencyConfidence) : avgFluency);
      const empathy = bd.empathy !== undefined ? Number(bd.empathy) : (bd.empathyListening !== undefined ? Number(bd.empathyListening) : 0);
      
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
      const memScore = bd.membership !== undefined ? Number(bd.membership) : (bd.loyaltySeniorCare !== undefined ? Number(bd.loyaltySeniorCare) : 0);

      const cleanBreakdown = {
        warmth: Math.min(10, Math.max(0, warmth)),
        fluency: Math.min(10, Math.max(0, fluency)),
        empathy: Math.min(10, Math.max(0, empathy)),
        dpos: Math.min(35, Math.max(0, dposScore)),
        pwp: Math.min(15, Math.max(0, pwpScore)),
        membership: Math.min(20, Math.max(0, memScore))
      };

      const calculatedTotal = cleanBreakdown.warmth + cleanBreakdown.fluency + cleanBreakdown.empathy + cleanBreakdown.dpos + cleanBreakdown.pwp + cleanBreakdown.membership;
      const totalScore = parsed.totalScore !== undefined ? Math.min(100, Math.max(calculatedTotal, Number(parsed.totalScore))) : calculatedTotal;

      state.evaluation = {
        totalScore: totalScore,
        speakingConfidence: confRating,
        languageUsed: languages || 'Bahasa Melayu',
        breakdown: cleanBreakdown,
        coachingTip: parsed.coachingTip || "Sila pastikan triage simptom, terangkan suplemen House Brand, dan ingatkan program Senior Care Plus 28hb."
      };

      // Save role-play score to sheet / backend
      saveTeammateScore(state.quizScore, totalScore, languages, confRating);

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
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    renderRolePlay(document.getElementById("dposContentContainer"));
  }

  // ─── PERSISTENCE (SHEET & LOCALSTORAGE) ────────────────────────────────────
  async function saveTeammateScore(quizScore, rolePlayScore, lang, conf) {
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
      speakingConfidenceRating: conf
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
    if (tab === 'review') {
      const isMgr = (typeof isManagementOrPharmacist === 'function') ? isManagementOrPharmacist(currentUser) : false;
      if (!state.canReview || !isMgr) {
        console.warn("Unauthorized attempt to access Review tab");
        state.currentTab = 'spotlight';
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
    selectOption: selectOption,
    nextQuestion: nextQuestion,
    retakeQuiz: retakeQuiz,
    replaySpeech: replaySpeech,
    evaluateRolePlay: evaluateRolePlay,
    resetRolePlay: resetRolePlay,
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
    computeConfidence: computeConfidence
  };

  global.DPOS = DPOS;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DPOS;
  }

})(typeof window !== 'undefined' ? window : this);
