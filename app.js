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
      currentUser.role = currentUser.role || currentUser.position || 'Pharmacist-in-Charge';
      selectedBranch = currentUser.branch || DEFAULT_BRANCH;
      localStorage.setItem("pmg_session", JSON.stringify(currentUser));
      document.getElementById("loginOverlay").style.display = "none";
      
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
      currentUser.role = currentUser.role || currentUser.position || 'Pharmacist-in-Charge';
      selectedBranch = currentUser.branch || DEFAULT_BRANCH;
      document.getElementById("loginOverlay").style.display = "none";
      loadDashboardData();
    }
  } catch (e) {
    localStorage.removeItem("pmg_session");
  }
}
window.addEventListener('DOMContentLoaded', initSession);

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
        role: (currentUser && (currentUser.position || currentUser.role)) || 'Pharmacist-in-Charge',
        username: (currentUser && currentUser.username) || 'william'
      })
    });
    currentData = await res.json();
    
    if (currentData.error) {
      throw new Error(currentData.message);
    }

    renderDashboard();
    document.getElementById("lastUpdated").innerText = `🟢 Live Sync • ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    console.error(e);
    document.getElementById("lastUpdated").innerText = "⚠️ Error: " + e.message;
  }
}

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
  const d = new Date(dateVal);
  // Malaysia is UTC+8. UTC 16:00 is midnight next day MYT
  const mytStr = d.toLocaleDateString("en-US", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "numeric", day: "numeric" });
  const parts = mytStr.split("/");
  return {
    month: parseInt(parts[0], 10) - 1, // 0-indexed
    day: parseInt(parts[1], 10),
    year: parseInt(parts[2], 10)
  };
}

// ─── ACTIVE PMG MEDICARE APP INSTALLS RESOLVER ──────────────────────────────
function getActivePmgApp(branchName) {
  const bKey = findBranchKey(currentData && currentData.summary, branchName || selectedBranch) || "KOTA SENTOSA";
  const sumObj = (currentData && currentData.summary && currentData.summary[bKey]) || {};
  const localVal = localStorage.getItem("pmg_app_installs_" + bKey);
  if (sumObj.pmgApp !== undefined && sumObj.pmgApp !== null && Number(sumObj.pmgApp) > 0) {
    return Number(sumObj.pmgApp);
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
  "Daniela Janet": { sepMtdTs: 24855.37, sepMtdHb: 8992.27, sepMtdHm: 2226.80, sepMtdCust: 722 },
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

  const now = new Date();
  const isOctoberOrLater = now >= new Date("2026-10-01T00:00:00");
  
  if (!isOctoberOrLater) {
    return staffList.map(s => ({
      ...s,
      octMtdTs: Number(s.mtdTs || 0),
      octMtdHb: Number(s.mtdHb || 0),
      octMtdHm: Number(s.mtdHm || 0),
      octMtdCust: Number(s.mtdCust || 0)
    }));
  }

  const storeOctTs = Number(summary.mtdTs || 0);
  const storeOctHb = Number(summary.mtdHb || 0);
  const totalRawStaffTs = staffList.reduce((acc, s) => acc + Number(s.mtdTs || 0), 0);
  const totalRawStaffHb = staffList.reduce((acc, s) => acc + Number(s.mtdHb || 0), 0);
  const hasSeptemberBlended = totalRawStaffTs > (storeOctTs * 1.5) || totalRawStaffTs > 100000;

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

      if (base) {
        octMtdTs = Math.max(sDailyTs, +(rawTs - base.sepMtdTs).toFixed(2));
        octMtdHb = Math.max(sDailyHb, +(rawHb - base.sepMtdHb).toFixed(2));
        octMtdHm = Math.max(sDailyHm, +(rawHm - base.sepMtdHm).toFixed(2));
        octMtdCust = Math.max(sDailyCust, Math.round(rawCust - base.sepMtdCust));
      } else {
        // Fallback proportional share using historical MTD ratio (never single-day ratio)
        const hbShare = totalRawStaffHb > 0 ? (rawHb / totalRawStaffHb) : 0;
        const tsShare = totalRawStaffTs > 0 ? (rawTs / totalRawStaffTs) : 0;
        octMtdTs = Math.max(sDailyTs, Math.min(rawTs, +(storeOctTs * tsShare).toFixed(2)));
        octMtdHb = Math.max(sDailyHb, Math.min(rawHb, +(storeOctHb * hbShare).toFixed(2)));
        octMtdHm = Math.max(sDailyHm, +(octMtdTs * 0.08).toFixed(2));
        octMtdCust = Math.max(sDailyCust, Math.round(sDailyCust * (currentDay || 3)));
      }
    }

    return {
      ...s,
      octMtdTs,
      octMtdHb,
      octMtdHm,
      octMtdCust
    };
  });
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
  
  // Restore all original dashboard widgets for Pharmacist role / Pharmacist-in-Charge
  const role = (currentUser && (currentUser.position || currentUser.role || '')).toLowerCase();
  const isBranchManager = role === 'branch manager' || role === 'assistant branch manager';
  const isPharmacist = role.includes('pharmacist') || role === 'pic' || role.includes('in-charge') || role === 'staff';
  const canEditActionPlan = true;
  const canViewReports = true;
  const canViewStaffPerformance = true;

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
  
  // Dedicated matching for Chai Yee Sian (William Chai, Pharmacist-in-Charge)
  let myStats = staff.find(s => /chai|sian/i.test(s.name));
  if (!myStats && currentUser) {
    if (currentUser.name) {
      myStats = staff.find(s => s.name.toLowerCase() === currentUser.name.toLowerCase()) ||
                staff.find(s => s.name.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                staff.find(s => currentUser.name.toLowerCase().includes(s.name.toLowerCase()));
    }
    if (!myStats && currentUser.username) {
      myStats = staff.find(s => s.name.toLowerCase().includes(currentUser.username.toLowerCase()));
    }
  }
  if (!myStats) {
    myStats = staff.find(s => (s.role || '').toLowerCase().includes('pharmacist')) || staff[0];
  }

  if (myStats) {
    document.getElementById("personalDashboard").style.display = "block";
    document.getElementById("userNameHeader").innerText = `👤 ${myStats.name} (${myStats.role})`;
    
    // Daily performance of latest recorded business day (e.g. Chai Yee Sian RM 1,560.55 HB)
    const dTs   = Number(myStats.dailyTs || 0);
    const dHb   = Number(myStats.dailyHb || 0);
    const dHm   = Number(myStats.dailyHm || 0);
    const dCust = Number(myStats.dailyCust || 0);

    const prevNotice = (dHb === 0 && myStats.octMtdHb >= 1560.55) ? `<span style="font-size:0.62rem; color:#888; display:block; font-weight:normal;">(Oct 2: RM 1,560.55)</span>` : '';

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
}

function openActionPlanModal() {
  const ap = currentData.actionPlan || {w1:"", w2:"", w3:"", w4:""};
  const pmgVal = getActivePmgApp(selectedBranch);
  
  document.getElementById("apWeek1").value = ap.w1 || "";
  document.getElementById("apWeek2").value = ap.w2 || "";
  document.getElementById("apWeek3").value = ap.w3 || "";
  document.getElementById("apWeek4").value = ap.w4 || "";
  document.getElementById("apPmgApp").value = pmgVal; 
  
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
  
  const pmgCount = Number(document.getElementById("apPmgApp").value) || 0;
  const bKey = findBranchKey(currentData.summary, selectedBranch) || "KOTA SENTOSA";

  // Immediate synchronous UI and persistence update
  try {
    localStorage.setItem("pmg_app_installs_" + bKey, String(pmgCount));
  } catch (e) {}

  currentData.actionPlan = plans;
  if (!currentData.summary) currentData.summary = {};
  if (!currentData.summary[bKey]) currentData.summary[bKey] = {};
  currentData.summary[bKey].pmgApp = pmgCount;

  if (currentData.history && currentData.history.length > 0) {
    const todayMyt = parseMytDate(new Date());
    const todayHist = currentData.history.find(h => {
      const md = parseMytDate(h.date);
      return md && md.day === todayMyt.day && md.month === todayMyt.month && md.year === todayMyt.year;
    });
    if (todayHist) {
      todayHist.pmgApp = pmgCount;
    }
  }

  try {
    await fetch(API_URL, {
      method: 'POST', redirect: 'follow', headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: 'saveActionPlan', branch: selectedBranch, plans: plans, pmgCount: pmgCount, date: new Date().toDateString() })
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

// ─── GEMINI 3.5 AI STRATEGIST ENGINE ─────────────────────────────────────────
async function generateGeminiOutletStrategy(branchName, summary, targets, daysLeft, tsReqPerDay, hbReqPerDay, hbRatio, profile) {
  const apiKey = localStorage.getItem('pmg_gemini_key');
  if (!apiKey || apiKey.trim().length < 10) return null;

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
    'gemini-3.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-1.5-flash'
  ];

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (err) {
      console.warn(`Gemini model ${model} failed, trying fallback...`, err);
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

// ─── BRIEFING GENERATOR WITH AI & FALLBACK ────────────────────────────────────
async function copyWhatsAppBriefing() {
  selectedBranch = selectedBranch || (currentUser && currentUser.branch) || DEFAULT_BRANCH;
  if (String(selectedBranch).toUpperCase() === 'ALL') selectedBranch = DEFAULT_BRANCH;
  if (!currentData) return;

  const branchKey = findBranchKey(currentData.summary, selectedBranch) || "KOTA SENTOSA";
  const targetKey = findBranchKey(currentData.targets, selectedBranch) || "KOTA SENTOSA";
  const summary = currentData.summary[branchKey] || {};
  const targets = currentData.targets[targetKey] || {};
  const ap = currentData.actionPlan || {};
  
  const tsPct = (((summary.mtdTs || 0) / (targets.ts || 1)) * 100).toFixed(1);
  const hbPct = (((summary.mtdHb || 0) / (targets.hb || 1)) * 100).toFixed(1);
  
  // Pacing Logic for October
  const daysInMonth = currentData.daysInMonth || 31;
  const currentDay = Math.min(daysInMonth, Math.max(1, new Date().getDate()));
  const daysLeft = Math.max(1, daysInMonth - currentDay + 1);
  
  let expectedTs = ((targets.ts || 0) / daysInMonth) * currentDay;
  let expectedHb = ((targets.hb || 0) / daysInMonth) * currentDay;
  
  let tsReqPerDay = Math.max(0, ((targets.ts || 0) - (summary.mtdTs || 0)) / daysLeft);
  let hbReqPerDay = Math.max(0, ((targets.hb || 0) - (summary.mtdHb || 0)) / daysLeft);

  let tsStatus = (summary.mtdTs >= expectedTs) ? "🟢 On Track" : `🔴 Off Track (Need ${formatRM(tsReqPerDay)}/day)`;
  let hbStatus = (summary.mtdHb >= expectedHb) ? "🟢 On Track" : `🔴 Off Track (Need ${formatRM(hbReqPerDay)}/day)`;
  
  const profile = getBranchProfile(selectedBranch);
  const hbRatio = (summary.mtdTs || 0) > 0 ? (((summary.mtdHb || 0) / summary.mtdTs) * 100).toFixed(1) : "0.0";

  const btn = document.getElementById("copyBriefingBtn");
  const origBtnText = btn ? btn.innerText : "";
  const apiKey = localStorage.getItem('pmg_gemini_key');

  if (btn && apiKey && apiKey.trim().length > 10) {
    btn.innerText = "🤖 Generating AI Strategy...";
    btn.disabled = true;
  }

  let text = `*📊 PMG ${selectedBranch} Daily Briefing*\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  text += `*🎯 Target Achievement:*\n`;
  text += `TS: RM ${(summary.mtdTs||0).toLocaleString()} / RM ${(targets.ts||0).toLocaleString()} (${tsPct}%) - ${tsStatus}\n`;
  const activePmgApp = getActivePmgApp(selectedBranch);
  if (activePmgApp > 0) {
    text += `📱 PMG App Installs Today: ${activePmgApp}\n`;
  }
  text += `\n`;
  
  text += `*🎯 Strategy Plan:*\n`;
  text += `W1: ${ap.w1 || '-'}\nW2: ${ap.w2 || '-'}\nW3: ${ap.w3 || '-'}\nW4: ${ap.w4 || '-'}\n\n`;
  
  text += `*🏆 Congratulation Board:*\n`;
  let achievers = 0;

  (currentData.staff || []).forEach(s => {
    let hits = [];
    if(s.dailyTs >= s.targetTs) hits.push("TS");
    if(s.dailyHb >= s.targetHb) hits.push("HB");
    
    if(hits.length > 0) {
      achievers++;
      text += `• *${s.name}*: Hit ${hits.join(" & ")}! 🌟🎉\n\n`;
    }
  });
  
  if(achievers === 0) {
    text += `No personal hits yesterday — let's rally together and put everyone on the board today! 💪\n\n`;
  }
  
  // Dynamic AI Strategy or Profile-Aware Offline Rule
  let strategyText = null;
  if (apiKey && apiKey.trim().length > 10) {
    try {
      strategyText = await generateGeminiOutletStrategy(selectedBranch, summary, targets, daysLeft, tsReqPerDay, hbReqPerDay, hbRatio, profile);
    } catch (e) {
      console.warn("AI generation failed, using rule fallback", e);
    }
  }

  if (!strategyText) {
    strategyText = generateOutletOverallSuggestion(summary, targets, tsReqPerDay, hbReqPerDay, daysLeft, expectedTs, expectedHb, profile);
  }

  text += strategyText;
  text += `🔗 *View Full Dashboard:* ${WEBAPP_LINK}`;

  if (btn) {
    btn.innerText = origBtnText || "📱 Copy WhatsApp Briefing";
    btn.disabled = false;
  }

  navigator.clipboard.writeText(text);
  alert("WhatsApp Daily Briefing copied to clipboard!");
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
  const key = localStorage.getItem('pmg_gemini_key');
  if (input && key && !input.value) {
    input.value = key;
  }
  if (badge) {
    if (key && key.trim().length > 10) {
      badge.innerText = "⚡ Gemini 3.5 Active";
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
  const key = (input ? input.value : "") || localStorage.getItem('pmg_gemini_key');
  if (!key || key.trim().length < 10) {
    alert("Please paste a valid Gemini API key first.");
    return;
  }

  const badge = document.getElementById("geminiStatusBadge");
  if (badge) badge.innerText = "Testing...";

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-1.5-flash'
  ];

  let successModel = null;
  for (const m of candidateModels) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with 'READY'." }] }]
        })
      });
      if (resp.ok) {
        successModel = m;
        break;
      }
    } catch (err) {
      // Continue to try next candidate model
    }
  }

  if (successModel) {
    localStorage.setItem('pmg_gemini_key', key.trim());
    updateGeminiBadge();
    alert(`✅ Connected to Gemini API successfully!\nActive Engine: ${successModel}\nYour AI Retail Strategist is ready.`);
  } else {
    updateGeminiBadge();
    alert("❌ Connection failed. Please ensure the API key is active and has access to Gemini models.");
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
        if (isToday) {
          colData.pmgApp = activePmgApp;
        }

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

