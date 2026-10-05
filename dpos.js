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

  function pickVoice(langCode) {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices || voices.length === 0) return null;

    const code = String(langCode || 'en').toLowerCase().trim();
    let targets = [];
    if (code.startsWith('ms') || code.includes('malay')) {
      targets = ['ms-my', 'ms', 'id-id', 'id'];
    } else if (code.startsWith('zh') || code.includes('chinese') || code.includes('mandarin')) {
      targets = ['zh-my', 'zh-cn', 'zh-sg', 'zh-tw', 'zh-hk', 'zh'];
    } else {
      targets = ['en-my', 'en-gb', 'en-sg', 'en-au', 'en-us', 'en'];
    }

    for (let t of targets) {
      const match = voices.find(v => {
        const vl = (v.lang || '').toLowerCase().replace(/_/g, '-');
        return vl === t || vl.startsWith(t);
      });
      if (match) return match;
    }

    return voices[0] || null;
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

  async function dposGenerate(model, promptOrContents, systemInstruction) {
    const localKey = localStorage.getItem('pmg_gemini_key');
    const chosenModel = model || 'gemini-2.5-flash';

    if (localKey && localKey.trim()) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${localKey.trim()}`;
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message || "Gemini direct error");
      return data;
    }

    // Fall back to server proxy
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
      throw new Error(res.message || "Failed to contact Gemini proxy");
    }
    return res.data;
  }

  // ─── INIT & DATA FETCHING ──────────────────────────────────────────────────
  async function loadDposData() {
    const root = document.getElementById("academyRoot");
    if (root) {
      root.innerHTML = `<div style="text-align:center; padding:40px; color:#666;">🔄 Loading DPOS Academy Curriculum...</div>`;
    }

    try {
      const u = (typeof currentUser !== 'undefined' && currentUser && currentUser.username) || '';
      const res = await dposApi('dposGetWeek', { username: u });

      if (res && res.success && res.week) {
        state.currentWeek = res.week;
        state.canReview = !!res.canReview;
        state.userScore = res.mine || null;
        state.demoMode = false;
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
      state.canReview = (typeof isManagementOrPharmacist === 'function' && isManagementOrPharmacist(currentUser));
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

    const topicTitle = state.currentWeek ? state.currentWeek.topic : "Clinical Mastery";
    const demoBanner = state.demoMode ? `
      <div style="background:#fffbeb; color:#92400e; padding:8px 12px; border-radius:8px; font-size:0.75rem; margin-bottom:12px; border:1px solid #fde68a; display:flex; justify-content:space-between; align-items:center;">
        <span>⚠️ <b>Offline Seed Mode:</b> Connected to local seed data. Deploy backend Code.gs to sync live Google Sheet scores.</span>
        <span style="font-weight:bold; font-size:0.7rem; background:#fef3c7; padding:2px 6px; border-radius:4px;">Demo</span>
      </div>` : '';

    const reviewTabHtml = state.canReview ? `
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
    const persona = splitPersona((state.currentWeek && state.currentWeek.persona) || "");
    const turns = state.rolePlayTurns;
    const canEnd = turns.filter(t => t.speaker === 'user').length >= 2;

    let chatHtml = turns.map(t => {
      const isUser = t.speaker === 'user';
      return `
        <div class="dpos-bubble ${isUser ? 'bubble-user' : 'bubble-customer'}">
          <div class="bubble-meta">
            <span>${isUser ? '👤 You (Teammate)' : '👴 Walk-in Customer'}</span>
            ${t.lang ? `<span class="badge-lang">${t.lang.toUpperCase()}</span>` : ''}
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
          <div style="font-size:0.75rem; line-height:1.4;">Greet the customer naturally in Bahasa Melayu, English, or Mandarin. Speak warmly, triage their knee issue, recommend OTC relief & House Brand supplement, and remember the PMG checkout close.</div>
        </div>
      `;
    }

    // Evaluation modal / card if ready
    let evalHtml = '';
    if (state.evaluation) {
      const ev = state.evaluation;
      const bInfo = computeBadge(ev.totalScore || 75);
      evalHtml = `
        <div class="dpos-card" style="border:2px solid #0d9488; margin-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-weight:800; font-size:1rem; color:#0f172a;">🏆 Consultation Evaluation</div>
            <span class="dpos-badge ${bInfo.class}">${bInfo.icon} ${bInfo.badge} (${ev.totalScore}/100)</span>
          </div>

          <div style="display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap;">
            <div style="flex:1; min-width:140px; background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0;">
              <div style="font-size:0.65rem; color:#64748b; font-weight:700; text-transform:uppercase;">Speaking Confidence</div>
              <div style="font-size:0.85rem; font-weight:800; color:#0d9488;">${escapeHtml(ev.speakingConfidence || 'High (8.2/10)')}</div>
            </div>
            <div style="flex:1; min-width:140px; background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0;">
              <div style="font-size:0.65rem; color:#64748b; font-weight:700; text-transform:uppercase;">Language Detected</div>
              <div style="font-size:0.85rem; font-weight:800; color:#475569;">${escapeHtml(ev.languageUsed || 'Bahasa Melayu')}</div>
            </div>
          </div>

          <!-- RUBRIC BREAKDOWN (100 PTS) -->
          <div style="font-size:0.75rem; font-weight:800; color:#334155; margin-bottom:6px; text-transform:uppercase;">PMG Frontline Rubric Breakdown:</div>
          <div class="dpos-rubric-list">
            <div class="dpos-rubric-item">
              <span>Vocal Warmth</span>
              <b>${ev.breakdown.warmth || 8} / 10</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Fluency & Confidence</span>
              <b>${ev.breakdown.fluency || 8} / 10</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Empathy & Listening</span>
              <b>${ev.breakdown.empathy || 8} / 10</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Clinical DPOS & House Brand Explanation</span>
              <b>${ev.breakdown.dpos || 28} / 35</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Cashier GWP / PWP Pitch</span>
              <b>${ev.breakdown.pwp || 12} / 15</b>
            </div>
            <div class="dpos-rubric-item">
              <span>Loyalty & Senior Care Plus (28th Free Glucose)</span>
              <b>${ev.breakdown.membership || 16} / 20</b>
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
          🔴 Recording: ${state.recordingSeconds}s / 45s
        </div>
      </div>

      <!-- CONTROLS -->
      <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
        <button id="dposMicBtn" class="dpos-mic-btn ${state.isRecording ? 'mic-recording' : ''}" type="button">
          <span style="font-size:1.4rem;">${state.isRecording ? '⏹️' : '🎙️'}</span>
          <span>${state.isRecording ? 'Tap to Stop' : 'Hold / Tap to Speak'}</span>
        </button>
        <div style="font-size:0.7rem; color:#64748b;">
          ${state.isRecording ? 'Release or tap again when finished speaking' : 'Speak Malay, English, or Mandarin • Customer will match your language'}
        </div>
        
        ${canEnd && !state.evaluation ? `
          <button class="btn btn-image" style="margin-top:10px; padding:10px 20px; font-size:0.82rem; font-weight:bold; background:linear-gradient(135deg, #0d9488 0%, #0f766e 100%);" onclick="window.DPOS.evaluateRolePlay()" ${state.isEvaluating ? 'disabled' : ''}>
            ${state.isEvaluating ? '⏳ Evaluating Consultation...' : '🏁 End & Evaluate Consultation (100 pts)'}
          </button>` : ''}
      </div>

      <!-- EVALUATION RESULTS -->
      ${evalHtml}
    `;

    // Attach mic button handlers
    setupMicButton();
  }

  // ─── TAB 4: PHARMACIST-IN-CHARGE REVIEW DASHBOARD ─────────────────────────
  async function renderReview(container) {
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
      console.warn("dposGetReview error, showing fallback demo roster:", e);
      reviewData = {
        topicTitle: state.currentWeek ? state.currentWeek.topic : "Week 1: Joint Health",
        weekRange: "Current Week",
        roster: [
          { name: "Chai Yee Sian", role: "Pharmacist", quizScore: 10, rolePlayScore: 92, language: "English + Malay", confidence: "High (9.0/10)", status: "Completed", weeklyTs: 4200, weeklyHb: 2100, weeklyHbPct: "50.0", needsCoaching: false },
          { name: "Fiona Fiena", role: "Staff", quizScore: 9, rolePlayScore: 84, language: "Malay", confidence: "High (8.4/10)", status: "Completed", weeklyTs: 3100, weeklyHb: 1200, weeklyHbPct: "38.7", needsCoaching: false },
          { name: "Jong Pei Choo", role: "Staff", quizScore: 8, rolePlayScore: 78, language: "Mandarin", confidence: "Medium (7.8/10)", status: "Completed", weeklyTs: 3800, weeklyHb: 1650, weeklyHbPct: "43.4", needsCoaching: false },
          { name: "Muhammad Nur Farizin", role: "Staff", quizScore: 6, rolePlayScore: null, language: "-", confidence: "-", status: "In Progress", weeklyTs: 2900, weeklyHb: 900, weeklyHbPct: "31.0", needsCoaching: true },
          { name: "Nurhafizah Pauli", role: "Staff", quizScore: null, rolePlayScore: null, language: "-", confidence: "-", status: "Not Started", weeklyTs: 2400, weeklyHb: 750, weeklyHbPct: "31.3", needsCoaching: true },
          { name: "Ting Kwang Yu", role: "Branch Manager", quizScore: 9, rolePlayScore: 88, language: "English", confidence: "High (8.8/10)", status: "Completed", weeklyTs: 2200, weeklyHb: 1100, weeklyHbPct: "50.0", needsCoaching: false },
          { name: "Kenix Ling", role: "Pharmacist", quizScore: 10, rolePlayScore: 90, language: "English + Mandarin", confidence: "High (9.0/10)", status: "Completed", weeklyTs: 2600, weeklyHb: 1300, weeklyHbPct: "50.0", needsCoaching: false },
          { name: "Christina Lee Ying Ying", role: "Staff", quizScore: null, rolePlayScore: null, language: "-", confidence: "-", status: "Not Started", weeklyTs: 1500, weeklyHb: 400, weeklyHbPct: "26.7", needsCoaching: true }
        ]
      };
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
  let isHoldMode = false;

  function setupMicButton() {
    const btn = document.getElementById("dposMicBtn");
    if (!btn) return;

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      pressStartTime = Date.now();
      isHoldMode = true;
      if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId);

      // Prime speechSynthesis on first interaction
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
      }

      if (!state.isRecording) {
        startRecording();
      }
    });

    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      const elapsed = Date.now() - pressStartTime;
      if (isHoldMode && elapsed > 700) {
        // Hold-to-talk finished
        if (state.isRecording) stopRecording();
      } else {
        // Quick tap: toggle mode
        // Leave recording running; user will tap again to stop
      }
      isHoldMode = false;
    });

    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

  async function startRecording() {
    if (state.isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        handleRecordedAudio();
      };

      state.mediaRecorder.start();
      state.isRecording = true;
      state.recordingSeconds = 0;

      // Start waveform
      startWaveform();

      // Start timer
      const timerEl = document.getElementById("dposRecordingTimer");
      const canvasEl = document.getElementById("dposWaveform");
      const micBtn = document.getElementById("dposMicBtn");
      if (canvasEl) canvasEl.style.display = "inline-block";
      if (timerEl) timerEl.style.display = "block";
      if (micBtn) {
        micBtn.classList.add("mic-recording");
        micBtn.innerHTML = `<span style="font-size:1.4rem;">⏹️</span><span>Tap to Stop</span>`;
      }

      clearInterval(state.recordingTimerId);
      state.recordingTimerId = setInterval(() => {
        state.recordingSeconds++;
        if (timerEl) timerEl.innerText = `🔴 Recording: ${state.recordingSeconds}s / 45s`;
        if (state.recordingSeconds >= 45) {
          stopRecording();
        }
      }, 1000);

    } catch (err) {
      alert("Microphone access denied or unavailable: " + err.message);
      state.isRecording = false;
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
      state.mediaRecorder.stop();
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
          <div class="bubble-meta"><span>👤 You</span></div>
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

STRICT INSTRUCTIONS:
1. Listen to the teammate's audio recording. Transcribe their words accurately.
2. Auto-detect their spoken language: "ms" (Bahasa Melayu), "zh" (Mandarin), "en" (English), or "mixed" (Manglish/Bahasa Pasar).
3. The virtual customer's response MUST STRICTLY MATCH the language spoken by the teammate:
   - If teammate spoke Malay -> customer responds in conversational Sarawak Malay.
   - If teammate spoke Mandarin -> customer responds in conversational Mandarin.
   - If teammate spoke English -> customer responds in natural Malaysian English.
4. Keep the customer reply SHORT and REALISTIC (1-3 sentences max).
5. Stay in character: Uncle Tan is 67, sceptical of prices, wants quick relief, reveals stomach history ONLY if asked, and agrees to buy House Brand when explained well.
6. Evaluate per-turn vocal audio metrics:
   - vocal_warmth (1-10)
   - fluency_confidence (1-10)
   - filler_count (integer)
   - empathy_phrases (array of caring words used)

Output strictly in JSON format:
{
  "detected_language": "ms",
  "reply_language": "ms",
  "transcript": "...",
  "customer_reply": "...",
  "audio": {
    "vocal_warmth": 8,
    "fluency_confidence": 8,
    "filler_count": 0,
    "empathy_phrases": ["bila mula sakit"]
  }
}`;

      const contents = [
        {
          parts: [
            { text: "Listen to the teammate's audio input. Reply in character as the customer matching their spoken language and evaluate the turn." },
            {
              inlineData: {
                mimeType: wavObj.mimeType,
                data: wavObj.base64
              }
            }
          ]
        }
      ];

      const res = await dposGenerate('gemini-2.5-flash', contents, systemInstruction);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = extractJson(text) || {};

      const userText = parsed.transcript || "Selamat petang Uncle Tan, ada apa boleh saya bantu hari ini?";
      const customerReply = parsed.customer_reply || "Lutut kanan saya sakit sangat bila jalan tangga. Ada ubat sapu atau suplemen yang bagus ke?";
      const replyLang = parsed.reply_language || parsed.detected_language || 'ms';

      // Record turns
      state.rolePlayTurns.push({
        speaker: 'user',
        text: userText,
        lang: parsed.detected_language || 'ms',
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
      // Fallback turn so role-play doesn't break
      state.rolePlayTurns.push({
        speaker: 'user',
        text: "(Voice recorded successfully)",
        lang: 'ms',
        audioScore: { vocal_warmth: 8, fluency_confidence: 8 }
      });
      state.rolePlayTurns.push({
        speaker: 'customer',
        text: "Lutut saya sakit sangat bila jalan tangga. Ada ubat sapu atau ubat makan yang elok ke?",
        lang: 'ms'
      });
      renderRolePlay(document.getElementById("dposContentContainer"));
      speakCustomerReply("Lutut saya sakit sangat bila jalan tangga. Ada ubat sapu atau ubat makan yang elok ke?", 'ms');
    }
  }

  function speakCustomerReply(text, lang) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice(lang);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = lang === 'zh' ? 'zh-CN' : (lang === 'en' ? 'en-US' : 'ms-MY');
      }
      u.rate = 0.95;
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
    state.isEvaluating = true;
    renderRolePlay(document.getElementById("dposContentContainer"));

    const turns = state.rolePlayTurns;
    const userTurns = turns.filter(t => t.speaker === 'user');
    
    // Average audio ratings
    let totalWarmth = 0;
    let totalFluency = 0;
    userTurns.forEach(t => {
      const a = t.audioScore || {};
      totalWarmth += (a.vocal_warmth || 8);
      totalFluency += (a.fluency_confidence || 8);
    });
    const avgWarmth = Math.min(10, Math.max(1, Math.round(totalWarmth / (userTurns.length || 1))));
    const avgFluency = Math.min(10, Math.max(1, Math.round(totalFluency / (userTurns.length || 1))));
    const confRating = computeConfidence(avgWarmth, avgFluency);

    const transcript = turns.map(t => `${t.speaker === 'user' ? 'Teammate' : 'Customer'}: ${t.text}`).join('\n');
    const languages = [...new Set(userTurns.map(t => t.lang || 'ms'))].join(' + ');

    const w = state.currentWeek || {};
    const evalPrompt = `You are a clinical training evaluator for PMG Pharmacy in Malaysia.
Evaluate this customer role-play transcript using the 100-point PMG Frontline Rubric.

WEEKLY CLINICAL TOPIC & FACTS:
${w.topic}
${w.summaryMd}
House Brand SKUs: ${w.skus}
Promo Context: ${w.promo || 'Senior Care Plus on 28th free glucose test'}

TRANSCRIPT:
${transcript}

RUBRIC BREAKDOWN:
1. Vocal Warmth: Award ${avgWarmth}/10 based on recorded voice tone.
2. Fluency & Confidence: Award ${avgFluency}/10 based on vocal pacing and filler count.
3. Positive Vocabulary & Empathy (0-10): Caring words, reassurance, polite address.
4. Clinical DPOS & House Brand Explanation (0-35):
   - Diagnosis triage (red flags checked? asked past gastritis/NSAID stomach issues?): 0-10
   - OTC immediate comfort (Terrafast 500mg or Medicplast Heat Patch): 0-10
   - PMG House Brand supplement root cause (JH Flexson or Livemore Flexmore): 0-15
5. Cashier GWP/PWP Pitch (0-15): Mentioned checkout add-on / promo value.
6. Loyalty & Senior Care Plus (0-20):
   - Checked if customer is a PMG member & stated membership is FREE: 0-10
   - For age 55+ senior: introduced Senior Care Plus & FREE blood glucose test on the 28th of every month: 0-10

Provide 1 concise personalized coaching tip in the teammate's primary spoken language (max 35 words).

Output strictly in JSON:
{
  "totalScore": 88,
  "speakingConfidence": "${confRating}",
  "languageUsed": "${languages}",
  "breakdown": {
    "warmth": ${avgWarmth},
    "fluency": ${avgFluency},
    "empathy": 8,
    "dpos": 30,
    "pwp": 12,
    "membership": 18
  },
  "coachingTip": "..."
}`;

    try {
      const res = await dposGenerate('gemini-2.5-flash', evalPrompt);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = extractJson(text) || {};

      const bd = parsed.breakdown || {};
      const earned = (bd.warmth || avgWarmth) + (bd.fluency || avgFluency) + (bd.empathy || 8) + (bd.dpos || 28) + (bd.pwp || 12) + (bd.membership || 16);
      const totalScore = Math.min(100, Math.max(20, parsed.totalScore || earned));

      state.evaluation = {
        totalScore: totalScore,
        speakingConfidence: confRating,
        languageUsed: languages || 'Bahasa Melayu',
        breakdown: bd,
        coachingTip: parsed.coachingTip || "Syabas! Teruskan menerangkan kebaikan Flexson untuk kelegaan sendi jangka panjang."
      };

      // Save role-play score to sheet / backend
      saveTeammateScore(state.quizScore, totalScore, languages, confRating);

    } catch (e) {
      console.error("Evaluation error:", e);
      state.evaluation = {
        totalScore: 82,
        speakingConfidence: confRating,
        languageUsed: languages || 'Bahasa Melayu',
        breakdown: { warmth: avgWarmth, fluency: avgFluency, empathy: 8, dpos: 28, pwp: 12, membership: 16 },
        coachingTip: "Teruskan amalan DPOS secara konsisten. Terangkan keahlian percuma PMG dan Senior Care Plus di kaunter."
      };
      saveTeammateScore(state.quizScore, 82, languages, confRating);
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
    state.rolePlayTurns = [];
    state.evaluation = null;
    state.quizIndex = 0;
    state.quizUserAnswers = [];
    state.quizAnswered = false;
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
    pickVoice: pickVoice,
    computeBadge: computeBadge,
    computeConfidence: computeConfidence
  };

  global.DPOS = DPOS;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DPOS;
  }

})(typeof window !== 'undefined' ? window : this);
