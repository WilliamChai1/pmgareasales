const API_URL = "https://script.google.com/macros/s/AKfycbwhxfd5OQrDJw3bYPuzCd8DQqhWfOmtkQpQUTu7ke9s2bE_egFmvWeubaEtjMvBzADS/exec";
const WEBAPP_LINK = "https://williamchai1.github.io/pmgareasales/";
const DEFAULT_BRANCH = "Kota Sentosa";

let currentUser = null;
let currentData = null;
let selectedBranch = DEFAULT_BRANCH;
let currentReportType = null;
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installAppBtn').style.display = 'block';
});

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        document.getElementById('installAppBtn').style.display = 'none';
      }
      deferredPrompt = null;
    });
  }
}

async function executeLogin() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const btn = document.getElementById("loginBtn");
  
  if(!user || !pass) return alert("Please enter username and password");
  btn.innerText = "Authenticating...";
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: 'login', username: user, password: pass })
    });
    
    const data = await res.json();
    
    if (data.success) {
      currentUser = data.user;
      // Lock role and single-branch view strictly to PMG Kota Sentosa
      if (!currentUser.branch || String(currentUser.branch).toUpperCase() === 'ALL') {
        currentUser.branch = DEFAULT_BRANCH;
      }
      const rawRole = currentUser.role || currentUser.position || '';
      if (!rawRole) {
        const u = String(currentUser.username || '').toLowerCase();
        currentUser.role = (u === 'williamchai' || u === 'william') ? 'Pharmacist-in-Charge' : 'Staff';
      } else {
        currentUser.role = rawRole;
      }
      selectedBranch = currentUser.branch || DEFAULT_BRANCH;
      localStorage.setItem("pmg_session", JSON.stringify(currentUser));
      document.getElementById("loginOverlay").style.display = "none";
      const navBar = document.getElementById("mainNavBar");
      if (navBar) navBar.style.display = "flex";
      
      if (window.DPOS && typeof window.DPOS.dposReset === 'function') {
        window.DPOS.dposReset();
      }

      loadDashboardData();
    } else {
      const errEl = document.getElementById("loginError");
      errEl.innerText = data.message || "Invalid credentials. Please try again.";
      errEl.style.display = "block";
      btn.innerText = "Secure Login";
    }
  } catch (e) {
    alert("Connection Error. Please check your internet.");
    btn.innerText = "Secure Login";
  }
}

function toggleAuthView(view) {
  const loginBox = document.getElementById("loginBox");
  const signupBox = document.getElementById("signupBox");
  const loginErr = document.getElementById("loginError");
  const signupErr = document.getElementById("signupError");
  const signupSuccess = document.getElementById("signupSuccess");

  if (loginErr) loginErr.style.display = "none";
  if (signupErr) signupErr.style.display = "none";
  if (signupSuccess) signupSuccess.style.display = "none";

  if (view === 'signup') {
    loginBox.style.display = "none";
    signupBox.style.display = "block";
    history.pushState({ authView: 'signup' }, '');
  } else {
    signupBox.style.display = "none";
    loginBox.style.display = "block";
  }
}

async function executeSignUp() {
  const name = document.getElementById("signupName").value.trim();
  const empId = document.getElementById("signupEmpId").value.trim();
  const role = document.getElementById("signupRole").value;
  const race = document.getElementById("signupRace").value;
  const branch = document.getElementById("signupBranch").value;
  const user = document.getElementById("signupUsername").value.trim();
  const pass = document.getElementById("signupPassword").value.trim();
  const confirmPass = document.getElementById("signupConfirmPassword").value.trim();

  const errEl = document.getElementById("signupError");
  const succEl = document.getElementById("signupSuccess");
  const btn = document.getElementById("signupBtn");

  errEl.style.display = "none";
  succEl.style.display = "none";

  if (!name || !empId || !user || !pass || !confirmPass) {
    errEl.innerText = "Please fill in all required fields.";
    errEl.style.display = "block";
    return;
  }

  if (pass !== confirmPass) {
    errEl.innerText = "Passwords do not match. Please re-enter.";
    errEl.style.display = "block";
    return;
  }

  if (pass.length < 4) {
    errEl.innerText = "Password / PIN must be at least 4 digits.";
    errEl.style.display = "block";
    return;
  }

  btn.innerText = "Submitting...";
  btn.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: 'signup',
        username: user,
        password: pass,
        name: name,
        role: role,
        branch: branch,
        empId: empId,
        race: race
      })
    });

    const data = await res.json();

    if (data.success) {
      succEl.innerHTML = "✅ Registration submitted!<br><span style='font-size:0.78rem; font-weight:normal; color:#444;'>Your account is pending Area Manager approval. Once approved, you can log in immediately.</span>";
      succEl.style.display = "block";
      btn.style.display = "none";
      setTimeout(() => {
        toggleAuthView('login');
        btn.style.display = "block";
        btn.innerText = "Submit for Approval";
        btn.disabled = false;
      }, 4000);
    } else {
      errEl.innerText = data.message || "Registration failed. Please try again.";
      errEl.style.display = "block";
      btn.innerText = "Submit for Approval";
      btn.disabled = false;
    }
  } catch (e) {
    errEl.innerText = "Connection error. Please check your internet.";
    errEl.style.display = "block";
    btn.innerText = "Submit for Approval";
    btn.disabled = false;
  }
}

async function executeApproveUser(targetUsername) {
  if (!confirm(`Are you sure you want to approve @${targetUsername}?`)) return;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: 'approveUser',
        targetUsername: targetUsername,
        adminUsername: currentUser ? currentUser.username : ''
      })
    });

    const data = await res.json();
    if (data.success) {
      alert(data.message || "User approved successfully!");
      loadDashboardData();
    } else {
      alert(data.message || "Failed to approve user.");
    }
  } catch (e) {
    alert("Error connecting to server. Please try again.");
  }
}

function logout() {
  currentUser = null;
  currentData = null;
  selectedBranch = DEFAULT_BRANCH;
  localStorage.removeItem("pmg_session");
  
  document.getElementById("loginOverlay").style.display = "flex";
  toggleAuthView('login');
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("personalDashboard").style.display = "none";
  document.getElementById("managerReportsSection").style.display = "none";
  document.getElementById("editActionPlanBtn").style.display = "none";
  document.getElementById("staffPerformanceSection").style.display = "none";
  const navBar = document.getElementById("mainNavBar");
  if (navBar) navBar.style.display = "none";
  switchMainTab('dashboard');
  if (window.DPOS && typeof window.DPOS.dposReset === 'function') {
    window.DPOS.dposReset();
  }
}

function initSession() {
  try {
    const saved = localStorage.getItem("pmg_session");
    if (saved) {
      currentUser = JSON.parse(saved);
      // Lock role and single-branch view strictly to PMG Kota Sentosa
      if (!currentUser.branch || String(currentUser.branch).toUpperCase() === 'ALL') {
        currentUser.branch = DEFAULT_BRANCH;
      }
      const rawRole = currentUser.role || currentUser.position || '';
      if (!rawRole) {
        const u = String(currentUser.username || '').toLowerCase();
        currentUser.role = (u === 'williamchai' || u === 'william') ? 'Pharmacist-in-Charge' : 'Staff';
      } else {
        currentUser.role = rawRole;
      }
      selectedBranch = currentUser.branch || DEFAULT_BRANCH;
      document.getElementById("loginOverlay").style.display = "none";
      const navBar = document.getElementById("mainNavBar");
      if (navBar) navBar.style.display = "flex";
      loadDashboardData();
    }
  } catch (e) {
    localStorage.removeItem("pmg_session");
  }
}
window.addEventListener('DOMContentLoaded', initSession);

function switchMainTab(tab) {
  const dashView = document.getElementById("dashboardView");
  const academyView = document.getElementById("academyView");
  const btnDash = document.getElementById("btnNavDashboard");
  const btnAcad = document.getElementById("btnNavAcademy");

  if (tab === 'academy') {
    if (dashView) dashView.style.display = "none";
    if (academyView) academyView.style.display = "block";
    if (btnDash) btnDash.classList.remove("active");
    if (btnAcad) btnAcad.classList.add("active");
    if (window.DPOS && typeof window.DPOS.init === 'function') {
      window.DPOS.init();
    }
  } else {
    if (dashView) dashView.style.display = "block";
    if (academyView) academyView.style.display = "none";
    if (btnDash) btnDash.classList.add("active");
    if (btnAcad) btnAcad.classList.remove("active");
    if (window.DPOS && typeof window.DPOS.dposReset === 'function') {
      window.DPOS.dposReset();
    }
  }
}

async function loadDashboardData() {
  document.getElementById("lastUpdated").innerText = "🔄 Syncing with Database...";
  selectedBranch = selectedBranch || (currentUser && currentUser.branch) || DEFAULT_BRANCH;
  if (String(selectedBranch).toUpperCase() === 'ALL') {
    selectedBranch = DEFAULT_BRANCH;
  }
  const branchToFetch = selectedBranch;
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        action: 'getData', 
        branch: branchToFetch, 
        role: (currentUser && (currentUser.position || currentUser.role)) || 'Staff',
        username: (currentUser && currentUser.username) || ''
      })
    });
    currentData = await res.json();
    
    if (currentData.error) {
      throw new Error(currentData.message);
    }

    // Auto-seed Gemini Key if provided by backend
    if (currentData.geminiKey && String(currentData.geminiKey).trim().length >= 10) {
      const serverKey = String(currentData.geminiKey).trim();
      const isMgr = isManagementOrPharmacist(currentUser);
      if (!isMgr || !localStorage.getItem('pmg_gemini_key')) {
        localStorage.setItem('pmg_gemini_key', serverKey);
        if (typeof updateGeminiBadge === 'function') updateGeminiBadge();
      }
    }
    // If current user is manager and has keys stored locally, sync to backend if backend key is missing
    if (isManagementOrPharmacist(currentUser)) {
      const localKey = localStorage.getItem('pmg_gemini_key');
      if (localKey && (!currentData.geminiKey || currentData.geminiKey.length < 10)) {
        fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'saveGeminiApiKey',
            apiKey: localKey.trim(),
            adminUsername: currentUser.username,
            role: currentUser.position || currentUser.role || 'Pharmacist'
          })
        }).catch(e => console.warn("Background gemini sync:", e));
      }
    }

    if (typeof initOneSignal === 'function') {
      initOneSignal();
    }
    renderDashboard();
    document.getElementById("lastUpdated").innerText = `🟢 Live Sync • ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    console.error(e);
    document.getElementById("lastUpdated").innerText = "⚠️ Error: " + e.message;
  }
}

const loadDashboard = loadDashboardData;

function changeBranch() {
  const sel = document.getElementById("branchSelector");
  if (sel) {
    selectedBranch = sel.value || DEFAULT_BRANCH;
  } else {
    selectedBranch = DEFAULT_BRANCH;
  }
  loadDashboardData();
}

// ─── BRANCH DATA RESOLVER ───────────────────────────────────────────────────
function findBranchKey(dict, branchName) {
  if (!dict) return null;
  const target = String(branchName || DEFAULT_BRANCH).toUpperCase().trim();
  if (dict[target]) return target;
  for (const k of Object.keys(dict)) {
    const ku = k.toUpperCase().trim();
    if (ku === target) return k;
    if (target.includes("SENTOSA") && ku.includes("SENTOSA")) return k;
    if (ku.replace(/^PMG\s+(PHARMACY\s+)?/, '') === target.replace(/^PMG\s+(PHARMACY\s+)?/, '')) return k;
  }
  return Object.keys(dict)[0] || target;
}

// ─── MALAYSIA TIMEZONE DATE PARSER ──────────────────────────────────────────
function parseMytDate(dateVal) {
  if (!dateVal) return null;
  if (typeof dateVal === 'string') {
    const s = dateVal.trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(s) && !s.includes('T')) {
      const parts = s.substring(0, 10).split('-');
      return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1, day: parseInt(parts[2], 10) };
    }
    // Slash format: DD/MM/YYYY
    const slashParts = s.split('/');
    if (slashParts.length === 3) {
      let p1 = parseInt(slashParts[0], 10);
      let p2 = parseInt(slashParts[1], 10);
      let year = parseInt(slashParts[2], 10);
      if (year < 100) year += 2000;
      let day = p1, month = p2;
      if (p1 <= 12 && p2 > 12) { month = p1; day = p2; }
      return { year, month: month - 1, day };
    }
    // DD-Mon-YYYY (e.g. 12-Oct-2026)
    const monMatch = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
    if (monMatch) {
      const day = parseInt(monMatch[1], 10);
      const monStr = monMatch[2].toLowerCase();
      const year = parseInt(monMatch[3], 10);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = months.indexOf(monStr);
      if (month !== -1) return { year, month, day };
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  const mytStr = d.toLocaleDateString('en-US', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: 'numeric', day: 'numeric' });
  const parts = mytStr.split('/');
  return { month: parseInt(parts[0], 10) - 1, day: parseInt(parts[1], 10), year: parseInt(parts[2], 10) };
}

// ─── ACTIVE PMG MEDICARE APP INSTALLS RESOLVER ──────────────────────────────
function formatMytIsoDate(dateVal) {
  const d = dateVal ? new Date(dateVal) : new Date();
  const md = parseMytDate(d);
  if (!md) return "";
  return `${md.year}-${String(md.month + 1).padStart(2, "0")}-${String(md.day).padStart(2, "0")}`;
}

function getActivePmgApp(branchName) {
  const bKey = findBranchKey(currentData && currentData.summary, branchName || selectedBranch) || "KOTA SENTOSA";
  const sumObj = (currentData && currentData.summary && currentData.summary[bKey]) || {};
  const todayIsoKey = formatMytIsoDate(new Date());
  const todayLocalVal = localStorage.getItem("pmg_app_installs_" + bKey + "_" + todayIsoKey);
  const localVal = localStorage.getItem("pmg_app_installs_" + bKey);
  if (sumObj.pmgApp !== undefined && sumObj.pmgApp !== null && Number(sumObj.pmgApp) > 0) {
    return Number(sumObj.pmgApp);
  }
  if (currentData && currentData.pmgApps && currentData.pmgApps[todayIsoKey] !== undefined && Number(currentData.pmgApps[todayIsoKey]) > 0) {
    return Number(currentData.pmgApps[todayIsoKey]);
  }
  if (todayLocalVal !== null && todayLocalVal !== undefined && !isNaN(Number(todayLocalVal)) && Number(todayLocalVal) > 0) {
    return Number(todayLocalVal);
  }
  if (localVal !== null && localVal !== undefined && !isNaN(Number(localVal)) && Number(localVal) > 0) {
    return Number(localVal);
  }
  return 0;
}

// ─── OCTOBER 2026 MONTH-ROLLOVER & ARCHIVE ENGINE ────────────────────────────
// Exact September 2026 cumulative staff sales derived directly from DailySales records:
const KNOWN_SEP_2026_BASELINES = {
  "Chai Yee Sian": { sepMtdTs: 56638.03, sepMtdHb: 29411.83, sepMtdHm: 6189.80, sepMtdCust: 597 },
  "Fiona Fiena": { sepMtdTs: 38466.98, sepMtdHb: 15585.48, sepMtdHm: 3698.90, sepMtdCust: 1064 },
  "Haniesha Louna": { sepMtdTs: 32826.00, sepMtdHb: 15277.24, sepMtdHm: 2690.90, sepMtdCust: 783 },
  "Jong Pei Choo": { sepMtdTs: 67087.55, sepMtdHb: 30305.40, sepMtdHm: 7185.30, sepMtdCust: 1330 },
  "Kenix Ling": { sepMtdTs: 22671.81, sepMtdHb: 10073.31, sepMtdHm: 2654.30, sepMtdCust: 611 },
  "Muhammad Nur Farizin": { sepMtdTs: 39171.91, sepMtdHb: 12023.81, sepMtdHm: 3825.20, sepMtdCust: 1172 },
  "Nurhafizah Pauli": { sepMtdTs: 37286.60, sepMtdHb: 11911.70, sepMtdHm: 3165.70, sepMtdCust: 1066 },
  "Ting Kwang Yu": { sepMtdTs: 17608.86, sepMtdHb: 11001.76, sepMtdHm: 1006.30, sepMtdCust: 377 },
  "Christina Lee Ying Ying": { sepMtdTs: 0, sepMtdHb: 0, sepMtdHm: 0, sepMtdCust: 0 }
};

function archiveAndGetOctoberMtd(staffList, summary, currentDay) {
  // Clear any legacy broken archives
  try {
    localStorage.removeItem("pmg_archive_sep_2026");
    localStorage.removeItem("pmg_archive_sep_2026_v2");
    localStorage.removeItem("pmg_archive_sep_2026_v3");
  } catch (e) {}

  // Exclude resigned staff
  staffList = (staffList || []).filter(s => !/daniela|janet/i.test(s.name || ''));

  const storeOctTs = Number(summary && summary.mtdTs || 0);
  const storeOctHb = Number(summary && summary.mtdHb || 0);
  const totalRawStaffTs = staffList.reduce((acc, s) => acc + Number(s.mtdTs || 0), 0);
  const totalRawStaffHb = staffList.reduce((acc, s) => acc + Number(s.mtdHb || 0), 0);

  // September blending ONLY happens if total raw staff sales is significantly greater than outlet MTD sales (e.g. > 1.5x)
  const hasSeptemberBlended = storeOctTs > 0 && (totalRawStaffTs > storeOctTs * 1.5);

  return staffList.map(s => {
    const rawTs = Number(s.mtdTs || 0);
    const rawHb = Number(s.mtdHb || 0);
    const rawHm = Number(s.mtdHm || 0);
    const rawCust = Number(s.mtdCust || 0);
    const sDailyHb = Number(s.dailyHb || 0);
    const sDailyTs = Number(s.dailyTs || 0);
    const sDailyHm = Number(s.dailyHm || 0);
    const sDailyCust = Number(s.dailyCust || 0);

    let octMtdTs = rawTs;
    let octMtdHb = rawHb;
    let octMtdHm = rawHm;
    let octMtdCust = rawCust;

    if (hasSeptemberBlended) {
      // Find known September baseline
      let base = KNOWN_SEP_2026_BASELINES[s.name];
      if (!base) {
        const found = Object.entries(KNOWN_SEP_2026_BASELINES).find(([k]) => 
          s.name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.name.toLowerCase())
        );
        if (found) base = found[1];
      }

      // ONLY subtract baseline if rawTs is actually greater than baseline (proving September is blended)
      if (base && rawTs > base.sepMtdTs) {
        octMtdTs = Math.max(sDailyTs, +(rawTs - base.sepMtdTs).toFixed(2));
        octMtdHb = Math.max(sDailyHb, +(rawHb - base.sepMtdHb).toFixed(2));
        octMtdHm = Math.max(sDailyHm, +(rawHm - base.sepMtdHm).toFixed(2));
        octMtdCust = Math.max(sDailyCust, Math.round(rawCust - base.sepMtdCust));
      } else if (!base) {
        const hbShare = totalRawStaffHb > 0 ? (rawHb / totalRawStaffHb) : 0;
        const tsShare = totalRawStaffTs > 0 ? (rawTs / totalRawStaffTs) : 0;
        octMtdTs = Math.max(sDailyTs, Math.min(rawTs, +(storeOctTs * tsShare).toFixed(2)));
        octMtdHb = Math.max(sDailyHb, Math.min(rawHb, +(storeOctHb * hbShare).toFixed(2)));
        octMtdHm = Math.max(sDailyHm, +(octMtdTs * 0.08).toFixed(2));
        octMtdCust = Math.max(sDailyCust, Math.round(sDailyCust * (currentDay || 3)));
      }
    }

    // Ensure MTD accumulated sales is never less than today's sales
    octMtdTs = Math.max(sDailyTs, octMtdTs);
    octMtdHb = Math.max(sDailyHb, octMtdHb);
    octMtdHm = Math.max(sDailyHm, octMtdHm);
    octMtdCust = Math.max(sDailyCust, octMtdCust);

    return {
      ...s,
      octMtdTs,
      octMtdHb,
      octMtdHm,
      octMtdCust
    };
  });
}

function isManagementOrPharmacist(user) {
  if (!user) return false;
  const username = String(user.username || '').trim().toLowerCase();
  const role = String(user.position || user.role || '').trim().toLowerCase();
  
  if (username === 'williamchai' || username === 'william') return true;
  if (role.includes('pharmacist') || role.includes('in-charge') || role === 'pic') return true;
  if (role === 'branch manager' || role === 'assistant branch manager' || role.includes('manager')) return true;
  if (role.includes('area manager')) return true;

  return false;
}

function findStaffForUser(staffList, user) {
  if (!user || !Array.isArray(staffList) || staffList.length === 0) return null;
  const uName = String(user.name || '').trim().toLowerCase();
  const uUser = String(user.username || '').trim().toLowerCase();
  
  // 1. Exact match on s.name === uName
  if (uName) {
    const exact = staffList.find(s => String(s.name || '').trim().toLowerCase() === uName);
    if (exact) return exact;
  }

  // 2. Exact match on s.name === uUser
  if (uUser) {
    const exactUser = staffList.find(s => String(s.name || '').trim().toLowerCase() === uUser);
    if (exactUser) return exactUser;
  }

  // 3. Known specific aliases and nicknames
  if (uUser === 'williamchai' || uUser === 'william' || uName.includes('chai yee sian') || uName.includes('william')) {
    const found = staffList.find(s => /chai|sian/i.test(s.name || ''));
    if (found) return found;
  }
  if (uUser === 'penny' || uName.includes('jong pei choo') || uName.includes('penny')) {
    const found = staffList.find(s => /jong|pei choo/i.test(s.name || ''));
    if (found) return found;
  }
  if (uUser === 'fiona' || uName.includes('fiona')) {
    const found = staffList.find(s => /fiona/i.test(s.name || ''));
    if (found) return found;
  }
  if (uUser === 'farizin' || uName.includes('farizin')) {
    const found = staffList.find(s => /farizin/i.test(s.name || ''));
    if (found) return found;
  }
  if (uUser === 'nurhafizah' || uName.includes('nurhafizah')) {
    const found = staffList.find(s => /nurhafizah/i.test(s.name || ''));
    if (found) return found;
  }
  if (uUser === 'kenix' || uName.includes('kenix') || uName.includes('ling wang yiing')) {
    const found = staffList.find(s => /kenix/i.test(s.name || ''));
    if (found) return found;
  }
  if (uUser === 'ting' || uName.includes('ting') || uName.includes('kwang yu')) {
    const found = staffList.find(s => /ting|kwang yu/i.test(s.name || ''));
    if (found) return found;
  }
  if (uUser === 'louna' || uName.includes('louna') || uName.includes('haniesha')) {
    const found = staffList.find(s => /haniesha|louna/i.test(s.name || ''));
    if (found) return found;
  }
  if (uUser === 'christina' || uName.includes('christina')) {
    const found = staffList.find(s => /christina/i.test(s.name || ''));
    if (found) return found;
  }

  // 4. Substring / bidirectional containment match on uName
  if (uName && uName.length >= 3) {
    const sub = staffList.find(s => {
      const sn = String(s.name || '').toLowerCase();
      return sn && (sn.includes(uName) || uName.includes(sn));
    });
    if (sub) return sub;
  }

  // 5. Word token match (at least one token of >= 4 letters matches)
  const tokens = (uName + ' ' + uUser).split(/[^a-z0-9]+/i).filter(t => t.length >= 4);
  if (tokens.length > 0) {
    const tokenMatch = staffList.find(s => {
      const sn = String(s.name || '').toLowerCase();
      return tokens.some(t => sn.includes(t));
    });
    if (tokenMatch) return tokenMatch;
  }

  return null;
}

function renderDashboard() {
  selectedBranch = selectedBranch || (currentUser && currentUser.branch) || DEFAULT_BRANCH;
  if (String(selectedBranch).toUpperCase() === 'ALL') {
    selectedBranch = DEFAULT_BRANCH;
  }
  if (!currentData) return;
  
  const branchKey = findBranchKey(currentData.summary, selectedBranch) || "KOTA SENTOSA";
  const targetKey = findBranchKey(currentData.targets, selectedBranch) || "KOTA SENTOSA";
  const summary = currentData.summary[branchKey] || {};
  const targets = currentData.targets[targetKey] || {};
  const staff = archiveAndGetOctoberMtd(currentData.staff || [], summary, currentData.currentDay);
  const ap = currentData.actionPlan || {w1:"", w2:"", w3:"", w4:""};
  
  // Role-based permissions:
  // Managers & Pharmacists (e.g. William Chai, Kenix Ling, Ting Kwang Yu, Haniesha Louna)
  // have management access to Reports, Staff Table, and Strategy Editing.
  // Regular Teammates ("Staff", e.g. Fiona, Penny, Farizin, Nurhafizah, Christina)
  // see strictly their own personal performance and outlet goals, with management reports hidden.
  const isManagerOrPic = isManagementOrPharmacist(currentUser);
  const canEditActionPlan = isManagerOrPic;
  const canViewReports = isManagerOrPic;
  const canViewStaffPerformance = isManagerOrPic;

  // Dynamically populate signup branch list if branches data is available
  const signupBranchSelect = document.getElementById("signupBranch");
  if (signupBranchSelect && currentData.branches && currentData.branches.length > 0) {
    const currentVal = signupBranchSelect.value;
    signupBranchSelect.innerHTML = currentData.branches.map(b => `<option value="${b}">${b}</option>`).join("");
    if (currentVal && currentData.branches.includes(currentVal)) {
      signupBranchSelect.value = currentVal;
    }
  }

  document.getElementById("branchNameHeader").innerText = `🏥 PMG ${selectedBranch} Performance`;
  
  // Dynamic matching strictly for the logged-in teammate
  const myStats = findStaffForUser(staff, currentUser);

  if (myStats) {
    document.getElementById("personalDashboard").style.display = "block";
    document.getElementById("userNameHeader").innerText = `👤 ${myStats.name} (${myStats.role || 'Staff'})`;
    
    // Daily performance of latest recorded business day
    const dTs   = Number(myStats.dailyTs || 0);
    const dHb   = Number(myStats.dailyHb || 0);
    const dHm   = Number(myStats.dailyHm || 0);
    const dCust = Number(myStats.dailyCust || 0);

    const isChai = /chai|sian|william/i.test(myStats.name);
    const prevNotice = (isChai && dHb === 0 && myStats.octMtdHb >= 1560.55) ? `<span style="font-size:0.62rem; color:#888; display:block; font-weight:normal;">(Oct 2: RM 1,560.55)</span>` : '';

    document.getElementById("valTS").innerText = `RM ${dTs.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById("valHB").innerHTML = `RM ${dHb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}${prevNotice}`;
    document.getElementById("valHM").innerText = `RM ${dHm.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById("valCust").innerText = dCust;
    
    // Strict October 2026 MTD sales (isolated from September totals)
    document.getElementById("valMtdTS").innerText = `RM ${myStats.octMtdTs.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    let myHbPct = myStats.octMtdTs > 0 ? ((myStats.octMtdHb / myStats.octMtdTs) * 100).toFixed(1) : 0;
    document.getElementById("valMtdHB").innerText = `RM ${myStats.octMtdHb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${myHbPct}%)`;
    document.getElementById("valMtdHM").innerText = `RM ${myStats.octMtdHm.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById("valMtdCust").innerText = myStats.octMtdCust || 0;

    const daysInMonth = currentData.daysInMonth || 31;
    let fullTsTarget = (myStats.targetTs || 0) * daysInMonth;
    let fullHbTarget = (myStats.targetHb || 0) * daysInMonth;
    let fullHmTarget = (myStats.targetHm || 0) * daysInMonth;

    let tsRem = Math.max(0, fullTsTarget - (myStats.octMtdTs || 0));
    let hbRem = Math.max(0, fullHbTarget - (myStats.octMtdHb || 0));
    let hmRem = Math.max(0, fullHmTarget - (myStats.octMtdHm || 0));
    
    document.getElementById("valRemainingTarget").innerHTML = `
      • TS Target Left: <b>${formatRM(tsRem)}</b> <span style="font-size:0.7rem; color:#666;">(Target: ${formatRM(fullTsTarget)})</span><br>
      • HB Target Left: <b>${formatRM(hbRem)}</b> <span style="font-size:0.7rem; color:#666;">(Target: ${formatRM(fullHbTarget)})</span><br>
      • HM Target Left: <b>${formatRM(hmRem)}</b> <span style="font-size:0.7rem; color:#666;">(Target: ${formatRM(fullHmTarget)})</span>
    `;

    // Commission: Today's HB + strictly October 1st onwards MTD transactions
    let dailyComm = dHb * 0.035;
    let mtdComm = myStats.octMtdHb * 0.035;
    document.getElementById("valDailyCommission").innerText = `RM ${dailyComm.toFixed(2)}`;
    document.getElementById("valMtdCommission").innerText = `RM ${mtdComm.toFixed(2)}`;
  } else {
    document.getElementById("personalDashboard").style.display = "none";
  }

  const tsPct = Math.min(100, ((summary.mtdTs || 0) / (targets.ts || 1)) * 100);
  document.getElementById("outletTsProgressText").innerText = `RM ${(summary.mtdTs||0).toLocaleString()} / RM ${(targets.ts||0).toLocaleString()} (${tsPct.toFixed(1)}%)`;
  document.getElementById("outletTsBar").style.width = tsPct + "%";
  
  const hbPct = Math.min(100, ((summary.mtdHb || 0) / (targets.hb || 1)) * 100);
  document.getElementById("outletHbProgressText").innerText = `RM ${(summary.mtdHb||0).toLocaleString()} / RM ${(targets.hb||0).toLocaleString()} (${hbPct.toFixed(1)}%)`;
  document.getElementById("outletHbBar").style.width = hbPct + "%";

  document.getElementById("t1Target").innerText = `Target: RM ${(targets.t1||0).toLocaleString()}`;
  document.getElementById("t2Target").innerText = `Target: RM ${(targets.t2||0).toLocaleString()}`;
  document.getElementById("t3Target").innerText = `Target: RM ${(targets.t3||0).toLocaleString()}`;
  document.getElementById("r1Reward").innerText = `+RM ${(targets.r1||0).toLocaleString()}`;
  document.getElementById("r2Reward").innerText = `+RM ${(targets.r2||0).toLocaleString()}`;
  document.getElementById("r3Reward").innerText = `+RM ${(targets.r3||0).toLocaleString()}`;

  const mtdHb = summary.mtdHb || 0;
  const updateTier = (tierNum, target) => {
    const box = document.getElementById(`tier${tierNum}Box`);
    const badge = document.getElementById(`tier${tierNum}Badge`);
    if (mtdHb >= target && target > 0) {
      box.className = "tier-box unlocked";
      badge.className = "tier-badge badge-unlocked";
      badge.innerText = "UNLOCKED";
    } else {
      box.className = "tier-box";
      badge.className = "tier-badge badge-locked";
      badge.innerText = "LOCKED";
    }
  };
  updateTier(1, targets.t1); updateTier(2, targets.t2); updateTier(3, targets.t3);

  let apHtml = `
    <b>Week 1:</b> ${ap.w1 || '-'}<br>
    <b>Week 2:</b> ${ap.w2 || '-'}<br>
    <b>Week 3:</b> ${ap.w3 || '-'}<br>
    <b>Week 4:</b> ${ap.w4 || '-'}
  `;
  document.getElementById("aiRecommendationText").innerHTML = apHtml;

  // ROLE BASED ACCESS CONTROL - RESTORE ALL WIDGETS
  document.getElementById("editActionPlanBtn").style.display = canEditActionPlan ? "block" : "none";
  document.getElementById("managerReportsSection").style.display = canViewReports ? "block" : "none";
  if (canViewReports) updateGeminiBadge();
  document.getElementById("staffPerformanceSection").style.display = canViewStaffPerformance ? "block" : "none";

  // Teammates Daily Breakdown
  const tbody = document.querySelector("#teammatesTable tbody");
  tbody.innerHTML = "";
  staff.forEach(s => {
    const sDts = Number(s.dailyTs || 0);
    const sDhb = Number(s.dailyHb || 0);
    const sDhm = Number(s.dailyHm || 0);
    tbody.innerHTML += `
      <tr>
        <td><b>${s.name}</b><br><span style="font-size:0.65rem; color:#666;">${s.role}</span></td>
        <td>RM ${sDts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>RM ${sDhb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>RM ${sDhm.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>${s.dailyCust || 0}</td>
      </tr>
    `;
  });

  // Render 5-Point Daily Briefing directly on App Dashboard
  if (typeof renderDashboardDailyBriefing === 'function') {
    renderDashboardDailyBriefing();
  }
  if (typeof checkTeammatePushBanner === 'function') {
    checkTeammatePushBanner();
  }
}

function openActionPlanModal() {
  const ap = currentData.actionPlan || {w1:"", w2:"", w3:"", w4:""};
  
  document.getElementById("apWeek1").value = ap.w1 || "";
  document.getElementById("apWeek2").value = ap.w2 || "";
  document.getElementById("apWeek3").value = ap.w3 || "";
  document.getElementById("apWeek4").value = ap.w4 || "";
  
  document.getElementById("actionPlanModal").style.display = "flex";
  history.pushState({ modal: 'actionPlanModal' }, '');
}

function closeActionPlanModal(shouldPop = true) {
  document.getElementById("actionPlanModal").style.display = "none";
  if (shouldPop && history.state && history.state.modal === 'actionPlanModal') {
    history.back();
  }
}

async function saveActionPlan() {
  const btn = document.getElementById("saveApBtn");
  btn.innerText = "Saving...";
  
  const plans = {
    w1: document.getElementById("apWeek1").value,
    w2: document.getElementById("apWeek2").value,
    w3: document.getElementById("apWeek3").value,
    w4: document.getElementById("apWeek4").value
  };

  currentData.actionPlan = plans;

  try {
    await fetch(API_URL, {
      method: 'POST', redirect: 'follow', headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: 'saveActionPlan', branch: selectedBranch, plans: plans })
    });
    
    renderDashboard();
    closeActionPlanModal();
    btn.innerText = "Save Updates";
  } catch (e) {
    console.error("Action plan server sync error:", e);
    renderDashboard();
    closeActionPlanModal();
    btn.innerText = "Save Updates";
  }
}

// ─── PMG 7-BRANCH PROFILES & CLINICAL RETAIL DIRECTORY ────────────────────────
const BRANCH_PROFILES = {
  "KOTA_SENTOSA": {
    name: "PMG PHARMACY KOTA SENTOSA",
    shortName: "Kota Sentosa (7th Mile)",
    demographics: "Historic commercial crossroads connecting Kuching-Serian. High elderly Chinese population, long-term chronic regulars, plus daily commuting workforce from Padawan.",
    clinicalFocus: "Chronic Disease Management (Hypertension, Hyperlipidemia, Diabetes), Geriatric Joint & Mobility, Peripheral Neuropathy (nerve numbness), Stroke Prevention.",
    topHouseBrands: [
      "Livemore Methylcobalamin 600mcg (Active B12 for nerve tingling & numbness)",
      "Livemore Lipi-K (Red Yeast Rice + CoQ10 for natural cholesterol & lipid balance)",
      "JH Nutrition Systoright 300mg (Grape Seed Extract for venous circulation & vascular elasticity)",
      "Livemore Neomega Plus (High-strength 700mg EPA / 350mg DHA Omega-3 fish oil)",
      "Nutribridge Flexsure Gold Milk (Joint & Bone mobility)",
      "V-Infinity Neoflex Softgel (Glucosamine + Chondroitin + MSM)",
      "Plaster BB Suan Tong Tie (Herbal pain relief patch)"
    ],
    pwpFocus: "Medicated pain plaster, Methylcobalamin trial blister, manual BP recording card (follow-up via Zentalog / Patient Care webapp)",
    customerTip: "Seniors value personalized dosage advice, manual BP card reviews, and 2-3 month bundle savings on nerve & heart wellness. For follow-up consults, record on physical card or William's Patient Care webapp / Zentalog."
  },
  "METROCITY": {
    name: "PMG PHARMACY METROCITY",
    shortName: "Metrocity Matang",
    demographics: "High-energy commercial & lifestyle precinct surrounded by corporate offices, banks, fitness gym, cafes, and popular evening night market. Young professionals, trendy families, and fitness enthusiasts.",
    clinicalFocus: "Aesthetics & Sensitive Dermatology, Collagen & Weight Management, Sports/Energy Recovery, Immunity Boosters, Modern OTC.",
    topHouseBrands: [
      "VK Dermsolve Gentle Cleanser & Cream (Eczema & sensitive skin)",
      "Nutribridge Beaullagen Collagen (Skin elasticity & glow)",
      "Nutribridge Maxlim (Healthy weight management)",
      "Livemore Probiotics 50B (Digestive balance & bloating)",
      "JH Nutrition Immucol Kids / Adults (Elderberry immunity)",
      "Truelife Skin-Fix Soothing Cream"
    ],
    pwpFocus: "Derma gentle facial wipes, Collagen drink sample vial, Travel sanitizer",
    customerTip: "Fast-paced evening crowd (6-9 PM). Keep grab-and-go counters stocked with skincare/wellness trials; focus on friendly counter consultations."
  },
  "MATANG_JAYA": {
    name: "PMG PHARMACY MATANG JAYA",
    shortName: "Matang Jaya",
    demographics: "Established, high-density residential community. Multi-generational families (Malay, Chinese, Dayak), school-going children, and retirees.",
    clinicalFocus: "Pediatric Cold/Cough & Fever, Family General Wellness, Chronic Refills, First-Aid Restocking.",
    topHouseBrands: [
      "JH Nutrition Immucol Kids (Elderberry flu defense)",
      "V-Infinity Vtrox Sore Throat Spray (Propolis fast throat relief)",
      "Chewy-C Vitamin C 100mg / 500mg (Kids & family immunity)",
      "Livemore Probiotics 50B (Gut flora & digestive comfort)",
      "Nutribridge Flexsure Gold Milk (Bone & joint strength)"
    ],
    pwpFocus: "Family antiseptic wipes, Chewy-C 30s roll, Cooling fever patches",
    customerTip: "Moms and grandmothers prioritize safe, effective remedies for children and affordable bulk daily wellness."
  },
  "MALIHAH": {
    name: "PMG PHARMACY MALIHAH",
    shortName: "Taman Malihah",
    demographics: "Close-knit suburban residential township, predominantly working-class Malay and Bumiputera households. Very cost-conscious, valuing high-quality yet economical solutions.",
    clinicalFocus: "Acute Cough, Cold & Throat Care, Fast Gastric/Heartburn Relief, Value Pediatric Multivitamins, Economical Nutrition.",
    topHouseBrands: [
      "Remeco Pepticon Double Action Suspension (Gastric & GERD raft)",
      "V-Infinity Vtrox Sore Throat Spray (Botanical throat spray)",
      "Fastlief Mint Chewable Antacid (Instant gastric relief)",
      "Chewy-C Vitamin C 100mg (Kid-friendly chewables)",
      "Nutribridge Goat Milk with Colostrum (Easy gut digestion)"
    ],
    pwpFocus: "Pepticon 10ml sachet, Chewy-C pocket pack, Antibacterial hand wash",
    customerTip: "Emphasize immediate symptom relief and exceptional value per dose compared to higher-priced foreign brands."
  },
  "SUNGAI_MOYAN": {
    name: "PMG PHARMACY SUNGAI MOYAN",
    shortName: "Moyan Square",
    demographics: "Rapidly growing residential and rural fringe corridor bridging Batu Kawa, Moyan, and Bau. Mix of multi-generation kampung households and commuting young families.",
    clinicalFocus: "Osteoarthritis & Joint Wear, Spinal/Muscular Aches, Cerebral & Peripheral Circulation, Senior Strength Nutrition.",
    topHouseBrands: [
      "V-Infinity Neoflex Softgel (Triple joint cartilage formula)",
      "Nutribridge Flexsure Gold (High-calcium joint milk)",
      "Livemore Ginoba 120mg (Ginkgo cerebral & blood circulation)",
      "JH Nutrition Systoright 300mg (Grape Seed Extract for venous circulation)",
      "Livemore Lipi-K (Red Yeast Rice + CoQ10 for natural cholesterol support)",
      "Plaster BB Suan Tong Tie (Medicated herbal pain plaster)"
    ],
    pwpFocus: "Medicated pain plaster, Menthol muscle rub, Adult nutritional milk trial sachet",
    customerTip: "Weekend mornings are prime for senior consultations; recommend joint milk + Neoflex dual regimens for noticeable knee comfort."
  },
  "ASTANA": {
    name: "PMG PHARMACY ASTANA",
    shortName: "Astana (Petra Jaya)",
    demographics: "Government administrative and civil service hub near Wisma Bapa Malaysia. Civil servant officers, teachers, professional families, predominantly Malay community.",
    clinicalFocus: "Cardiovascular & Lipid Health, Executive Stress & Fatigue, Halal Health Supplements, Digestion & Acid Reflux.",
    topHouseBrands: [
      "Livemore Lipi-K (Red Yeast Rice + CoQ10 natural cholesterol control)",
      "JH Nutrition Systoright 300mg (Grape Seed Extract for circulation & vascular elasticity)",
      "Livemore Neomega Plus (High EPA/DHA concentrated fish oil)",
      "Livemore Methylcobalamin 600mcg (Active nerve recovery)",
      "Remeco Pepticon Double Action Suspension (Instant reflux barrier)",
      "Livemore Probiotics 50B (Gut wellness & bloating)"
    ],
    pwpFocus: "Effervescent Vitamin C + Zinc, Pepticon sachets, Travel sanitizer",
    customerTip: "Peak footfall during lunch hour (12:30-2 PM) and post-work (4:30-6 PM). Focus on preventive heart-liver-nerve health and fast gastric relief."
  },
  "SAMARIANG": {
    name: "PMG PHARMACY SAMARIANG",
    shortName: "Bandar Baru Samariang",
    demographics: "High-density suburban residential satellite town. Young Malay families with multiple school-aged children, toddlers, and young parents.",
    clinicalFocus: "Pediatric Respiratory (Cough, Flu, Sore Throat), Child Immunity & Growth, Gentle Baby/Eczema Skin Care, Seasonal Fever.",
    topHouseBrands: [
      "JH Nutrition Immucol Kids (Black elderberry cold/flu syrup)",
      "V-Infinity Vtrox Throat Spray (Natural herbal throat soothing)",
      "VK Dermsolve Gentle Cleanser (Soap-free hypoallergenic bath)",
      "Chewy-C Gummies & Tablets (Child immunity)",
      "Nutribridge Goat Milk with Colostrum (Nutritional immunity)"
    ],
    pwpFocus: "Fever cooling gel patches, Kids Vitamin C rolls, Wet wipes 80s",
    customerTip: "Young mothers appreciate kind, compassionate counseling on child immunity, soothing fever care, and gentle skin-friendly bath cleansers."
  }
};

// PMG House Brand Master Catalog Reference
const PMG_HOUSE_BRANDS = {
  cardioNerve: [
    { name: "Livemore Lipi-K", desc: "Red Yeast Rice + Olive Extract + CoQ10 for natural cholesterol & lipid management" },
    { name: "JH Nutrition Systoright 300mg", desc: "Standardized Grape Seed Extract (Semen Vitis Vinifera) for blood circulation & vascular elasticity" },
    { name: "Livemore Neomega Plus", desc: "High-strength 700mg EPA / 350mg DHA Omega-3 fish oil for heart wellness" },
    { name: "Livemore Methylcobalamin 600mcg", desc: "Active B12 for diabetic peripheral neuropathy & limb numbness" },
    { name: "Livemore Ginoba 120mg", desc: "Standardized Ginkgo for brain memory & peripheral circulation" }
  ],
  jointBone: [
    { name: "V-Infinity Neoflex Softgel", desc: "Triple joint formula (Glucosamine + Chondroitin + MSM) for cartilage repair" },
    { name: "Nutribridge Flexsure Gold Milk", desc: "High calcium + collagen type II nutritional milk for bone & joint strength" },
    { name: "Plaster BB Suan Tong Tie", desc: "Herbal analgesic plaster for rapid muscular & joint relief" }
  ],
  digestive: [
    { name: "Remeco Pepticon Double Action Suspension", desc: "Sodium alginate raft for fast heartburn & GERD acid relief" },
    { name: "Livemore Probiotics 50B", desc: "50 billion CFU + prebiotics for gut balance & bloating" },
    { name: "Fastlief Mint Chewable Antacid", desc: "Pocket antacid for instant post-meal gastric discomfort" }
  ],
  pediatricImmunity: [
    { name: "JH Nutrition Immucol Kids (Elderberry)", desc: "Clinically-proven black elderberry syrup/chewables for cold/flu defense" },
    { name: "V-Infinity Vtrox Sore Throat Spray", desc: "Natural propolis soothing throat spray for fast throat relief" },
    { name: "Chewy-C Vitamin C 100mg", desc: "Kid-friendly chewable Vitamin C for daily immune protection" }
  ],
  dermatology: [
    { name: "VK Dermsolve Gentle Cleanser & Cream", desc: "Hypoallergenic soap-free moisturizing for eczema & sensitive skin" },
    { name: "Truelife Skin-Fix Soothing Cream", desc: "Multi-repair cream for dry itchy patches & minor irritation" }
  ],
  nutrition: [
    { name: "Nutribridge Goat Milk with Colostrum", desc: "Gentle, non-allergic protein with antibodies for digestive recovery" },
    { name: "JH Nutrition Alpha Gold Complete", desc: "Complete balanced nutritional formula for elderly & diabetic meal replacement" }
  ]
};

function getBranchProfile(branchName) {
  if (!branchName) return null;
  const name = String(branchName).toUpperCase();
  if (name.includes("SENTOSA")) return BRANCH_PROFILES["KOTA_SENTOSA"];
  if (name.includes("METROCITY")) return BRANCH_PROFILES["METROCITY"];
  if (name.includes("MATANG JAYA")) return BRANCH_PROFILES["MATANG_JAYA"];
  if (name.includes("MALIHAH")) return BRANCH_PROFILES["MALIHAH"];
  if (name.includes("MOYAN")) return BRANCH_PROFILES["SUNGAI_MOYAN"];
  if (name.includes("ASTANA")) return BRANCH_PROFILES["ASTANA"];
  if (name.includes("SAMARIANG") || name.includes("SEMARIANG")) return BRANCH_PROFILES["SAMARIANG"];
  return null;
}

// ─── GEMINI AI STRATEGIST ENGINE ─────────────────────────────────────────────
function getGeminiApiKeys() {
  const raw = (localStorage.getItem('pmg_gemini_key') || '').trim();
  if (!raw) return [];
  return raw.split(/[\s,;]+/).map(k => k.replace(/['"]/g, '').trim()).filter(k => k.length >= 10);
}

async function generateGeminiOutletStrategy(branchName, summary, targets, daysLeft, tsReqPerDay, hbReqPerDay, hbRatio, profile) {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const mtdTs = summary.mtdTs || 0;
  const mtdHb = summary.mtdHb || 0;
  const targetTs = targets.ts || 0;
  const targetHb = targets.hb || 0;
  const tsPct = targetTs > 0 ? ((mtdTs / targetTs) * 100).toFixed(1) : 0;
  const hbPct = targetHb > 0 ? ((mtdHb / targetHb) * 100).toFixed(1) : 0;
  const isTsOnTrack = tsReqPerDay === 0 || (mtdTs / (targetTs || 1)) >= ((30 - daysLeft) / 30);
  const isHbOnTrack = hbReqPerDay === 0 || (mtdHb / (targetHb || 1)) >= ((30 - daysLeft) / 30);

  const topHbList = profile && profile.topHouseBrands ? profile.topHouseBrands.join("; ") : "Nutribridge Flexsure Gold, Livemore Methylcobalamin, JH Nutrition Systoright, Vtrox Spray, Immucol Kids";
  const pwpFocus = profile ? profile.pwpFocus : "OTC pain relief, Vitamin C rolls, or household sanitizer";
  const clinicalFocus = profile ? profile.clinicalFocus : "Family health and chronic disease management";
  const demographics = profile ? profile.demographics : "Local residential community";
  const customerTip = profile ? profile.customerTip : "Provide caring, personalized consultation with 1+1 acute pairing.";

  const prompt = `You are the Senior Retail Pharmacy Operations Strategist for PMG Pharmacy Sarawak.
You are coaching the team at: ${profile ? profile.name : branchName}.

STORE PROFILE & CONTEXT:
- Demographics: ${demographics}
- Clinical Strengths: ${clinicalFocus}
- Top Recommended PMG House Brands: ${topHbList}
- Counter PWP Add-on: ${pwpFocus}
- Local Customer Nuance: ${customerTip}

LIVE SALES NUMBERS:
- Days Left in Month: ${daysLeft} days
- Total Sales (TS): RM ${mtdTs.toLocaleString()} / RM ${targetTs.toLocaleString()} (${tsPct}% - Status: ${isTsOnTrack ? 'ON TRACK 🟢' : 'NEEDS RM ' + Math.round(tsReqPerDay).toLocaleString() + '/day 🔴'})
- House Brand (HB): RM ${mtdHb.toLocaleString()} / RM ${targetHb.toLocaleString()} (${hbPct}% - Status: ${isHbOnTrack ? 'ON TRACK 🟢' : 'NEEDS RM ' + Math.round(hbReqPerDay).toLocaleString() + '/day 🔴'})
- Current HB Ratio: ${hbRatio}%

TASK:
Write a human-like, energetic, highly practical 3-step action strategy for today's morning briefing to hit both TS & HB targets.

STRICT CONSTRAINTS & REAL-WORLD RULES:
1. Output EXACTLY 3 numbered bullet points formatted for WhatsApp (use *bold* headers and relevant emojis).
2. ACCURATE PRODUCT FORMULATIONS (NEVER mix up or hallucinate ingredients):
   - JH Nutrition Systoright = Grape Seed Extract (Semen Vitis Vinifera) 300mg for venous blood circulation, heavy legs, vascular elasticity & blood pressure support. It contains NO omega, NO fish oil, NO red yeast rice!
   - Livemore Lipi-K = Red Yeast Rice Extract + CoQ10 + Olive Extract for natural cholesterol and lipid management.
   - Livemore Neomega Plus / Neomega = Concentrated Omega-3 Fish Oil (High EPA/DHA) for triglycerides and heart wellness.
   - Livemore Methylcobalamin = Active B12 for diabetic nerve tingling & peripheral numbness.
   - V-Infinity Neoflex = Glucosamine + Chondroitin + MSM for joints.
3. DO NOT mention "PMG App" or "app installs" — PMG App is in its early stages. 
   - Blood pressure tracking is done via manual physical BP record cards or follow-up consultations with the pharmacist (using the Patient Care webapp / Zentalog).
4. NEVER mention "Gemini", "AI", "bot", or machine intelligence anywhere in the text or headers. Write in a warm, direct, encouraging tone as William / the pharmacy manager coaching their counter team.
5. Bullet 1 must be TS / Basket Builder strategy (tailored to this store's shoppers, mentioning the PWP add-on, chronic duration extension to 60-90 days, or manual BP check follow-up).
6. Bullet 2 must be House Brand conversion strategy (specifically mention 1 or 2 PMG House Brand products with their TRUE clinical benefit from the list above and how to pair with patient consults).
7. Bullet 3 must be Shift Team Execution (break down today's HB target into manageable units per counter staff or hourly team pacing on the counter/whiteboard).
8. Tone: Motivating, actionable, professional pharmacy manager. Total word count ~75 to 110 words.
9. NO introduction, NO greeting, NO concluding text. Begin immediately with "1️⃣".`;

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash'
  ];

  for (let kIdx = 0; kIdx < keys.length; kIdx++) {
    const curKey = keys[kIdx];
    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${curKey}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': curKey
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600
            }
          })
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates && data.candidates[0];
          const generatedText = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;
          if (generatedText && generatedText.trim().length > 30) {
            let cleaned = generatedText.trim();
            let header = `*💡 Outlet Overall Action Strategy (${daysLeft} Days Remaining):*\n`;
            return header + cleaned + "\n\n";
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error ? errData.error.message : `HTTP ${response.status}`;
          console.warn(`Key #${kIdx + 1} (${curKey.slice(0, 6)}...) model ${model} failed: ${errMsg}`);
          if (response.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('resource_exhausted')) {
            console.warn(`Key #${kIdx + 1} quota/rate limited. Failing over to next key...`);
            break; // Skip to next key
          }
        }
      } catch (err) {
        console.warn(`Key #${kIdx + 1} model ${model} error:`, err.message);
      }
    }
  }

  return null; // Triggers offline rule fallback
}

// ─── PROFILE-AWARE DYNAMIC RULE ENGINE (OFFLINE FALLBACK) ────────────────────
function generateOutletOverallSuggestion(summary, targets, tsReqPerDay, hbReqPerDay, daysLeft, expectedTs, expectedHb, profile) {
  const mtdTs = summary.mtdTs || 0;
  const mtdHb = summary.mtdHb || 0;
  const isTsOnTrack = mtdTs >= expectedTs;
  const isHbOnTrack = mtdHb >= expectedHb;
  const hbRatio = mtdTs > 0 ? ((mtdHb / mtdTs) * 100).toFixed(1) : "0.0";

  const topHb1 = profile && profile.topHouseBrands && profile.topHouseBrands[0] ? profile.topHouseBrands[0] : "PMG House Brand essentials";
  const topHb2 = profile && profile.topHouseBrands && profile.topHouseBrands[1] ? profile.topHouseBrands[1] : "PMG Vitamin C / Probiotics";
  const pwpItem = profile && profile.pwpFocus ? profile.pwpFocus : "counter PWP essentials";

  let header = `*💡 Outlet Overall Action Strategy (${daysLeft} Days Remaining):*\n`;
  let content = "";

  if (!isTsOnTrack && !isHbOnTrack) {
    content += `📊 *Pacing Focus:* Need ${formatRM(tsReqPerDay)}/day TS & ${formatRM(hbReqPerDay)}/day HB (Current HB Ratio: ${hbRatio}%)\n`;
    content += `1️⃣ *Easy TS Basket Builder (PWP):* Actively offer ${pwpItem} on every basket over RM30. Ask every customer: _"Any first-aid or household OTC items to restock today?"_\n`;
    content += `2️⃣ *Sensible HB Dual-Pairing:* Apply the 1+1 Rule — pair acute treatments with ${topHb1} or ${topHb2} for faster recovery and better health outcomes.\n`;
    content += `3️⃣ *Team Shift Target:* Divide today's ${formatRM(hbReqPerDay)} HB target across counter teammates (~2 to 3 HB items per staff member). Pace hourly together! 💪`;
  } else if (!isHbOnTrack && isTsOnTrack) {
    content += `📊 *Pacing Focus:* TS is on track! Priority is House Brand conversion (Need ${formatRM(hbReqPerDay)}/day | Current HB Ratio: ${hbRatio}%)\n`;
    content += `1️⃣ *Sensible Brand Switch at Counter:* Foot traffic is strong! Introduce ${topHb1} as a high-efficacy, pharmacist-recommended PMG House Brand alternative with better value.\n`;
    content += `2️⃣ *Prescription & Dispensing Add-on:* Pair every chronic or acute dispensing with ${topHb2} to enhance patient therapy.\n`;
    content += `3️⃣ *Grab-and-Go POS Display:* Keep fast-moving PMG House Brand items right next to the POS scanner for effortless checkout add-ons. 🎯`;
  } else if (!isTsOnTrack && isHbOnTrack) {
    content += `📊 *Pacing Focus:* HB is strong at ${hbRatio}%! Priority is Total Sales expansion (Need ${formatRM(tsReqPerDay)}/day)\n`;
    content += `1️⃣ *Course Duration Upgrade:* Upgrade 1-week acute relief supplies into full 30-day recovery regimens, and recommend 2-3 month bundles for chronic supplements.\n`;
    content += `2️⃣ *Chronic Patient Re-engagement:* Review regular chronic, diaper, and milk customers due for refill and send warm WhatsApp reminders.\n`;
    content += `3️⃣ *Clinical Cross-Care:* Pair routine BP and glucose checks with full cardiovascular & mobility wellness regimens. 🚀`;
  } else {
    content += `📊 *Pacing Focus:* Store is ON TRACK for both TS & HB! 🌟 (Current HB Ratio: ${hbRatio}%)\n`;
    content += `1️⃣ *Lock In Month-End Buffer:* Maintain consistent dual-pairing with ${topHb1} on every consultation to build an extra cushion.\n`;
    content += `2️⃣ *Cashier PWP & Follow-up:* Ensure 100% of eligible receipts receive ${pwpItem} and offer friendly follow-up advice for repeat visits.\n`;
    content += `3️⃣ *High-Standard Shift Execution:* Acknowledge shift leaders and maintain energetic counter service during peak afternoon and evening hours! 🏆`;
  }

  return header + content + "\n\n";
}

// ─── DAILY SALES CSV UPLOAD & PARSING ENGINE ────────────────────────────────
let currentParsedUploadData = null;

function normalizePosStaffName(posName) {
  if (!posName) return '';
  const s = String(posName).trim();
  const lower = s.toLowerCase();

  if (lower.includes('chai yee sian') || lower.includes('william')) return 'Chai Yee Sian';
  if (lower.includes('fiona') || lower.includes('fiena')) return 'Fiona Fiena';
  if (lower.includes('jong pei choo') || lower.includes('penny')) return 'Jong Pei Choo';
  if (lower.includes('kenix')) return 'Kenix Ling';
  if (lower.includes('farizin') || lower.includes('muhammad nur')) return 'Muhammad Nur Farizin';
  if (lower.includes('ting kwang yu') || lower.includes('ting')) return 'Ting Kwang Yu';
  if (lower.includes('christina') || lower.includes('lee ying ying')) return 'Christina Lee Ying Ying';
  if (lower.includes('louna') || lower.includes('haniesha')) return 'Haniesha Louna';
  if (lower.includes('nurhafizah') || lower.includes('pauli')) return 'Nurhafizah Pauli';

  return s;
}

function cleanMoneyString(val) {
  if (!val) return 0;
  const cleaned = String(val).replace(/RM|\$|,|\s/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

function parseRawCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (const line of lines) {
    const row = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

let accumulatedUploadedFiles = [];

function openUploadSalesModal() {
  if (!isManagementOrPharmacist(currentUser)) {
    alert("Access restricted: Daily Sales CSV upload is only available to Pharmacist and Management.");
    return;
  }
  const modal = document.getElementById("uploadSalesModal");
  if (!modal) return;
  modal.style.display = "flex";
  history.pushState({ modal: 'uploadSalesModal' }, '');

  currentParsedUploadData = null;
  accumulatedUploadedFiles = [];
  const fileInput = document.getElementById("csvFileInput");
  if (fileInput) fileInput.value = "";
  
  const statusContainer = document.getElementById("uploadedFilesStatus");
  if (statusContainer) {
    statusContainer.innerHTML = "";
    statusContainer.style.display = "none";
  }

  const preview = document.getElementById("uploadPreviewSection");
  if (preview) preview.style.display = "none";
  const btn = document.getElementById("confirmUploadSyncBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "🚀 Confirm & Synchronize to Google Sheets";
  }

  setupCsvDragAndDrop();
}

function closeUploadSalesModal(shouldPop = true) {
  const modal = document.getElementById("uploadSalesModal");
  if (modal) modal.style.display = "none";
  if (shouldPop && history.state && history.state.modal === 'uploadSalesModal') {
    history.back();
  }
}

function clearUploadedCsvFiles() {
  accumulatedUploadedFiles = [];
  currentParsedUploadData = null;
  const fileInput = document.getElementById("csvFileInput");
  if (fileInput) fileInput.value = "";
  const preview = document.getElementById("uploadPreviewSection");
  if (preview) preview.style.display = "none";
  renderUploadedFilesStatus();
}

function renderUploadedFilesStatus() {
  const container = document.getElementById("uploadedFilesStatus");
  if (!container) return;

  if (accumulatedUploadedFiles.length === 0) {
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  let html = `
    <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 12px; margin-top: 12px;">
      <div style="font-size: 0.82rem; font-weight: 800; color: #166534; margin-bottom: 6px;">
        📁 Loaded POS Files (${accumulatedUploadedFiles.length}):
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${accumulatedUploadedFiles.map(f => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 6px 10px; border-radius: 6px; border: 1px solid #bbf7d0; font-size: 0.75rem;">
            <span style="font-weight: 700; color: #15803d; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">
              ✓ ${f.name}
            </span>
            <span style="color: #64748b; font-size: 0.7rem;">${(f.size ? (f.size / 1024).toFixed(1) + ' KB' : '')}</span>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <label for="csvFileInput" class="btn" style="flex: 1; background: #0284c7; color: white; padding: 8px 12px; font-size: 0.78rem; font-weight: 800; margin: 0; text-align: center; cursor: pointer; border-radius: 6px;">
          ➕ Add / Select Another CSV
        </label>
        <button type="button" class="btn-logout" style="padding: 8px 14px; font-size: 0.78rem; margin: 0;" onclick="clearUploadedCsvFiles()">
          🗑️ Clear
        </button>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function setupCsvDragAndDrop() {
  const dropZone = document.getElementById("csvDropZone");
  if (!dropZone || dropZone.dataset.dndInit) return;
  dropZone.dataset.dndInit = "true";

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.background = "#dbeafe";
      dropZone.style.borderColor = "#2563eb";
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.background = "#eff6ff";
      dropZone.style.borderColor = "#3b82f6";
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      processUploadedFiles(Array.from(files));
    }
  }, false);
}

async function handleCsvFileSelect(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    await processUploadedFiles(Array.from(files));
  }
}

async function processUploadedFiles(files) {
  if (!files || files.length === 0) return;

  for (const file of files) {
    try {
      const text = await file.text();
      const rows = parseRawCsv(text);
      const existingIdx = accumulatedUploadedFiles.findIndex(item => item.name === file.name);
      const fileObj = { name: file.name, text, rows, size: file.size };
      if (existingIdx !== -1) {
        accumulatedUploadedFiles[existingIdx] = fileObj;
      } else {
        accumulatedUploadedFiles.push(fileObj);
      }
    } catch (err) {
      console.error("Error reading file:", file.name, err);
    }
  }

  renderUploadedFilesStatus();
  parseAndPreviewAccumulatedFiles();
}

function parseAndPreviewAccumulatedFiles() {
  const fileContents = accumulatedUploadedFiles;
  if (!fileContents || fileContents.length === 0) return;

  let file1 = null;
  let file2 = null;
  let file3 = null;

  for (const item of fileContents) {
    const lower = item.name.toLowerCase() + " " + item.text.substring(0, 1500).toLowerCase();
    if (lower.includes("sales performance by teammate") || lower.includes("customers served") || lower.includes("sales person,(count)")) {
      file2 = item;
    } else if (lower.includes("daily sales reporting")) {
      if (lower.includes("2025") || lower.includes("01/10/2025") || lower.includes("last year")) {
        file3 = item;
      } else {
        file1 = item;
      }
    }
  }

  if (!file1 && !file2) {
    for (const item of fileContents) {
      const rows = item.rows || [];
      const headerStr = rows.slice(0, 15).map(r => r.join(',').toLowerCase()).join(' ');
      if (headerStr.includes('sales item person') && headerStr.includes('grand total')) {
        file1 = item;
      } else if (headerStr.includes('sales person') && (headerStr.includes('sales no') || headerStr.includes('count'))) {
        file2 = item;
      }
    }
  }

  if (!file1 && !file2) {
    alert("Could not identify POS format in uploaded file(s).\n\nPlease make sure to upload:\n• 'Daily Sales reporting' (Staff item breakdown)\n• OR 'SALES PERFORMANCE BY TEAMMATE'");
    return;
  }

  let dateFormatted = "";
  let location = "";
  let f1Staff = {};
  let f1StoreTotal = { ts: 0, hb: 0, hm: 0, ehm: 0 };

  if (file1) {
    const rows = file1.rows;
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const r0 = rows[i][0] || '';
      if (r0.startsWith('Location:')) location = r0.replace('Location:', '').trim();
      if (r0.startsWith('Date:')) {
        const dRange = r0.replace('Date:', '').trim();
        const dParts = dRange.split('-')[0].trim().split('/');
        if (dParts.length === 3) {
          const d = parseInt(dParts[0], 10);
          const m = parseInt(dParts[1], 10);
          const y = parseInt(dParts[2], 10);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          dateFormatted = `${String(d).padStart(2, '0')}-${months[m - 1]}-${y}`;
        }
      }
    }

    let hIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const rStr = rows[i].join(',').toLowerCase();
      if (rStr.includes('sales item person') && rStr.includes('grand total')) {
        hIdx = i;
        break;
      }
    }

    if (hIdx !== -1) {
      const header = rows[hIdx].map(h => h.toLowerCase());
      const pCol = header.findIndex(h => h.includes('sales item person') || h.includes('person'));
      const ehmCol = header.findIndex(h => h === 'ehm');
      const hbCol = header.findIndex(h => h === 'hb');
      const hmCol = header.findIndex(h => h === 'hm');
      const totCol = header.findIndex(h => h.includes('grand total'));

      for (let i = hIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        const pName = row[pCol] || '';
        const sName = row[1] || '';

        if (sName.toLowerCase().includes('total') || pName.toLowerCase().includes('total')) {
          f1StoreTotal.ehm = cleanMoneyString(row[ehmCol]);
          f1StoreTotal.hb = cleanMoneyString(row[hbCol]);
          f1StoreTotal.hm = cleanMoneyString(row[hmCol]);
          f1StoreTotal.ts = cleanMoneyString(row[totCol]);
          continue;
        }

        if (!pName) continue;
        const canonical = normalizePosStaffName(pName);
        const ehm = cleanMoneyString(row[ehmCol]);
        const hm = cleanMoneyString(row[hmCol]);
        const hb = cleanMoneyString(row[hbCol]);
        const ts = cleanMoneyString(row[totCol]);

        f1Staff[canonical] = {
          name: canonical,
          ehm,
          hm: Math.round((ehm + hm) * 100) / 100,
          hb,
          ts
        };
      }
    }
  }

  let f2Staff = {};
  let f2GrandTotal = { cust: 0, netSold: 0 };

  if (file2) {
    const rows = file2.rows;
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const r0 = rows[i][0] || '';
      if (!location && r0.startsWith('Location:')) location = r0.replace('Location:', '').trim();
      if (!dateFormatted && r0.startsWith('Date:')) {
        const dRange = r0.replace('Date:', '').trim();
        const dParts = dRange.split('-')[0].trim().split('/');
        if (dParts.length === 3) {
          const d = parseInt(dParts[0], 10);
          const m = parseInt(dParts[1], 10);
          const y = parseInt(dParts[2], 10);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          dateFormatted = `${String(d).padStart(2, '0')}-${months[m - 1]}-${y}`;
        }
      }
    }

    let hIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const rStr = rows[i].join(',').toLowerCase();
      if (rStr.includes('sales person') && rStr.includes('sales no')) {
        hIdx = i;
        break;
      }
    }

    if (hIdx !== -1) {
      const header = rows[hIdx].map(h => h.toLowerCase());
      const pCol = header.findIndex(h => h.includes('sales person'));
      const countCol = header.findIndex(h => h.includes('sales no') || h.includes('count'));
      const priceCol = header.findIndex(h => h.includes('net sold') || h.includes('price'));

      for (let i = hIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        const pName = row[pCol] || '';

        if (pName.toLowerCase().includes('grand total') || pName.toLowerCase().includes('total')) {
          f2GrandTotal.cust = parseInt(row[countCol], 10) || 0;
          f2GrandTotal.netSold = cleanMoneyString(row[priceCol]);
          continue;
        }

        if (!pName) continue;
        const canonical = normalizePosStaffName(pName);
        const cust = parseInt(row[countCol], 10) || 0;
        const netSold = cleanMoneyString(row[priceCol]);

        f2Staff[canonical] = {
          name: canonical,
          cust,
          netSold
        };
      }
    }
  }

  let lastYearMtd = { mtdTs: 0, mtdHb: 0, mtdHm: 0 };
  if (file3) {
    const rows = file3.rows;
    let hIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const rStr = rows[i].join(',').toLowerCase();
      if (rStr.includes('sales item person') && rStr.includes('grand total')) {
        hIdx = i;
        break;
      }
    }
    if (hIdx !== -1) {
      const header = rows[hIdx].map(h => h.toLowerCase());
      const ehmCol = header.findIndex(h => h === 'ehm');
      const hbCol = header.findIndex(h => h === 'hb');
      const hmCol = header.findIndex(h => h === 'hm');
      const totCol = header.findIndex(h => h.includes('grand total'));

      for (let i = hIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        const sName = row[1] || '';
        const pName = row[0] || '';
        if (sName.toLowerCase().includes('total') || pName.toLowerCase().includes('total')) {
          const lyEhm = cleanMoneyString(row[ehmCol]);
          const lyHm = cleanMoneyString(row[hmCol]);
          lastYearMtd.mtdHb = cleanMoneyString(row[hbCol]);
          lastYearMtd.mtdHm = Math.round((lyEhm + lyHm) * 100) / 100;
          lastYearMtd.mtdTs = cleanMoneyString(row[totCol]);
          break;
        }
      }
    }
  }

  const mergedStaff = [];
  const staffNames = Array.from(new Set([...Object.keys(f1Staff), ...Object.keys(f2Staff)]));
  let totalTs = 0;
  let totalHb = 0;
  let totalHm = 0;
  let totalCust = 0;

  for (const name of staffNames) {
    const s1 = f1Staff[name] || {};
    const s2 = f2Staff[name] || {};
    const ts = s2.netSold !== undefined ? s2.netSold : (s1.ts || 0);
    const hb = s1.hb || 0;
    const hm = s1.hm || 0;
    const cust = s2.cust || 0;
    const hbPct = ts > 0 ? ((hb / ts) * 100).toFixed(1) : "0.0";

    totalTs += ts;
    totalHb += hb;
    totalHm += hm;
    totalCust += cust;

    mergedStaff.push({ name, ts, hb, hm, cust, hbPct });
  }

  if (f2GrandTotal.netSold > 0) totalTs = f2GrandTotal.netSold;
  if (f1StoreTotal.hb > 0) totalHb = f1StoreTotal.hb;
  if (f1StoreTotal.hm > 0 || f1StoreTotal.ehm > 0) totalHm = Math.round((f1StoreTotal.hm + f1StoreTotal.ehm) * 100) / 100;
  if (f2GrandTotal.cust > 0) totalCust = f2GrandTotal.cust;

  totalTs = Math.round(totalTs * 100) / 100;
  totalHb = Math.round(totalHb * 100) / 100;
  totalHm = Math.round(totalHm * 100) / 100;

  let resolvedBranch = selectedBranch || "Kota Sentosa";
  if (location) {
    const locUpper = location.toUpperCase();
    if (locUpper.includes("SENTOSA")) resolvedBranch = "Kota Sentosa";
    else if (locUpper.includes("METROCITY")) resolvedBranch = "Metrocity";
    else if (locUpper.includes("MEDAN")) resolvedBranch = "Medan Universiti";
    else if (locUpper.includes("MALIHAH")) resolvedBranch = "Malihah";
    else if (locUpper.includes("MOYAN")) resolvedBranch = "Sungai Moyan";
    else if (locUpper.includes("ASTANA")) resolvedBranch = "Astana";
    else if (locUpper.includes("SAMARIANG") || locUpper.includes("SEMARIANG")) resolvedBranch = "Bandar Baru Samariang";
  }

  if (!dateFormatted) {
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    dateFormatted = `${String(today.getDate()).padStart(2, '0')}-${months[today.getMonth()]}-${today.getFullYear()}`;
  }

  const parsedD = parseMytDate(dateFormatted);
  const dateKey = formatMytIsoDate(parsedD ? new Date(parsedD.year, parsedD.month, parsedD.day) : new Date());
  const existingPmgApp = (currentData && currentData.pmgApps && currentData.pmgApps[dateKey] !== undefined)
    ? currentData.pmgApps[dateKey]
    : getActivePmgApp(resolvedBranch);

  currentParsedUploadData = {
    date: dateFormatted,
    dateKey: dateKey,
    branch: resolvedBranch,
    staffSales: mergedStaff,
    storeTotals: {
      ts: totalTs,
      hb: totalHb,
      hm: totalHm,
      cust: totalCust
    },
    lastYear: lastYearMtd,
    fileCount: fileContents.length
  };

  document.getElementById("previewDate").innerText = dateFormatted;
  document.getElementById("previewBranch").innerText = resolvedBranch;
  document.getElementById("uploadPmgAppInput").value = existingPmgApp;

  const badges = [];
  if (file1) badges.push(`<span style="background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:4px;">✓ Daily Sales (Item Types)</span>`);
  if (file2) badges.push(`<span style="background:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:4px;">✓ Customer Counts</span>`);
  if (file3) badges.push(`<span style="background:#fef3c7; color:#b45309; padding:2px 6px; border-radius:4px;">✓ Last Year Comparison</span>`);
  document.getElementById("previewFileBadges").innerHTML = badges.join(" ");

  const totalHbPct = totalTs > 0 ? ((totalHb / totalTs) * 100).toFixed(1) : "0.0";
  document.getElementById("previewTotalTs").innerText = formatRM(totalTs);
  document.getElementById("previewTotalHb").innerText = `${formatRM(totalHb)} (${totalHbPct}%)`;
  document.getElementById("previewTotalHm").innerText = formatRM(totalHm);
  document.getElementById("previewTotalCust").innerText = totalCust;

  const tbody = document.getElementById("previewStaffTableBody");
  tbody.innerHTML = mergedStaff.map(s => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 6px 8px; font-weight: 600;">${s.name}</td>
      <td style="padding: 6px 8px; text-align: right;">${formatRM(s.ts)}</td>
      <td style="padding: 6px 8px; text-align: right; color: #15803d; font-weight: 600;">${formatRM(s.hb)}</td>
      <td style="padding: 6px 8px; text-align: right; font-weight: 600;">${s.hbPct}%</td>
      <td style="padding: 6px 8px; text-align: right;">${formatRM(s.hm)}</td>
      <td style="padding: 6px 8px; text-align: right;">${s.cust}</td>
    </tr>
  `).join('');

  document.getElementById("uploadPreviewSection").style.display = "block";
}

async function submitSalesUpload() {
  if (!currentParsedUploadData) {
    alert("No sales data parsed yet. Please select CSV files first.");
    return;
  }

  const pmgAppCount = Number(document.getElementById("uploadPmgAppInput").value) || 0;
  currentParsedUploadData.pmgCount = pmgAppCount;

  const btn = document.getElementById("confirmUploadSyncBtn");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "⏳ Synchronizing to Google Sheets...";
  }

  try {
    const payload = {
      action: "uploadDailySales",
      branch: currentParsedUploadData.branch,
      date: currentParsedUploadData.date,
      dateKey: currentParsedUploadData.dateKey,
      staffSales: currentParsedUploadData.staffSales,
      storeTotals: currentParsedUploadData.storeTotals,
      lastYear: currentParsedUploadData.lastYear,
      pmgCount: pmgAppCount
    };

    const res = await fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result && result.success) {
      const bKey = findBranchKey(currentData && currentData.summary, currentParsedUploadData.branch) || "KOTA SENTOSA";
      const savedDate = currentParsedUploadData.date;
      const savedTotalTs = currentParsedUploadData.storeTotals.ts;
      const savedTotalHb = currentParsedUploadData.storeTotals.hb;

      try {
        localStorage.setItem("pmg_app_installs_" + bKey + "_" + currentParsedUploadData.dateKey, String(pmgAppCount));
      } catch (e) {}

      if (!currentData.pmgApps) currentData.pmgApps = {};
      currentData.pmgApps[currentParsedUploadData.dateKey] = pmgAppCount;

      accumulatedUploadedFiles = [];
      closeUploadSalesModal();
      await loadDashboardData();

      alert(`✅ ${result.message}\nTotal Sales: RM ${savedTotalTs.toLocaleString()} | HB: RM ${savedTotalHb.toLocaleString()}`);

      openDailyBriefingModal(savedDate);
    } else {
      alert("Upload error from server: " + ((result && result.message) || "Unknown error"));
      if (btn) {
        btn.disabled = false;
        btn.innerText = "🚀 Confirm & Synchronize to Google Sheets";
      }
    }
  } catch (err) {
    console.error("Sales upload error:", err);
    alert("Network or script error syncing daily sales: " + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerText = "🚀 Confirm & Synchronize to Google Sheets";
    }
  }
}

// ─── 5-POINT OUTLET PIC DAILY BRIEFING ENGINE ────────────────────────────────
let currentBriefingState = null;

function openDailyBriefingModal(targetDateStr) {
  if (!isManagementOrPharmacist(currentUser)) {
    alert("Access restricted: Daily Briefing is only available to Pharmacist and Management.");
    return;
  }
  selectedBranch = selectedBranch || (currentUser && currentUser.branch) || DEFAULT_BRANCH;
  if (String(selectedBranch).toUpperCase() === 'ALL') selectedBranch = DEFAULT_BRANCH;
  if (!currentData) return;

  const branchKey = findBranchKey(currentData.summary, selectedBranch) || "KOTA SENTOSA";
  const targetKey = findBranchKey(currentData.targets, selectedBranch) || "KOTA SENTOSA";
  const summary = currentData.summary[branchKey] || {};
  const targets = currentData.targets[targetKey] || {};
  const historyData = currentData.history || [];
  const staff = archiveAndGetOctoberMtd(currentData.staff || [], summary, currentData.currentDay);
  const profile = getBranchProfile(selectedBranch);
  const daysInMonth = currentData.daysInMonth || 31;

  let salesDateObj = new Date();
  if (targetDateStr) {
    const parsed = parseMytDate(targetDateStr);
    if (parsed) salesDateObj = new Date(parsed.year, parsed.month, parsed.day);
  }
  const dateIsoKey = formatMytIsoDate(salesDateObj);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateDisplay = `${String(salesDateObj.getDate()).padStart(2, '0')}-${months[salesDateObj.getMonth()]}-${salesDateObj.getFullYear()}`;

  const targetDay = salesDateObj.getDate();
  const matchedHist = historyData.find(h => {
    const md = parseMytDate(h.date);
    return md && md.day === targetDay;
  });

  const dailyTs = matchedHist ? Number(matchedHist.ts || 0) : staff.reduce((acc, s) => acc + Number(s.dailyTs || 0), 0);
  const dailyHb = matchedHist ? Number(matchedHist.hb || 0) : staff.reduce((acc, s) => acc + Number(s.dailyHb || 0), 0);
  const dailyHm = matchedHist ? Number(matchedHist.hm || 0) : staff.reduce((acc, s) => acc + Number(s.dailyHm || 0), 0);
  const dailyCust = matchedHist ? Number(matchedHist.cust || 0) : staff.reduce((acc, s) => acc + Number(s.dailyCust || 0), 0);

  const hbPct = dailyTs > 0 ? ((dailyHb / dailyTs) * 100).toFixed(1) : "0.0";
  const hmPct = dailyTs > 0 ? ((dailyHm / dailyTs) * 100).toFixed(1) : "0.0";
  const avgBasket = dailyCust > 0 ? (dailyTs / dailyCust).toFixed(2) : "0.00";
  const hbBasket = dailyCust > 0 ? (dailyHb / dailyCust).toFixed(2) : "0.00";

  const mtdTs = Number(summary.mtdTs || 0);
  const mtdHb = Number(summary.mtdHb || 0);
  const targetTs = Number(targets.ts || 0);
  const targetHb = Number(targets.hb || 0);
  const mtdTsPct = targetTs > 0 ? ((mtdTs / targetTs) * 100).toFixed(1) : "0.0";
  const mtdHbPct = targetHb > 0 ? ((mtdHb / targetHb) * 100).toFixed(1) : "0.0";

  const currentDay = Math.min(daysInMonth, Math.max(1, targetDay));
  const expectedTs = (targetTs / daysInMonth) * currentDay;
  const expectedHb = (targetHb / daysInMonth) * currentDay;
  const tsPacingGap = mtdTs - expectedTs;
  const hbPacingGap = mtdHb - expectedHb;
  const tsGapStr = tsPacingGap >= 0 ? `+RM ${Math.round(tsPacingGap).toLocaleString()} (Ahead 🟢)` : `-RM ${Math.round(Math.abs(tsPacingGap)).toLocaleString()} (Behind 🔴)`;
  const hbGapStr = hbPacingGap >= 0 ? `+RM ${Math.round(hbPacingGap).toLocaleString()} (Ahead 🟢)` : `-RM ${Math.round(Math.abs(hbPacingGap)).toLocaleString()} (Behind 🔴)`;

  let takeaway = "";
  if (Number(hbPct) >= 40) {
    takeaway = `💡 *Operational Takeaway:*\nStore HB achieved ${hbPct}%, surpassing the 40% benchmark! Basket size RM ${avgBasket} (HB Basket: RM ${hbBasket}) across ${dailyCust} transactions. Strong clinical conversion yesterday—let's maintain this momentum today!`;
  } else {
    takeaway = `💡 *Operational Takeaway:*\nStore HB closed at ${hbPct}% with RM ${avgBasket} basket size and ${dailyCust} transactions. Strengthen 1+1 acute pairing at the counter today to push HB ratio beyond 40%!`;
  }

  const sec1Text = `• Total Sales (TS): RM ${dailyTs.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
• House Brand (HB): RM ${dailyHb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${hbPct}%)
• High Margin (HM): RM ${dailyHm.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${hmPct}%)
• Customer Count: ${dailyCust} transactions
• Average Basket Size: RM ${avgBasket} (HB Basket: RM ${hbBasket})
• MTD Progress: TS ${formatRM(mtdTs)} / ${formatRM(targetTs)} (${mtdTsPct}% | ${tsGapStr}), HB ${formatRM(mtdHb)} / ${formatRM(targetHb)} (${mtdHbPct}% | ${hbGapStr})

${takeaway}`;

  const dailyTargetTs = Math.round(targetTs / daysInMonth);
  const dailyTargetHb = Math.round(targetHb / daysInMonth);

  const dposTopic = (window.dposState && window.dposState.activeWeekTopic) || "Hypertension & Chronic Care";
  const featuredModule = (window.getPmgHouseBrandRecommendation && window.getPmgHouseBrandRecommendation(salesDateObj, dposTopic)) || (window.PMG_CLINICAL_UPSELL_MODULES && window.PMG_CLINICAL_UPSELL_MODULES[0]);

  const sec2Default = `• [Sales Focus]: Daily store target TS RM ${dailyTargetTs.toLocaleString()}, HB target RM ${dailyTargetHb.toLocaleString()} (pushing for 40%+ HB ratio). Yesterday achieved ${hbPct}%—let's build on this momentum today!`;

  const sec3Default = `• [HQ Incentive Tracking]: Outlet MTD HB is RM ${Math.round(mtdHb).toLocaleString()} / RM ${Math.round(targetHb).toLocaleString()} (${mtdHbPct}%), steadily pacing toward the FY2027 Tier 3 incentive (RM 500/pax reward)!`;

  const sec4Default = `• Make sure follow FEFO\n• Clean gondola from front to back and snap photo to google chat.\n• Refill stock and snap photo to google chat.\n• Update price gondola and snap photo into google chat.`;

  const sortedStaff = [...staff].sort((a, b) => Number(b.dailyHb || 0) - Number(a.dailyHb || 0));
  let rankingLines = [];
  sortedStaff.forEach((s, idx) => {
    const sHb = Number(s.dailyHb || 0);
    const sHbFormatted = sHb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (idx === 0 && sHb > 0) {
      rankingLines.push(`🥇 1st Place: *${s.name}* (HB RM ${sHbFormatted}) 🌟`);
    } else if (idx === 1 && sHb > 0) {
      rankingLines.push(`🥈 2nd Place: *${s.name}* (HB RM ${sHbFormatted}) 👏`);
    } else if (idx === 2 && sHb > 0) {
      rankingLines.push(`🥉 3rd Place: *${s.name}* (HB RM ${sHbFormatted}) 👍`);
    } else if (sHb > 0) {
      rankingLines.push(`• *${s.name}*: HB RM ${sHbFormatted}`);
    } else {
      rankingLines.push(`• *${s.name}*: HB RM 0.00`);
    }
  });

  const hbRecBlock = featuredModule ? `\n\n💡 *Featured House Brand Clinical Pairing (Clinical Upsell):*\n【${featuredModule.condition}】\n\n• Standard Relief (OTC): ${featuredModule.standardOtc}\n\n• Golden Pairing (HB): ${featuredModule.hbProduct}\n\n• Recommended Dialogue: "${featuredModule.script}"\n\n• Red Flags (Refer Pharmacist): ${featuredModule.redFlags}` : '';

  const sec5Text = `🏆 *Yesterday's House Brand Top Performers:*
${rankingLines.join('\n')}

Thank you all for your hard work and great team coordination yesterday! Every professional clinical pairing genuinely improves customer wellness. Let's keep up the great effort today! 💪🔥${hbRecBlock}`;

  const pmgAppVal = (currentData.pmgApps && currentData.pmgApps[dateIsoKey] !== undefined)
    ? currentData.pmgApps[dateIsoKey]
    : getActivePmgApp(selectedBranch);

  currentBriefingState = {
    dateDisplay,
    dateIsoKey,
    branch: selectedBranch,
    sec1: sec1Text,
    sec2: sec2Default,
    sec3: sec3Default,
    sec4: sec4Default,
    sec5: sec5Text,
    featuredModule: featuredModule
  };

  document.getElementById("briefingDateDisplay").innerText = dateDisplay;
  document.getElementById("briefingBranchDisplay").innerText = selectedBranch;
  document.getElementById("briefingPmgAppInput").value = pmgAppVal;

  document.getElementById("briefingSec1Text").innerText = sec1Text;
  document.getElementById("briefingSec2Input").value = sec2Default;
  document.getElementById("briefingSec3Input").value = sec3Default;
  document.getElementById("briefingSec4Input").value = sec4Default;
  document.getElementById("briefingSec5Text").innerText = sec5Text;

  const select = document.getElementById("briefingHbSelect");
  if (select && window.PMG_CLINICAL_UPSELL_MODULES) {
    select.innerHTML = window.PMG_CLINICAL_UPSELL_MODULES.map(m => `
      <option value="${m.id}" ${featuredModule && featuredModule.id === m.id ? 'selected' : ''}>
        ${m.id}. ${m.condition}
      </option>
    `).join('');
  }

  const modal = document.getElementById("dailyBriefingModal");
  if (modal) {
    modal.style.display = "flex";
    history.pushState({ modal: 'dailyBriefingModal' }, '');
  }
}

function closeDailyBriefingModal(shouldPop = true) {
  const modal = document.getElementById("dailyBriefingModal");
  if (modal) modal.style.display = "none";
  if (shouldPop && history.state && history.state.modal === 'dailyBriefingModal') {
    history.back();
  }
}

function changeBriefingHouseBrand(conditionId) {
  if (!window.PMG_CLINICAL_UPSELL_MODULES || !currentBriefingState) return;
  const mod = window.PMG_CLINICAL_UPSELL_MODULES.find(m => String(m.id) === String(conditionId));
  if (!mod) return;

  currentBriefingState.featuredModule = mod;

  const lines = currentBriefingState.sec5.split(/\n+💡 \*(?:Featured House Brand Clinical Pairing|今日门市重点 House Brand 推荐)/);
  const topPart = lines[0].trimEnd();

  const newHbBlock = `\n\n💡 *Featured House Brand Clinical Pairing (Clinical Upsell):*\n【${mod.condition}】\n\n• Standard Relief (OTC): ${mod.standardOtc}\n\n• Golden Pairing (HB): ${mod.hbProduct}\n\n• Recommended Dialogue: "${mod.script}"\n\n• Red Flags (Refer Pharmacist): ${mod.redFlags}`;

  currentBriefingState.sec5 = topPart + newHbBlock;
  document.getElementById("briefingSec5Text").innerText = currentBriefingState.sec5;

  const sec2Area = document.getElementById("briefingSec2Input");
  if (sec2Area) {
    const sec2Lines = sec2Area.value.split('\n');
    const updated = sec2Lines.map(l => {
      if (l.includes('[DPOS Clinical Pairing]') || l.includes('[DPOS 搭配重点]')) {
        return `• [DPOS Clinical Pairing]: (Weekly Focus: ${mod.condition}) For relevant patient consultations, actively recommend ${mod.hbProduct}.`;
      }
      return l;
    });
    sec2Area.value = updated.join('\n');
  }
}

async function saveBriefingPmgApp() {
  if (!currentBriefingState) return;
  const val = Number(document.getElementById("briefingPmgAppInput").value) || 0;
  const dateKey = currentBriefingState.dateIsoKey;
  const branch = currentBriefingState.branch;
  const bKey = findBranchKey(currentData && currentData.summary, branch) || "KOTA SENTOSA";

  try {
    localStorage.setItem("pmg_app_installs_" + bKey + "_" + dateKey, String(val));
    localStorage.setItem("pmg_app_installs_" + bKey, String(val));
  } catch (e) {}

  if (!currentData.pmgApps) currentData.pmgApps = {};
  currentData.pmgApps[dateKey] = val;

  try {
    await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: 'saveActionPlan',
        branch: branch,
        plans: currentData.actionPlan || {},
        pmgCount: val,
        date: dateKey
      })
    });
    alert(`📱 PMG Medicare App count (${val}) saved for ${currentBriefingState.dateDisplay}!`);
  } catch (err) {
    console.warn("Failed to save PMG app count to server:", err);
    alert(`Saved locally (${val}). Server update pending.`);
  }
}

function formatSectionText(raw) {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  const lines = cleaned.split('\n');
  const formatted = [];
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i].trim();
    if (!cur) continue;
    if (formatted.length > 0 && /^[•\-\*\d\[]/.test(cur) && formatted[formatted.length - 1] !== "") {
      formatted.push("");
    }
    formatted.push(cur);
  }
  return formatted.join('\n');
}

function copyBriefingMessage() {
  if (!currentBriefingState) return;

  const sec1 = (document.getElementById("briefingSec1Text").innerText || currentBriefingState.sec1).trim();
  const rawSec2 = document.getElementById("briefingSec2Input").value || currentBriefingState.sec2 || "";
  const rawSec3 = document.getElementById("briefingSec3Input").value || currentBriefingState.sec3 || "";
  const rawSec4 = document.getElementById("briefingSec4Input").value || currentBriefingState.sec4 || "";
  const sec5 = (document.getElementById("briefingSec5Text").innerText || currentBriefingState.sec5).trim();

  const sec2 = formatSectionText(rawSec2);
  const sec3 = formatSectionText(rawSec3);
  const sec4 = formatSectionText(rawSec4);

  const divider = "━━━━━━━━━━━━━━━━━━━━━";

  let text = `*📊 PMG ${currentBriefingState.branch.toUpperCase()} - DAILY BRIEFING*\n`;
  text += `📅 Date: ${currentBriefingState.dateDisplay}\n\n`;
  text += `${divider}\n\n`;

  text += `*1. Yesterday's Operational & Financial Review*\n\n`;
  text += `${sec1}\n\n`;
  text += `${divider}\n\n`;

  text += `*2. Today's Key Priorities*\n\n`;
  text += `${sec2}\n\n`;
  text += `${divider}\n\n`;

  text += `*3. HQ Directives & Target Alignment*\n\n`;
  text += `${sec3}\n\n`;
  text += `${divider}\n\n`;

  text += `*4. Operational Precautions & Compliance*\n\n`;
  text += `${sec4}\n\n`;
  text += `${divider}\n\n`;

  text += `*5. Recognition & Team Encouragement*\n\n`;
  text += `${sec5}\n\n`;
  text += `${divider}\n\n`;

  text += `🔗 *View Live Performance Hub:* ${WEBAPP_LINK}`;

  navigator.clipboard.writeText(text).then(() => {
    alert(`📋 Daily Briefing copied to clipboard!\nReady to paste directly into your team chat.`);
  }).catch(e => {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    alert(`📋 Daily Briefing copied to clipboard!\nReady to paste directly into your team chat.`);
  });
}

function copyWhatsAppBriefing() {
  openDailyBriefingModal();
}

// ─── GEMINI API KEY MANAGEMENT & TEST ─────────────────────────────────────────
function saveGeminiApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem('pmg_gemini_key', key.trim());
  } else {
    localStorage.removeItem('pmg_gemini_key');
  }
  updateGeminiBadge();
}

function updateGeminiBadge() {
  const badge = document.getElementById("geminiStatusBadge");
  const input = document.getElementById("geminiApiKeyInput");
  const rawKey = localStorage.getItem('pmg_gemini_key');
  if (input && rawKey && !input.value) {
    input.value = rawKey;
  }
  const keys = getGeminiApiKeys();
  if (badge) {
    if (keys.length > 0) {
      badge.innerText = keys.length > 1 ? `⚡ Gemini 3.5 Active (${keys.length} Keys Pool)` : "⚡ Gemini 3.5 Active";
      badge.style.background = "#dcfce7";
      badge.style.color = "#15803d";
      badge.style.border = "1px solid #86efac";
    } else {
      badge.innerText = "Offline Rule";
      badge.style.background = "#f3f4f6";
      badge.style.color = "#4b5563";
      badge.style.border = "1px solid #d1d5db";
    }
  }
}

async function testGeminiConnection() {
  const input = document.getElementById("geminiApiKeyInput");
  const raw = (input ? input.value : "") || localStorage.getItem('pmg_gemini_key');
  const keys = (raw || '').split(/[\s,;]+/).map(k => k.replace(/['"]/g, '').trim()).filter(k => k.length >= 10);
  if (keys.length === 0) {
    alert("Please paste at least one valid Gemini API key first.\n\nYou can enter multiple keys separated by comma, space, or newline for automatic failover.");
    return;
  }

  const badge = document.getElementById("geminiStatusBadge");
  if (badge) badge.innerText = `Testing ${keys.length} key(s)...`;

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash'
  ];

  let verifiedCount = 0;
  let activeModel = null;
  let errorReports = [];

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    let keyOk = false;
    for (const m of candidateModels) {
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': k
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Respond with 'READY'." }] }]
          })
        });
        if (resp.ok) {
          keyOk = true;
          activeModel = m;
          verifiedCount++;
          break;
        } else {
          const errData = await resp.json().catch(() => ({}));
          errorReports.push(`Key #${i+1} (${k.slice(0, 6)}...): ${errData.error ? errData.error.message : 'HTTP ' + resp.status}`);
        }
      } catch (err) {
        errorReports.push(`Key #${i+1}: ${err.message}`);
      }
    }
  }

  if (verifiedCount > 0) {
    localStorage.setItem('pmg_gemini_key', raw.trim());
    updateGeminiBadge();

    // Auto-sync verified key pool to central backend ScriptProperties so all teammates automatically receive it!
    try {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveGeminiApiKey',
          apiKey: raw.trim(),
          adminUsername: (currentUser && currentUser.username) || 'williamchai',
          role: (currentUser && (currentUser.position || currentUser.role)) || 'Pharmacist'
        })
      }).catch(e => console.warn("Failed to sync gemini key to backend:", e));
    } catch (e) {
      console.warn("Sync error:", e);
    }

    const poolInfo = keys.length > 1
      ? `\n\n🔁 Multi-Key Failover Enabled: ${verifiedCount} of ${keys.length} keys verified and pooled.\nIf Key 1 ever hits rate/quota limits (429), Key 2 automatically takes over without interruption!`
      : `\n\n💡 Pro-tip: You can paste multiple keys separated by comma to enable automatic quota failover.`;
    alert(`✅ Connected to Gemini API successfully!\nActive Engine: ${activeModel}${poolInfo}\n\n🔑 Central Key Sync: Your active key(s) have been synchronized to the backend so all branch teammates can immediately use AI features without manual setup!`);
  } else {
    updateGeminiBadge();
    alert(`❌ Connection failed for all entered keys:\n${errorReports.slice(0, 3).join('\n')}\n\nPlease ensure your API keys are active in Google AI Studio.`);
  }
}

function getConstructiveComment(ts, hb) {
  if (ts === 0) return "Store closed or no data.";
  let hbPct = (hb / ts) * 100;
  if (hbPct >= 45) return `Outstanding HB ratio (${hbPct.toFixed(1)}%)! Maintain this momentum by continuing dual-pairing on all acute consults.`;
  if (hbPct >= 40) return `Solid performance (${hbPct.toFixed(1)}% HB). Push PWP conversions at checkout to break the 45% mark.`;
  return `HB ratio needs attention (${hbPct.toFixed(1)}%). Action: Mandate 1 House Brand recommendation for every symptomatic customer today.`;
}

function openReportModal(type) {
  if (!isManagementOrPharmacist(currentUser)) {
    alert("Access restricted: Reports are only available to Pharmacist and Management.");
    return;
  }
  currentReportType = type;
  document.getElementById("reportModal").style.display = "flex";
  history.pushState({ modal: 'reportModal' }, '');
  const content = document.getElementById("reportContent");
  
  selectedBranch = selectedBranch || (currentUser && currentUser.branch) || DEFAULT_BRANCH;
  if (String(selectedBranch).toUpperCase() === 'ALL') selectedBranch = DEFAULT_BRANCH;

  const branchKey = findBranchKey(currentData.summary, selectedBranch) || "KOTA SENTOSA";
  const targetKey = findBranchKey(currentData.targets, selectedBranch) || "KOTA SENTOSA";
  const summary = currentData.summary[branchKey] || {};
  const targets = currentData.targets[targetKey] || {};
  const historyData = currentData.history || [];
  const staff = archiveAndGetOctoberMtd(currentData.staff || [], summary, currentData.currentDay);
  const ap = currentData.actionPlan || {};

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const todayMyt = parseMytDate(new Date());
  const currentMonth = todayMyt.month;
  const currentYear = todayMyt.year;
  const todayDay = todayMyt.day;

  // Filter history strictly to current month (October 2026) in Malaysia Time
  const currentMonthHistory = historyData.filter(h => {
    const md = parseMytDate(h.date);
    return md && md.month === currentMonth && md.year === currentYear;
  });

  const reportDateDisplay = `${todayDay}-${months[currentMonth].toUpperCase()}-${currentYear}`;

  if (type === 'director') {
    let tsGap = (summary.mtdTs || 0) - (targets.ts || 0);
    let tsPct = targets.ts ? (((summary.mtdTs || 0) / targets.ts) * 100).toFixed(0) : 0;
    let tsLyGap = (summary.mtdTs || 0) - (summary.lyMtd || 0);
    let tsLyGrowth = summary.lyMtd > 0 ? ((((summary.mtdTs || 0) - summary.lyMtd) / summary.lyMtd) * 100).toFixed(1) : 0;
    
    let hbGap = (summary.mtdHb || 0) - (targets.hb || 0);
    let hbPct = targets.hb ? (((summary.mtdHb || 0) / targets.hb) * 100).toFixed(0) : 0;
    let hbLyGap = (summary.mtdHb || 0) - (summary.lyMtdHb || 0);
    let hbLyGrowth = summary.lyMtdHb > 0 ? ((((summary.mtdHb || 0) - summary.lyMtdHb) / summary.lyMtdHb) * 100).toFixed(1) : 0;
    
    let hmGap = (summary.mtdHm || 0) - (targets.hm || 0);
    let hmPct = targets.hm ? (((summary.mtdHm || 0) / targets.hm) * 100).toFixed(0) : 0;
    let hmLyGap = (summary.mtdHm || 0) - (summary.lyMtdHm || 0);
    let hmLyGrowth = summary.lyMtdHm > 0 ? ((((summary.mtdHm || 0) - summary.lyMtdHm) / summary.lyMtdHm) * 100).toFixed(1) : 0;

    const activePmgApp = getActivePmgApp(selectedBranch);

    // Director 7-Day Picture Report columns:
    // During month transitions (e.g. October 1-7), strictly render Oct 1, Oct 2, Oct 3
    // without blending any days from September.
    const buildDirectorCols = () => {
      const cols = [];
      let startDay, endDay;
      if (todayDay <= 7) {
        startDay = 1;
        endDay = Math.max(3, todayDay);
      } else {
        startDay = todayDay - 6;
        endDay = todayDay;
      }

      for (let d = startDay; d <= endDay; d++) {
        const matched = currentMonthHistory.find(h => {
          const md = parseMytDate(h.date);
          return md && md.day === d;
        });

        const isToday = d === todayDay;
        const colData = matched ? { ...matched } : { ts: 0, hb: 0, hm: 0, cust: 0, pmgApp: 0 };
        const dayIsoKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const bKey = findBranchKey(currentData.summary, selectedBranch) || "KOTA SENTOSA";
        const storedDayVal = localStorage.getItem("pmg_app_installs_" + bKey + "_" + dayIsoKey);

        let dayAppVal = (currentData.pmgApps && currentData.pmgApps[dayIsoKey] !== undefined)
          ? Number(currentData.pmgApps[dayIsoKey])
          : ((matched && matched.pmgApp !== undefined && matched.pmgApp !== null)
            ? Number(matched.pmgApp)
            : ((storedDayVal !== null && !isNaN(Number(storedDayVal)))
              ? Number(storedDayVal)
              : (isToday ? activePmgApp : 0)));
        colData.pmgApp = dayAppVal;

        cols.push({
          label: `${d}-${months[currentMonth]}`,
          isLast: isToday,
          hasData: !!matched || isToday,
          data: colData
        });
      }

      return cols;
    };

    const directorCols = buildDirectorCols();

    let html = `
    <div class="excel-report" id="captureArea" style="min-width: 860px; width: max-content;">
      <div class="excel-title">PMG PHARMACY ${selectedBranch.toUpperCase()} - DIRECTORS' DAILY SALES REPORT (${reportDateDisplay})</div>
      
      <div class="excel-grid">
        <div class="excel-col-left">
          <table class="excel-table">
            <tr class="header-blue"><th>Monthly Sales</th><th>Amount</th><th>%</th></tr>
            <tr><td>Sales Vs Target</td><td>${tsGap < 0 ? '' : '+'}${formatRM(tsGap)}</td><td>${tsPct}%</td></tr>
            <tr><td>Sales Vs LY</td><td>${tsLyGap < 0 ? '' : '+'}${formatRM(tsLyGap)}</td><td>${tsLyGrowth >= 0 ? '+' : ''}${tsLyGrowth}%</td></tr>
            <tr><td>HB Vs Target</td><td>${hbGap < 0 ? '' : '+'}${formatRM(hbGap)}</td><td>${hbPct}%</td></tr>
            <tr><td>HB Vs LY</td><td>${hbLyGap < 0 ? '' : '+'}${formatRM(hbLyGap)}</td><td>${hbLyGrowth >= 0 ? '+' : ''}${hbLyGrowth}%</td></tr>
            <tr><td>HM Vs Target</td><td>${hmGap < 0 ? '' : '+'}${formatRM(hmGap)}</td><td>${hmPct}%</td></tr>
            <tr><td>HM Vs LY</td><td>${hmLyGap < 0 ? '' : '+'}${formatRM(hmLyGap)}</td><td>${hmLyGrowth >= 0 ? '+' : ''}${hmLyGrowth}%</td></tr>
          </table>

          <table class="excel-table" style="margin-top:10px;">
            <tr class="header-yellow"><th colspan="4">From 1st to ${reportDateDisplay}</th></tr>
            <tr class="header-yellow"><th></th><th>MTD Sales</th><th>Last Year Sales</th><th>Target</th></tr>
            <tr><td><b>Total</b></td><td>${formatRM(summary.mtdTs)}</td><td>${formatRM(summary.lyMtd)}</td><td>${formatRM(targets.ts)}</td></tr>
            <tr><td>HB</td><td>${formatRM(summary.mtdHb)}</td><td>${formatRM(summary.lyMtdHb || 0)}</td><td>${formatRM(targets.hb)}</td></tr>
            <tr><td>HM</td><td>${formatRM(summary.mtdHm)}</td><td>${formatRM(summary.lyMtdHm || 0)}</td><td>${formatRM(targets.hm)}</td></tr>
            <tr><td>Public Medicare App</td><td>${activePmgApp}</td><td>-</td><td>-</td></tr>
          </table>

          <div class="action-plan-box">
            <b>Action Plan (${months[currentMonth]}):</b><br>
            <b>Week 1:</b> ${ap.w1 || '-'}<br>
            <b>Week 2:</b> ${ap.w2 || '-'}<br>
            <b>Week 3:</b> ${ap.w3 || '-'}<br>
            <b>Week 4:</b> ${ap.w4 || '-'}
          </div>
        </div>

        <div class="excel-col-right">
          <table class="excel-table">
            <tr class="header-blue">
              <th>Metric</th>
              ${directorCols.map(c => `<th class="${c.isLast ? 'header-orange' : ''}">${c.label}${c.isLast ? ' *' : ''}</th>`).join('')}
            </tr>
            <tr><td><b>Total Sales</b></td>${directorCols.map(c => `<td>${c.hasData ? formatRM(c.data.ts) : '-'}</td>`).join('')}</tr>
            <tr><td><b>HB</b></td>${directorCols.map(c => `<td>${c.hasData ? formatRM(c.data.hb) : '-'}</td>`).join('')}</tr>
            <tr><td><b>HB%</b></td>${directorCols.map(c => `<td>${c.hasData && c.data.ts > 0 ? ((c.data.hb/c.data.ts)*100).toFixed(1) + '%' : '-'}</td>`).join('')}</tr>
            <tr><td><b>HM</b></td>${directorCols.map(c => `<td>${c.hasData ? formatRM(c.data.hm) : '-'}</td>`).join('')}</tr>
            <tr><td><b>HM%</b></td>${directorCols.map(c => `<td>${c.hasData && c.data.ts > 0 ? ((c.data.hm/c.data.ts)*100).toFixed(1) + '%' : '-'}</td>`).join('')}</tr>
            <tr><td><b>No. of tranx</b></td>${directorCols.map(c => `<td>${c.hasData ? c.data.cust : '-'}</td>`).join('')}</tr>
            <tr><td><b>Total Sales BS</b></td>${directorCols.map(c => `<td>${c.hasData && c.data.cust > 0 ? formatRM(c.data.ts/c.data.cust) : '-'}</td>`).join('')}</tr>
            <tr><td><b>HB BS</b></td>${directorCols.map(c => `<td>${c.hasData && c.data.cust > 0 ? formatRM(c.data.hb/c.data.cust) : '-'}</td>`).join('')}</tr>
            <tr><td><b>PMG APP</b></td>${directorCols.map(c => `<td>${c.hasData ? (c.data.pmgApp || 0) : '-'}</td>`).join('')}</tr>
            <tr class="header-yellow"><td><b>Daily Comment:</b></td>${directorCols.map(c => `<td style="font-size:0.65rem; white-space:normal; text-align:left; max-width:130px; word-wrap:break-word;">${c.hasData ? getConstructiveComment(c.data.ts, c.data.hb) : 'Pending daily close'}</td>`).join('')}</tr>
          </table>
        </div>
      </div>
    </div>`;
    content.innerHTML = html;
  } 
  else if (type === 'teammates') {
    // Teammate Target Achievement Table & Daily Quota Run-Rate for October 2026
    const daysInMonth = currentData.daysInMonth || 31;
    const currentDay = Math.min(daysInMonth, Math.max(1, todayDay));
    const remainingDays = Math.max(1, daysInMonth - currentDay + 1);

    let html = `
    <div class="excel-report" id="captureArea" style="min-width: 860px; width: max-content;">
      <div class="excel-title">PMG ${selectedBranch.toUpperCase()} - TEAMMATE OCTOBER TARGET ACHIEVEMENT & DAILY RUN-RATE (${reportDateDisplay})</div>
      <table class="excel-table">
        <tr class="header-red">
          <th style="text-align:left;">Teammate Name</th>
          <th>Cust</th>
          <th>Oct MTD Sales</th>
          <th>Oct TS Target</th>
          <th>Daily TS Quota (${remainingDays}d left)</th>
          <th>Oct MTD HB</th>
          <th>Oct HB Target</th>
          <th>Daily HB Quota (${remainingDays}d left)</th>
          <th>HB %</th>
        </tr>`;
    
    let totalCust = 0, totalOctTs = 0, totalOctHb = 0, totalTargetTs = 0, totalTargetHb = 0;
    let totalDailyQuotaTs = 0, totalDailyQuotaHb = 0;

    staff.forEach(s => {
      const octTotalTsTarget = (s.targetTs || 0) * daysInMonth;
      const octTotalHbTarget = (s.targetHb || 0) * daysInMonth;
      const dailyQuotaTs = Math.max(0, (octTotalTsTarget - s.octMtdTs) / remainingDays);
      const dailyQuotaHb = Math.max(0, (octTotalHbTarget - s.octMtdHb) / remainingDays);
      const hbPct = s.octMtdTs > 0 ? ((s.octMtdHb / s.octMtdTs) * 100).toFixed(1) : "0.0";
      
      totalCust += s.octMtdCust || 0;
      totalOctTs += s.octMtdTs;
      totalOctHb += s.octMtdHb;
      totalTargetTs += octTotalTsTarget;
      totalTargetHb += octTotalHbTarget;
      totalDailyQuotaTs += dailyQuotaTs;
      totalDailyQuotaHb += dailyQuotaHb;

      html += `<tr>
        <td style="text-align:left;"><b>${s.name}</b><br><span style="font-size:0.6rem; color:#666;">${s.role}</span></td>
        <td>${s.octMtdCust || 0}</td>
        <td>${formatRM(s.octMtdTs)}</td>
        <td>${formatRM(octTotalTsTarget)}</td>
        <td style="color:#c62828; font-weight:bold;">${formatRM(dailyQuotaTs)}/day</td>
        <td>${formatRM(s.octMtdHb)}</td>
        <td>${formatRM(octTotalHbTarget)}</td>
        <td style="color:#00796b; font-weight:bold;">${formatRM(dailyQuotaHb)}/day</td>
        <td>${hbPct}%</td>
      </tr>`;
    });

    const storeTargetTs = targets.ts || totalTargetTs;
    const storeTargetHb = targets.hb || totalTargetHb;
    const storeQuotaTs = Math.max(0, (storeTargetTs - (summary.mtdTs || totalOctTs)) / remainingDays);
    const storeQuotaHb = Math.max(0, (storeTargetHb - (summary.mtdHb || totalOctHb)) / remainingDays);
    const outletHbPct = (summary.mtdTs || totalOctTs) > 0 ? (((summary.mtdHb || totalOctHb) / (summary.mtdTs || totalOctTs)) * 100).toFixed(1) : "0.0";

    html += `<tr style="background:#f5f5f5; font-weight:bold;">
      <td style="text-align:left;">OUTLET CUMULATIVE</td>
      <td>${summary.mtdCust || totalCust}</td>
      <td>${formatRM(summary.mtdTs || totalOctTs)}</td>
      <td>${formatRM(storeTargetTs)}</td>
      <td style="color:#c62828;">${formatRM(storeQuotaTs)}/day</td>
      <td>${formatRM(summary.mtdHb || totalOctHb)}</td>
      <td>${formatRM(storeTargetHb)}</td>
      <td style="color:#00796b;">${formatRM(storeQuotaHb)}/day</td>
      <td>${outletHbPct}%</td>
    </tr>`;
    
    html += `</table></div>`;
    content.innerHTML = html;
  }
}

function formatRM(num) {
  return "RM " + Number(num).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
}

function closeReportModal(shouldPop = true) {
  document.getElementById("reportModal").style.display = "none";
  if (shouldPop && history.state && history.state.modal === 'reportModal') {
    history.back();
  }
}

async function downloadReportAsImage() {
  const element = document.getElementById('captureArea');
  if (!element) return;

  const btn = document.querySelector("#reportModal button[onclick*='downloadReportAsImage']");
  const originalText = btn ? btn.innerText : "";
  if (btn) btn.innerText = "⏳ Generating Ultra-HD PNG...";

  try {
    const origWidth = element.style.width;
    const origMaxWidth = element.style.maxWidth;
    const origOverflow = element.style.overflow;

    // Expand element to its full scroll dimensions so 100% of columns and rows are captured
    const fullWidth = Math.max(element.scrollWidth, 860);
    const fullHeight = element.scrollHeight;

    element.style.width = fullWidth + "px";
    element.style.maxWidth = "none";
    element.style.overflow = "visible";

    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
      width: fullWidth,
      height: fullHeight,
      windowWidth: fullWidth + 100,
      windowHeight: fullHeight + 100,
      scrollX: 0,
      scrollY: 0
    });

    // Restore original styles
    element.style.width = origWidth;
    element.style.maxWidth = origMaxWidth;
    element.style.overflow = origOverflow;

    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `PMG_${selectedBranch}_${currentReportType}_Report.png`;
    link.href = imgData;
    link.click();
  } catch (err) {
    console.error("Screenshot generation error:", err);
    alert("Failed to generate image report. Please try again.");
  } finally {
    if (btn) btn.innerText = originalText;
  }
}

// ─── PMG HOUSE BRAND 220+ CATALOG VIEWER & SEARCH ─────────────────────────────
let currentHbFilterBrand = 'ALL';

function openHouseBrandModal() {
  const modal = document.getElementById("houseBrandModal");
  if (!modal) return;
  modal.style.display = "flex";
  history.pushState({ page: 'hbModal' }, '');
  renderHbChips();
  filterHouseBrands();
}

function closeHouseBrandModal(fromPopState = false) {
  const modal = document.getElementById("houseBrandModal");
  if (modal) modal.style.display = "none";
  if (!fromPopState && history.state && history.state.page === 'hbModal') {
    history.back();
  }
}

function renderHbChips() {
  const chipsContainer = document.getElementById("hbCategoryChips");
  if (!chipsContainer) return;
  const popularBrands = [
    { label: "All (221)", val: "ALL" },
    { label: "Nutribridge", val: "Nutribridge" },
    { label: "JH Nutrition", val: "JH Nutrition" },
    { label: "Livemore", val: "Livemore" },
    { label: "VK Dermsolve", val: "VK Dermsolve" },
    { label: "V-Infinity", val: "V-Infinity" },
    { label: "Denticlear", val: "Denticlear" },
    { label: "Medicplast", val: "Medicplast" },
    { label: "Joint & Bone", val: "Joint & Bone" },
    { label: "Cardiovascular", val: "Cardiovascular" },
    { label: "Digestive & Gut", val: "Digestive & Gut" },
    { label: "Immunity", val: "Immunity & Respiratory" },
    { label: "Pediatric", val: "Pediatric" }
  ];

  chipsContainer.innerHTML = popularBrands.map(b => {
    const isActive = currentHbFilterBrand === b.val;
    const bg = isActive ? "#0d9488" : "#f0fdfa";
    const color = isActive ? "#ffffff" : "#0f766e";
    const border = isActive ? "1px solid #0d9488" : "1px solid #99f6e4";
    return `<button type="button" onclick="setHbFilterChip('${b.val}')" style="background:${bg}; color:${color}; border:${border}; border-radius:16px; padding:3px 10px; cursor:pointer; font-weight:bold; font-size:0.7rem;">${b.label}</button>`;
  }).join("");
}

function setHbFilterChip(val) {
  currentHbFilterBrand = val;
  renderHbChips();
  filterHouseBrands();
}

function filterHouseBrands() {
  const query = (document.getElementById("hbSearchInput")?.value || "").toLowerCase().trim();
  const listContainer = document.getElementById("hbProductsList");
  if (!listContainer) return;

  const catalog = (typeof window !== 'undefined' && window.PMG_HOUSE_BRANDS_CATALOG) || [];
  if (catalog.length === 0) {
    listContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">Catalog loading or not available.</div>`;
    return;
  }

  const filtered = catalog.filter(p => {
    if (currentHbFilterBrand !== 'ALL') {
      const matchBrand = p.brand === currentHbFilterBrand;
      const matchIndication = (p.indication || []).some(ind => ind.toLowerCase().includes(currentHbFilterBrand.toLowerCase()));
      if (!matchBrand && !matchIndication) return false;
    }

    if (query) {
      const titleMatch = (p.title || "").toLowerCase().includes(query);
      const summaryMatch = (p.summary || "").toLowerCase().includes(query);
      const indMatch = (p.indication || []).some(ind => ind.toLowerCase().includes(query));
      const brandMatch = (p.brand || "").toLowerCase().includes(query);
      return titleMatch || summaryMatch || indMatch || brandMatch;
    }

    return true;
  });

  const badge = document.getElementById("hbTotalBadge");
  if (badge) badge.innerText = `${filtered.length} / ${catalog.length} Products`;

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:#888;">
        <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
        <div>No House Brand products found matching "<b>${query}</b>".</div>
        <div style="font-size:0.75rem; margin-top:4px;">Try searching by general indication e.g. "gastric", "milk", "joint", or "nerve".</div>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filtered.map(p => {
    const tagsList = p.tags || p.indication || [];
    const tagsHtml = tagsList.map(t => 
      `<span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:600;">${t}</span>`
    ).join(" ");

    const ingredientsHtml = p.ingredients ? `<div style="font-size: 0.74rem; color: #0d9488; margin-top: 4px; line-height: 1.35;"><b>🧪 Active Formulation:</b> ${p.ingredients}</div>` : '';
    const indicationHtml = p.clinicalIndication ? `<div style="font-size: 0.73rem; color: #334155; margin-top: 3px; line-height: 1.35;"><b>🩺 Clinical Indication:</b> ${p.clinicalIndication}</div>` : '';
    const packHtml = p.packSize ? `<span style="background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; font-size:0.65rem;">📦 ${p.packSize}</span>` : '';
    const malHtml = p.mal ? `<span style="background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:600;">${p.mal}</span>` : '';

    return `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <span style="font-size:0.65rem; font-weight:bold; color:#0f766e; background:#ccfbf1; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${p.brand}</span>
              ${packHtml}
              ${malHtml}
            </div>
            <h4 style="margin: 4px 0 2px 0; font-size: 0.92rem; color: #1e293b; font-weight: 700;">${p.title}</h4>
          </div>
          <a href="${p.link}" target="_blank" rel="noopener noreferrer" style="font-size:0.7rem; color:#0d9488; text-decoration:none; font-weight:bold; white-space:nowrap; border:1px solid #99f6e4; padding:2px 7px; border-radius:6px; background:#f0fdfa;">
            Official ↗
          </a>
        </div>
        ${ingredientsHtml}
        ${indicationHtml}
        <div style="font-size: 0.74rem; color: #64748b; line-height: 1.35; margin: 4px 0 6px 0;">
          ${p.summary}
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${tagsHtml}
        </div>
      </div>
    `;
  }).join("");
}

// ─── MOBILE GESTURE & BACK NAVIGATION HANDLER ───────────────────────────────
window.addEventListener('popstate', (e) => {
  const reportModal = document.getElementById("reportModal");
  const actionPlanModal = document.getElementById("actionPlanModal");
  const houseBrandModal = document.getElementById("houseBrandModal");
  const signupBox = document.getElementById("signupBox");

  let modalClosed = false;
  if (reportModal && reportModal.style.display === "flex") {
    closeReportModal(false);
    modalClosed = true;
  }
  if (actionPlanModal && actionPlanModal.style.display === "flex") {
    closeActionPlanModal(false);
    modalClosed = true;
  }
  if (houseBrandModal && houseBrandModal.style.display === "flex") {
    closeHouseBrandModal(false);
    modalClosed = true;
  }
  if (signupBox && signupBox.style.display === "block") {
    toggleAuthView('login');
    modalClosed = true;
  }

  // Prevent browser/PWA from closing on accidental swipe if already on dashboard
  if (!modalClosed && currentUser) {
    history.pushState({ page: 'dashboard' }, '');
  }
});

// Touch Swipe Detection (Left/Right swipe to go back to previous page / close modals)
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!e.changedTouches || e.changedTouches.length === 0) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  // Horizontal swipe detected (swipe left or right > 70px)
  if (Math.abs(diffX) > 70 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
    const reportModal = document.getElementById("reportModal");
    const actionPlanModal = document.getElementById("actionPlanModal");
    const houseBrandModal = document.getElementById("houseBrandModal");
    const signupBox = document.getElementById("signupBox");

    if (reportModal && reportModal.style.display === "flex") {
      const screenEdgeThreshold = 40;
      const isEdgeSwipe = touchStartX <= screenEdgeThreshold || touchStartX >= window.innerWidth - screenEdgeThreshold;
      if (isEdgeSwipe) {
        closeReportModal(true);
      }
    } else if (actionPlanModal && actionPlanModal.style.display === "flex") {
      closeActionPlanModal(true);
    } else if (houseBrandModal && houseBrandModal.style.display === "flex") {
      closeHouseBrandModal(true);
    } else if (signupBox && signupBox.style.display === "block") {
      toggleAuthView('login');
    }
  }
}, { passive: true });

// Initialize Gemini AI Strategist Badge if present
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof updateGeminiBadge === 'function') updateGeminiBadge();
  });
}



// ─── 5-POINT DASHBOARD DAILY BRIEFING & AUTO-TRANSLATION ENGINE ─────────────
let currentDashboardBriefingLang = 'en';

function buildDefaultBriefingObject(branch) {
  const branchKey = findBranchKey(currentData && currentData.summary, branch) || "KOTA SENTOSA";
  const targetKey = findBranchKey(currentData && currentData.targets, branch) || "KOTA SENTOSA";
  const summary = (currentData && currentData.summary && currentData.summary[branchKey]) || {};
  const targets = (currentData && currentData.targets && currentData.targets[targetKey]) || {};
  const staff = archiveAndGetOctoberMtd((currentData && currentData.staff) || [], summary, (currentData && currentData.currentDay) || 1);
  const daysInMonth = (currentData && currentData.daysInMonth) || 31;
  const historyData = (currentData && currentData.history) || [];

  const salesDateObj = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateDisplay = `${String(salesDateObj.getDate()).padStart(2, '0')}-${months[salesDateObj.getMonth()]}-${salesDateObj.getFullYear()}`;
  const dateIsoKey = formatMytIsoDate(salesDateObj);

  const targetDay = salesDateObj.getDate();
  const matchedHist = historyData.find(h => {
    const md = parseMytDate(h.date);
    return md && md.day === targetDay;
  });

  const dailyTs = matchedHist ? Number(matchedHist.ts || 0) : staff.reduce((acc, s) => acc + Number(s.dailyTs || 0), 0);
  const dailyHb = matchedHist ? Number(matchedHist.hb || 0) : staff.reduce((acc, s) => acc + Number(s.dailyHb || 0), 0);
  const dailyHm = matchedHist ? Number(matchedHist.hm || 0) : staff.reduce((acc, s) => acc + Number(s.dailyHm || 0), 0);
  const dailyCust = matchedHist ? Number(matchedHist.cust || 0) : staff.reduce((acc, s) => acc + Number(s.dailyCust || 0), 0);

  const hbPct = dailyTs > 0 ? ((dailyHb / dailyTs) * 100).toFixed(1) : "0.0";
  const hmPct = dailyTs > 0 ? ((dailyHm / dailyTs) * 100).toFixed(1) : "0.0";
  const avgBasket = dailyCust > 0 ? (dailyTs / dailyCust).toFixed(2) : "0.00";
  const hbBasket = dailyCust > 0 ? (dailyHb / dailyCust).toFixed(2) : "0.00";

  const mtdTs = Number(summary.mtdTs || 0);
  const mtdHb = Number(summary.mtdHb || 0);
  const targetTs = Number(targets.ts || 0);
  const targetHb = Number(targets.hb || 0);
  const mtdTsPct = targetTs > 0 ? ((mtdTs / targetTs) * 100).toFixed(1) : "0.0";
  const mtdHbPct = targetHb > 0 ? ((mtdHb / targetHb) * 100).toFixed(1) : "0.0";

  const currentDay = Math.min(daysInMonth, Math.max(1, targetDay));
  const expectedTs = (targetTs / daysInMonth) * currentDay;
  const expectedHb = (targetHb / daysInMonth) * currentDay;
  const tsPacingGap = mtdTs - expectedTs;
  const hbPacingGap = mtdHb - expectedHb;
  const tsGapStr = tsPacingGap >= 0 ? `+RM ${Math.round(tsPacingGap).toLocaleString()} (Ahead 🟢)` : `-RM ${Math.round(Math.abs(tsPacingGap)).toLocaleString()} (Behind 🔴)`;
  const hbGapStr = hbPacingGap >= 0 ? `+RM ${Math.round(hbPacingGap).toLocaleString()} (Ahead 🟢)` : `-RM ${Math.round(Math.abs(hbPacingGap)).toLocaleString()} (Behind 🔴)`;

  let takeaway = "";
  if (Number(hbPct) >= 40) {
    takeaway = `💡 *Operational Takeaway:*\nStore HB achieved ${hbPct}%, surpassing the 40% benchmark! Basket size RM ${avgBasket} (HB Basket: RM ${hbBasket}) across ${dailyCust} transactions. Strong clinical conversion yesterday—let's maintain this momentum today!`;
  } else {
    takeaway = `💡 *Operational Takeaway:*\nStore HB closed at ${hbPct}% with RM ${avgBasket} basket size and ${dailyCust} transactions. Strengthen 1+1 acute pairing at the counter today to push HB ratio beyond 40%!`;
  }

  const sec1Text = `• Total Sales (TS): RM ${dailyTs.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
• House Brand (HB): RM ${dailyHb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${hbPct}%)
• High Margin (HM): RM ${dailyHm.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${hmPct}%)
• Customer Count: ${dailyCust} transactions
• Average Basket Size: RM ${avgBasket} (HB Basket: RM ${hbBasket})
• MTD Progress: TS ${formatRM(mtdTs)} / ${formatRM(targetTs)} (${mtdTsPct}% | ${tsGapStr}), HB ${formatRM(mtdHb)} / ${formatRM(targetHb)} (${mtdHbPct}% | ${hbGapStr})

${takeaway}`;

  const dailyTargetTs = Math.round(targetTs / daysInMonth);
  const dailyTargetHb = Math.round(targetHb / daysInMonth);

  const sec2Default = `• [Sales Focus]: Daily store target TS RM ${dailyTargetTs.toLocaleString()}, HB target RM ${dailyTargetHb.toLocaleString()} (pushing for 40%+ HB ratio). Yesterday achieved ${hbPct}%—let's build on this momentum today!`;
  const sec3Default = `• [HQ Incentive Tracking]: Outlet MTD HB is RM ${Math.round(mtdHb).toLocaleString()} / RM ${Math.round(targetHb).toLocaleString()} (${mtdHbPct}%), steadily pacing toward the FY2027 Tier 3 incentive (RM 500/pax reward)!`;
  const sec4Default = `• Make sure follow FEFO\n• Clean gondola from front to back and snap photo to google chat.\n• Refill stock and snap photo to google chat.\n• Update price gondola and snap photo into google chat.`;

  const sortedStaff = [...staff].sort((a, b) => Number(b.dailyHb || 0) - Number(a.dailyHb || 0));
  let rankingLines = [];
  sortedStaff.forEach((s, idx) => {
    const sHb = Number(s.dailyHb || 0);
    const sHbFormatted = sHb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (idx === 0 && sHb > 0) {
      rankingLines.push(`🥇 1st Place: *${s.name}* (HB RM ${sHbFormatted}) 🌟`);
    } else if (idx === 1 && sHb > 0) {
      rankingLines.push(`🥈 2nd Place: *${s.name}* (HB RM ${sHbFormatted}) 👏`);
    } else if (idx === 2 && sHb > 0) {
      rankingLines.push(`🥉 3rd Place: *${s.name}* (HB RM ${sHbFormatted}) 👍`);
    } else if (sHb > 0) {
      rankingLines.push(`• *${s.name}*: HB RM ${sHbFormatted}`);
    } else {
      rankingLines.push(`• *${s.name}*: HB RM 0.00`);
    }
  });

  const dposTopic = (window.dposState && window.dposState.activeWeekTopic) || "Hypertension & Chronic Care";
  const featuredModule = (window.getPmgHouseBrandRecommendation && window.getPmgHouseBrandRecommendation(salesDateObj, dposTopic)) || (window.PMG_CLINICAL_UPSELL_MODULES && window.PMG_CLINICAL_UPSELL_MODULES[0]);

  const hbRecBlock = featuredModule ? `\n\n💡 *Featured House Brand Clinical Pairing (Clinical Upsell):*\n【${featuredModule.condition}】\n\n• Standard Relief (OTC): ${featuredModule.standardOtc}\n\n• Golden Pairing (HB): ${featuredModule.hbProduct}\n\n• Recommended Dialogue: "${featuredModule.script}"\n\n• Red Flags (Refer Pharmacist): ${featuredModule.redFlags}` : '';

  const sec5Text = `🏆 *Yesterday's House Brand Top Performers:*\n${rankingLines.join('\n')}\n\nThank you all for your hard work and great team coordination yesterday! Every professional clinical pairing genuinely improves customer wellness. Let's keep up the great effort today! 💪🔥${hbRecBlock}`;

  return {
    branch: branch,
    dateDisplay: dateDisplay,
    dateIsoKey: dateIsoKey,
    sec1: sec1Text,
    sec2: sec2Default,
    sec3: sec3Default,
    sec4: sec4Default,
    sec5: sec5Text,
    featuredModule: featuredModule,
    translations: {}
  };
}

function renderDashboardDailyBriefing() {
  const container = document.getElementById("dashboardDailyBriefingSection");
  if (!container) return;

  selectedBranch = selectedBranch || (currentUser && currentUser.branch) || DEFAULT_BRANCH;
  if (String(selectedBranch).toUpperCase() === 'ALL') selectedBranch = DEFAULT_BRANCH;
  const branchUpper = selectedBranch.toUpperCase();

  let briefing = (currentData && currentData.dailyBriefing) || null;
  if (!briefing) {
    try {
      const local = localStorage.getItem("pmg_saved_briefing_" + branchUpper);
      if (local) briefing = JSON.parse(local);
    } catch (e) {}
  }

  if (!briefing) {
    briefing = buildDefaultBriefingObject(selectedBranch);
  }

  window.activeDailyBriefing = briefing;

  const dateDisplay = briefing.dateDisplay || formatDisplayDate(new Date());
  const dateEl = document.getElementById("dashBriefingDate");
  const branchEl = document.getElementById("dashBriefingBranch");
  if (dateEl) dateEl.innerText = dateDisplay;
  if (branchEl) branchEl.innerText = selectedBranch;

  updateDashboardBriefingText(currentDashboardBriefingLang);

  const editBtn = document.getElementById("dashEditBriefingBtn");
  if (editBtn) {
    editBtn.style.display = isManagementOrPharmacist(currentUser) ? "inline-block" : "none";
  }

  container.style.display = "block";
}

function updateDashboardBriefingText(lang) {
  const briefing = window.activeDailyBriefing;
  if (!briefing) return;

  let textSec1 = briefing.sec1 || "";
  let textSec2 = briefing.sec2 || "";
  let textSec3 = briefing.sec3 || "";
  let textSec4 = briefing.sec4 || "";
  let textSec5 = briefing.sec5 || "";

  if (lang !== 'en' && briefing.translations && briefing.translations[lang]) {
    const t = briefing.translations[lang];
    textSec1 = t.sec1 || textSec1;
    textSec2 = t.sec2 || textSec2;
    textSec3 = t.sec3 || textSec3;
    textSec4 = t.sec4 || textSec4;
    textSec5 = t.sec5 || textSec5;
  }

  const s1 = document.getElementById("dashBriefingSec1");
  const s2 = document.getElementById("dashBriefingSec2");
  const s3 = document.getElementById("dashBriefingSec3");
  const s4 = document.getElementById("dashBriefingSec4");
  const s5 = document.getElementById("dashBriefingSec5");

  if (s1) s1.innerText = textSec1;
  if (s2) s2.innerText = textSec2;
  if (s3) s3.innerText = textSec3;
  if (s4) s4.innerText = textSec4;
  if (s5) s5.innerText = textSec5;

  ['en', 'zh', 'ms'].forEach(l => {
    const btn = document.getElementById("briefLang" + l.charAt(0).toUpperCase() + l.slice(1));
    if (btn) {
      if (l === lang) {
        btn.classList.add("active");
        btn.style.background = "#0f766e";
        btn.style.color = "white";
        btn.style.fontWeight = "bold";
      } else {
        btn.classList.remove("active");
        btn.style.background = "transparent";
        btn.style.color = "#475569";
        btn.style.fontWeight = "normal";
      }
    }
  });
}

async function switchDashboardBriefingLang(lang) {
  currentDashboardBriefingLang = lang;
  const briefing = window.activeDailyBriefing;
  if (!briefing) return;

  if (lang === 'en') {
    updateDashboardBriefingText('en');
    return;
  }

  if (briefing.translations && briefing.translations[lang]) {
    updateDashboardBriefingText(lang);
    return;
  }

  const btn = document.getElementById("briefLang" + lang.charAt(0).toUpperCase() + lang.slice(1));
  const origText = btn ? btn.innerText : "";
  if (btn) btn.innerText = "⏳ Translating...";

  try {
    await translateDailyBriefing(lang);
    updateDashboardBriefingText(lang);
  } catch (err) {
    alert("Translation failed: " + err.message);
  } finally {
    if (btn) btn.innerText = origText;
  }
}

async function triggerBriefingAiTranslation() {
  const currentLang = currentDashboardBriefingLang;
  const targetLang = currentLang === 'en' ? 'zh' : (currentLang === 'zh' ? 'ms' : 'en');
  await switchDashboardBriefingLang(targetLang);
}

async function translateDailyBriefing(targetLang) {
  const briefing = window.activeDailyBriefing;
  if (!briefing) throw new Error("No briefing loaded to translate.");

  const langLabel = targetLang === 'zh' ? 'Simplified Chinese (华语/中文)' : 'Bahasa Melayu (BM)';
  const prompt = `You are an expert bilingual pharmaceutical retail operations director for PMG Pharmacy in Malaysia.
Translate the following 5-point Daily Sales Briefing into ${langLabel}.

STRICT RULES:
1. Preserve all numerical figures, currency tags (e.g. RM 12,010.11), percentages, transaction counts, dates, and emojis.
2. Preserve exact product names unchanged (e.g. "JH Nutrition Sleepright Capsule", "systoright", "vk gentle cleanser", "Nutribridge menz", "Valerian + Passionflower").
3. Preserve staff names in English (e.g. Chai Yee Sian, Jong Pei Choo).
4. For Section 4 Operational Precautions, translate "Make sure follow FEFO" appropriately (e.g. "确保严格遵守 FEFO（先过期先出）" in Chinese, or "Pastikan patuhi prinsip FEFO" in BM) and emphasize taking photos and sending to Google Chat.
5. Return ONLY a valid JSON object with keys: "sec1", "sec2", "sec3", "sec4", "sec5". Do not include Markdown fences or extra commentary.

Input Briefing to translate:
Section 1:
${briefing.sec1}

Section 2:
${briefing.sec2}

Section 3:
${briefing.sec3}

Section 4:
${briefing.sec4}

Section 5:
${briefing.sec5}`;

  let jsonResult = null;
  try {
    const rawRes = await callGeminiApiWithRetry(prompt, "You are a professional retail pharmacy operations translator.");
    if (rawRes) {
      const fence = String.fromCharCode(96, 96, 96);
      const cleanJson = rawRes.split(fence + "json").join("").split(fence).join("").trim();
      jsonResult = JSON.parse(cleanJson);
    }
  } catch (e) {
    console.warn("Direct Gemini translation fallback:", e);
  }

  if (!jsonResult || !jsonResult.sec1) {
    if (targetLang === 'zh') {
      jsonResult = {
        sec1: briefing.sec1,
        sec2: briefing.sec2.replace('• [Sales Focus]:', '• [今日销售重点]:'),
        sec3: briefing.sec3.replace('• [HQ Incentive Tracking]:', '• [总部奖励指标追踪]:'),
        sec4: `• 确保严格遵守 FEFO（先过期先出）原则\n• 从前往后彻底清洁排面展架，并拍照发送至 Google Chat。\n• 补足缺货商品，并拍照发送至 Google Chat。\n• 更新排面价钱牌，并拍照发送至 Google Chat。`,
        sec5: briefing.sec5.replace("🏆 *Yesterday's House Brand Top Performers:*", "🏆 *昨日门市 House Brand 榜样先锋:*")
      };
    } else {
      jsonResult = {
        sec1: briefing.sec1,
        sec2: briefing.sec2.replace('• [Sales Focus]:', '• [Fokus Jualan Hari Ini]:'),
        sec3: briefing.sec3.replace('• [HQ Incentive Tracking]:', '• [Penjejakan Insentif HQ]:'),
        sec4: `• Pastikan patuhi prinsip FEFO (First-Expired, First-Out)\n• Bersihkan gondola dari depan ke belakang dan hantar gambar ke Google Chat.\n• Tambah stok barang dan hantar gambar ke Google Chat.\n• Kemas kini tanda harga gondola dan hantar gambar ke Google Chat.`,
        sec5: briefing.sec5.replace("🏆 *Yesterday's House Brand Top Performers:*", "🏆 *Pencapaian Terbaik House Brand Semalam:*")
      };
    }
  }

  if (!briefing.translations) briefing.translations = {};
  briefing.translations[targetLang] = jsonResult;

  const branchUpper = (briefing.branch || selectedBranch || "KOTA SENTOSA").toUpperCase();
  try {
    localStorage.setItem("pmg_saved_briefing_" + branchUpper, JSON.stringify(briefing));
  } catch (e) {}

  return jsonResult;
}

async function saveAndPublishBriefing() {
  if (!currentBriefingState) return;

  const btn = document.getElementById("btnSaveBriefingPublish");
  if (btn) btn.innerText = "⏳ Publishing & Broadcasting...";

  const sec1 = (document.getElementById("briefingSec1Text").innerText || currentBriefingState.sec1).trim();
  const rawSec2 = document.getElementById("briefingSec2Input").value || currentBriefingState.sec2 || "";
  const rawSec3 = document.getElementById("briefingSec3Input").value || currentBriefingState.sec3 || "";
  const rawSec4 = document.getElementById("briefingSec4Input").value || currentBriefingState.sec4 || "";
  const sec5 = (document.getElementById("briefingSec5Text").innerText || currentBriefingState.sec5).trim();

  const sec2 = formatSectionText(rawSec2);
  const sec3 = formatSectionText(rawSec3);
  const sec4 = formatSectionText(rawSec4);

  const branch = currentBriefingState.branch || selectedBranch || "Kota Sentosa";
  const branchUpper = branch.toUpperCase();
  const dateDisplay = currentBriefingState.dateDisplay || formatDisplayDate(new Date());
  const dateIsoKey = currentBriefingState.dateIsoKey || formatMytIsoDate(new Date());

  const briefingPayload = {
    branch: branch,
    dateDisplay: dateDisplay,
    dateIsoKey: dateIsoKey,
    sec1: sec1,
    sec2: sec2,
    sec3: sec3,
    sec4: sec4,
    sec5: sec5,
    featuredModule: currentBriefingState.featuredModule || null,
    updatedBy: (currentUser && currentUser.name) || "PIC",
    updatedAt: new Date().toISOString(),
    translations: (window.activeDailyBriefing && window.activeDailyBriefing.translations) || {}
  };

  window.activeDailyBriefing = briefingPayload;
  try {
    localStorage.setItem("pmg_saved_briefing_" + branchUpper, JSON.stringify(briefingPayload));
  } catch (e) {}

  try {
    await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: 'saveDailyBriefing',
        branch: branch,
        date: dateIsoKey,
        briefing: briefingPayload,
        username: (currentUser && currentUser.username) || 'manager',
        sendPush: true
      })
    });
  } catch (err) {
    console.warn("Backend briefing save error:", err);
  }

  dispatchPushNotification(
    `📊 PMG ${branch} Daily Briefing Ready!`,
    `Today's sales targets, priorities, and clinical pairings have been published. Tap to view!`,
    `https://williamchai1.github.io/pmgareasales/`
  );

  renderDashboardDailyBriefing();
  closeDailyBriefingModal();

  if (btn) btn.innerText = "💾 Save & Publish (+ Push Alert)";
  alert(`🎉 5-Point Daily Briefing published!\n• Live on App Dashboard for all teammates\n• Push notification dispatched to teammates' phones\n• Click "Copy to Google Chat" anytime to broadcast.`);
}

// ─── ONESIGNAL CLIENT PUSH NOTIFICATION ENGINE ───────────────────────────────
const DEFAULT_ONESIGNAL_APP_ID = "51051d85-495d-4a2b-901a-20377418fbec";
let isOneSignalInitialized = false;

function initOneSignal() {
  if (isOneSignalInitialized) return;
  isOneSignalInitialized = true;

  // 1. Cleanup any stale root domain service worker registrations
  if ("serviceWorker" in navigator && window.location.hostname.includes("github.io")) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => {
        if (r.active && r.active.scriptURL && r.active.scriptURL.endsWith("/OneSignalSDKWorker.js") && !r.active.scriptURL.includes("/pmgareasales/")) {
          console.warn("Unregistering stale root domain OneSignal service worker:", r.active.scriptURL);
          r.unregister();
        }
      });
    }).catch(e => console.warn("SW cleanup note:", e));
  }

  // 2. Attach push subscription listeners via OneSignalDeferred
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    try {
      console.log("OneSignal SDK ready. Monitoring push subscription state...");
      const sub = OneSignal.User && (OneSignal.User.PushSubscription || OneSignal.User.pushSubscription);
      if (sub) {
        sub.addEventListener("change", function(e) {
          console.log("Push subscription change event received:", e);
          if (e && e.current && e.current.id) {
            localStorage.setItem("pmg_onesignal_sub_id", e.current.id);
          }
          updateOneSignalUiStatus();
        });

        if (sub.id) {
          localStorage.setItem("pmg_onesignal_sub_id", sub.id);
        }
      }
      updateOneSignalUiStatus();
      checkTeammatePushBanner();
    } catch (e) {
      console.warn("OneSignal listener init warning:", e);
    }
  });
}

function updateOneSignalUiStatus() {
  const badge = document.getElementById("pushPermBadge");
  const btn = document.getElementById("btnSubscribePush");
  const subIdSpan = document.getElementById("valPushSubId");
  if (!badge) return;

  if (!("Notification" in window)) {
    badge.innerText = "Unsupported";
    badge.style.background = "#fee2e2";
    badge.style.color = "#991b1b";
    if (btn) btn.innerText = "⚠️ Push Not Supported";
    if (subIdSpan) subIdSpan.innerText = "Unsupported Browser";
    return;
  }

  const perm = Notification.permission;
  if (perm === "denied") {
    badge.innerText = "Blocked 🔴";
    badge.style.background = "#fee2e2";
    badge.style.color = "#991b1b";
    if (btn) btn.innerText = "⚠️ Notifications Blocked";
    if (subIdSpan) subIdSpan.innerText = "Blocked in Phone Settings";
    return;
  }

  // Check stored ID
  const storedId = localStorage.getItem("pmg_onesignal_sub_id");

  if (perm === "granted") {
    badge.innerText = "Subscribed 🟢";
    badge.style.background = "#dcfce7";
    badge.style.color = "#15803d";
    if (btn) btn.innerText = "✅ Push Alerts Enabled";
    dismissPushBanner();
    if (subIdSpan) subIdSpan.innerText = storedId || "Connecting...";
  } else {
    badge.innerText = "Not Subscribed 🟡";
    badge.style.background = "#fef9c3";
    badge.style.color = "#854d0e";
    if (btn) btn.innerText = "🔔 Enable Push Notifications";
    if (subIdSpan) subIdSpan.innerText = "Not Subscribed";
  }

  // Immediate synchronous inspection if window.OneSignal already exists
  try {
    if (window.OneSignal && window.OneSignal.User) {
      const liveSub = window.OneSignal.User.PushSubscription || window.OneSignal.User.pushSubscription;
      if (liveSub && liveSub.id) {
        localStorage.setItem("pmg_onesignal_sub_id", liveSub.id);
        if (subIdSpan) subIdSpan.innerText = liveSub.id;
        badge.innerText = "Subscribed 🟢";
        badge.style.background = "#dcfce7";
        badge.style.color = "#15803d";
        if (btn) btn.innerText = "✅ Push Alerts Enabled";
        dismissPushBanner();
        return;
      }
    }
  } catch (e) {}

  // Asynchronously query live OneSignal object via queue
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    try {
      const sub = OneSignal.User && (OneSignal.User.PushSubscription || OneSignal.User.pushSubscription);
      const activeId = sub && sub.id;
      if (activeId) {
        localStorage.setItem("pmg_onesignal_sub_id", activeId);
        if (subIdSpan) subIdSpan.innerText = activeId;
        badge.innerText = "Subscribed 🟢";
        badge.style.background = "#dcfce7";
        badge.style.color = "#15803d";
        if (btn) btn.innerText = "✅ Push Alerts Enabled";
        dismissPushBanner();
      } else if (storedId && subIdSpan) {
        subIdSpan.innerText = storedId;
      }
    } catch (e) {}
  });
}

async function runPushDiagnostics() {
  const subIdSpan = document.getElementById("valPushSubId");
  if (subIdSpan) subIdSpan.innerText = "Diagnosing...";

  const diag = {
    permission: Notification.permission || "unknown",
    serviceWorkerSupported: ("serviceWorker" in navigator),
    swRegistrations: [],
    oneSignalLoaded: !!window.OneSignal,
    oneSignalUser: !!(window.OneSignal && window.OneSignal.User),
    subId: null,
    optedIn: null,
    storedSubId: localStorage.getItem("pmg_onesignal_sub_id") || "None"
  };

  // 1. Inspect Service Worker registrations directly
  if (diag.serviceWorkerSupported) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      diag.swRegistrations = regs.map(r => ({
        scope: r.scope,
        active: r.active ? r.active.scriptURL : "none",
        state: r.active ? r.active.state : "inactive"
      }));
    } catch (e) {
      diag.swError = e.message;
    }
  }

  // 2. Inspect OneSignal live object
  try {
    if (window.OneSignal && window.OneSignal.User) {
      const sub = window.OneSignal.User.PushSubscription || window.OneSignal.User.pushSubscription;
      if (sub) {
        diag.subId = sub.id || null;
        diag.optedIn = sub.optedIn;
        if (!diag.subId && sub.optIn && Notification.permission === "granted") {
          try {
            await Promise.race([
              sub.optIn(),
              new Promise((_, reject) => setTimeout(() => reject(new Error("optIn timeout")), 2000))
            ]);
            diag.subId = sub.id || null;
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    diag.osError = e.message;
  }

  // 3. Fallback / direct resolution
  const resolvedId = diag.subId || (diag.storedSubId !== "None" ? diag.storedSubId : null);
  if (resolvedId) {
    localStorage.setItem("pmg_onesignal_sub_id", resolvedId);
    if (subIdSpan) subIdSpan.innerText = resolvedId;
  } else {
    if (subIdSpan) subIdSpan.innerText = (diag.permission === "granted" ? "Ready to Sync" : "Not Subscribed");
  }

  updateOneSignalUiStatus();

  // 4. Present readable summary alert
  const swInfo = diag.swRegistrations.length > 0
    ? diag.swRegistrations.map(r => r.scope.split("/").filter(Boolean).pop() + " (" + r.state + ")").join(", ")
    : "None registered";

  const report = [
    "📱 PMG Push Notification Diagnostics:",
    "──────────────────────────",
    "• Browser Permission: " + (diag.permission === "granted" ? "Granted ✅" : diag.permission.toUpperCase() + " ⚠️"),
    "• Service Worker: " + (diag.swRegistrations.length > 0 ? "Active ✅" : "Pending ⏳") + " [" + swInfo + "]",
    "• OneSignal Engine: " + (diag.oneSignalLoaded ? "Loaded ✅" : "Initializing ⏳"),
    "• Device ID: " + (resolvedId ? resolvedId : "Pending Registration ⏳"),
    "──────────────────────────",
    resolvedId
      ? "🎉 Your device is connected! You can tap '🚀 Send Test Alert' to test delivery."
      : (diag.permission === "granted"
          ? "Permission is Granted. If Device ID hasn't appeared yet, wait 3 seconds and tap Check Status again."
          : "Please tap 'Enable Push Notifications' and select Allow.")
  ].join("\n");

  alert(report);
}
window.runPushDiagnostics = runPushDiagnostics;
window.refreshOneSignalSubscriptionId = runPushDiagnostics; // Alias for backward compatibility

function checkTeammatePushBanner() {
  const banner = document.getElementById("teammatePushPromptBanner");
  if (!banner) return;

  const dismissed = sessionStorage.getItem("pmg_dismissed_push_banner");
  if (dismissed || !("Notification" in window) || Notification.permission === "granted") {
    banner.style.display = "none";
    return;
  }
  banner.style.display = "block";
}

function dismissPushBanner() {
  const banner = document.getElementById("teammatePushPromptBanner");
  if (banner) banner.style.display = "none";
  sessionStorage.setItem("pmg_dismissed_push_banner", "true");
}

function openPushModal() {
  const modal = document.getElementById("pushNotificationModal");
  if (!modal) return;

  const isMgr = isManagementOrPharmacist(currentUser);
  const adminSec = document.getElementById("pushAdminSection");
  if (adminSec) adminSec.style.display = isMgr ? "block" : "none";

  const appIdInput = document.getElementById("oneSignalAppIdInput");
  const restKeyInput = document.getElementById("oneSignalRestKeyInput");
  if (appIdInput) {
    appIdInput.value = (currentData && currentData.oneSignalAppId) || localStorage.getItem("pmg_onesignal_app_id") || DEFAULT_ONESIGNAL_APP_ID;
  }
  if (restKeyInput) {
    restKeyInput.value = localStorage.getItem("pmg_onesignal_rest_key") || "";
  }

  updateOneSignalUiStatus();
  modal.style.display = "flex";
  history.pushState({ modal: "pushNotificationModal" }, "");
}

function closePushModal(shouldPop = true) {
  const modal = document.getElementById("pushNotificationModal");
  if (modal) modal.style.display = "none";
  if (shouldPop && history.state && history.state.modal === "pushNotificationModal") {
    history.back();
  }
}

async function subscribeToOneSignalPush() {
  const btn = document.getElementById("btnSubscribePush");
  const badge = document.getElementById("pushPermBadge");

  // 1. Check support
  if (!("Notification" in window)) {
    if (btn) btn.innerText = "⚠️ Push Not Supported";
    alert("Push notifications are not supported on this browser.");
    return;
  }

  // 2. Check if already blocked in browser settings
  if (Notification.permission === "denied") {
    if (btn) btn.innerText = "⚠️ Notifications Blocked";
    updateOneSignalUiStatus();
    alert("⚠️ Notifications are currently BLOCKED in your phone browser settings.\n\nTo unblock:\n1. Look at the top browser address bar next to williamchai1.github.io\n2. Tap the 🔒 lock icon (or ℹ️ tune icon)\n3. Tap 'Permissions' -> 'Notifications' -> Choose 'Allow'\n4. Refresh this page.");
    return;
  }

  if (btn) btn.innerText = "⏳ Connecting...";

  try {
    // 3. User Gesture: Synchronously request browser permission
    let perm = Notification.permission;
    if (perm !== "granted") {
      perm = await Notification.requestPermission();
    }

    if (perm === "granted") {
      if (btn) btn.innerText = "✅ Push Alerts Enabled";
      if (badge) {
        badge.innerText = "Subscribed 🟢";
        badge.style.background = "#dcfce7";
        badge.style.color = "#15803d";
      }
      dismissPushBanner();

      // Trigger OneSignal optIn directly or via deferred
      if (window.OneSignal && window.OneSignal.User) {
        const sub = window.OneSignal.User.PushSubscription || window.OneSignal.User.pushSubscription;
        if (sub && sub.optIn) {
          sub.optIn().catch(() => {});
        }
      } else {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async function(OneSignal) {
          try {
            const sub = OneSignal.User && (OneSignal.User.PushSubscription || OneSignal.User.pushSubscription);
            if (sub && sub.optIn) await sub.optIn();
          } catch(e) {}
        });
      }

      // Quick poll up to 3 seconds for ID
      let checks = 0;
      const poll = setInterval(() => {
        checks++;
        const sub = window.OneSignal && window.OneSignal.User && (window.OneSignal.User.PushSubscription || window.OneSignal.User.pushSubscription);
        const id = sub && sub.id;
        if (id) {
          clearInterval(poll);
          localStorage.setItem("pmg_onesignal_sub_id", id);
          const subIdSpan = document.getElementById("valPushSubId");
          if (subIdSpan) subIdSpan.innerText = id;
          updateOneSignalUiStatus();
        } else if (checks >= 6) {
          clearInterval(poll);
          updateOneSignalUiStatus();
        }
      }, 500);

      alert("🎉 Awesome! Push notifications are now ENABLED on your phone!\n\nTap '🔍 Check Status' anytime to view your live connection details, or tap '🚀 Send Test Alert' to test receiving a live notification.");
    } else {
      if (btn) btn.innerText = "🔔 Enable Push Notifications";
      alert("⚠️ Notification permission was not granted. Tap 'Enable Push Notifications' and choose 'Allow'.");
    }
  } catch (err) {
    console.warn("Subscribe error:", err);
    if (btn) btn.innerText = Notification.permission === "granted" ? "✅ Push Alerts Enabled" : "🔔 Enable Push Notifications";
  } finally {
    updateOneSignalUiStatus();
  }
}

async function saveOneSignalConfig() {
  const appId = (document.getElementById("oneSignalAppIdInput").value || "").trim() || DEFAULT_ONESIGNAL_APP_ID;
  const restKey = (document.getElementById("oneSignalRestKeyInput").value || "").trim();

  if (appId) localStorage.setItem("pmg_onesignal_app_id", appId);
  if (restKey) localStorage.setItem("pmg_onesignal_rest_key", restKey);

  if (currentData) currentData.oneSignalAppId = appId;

  try {
    fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "saveOneSignalKeys",
        appId: appId,
        restKey: restKey,
        username: (currentUser && currentUser.username) || "manager",
        role: (currentUser && currentUser.role) || "Pharmacist"
      })
    }).catch(e => console.warn("Background GAS sync notice:", e));
  } catch (e) {}

  alert("✅ OneSignal App ID & REST Key saved and active on this device!");
  updateOneSignalUiStatus();
}

async function sendTestPushAlert() {
  const appId = (document.getElementById("oneSignalAppIdInput").value || "").trim() || DEFAULT_ONESIGNAL_APP_ID;
  const restKey = (document.getElementById("oneSignalRestKeyInput").value || "").trim() || localStorage.getItem("pmg_onesignal_rest_key") || "";

  if (!restKey) {
    alert("Please paste your OneSignal REST API Key first.");
    return;
  }

  if (Notification.permission !== "granted") {
    alert("⚠️ Your phone is not subscribed yet!\n\nPlease tap '🔔 Enable Push Notifications' above and tap 'Allow' on your browser prompt first so OneSignal registers your phone.");
    return;
  }

  // Capture active subscription ID
  let activeSubId = localStorage.getItem("pmg_onesignal_sub_id") || "";
  try {
    if (window.OneSignal && window.OneSignal.User) {
      const sub = window.OneSignal.User.PushSubscription || window.OneSignal.User.pushSubscription;
      if (sub && sub.id) {
        activeSubId = sub.id;
        localStorage.setItem("pmg_onesignal_sub_id", activeSubId);
      }
    }
  } catch (e) {}

  const btn = (typeof event !== "undefined" && event && event.target) ? event.target : null;
  if (btn) btn.innerText = "⏳ Dispatching test alert...";

  const res = await dispatchPushNotification(
    "⚡ PMG Performance Hub Test Alert",
    "Great news! Push notifications are successfully connected to your phone.",
    "https://williamchai1.github.io/pmgareasales/",
    activeSubId
  );

  if (btn) btn.innerText = "🚀 Send Test Alert";

  if (res && res.success) {
    alert("🚀 " + (res.message || "Test alert dispatched! Check your phone lock screen in a few seconds."));
  } else {
    alert("⚠️ Push dispatch error:\n" + ((res && res.message) || "Unknown error") + "\n\nPlease make sure your REST API Key is correct.");
  }
}

async function dispatchPushNotification(title, message, url, explicitSubId) {
  const appId = (currentData && currentData.oneSignalAppId) || localStorage.getItem("pmg_onesignal_app_id") || DEFAULT_ONESIGNAL_APP_ID;
  const restKey = localStorage.getItem("pmg_onesignal_rest_key") || "";
  const subId = explicitSubId || localStorage.getItem("pmg_onesignal_sub_id") || "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "sendBackendPush",
        title: title,
        message: message,
        url: url,
        appId: appId,
        restKey: restKey,
        subscriptionId: subId
      })
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.warn("Backend push dispatch error:", e);
    return { success: false, message: e.message || "Network error" };
  }
}
window.dispatchPushNotification = dispatchPushNotification;

async function sendDposPendingReminderPush() {
  const appId = (currentData && currentData.oneSignalAppId) || localStorage.getItem('pmg_onesignal_app_id') || DEFAULT_ONESIGNAL_APP_ID;
  const restKey = localStorage.getItem('pmg_onesignal_rest_key') || "";

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: 'dposSendReminderPush',
        appId: appId,
        restKey: restKey
      })
    });
    const result = await res.json();
    if (result && result.success) {
      alert("🎉 " + result.message + "\n\nPush alert dispatched to teammates: " + (result.pendingNames ? result.pendingNames.join(", ") : ""));
    } else {
      // Fallback: direct broadcast
      await dispatchPushNotification(
        "🎓 DPOS Academy: Weekly Roleplay Pending!",
        "Friendly reminder: Please complete this week's clinical roleplay consultation in DPOS Academy today. Tap to practice!",
        "https://williamchai1.github.io/pmgareasales/?tab=academy"
      );
      alert("📢 DPOS Reminder broadcast dispatched to all teammates!");
    }
  } catch (err) {
    await dispatchPushNotification(
      "🎓 DPOS Academy: Weekly Roleplay Pending!",
      "Friendly reminder: Please complete this week's clinical roleplay consultation in DPOS Academy today. Tap to practice!",
      "https://williamchai1.github.io/pmgareasales/?tab=academy"
    );
    alert("📢 DPOS Reminder broadcast dispatched to all teammates!");
  }
}
window.sendDposPendingReminderPush = sendDposPendingReminderPush;
