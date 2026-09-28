const API_URL = "https://script.google.com/macros/s/AKfycbwhxfd5OQrDJw3bYPuzCd8DQqhWfOmtkQpQUTu7ke9s2bE_egFmvWeubaEtjMvBzADS/exec";
const WEBAPP_LINK = "https://williamchai1.github.io/pmgareasales/";

let currentUser = null;
let currentData = null;
let selectedBranch = null;
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
      localStorage.setItem("pmg_session", JSON.stringify(currentUser));
      selectedBranch = String(currentUser.branch).toUpperCase() === 'ALL' ? null : currentUser.branch;
      document.getElementById("loginOverlay").style.display = "none";
      
      const role = (currentUser.position || currentUser.role || '').toLowerCase();
      document.getElementById("areaManagerControls").style.display = (role === 'area manager') ? "block" : "none";
      
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
  selectedBranch = null;
  localStorage.removeItem("pmg_session");
  
  document.getElementById("loginOverlay").style.display = "flex";
  toggleAuthView('login');
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("areaManagerControls").style.display = "none";
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
      selectedBranch = String(currentUser.branch).toUpperCase() === 'ALL' ? null : currentUser.branch;
      document.getElementById("loginOverlay").style.display = "none";
      const role = (currentUser.position || currentUser.role || '').toLowerCase();
      document.getElementById("areaManagerControls").style.display = (role === 'area manager') ? "block" : "none";
      loadDashboardData();
    }
  } catch (e) {
    localStorage.removeItem("pmg_session");
  }
}
window.addEventListener('DOMContentLoaded', initSession);

async function loadDashboardData() {
  document.getElementById("lastUpdated").innerText = "🔄 Syncing with Database...";
  const branchToFetch = selectedBranch || "ALL"; 
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        action: 'getData', 
        branch: branchToFetch, 
        role: currentUser.position || currentUser.role,
        username: currentUser.username 
      })
    });
    currentData = await res.json();
    
    if (currentData.error) {
      throw new Error(currentData.message);
    }

    const role = (currentUser.position || currentUser.role || '').toLowerCase();
    if (role === 'area manager' && !selectedBranch) {
      const selector = document.getElementById("branchSelector");
      selector.innerHTML = "";
      currentData.branches.forEach(b => {
        selector.innerHTML += `<option value="${b}">${b}</option>`;
      });
      selectedBranch = currentData.branches[0];
      return loadDashboardData(); 
    }
    
    renderDashboard();
    document.getElementById("lastUpdated").innerText = `🟢 Live Sync • ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    console.error(e);
    document.getElementById("lastUpdated").innerText = "⚠️ Error: " + e.message;
  }
}

function changeBranch() {
  selectedBranch = document.getElementById("branchSelector").value;
  loadDashboardData();
}

function renderDashboard() {
  if (!currentData || !selectedBranch) return;
  
  const branchUpper = String(selectedBranch).toUpperCase();
  const summary = currentData.summary[branchUpper] || {};
  const targets = currentData.targets[branchUpper] || {};
  const staff = currentData.staff || [];
  const ap = currentData.actionPlan || {w1:"", w2:"", w3:"", w4:""};
  const role = (currentUser.position || currentUser.role || '').toLowerCase();
  const isAreaManager = role === 'area manager';
  const isBranchManager = role === 'branch manager' || role === 'assistant branch manager';
  const isPharmacist = role.includes('pharmacist');
  const canEditActionPlan = isAreaManager || isBranchManager;
  const canViewReports = isAreaManager || isBranchManager;
  const canViewStaffPerformance = isAreaManager || isBranchManager || isPharmacist;
  
  // Dynamically populate signup branch list if branches data is available
  const signupBranchSelect = document.getElementById("signupBranch");
  if (signupBranchSelect && currentData.branches && currentData.branches.length > 0) {
    const currentVal = signupBranchSelect.value;
    signupBranchSelect.innerHTML = currentData.branches.map(b => `<option value="${b}">${b}</option>`).join("");
    if (currentVal && currentData.branches.includes(currentVal)) {
      signupBranchSelect.value = currentVal;
    }
  }

  // --- AREA MANAGER OVERVIEW TABLE ---
  if (isAreaManager) {
    document.getElementById("areaManagerControls").style.display = "block";

    // --- PENDING REGISTRATIONS APPROVAL SECTION ---
    const pendingSection = document.getElementById("pendingApprovalsSection");
    const pendingList = document.getElementById("pendingUsersList");
    const pendingBadge = document.getElementById("pendingCountBadge");

    if (currentData.pendingUsers && currentData.pendingUsers.length > 0) {
      if (pendingSection) pendingSection.style.display = "block";
      if (pendingBadge) pendingBadge.innerText = currentData.pendingUsers.length;
      if (pendingList) {
        pendingList.innerHTML = "";
        currentData.pendingUsers.forEach(u => {
          pendingList.innerHTML += `
            <div style="background: white; border-radius: 6px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ffe082;">
              <div>
                <div style="font-weight: bold; font-size: 0.85rem; color: #333;">${u.name} <span style="font-size:0.7rem; color:#666;">(@${u.username})</span></div>
                <div style="font-size: 0.72rem; color: #777;">${u.role} · ${u.branch} · ${u.empId || 'No ID'} · ${u.race || ''}</div>
              </div>
              <button class="btn" style="width: auto; padding: 5px 12px; margin: 0; font-size: 0.75rem; background: #2e7d32;" onclick="executeApproveUser('${u.username}')">Approve</button>
            </div>
          `;
        });
      }
    } else if (pendingSection) {
      pendingSection.style.display = "none";
    }

    const amTbody = document.querySelector("#amOverviewTable tbody");
    amTbody.innerHTML = "";
    
    let totalTs = 0;
    let totalHb = 0;
    let totalTsTarget = 0;
    let totalHbTarget = 0;

    currentData.branches.forEach(b => {
      let bUpper = b.toUpperCase();
      let bSum = currentData.summary[bUpper] || {};
      let bTarget = currentData.targets[bUpper] || {};
      
      totalTs += (bSum.mtdTs || 0);
      totalHb += (bSum.mtdHb || 0);
      totalTsTarget += (bTarget.ts || 0);
      totalHbTarget += (bTarget.hb || 0);
      
      let tsPct = bTarget.ts ? (((bSum.mtdTs || 0) / bTarget.ts) * 100).toFixed(1) : 0;
      let hbPct = bTarget.hb ? (((bSum.mtdHb || 0) / bTarget.hb) * 100).toFixed(1) : 0;
      
      amTbody.innerHTML += `
        <tr style="border-bottom: 1px solid #ffcdd2;">
          <td style="text-align: left; padding: 8px 5px; font-weight: bold;">${b}</td>
          <td style="text-align: right; padding: 8px 5px;">
            ${formatRM(bSum.mtdTs || 0)}<br>
            <span style="font-size:0.65rem; color:#666;">(${tsPct}%)</span>
          </td>
          <td style="text-align: right; padding: 8px 5px; color: #2e7d32; font-weight: bold;">
            ${formatRM(bSum.mtdHb || 0)}<br>
            <span style="font-size:0.65rem; color:#666;">(${hbPct}%)</span>
          </td>
        </tr>
      `;
    });
    
    let overallTsPct = totalTsTarget ? ((totalTs / totalTsTarget) * 100).toFixed(1) : 0;
    let overallHbPct = totalHbTarget ? ((totalHb / totalHbTarget) * 100).toFixed(1) : 0;

    amTbody.innerHTML += `
      <tr style="border-top: 2px solid #ef5350; background: #ffebee; font-weight: bold;">
        <td style="text-align: left; padding: 8px 5px;">TOTAL</td>
        <td style="text-align: right; padding: 8px 5px;">
          ${formatRM(totalTs)}<br>
          <span style="font-size:0.65rem; color:#c62828;">(${overallTsPct}%)</span>
        </td>
        <td style="text-align: right; padding: 8px 5px; color: #2e7d32;">
          ${formatRM(totalHb)}<br>
          <span style="font-size:0.65rem; color:#2e7d32;">(${overallHbPct}%)</span>
        </td>
      </tr>
    `;
    
    document.getElementById("amNoteInput").value = currentData.amNote || "";
  } else {
    document.getElementById("areaManagerControls").style.display = "none";
  }

  document.getElementById("branchNameHeader").innerText = `🏥 ${selectedBranch} Performance`;
  
  const myStats = staff.find(s => s.name === currentUser.name);
  if (myStats) {
    document.getElementById("personalDashboard").style.display = "block";
    document.getElementById("userNameHeader").innerText = `👤 ${myStats.name} (${myStats.role})`;
    
    document.getElementById("valTS").innerText = formatRM(myStats.dailyTs);
    document.getElementById("valHB").innerText = formatRM(myStats.dailyHb);
    document.getElementById("valHM").innerText = formatRM(myStats.dailyHm);
    document.getElementById("valCust").innerText = myStats.dailyCust;
    
    document.getElementById("valMtdTS").innerText = formatRM(myStats.mtdTs);
    let myHbPct = myStats.mtdTs > 0 ? ((myStats.mtdHb / myStats.mtdTs) * 100).toFixed(1) : 0;
    document.getElementById("valMtdHB").innerText = `${formatRM(myStats.mtdHb)} (${myHbPct}%)`;
    document.getElementById("valMtdHM").innerText = formatRM(myStats.mtdHm);
    document.getElementById("valMtdCust").innerText = myStats.dailyCust; 

    const daysInMonth = currentData.daysInMonth || 30;
    let fullTsTarget = (myStats.targetTs || 0) * daysInMonth;
    let fullHbTarget = (myStats.targetHb || 0) * daysInMonth;
    let fullHmTarget = (myStats.targetHm || 0) * daysInMonth;

    let tsRem = Math.max(0, fullTsTarget - (myStats.mtdTs || 0));
    let hbRem = Math.max(0, fullHbTarget - (myStats.mtdHb || 0));
    let hmRem = Math.max(0, fullHmTarget - (myStats.mtdHm || 0));
    
    document.getElementById("valRemainingTarget").innerHTML = `
      • TS Target Left: <b>${formatRM(tsRem)}</b> <span style="font-size:0.7rem; color:#666;">(Target: ${formatRM(fullTsTarget)})</span><br>
      • HB Target Left: <b>${formatRM(hbRem)}</b> <span style="font-size:0.7rem; color:#666;">(Target: ${formatRM(fullHbTarget)})</span><br>
      • HM Target Left: <b>${formatRM(hmRem)}</b> <span style="font-size:0.7rem; color:#666;">(Target: ${formatRM(fullHmTarget)})</span>
    `;

    let dailyComm = myStats.dailyHb * 0.035;
    let mtdComm = myStats.mtdHb * 0.035;
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

  // ROLE BASED ACCESS CONTROL
  document.getElementById("editActionPlanBtn").style.display = canEditActionPlan ? "block" : "none";
  document.getElementById("managerReportsSection").style.display = canViewReports ? "block" : "none";
  if (canViewReports) updateGeminiBadge();
  document.getElementById("staffPerformanceSection").style.display = canViewStaffPerformance ? "block" : "none";

  const tbody = document.querySelector("#teammatesTable tbody");
  tbody.innerHTML = "";
  staff.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td><b>${s.name}</b><br><span style="font-size:0.65rem; color:#666;">${s.role}</span></td>
        <td>RM ${Number(s.dailyTs).toLocaleString()}</td>
        <td>RM ${Number(s.dailyHb).toLocaleString()}</td>
        <td>RM ${Number(s.dailyHm).toLocaleString()}</td>
        <td>${s.dailyCust}</td>
      </tr>
    `;
  });
}

function openActionPlanModal() {
  const ap = currentData.actionPlan || {w1:"", w2:"", w3:"", w4:""};
  const branchUpper = String(selectedBranch).toUpperCase();
  const summary = currentData.summary[branchUpper] || {};
  
  document.getElementById("apWeek1").value = ap.w1;
  document.getElementById("apWeek2").value = ap.w2;
  document.getElementById("apWeek3").value = ap.w3;
  document.getElementById("apWeek4").value = ap.w4;
  document.getElementById("apPmgApp").value = summary.pmgApp || 0; 
  
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
  
  const pmgCount = document.getElementById("apPmgApp").value || 0;

  try {
    await fetch(API_URL, {
      method: 'POST', redirect: 'follow', headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: 'saveActionPlan', branch: selectedBranch, plans: plans, pmgCount: pmgCount, date: new Date().toDateString() })
    });
    
    currentData.actionPlan = plans;
    if(currentData.summary[String(selectedBranch).toUpperCase()]) {
      currentData.summary[String(selectedBranch).toUpperCase()].pmgApp = pmgCount;
    }
    
    renderDashboard();
    closeActionPlanModal();
    btn.innerText = "Save Updates";
  } catch (e) {
    alert("Failed to save. Check connection.");
    btn.innerText = "Save Updates";
  }
}

async function saveAmNote() {
  const btn = document.getElementById("saveAmNoteBtn");
  btn.innerText = "Saving...";
  const note = document.getElementById("amNoteInput").value;
  try {
    await fetch(API_URL, {
      method: 'POST', redirect: 'follow', headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: 'saveAmNote', note: note })
    });
    currentData.amNote = note;
    btn.innerText = "Save Note";
  } catch (e) {
    alert("Failed to save note.");
    btn.innerText = "Save Note";
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
  if (!currentData || !selectedBranch) return;
  const branchUpper = String(selectedBranch).toUpperCase();
  const summary = currentData.summary[branchUpper] || {};
  const targets = currentData.targets[branchUpper] || {};
  const ap = currentData.actionPlan || {};
  
  const tsPct = (((summary.mtdTs || 0) / (targets.ts || 1)) * 100).toFixed(1);
  const hbPct = (((summary.mtdHb || 0) / (targets.hb || 1)) * 100).toFixed(1);
  
  // Pacing Logic
  let currentDay = currentData.currentDay || new Date().getDate();
  let daysLeft = Math.max(1, 30 - currentDay);
  
  let expectedTs = ((targets.ts || 0) / 30) * currentDay;
  let expectedHb = ((targets.hb || 0) / 30) * currentDay;
  
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

  let text = `*📊 ${selectedBranch} Daily Briefing*\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  text += `*🎯 Target Achievement:*\n`;
  text += `TS: RM ${(summary.mtdTs||0).toLocaleString()} / RM ${(targets.ts||0).toLocaleString()} (${tsPct}%) - ${tsStatus}\n`;
  text += `HB: RM ${(summary.mtdHb||0).toLocaleString()} / RM ${(targets.hb||0).toLocaleString()} (${hbPct}%) - ${hbStatus}\n`;
  if (summary.pmgApp && Number(summary.pmgApp) > 0) {
    text += `📱 PMG App Installs Today: ${summary.pmgApp}\n`;
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

function copyAMWhatsAppBriefing() {
  if (!currentData || !currentData.branches) return;

  let totalTs = 0, totalHb = 0, totalTsTarget = 0, totalHbTarget = 0;
  let branchDetails = "";
  let currentDay = currentData.currentDay || new Date().getDate();
  let daysLeft = Math.max(1, 30 - currentDay);

  currentData.branches.forEach(b => {
    let bUpper = b.toUpperCase();
    let bSum = currentData.summary[bUpper] || {};
    let bTarget = currentData.targets[bUpper] || {};

    totalTs += (bSum.mtdTs || 0);
    totalHb += (bSum.mtdHb || 0);
    totalTsTarget += (bTarget.ts || 0);
    totalHbTarget += (bTarget.hb || 0);

    let tsPct = bTarget.ts ? (((bSum.mtdTs || 0) / bTarget.ts) * 100).toFixed(1) : 0;
    let hbPct = bTarget.hb ? (((bSum.mtdHb || 0) / bTarget.hb) * 100).toFixed(1) : 0;
    
    let expectedTs = ((bTarget.ts || 0) / 30) * currentDay;
    let tsReqPerDay = Math.max(0, ((bTarget.ts || 0) - (bSum.mtdTs || 0)) / daysLeft);
    let tsStatus = (bSum.mtdTs >= expectedTs) ? "🟢 On Track" : `🔴 Need RM ${formatRM(tsReqPerDay)}/day`;

    branchDetails += `🏥 *${b}*\n`;
    branchDetails += `• TS: ${tsPct}% (${tsStatus})\n`;
    branchDetails += `• HB: ${hbPct}%\n\n`;
  });

  let overallTsPct = totalTsTarget ? ((totalTs / totalTsTarget) * 100).toFixed(1) : 0;
  let overallHbPct = totalHbTarget ? ((totalHb / totalHbTarget) * 100).toFixed(1) : 0;

  let text = `*🌐 AREA MANAGER DAILY BRIEFING*\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n\n`;

  text += `*📊 OVERALL REGION PERFORMANCE:*\n`;
  text += `Total TS: ${formatRM(totalTs)} (${overallTsPct}%)\n`;
  text += `Total HB: ${formatRM(totalHb)} (${overallHbPct}%)\n\n`;

  text += `*🎯 BRANCH PACING (For PM, BM & ABM):*\n`;
  text += branchDetails;

  text += `*📝 AM Notes & Focus:*\n${currentData.amNote || "Let's keep the momentum going! Focus on our HB targets."}\n\n`;

  text += `Let's execute these strategies today. 💪\n`;
  text += `🔗 *View Full Dashboard:* ${WEBAPP_LINK}`;

  navigator.clipboard.writeText(text);
  alert("Area Manager Master Briefing copied to clipboard!");
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
  const branchUpper = String(selectedBranch).toUpperCase();
  const summary = currentData.summary[branchUpper] || {};
  const targets = currentData.targets[branchUpper] || {};
  const historyData = currentData.history || [];
  const staff = currentData.staff || [];
  const ap = currentData.actionPlan || {};
  
  const formatShortDate = (dateString) => {
    const d = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return d.getDate() + "-" + months[d.getMonth()];
  };

  let reportDate = historyData.length > 0 ? formatShortDate(historyData[historyData.length-1].date).toUpperCase() + "-2026" : new Date().toLocaleDateString();

  if (type === 'director') {
    let tsGap = summary.mtdTs - targets.ts;
    let tsPct = ((summary.mtdTs / targets.ts) * 100).toFixed(0);
    let tsLyGap = summary.mtdTs - summary.lyMtd;
    let tsLyPct = summary.lyMtd > 0 ? ((summary.mtdTs / summary.lyMtd) * 100).toFixed(0) : 0;
    
    let hbGap = summary.mtdHb - targets.hb;
    let hbPct = ((summary.mtdHb / targets.hb) * 100).toFixed(0);
    let hbLyGap = summary.mtdHb - (summary.lyMtdHb || 0);
    let hbLyPct = summary.lyMtdHb > 0 ? ((summary.mtdHb / summary.lyMtdHb) * 100).toFixed(0) : 0;
    
    let hmGap = summary.mtdHm - targets.hm;
    let hmPct = ((summary.mtdHm / targets.hm) * 100).toFixed(0);
    let hmLyGap = summary.mtdHm - (summary.lyMtdHm || 0);
    let hmLyPct = summary.lyMtdHm > 0 ? ((summary.mtdHm / summary.lyMtdHm) * 100).toFixed(0) : 0;

    let html = `
    <div class="excel-report" id="captureArea" style="min-width: 860px; width: max-content;">
      <div class="excel-title">PMG PHARMACY ${selectedBranch.toUpperCase()} - DIRECTORS' DAILY SALES REPORT (${reportDate})</div>
      
      <div class="excel-grid">
        <div class="excel-col-left">
          <table class="excel-table">
            <tr class="header-blue"><th>Monthly Sales</th><th>Amount</th><th>%</th></tr>
            <tr><td>Sales Vs Target</td><td>${tsGap < 0 ? '' : '+'}${formatRM(tsGap)}</td><td>${tsPct}%</td></tr>
            <tr><td>Sales Vs LY</td><td>${tsLyGap < 0 ? '' : '+'}${formatRM(tsLyGap)}</td><td>+${tsLyPct}%</td></tr>
            <tr><td>HB Vs Target</td><td>${hbGap < 0 ? '' : '+'}${formatRM(hbGap)}</td><td>${hbPct}%</td></tr>
            <tr><td>HB Vs LY</td><td>${hbLyGap < 0 ? '' : '+'}${formatRM(hbLyGap)}</td><td>+${hbLyPct}%</td></tr>
            <tr><td>HM Vs Target</td><td>${hmGap < 0 ? '' : '+'}${formatRM(hmGap)}</td><td>${hmPct}%</td></tr>
            <tr><td>HM Vs LY</td><td>${hmLyGap < 0 ? '' : '+'}${formatRM(hmLyGap)}</td><td>+${hmLyPct}%</td></tr>
          </table>

          <table class="excel-table" style="margin-top:10px;">
            <tr class="header-yellow"><th colspan="4">From 1st to ${reportDate}</th></tr>
            <tr class="header-yellow"><th></th><th>MTD Sales</th><th>Last Year Sales</th><th>Target</th></tr>
            <tr><td><b>Total</b></td><td>${formatRM(summary.mtdTs)}</td><td>${formatRM(summary.lyMtd)}</td><td>${formatRM(targets.ts)}</td></tr>
            <tr><td>HB</td><td>${formatRM(summary.mtdHb)}</td><td>${formatRM(summary.lyMtdHb || 0)}</td><td>${formatRM(targets.hb)}</td></tr>
            <tr><td>HM</td><td>${formatRM(summary.mtdHm)}</td><td>${formatRM(summary.lyMtdHm || 0)}</td><td>${formatRM(targets.hm)}</td></tr>
            <tr><td>Public Medicare App</td><td>${summary.pmgApp || 0}</td><td>-</td><td>-</td></tr>
          </table>

          <div class="action-plan-box">
            <b>Action Plan (${new Date().toLocaleString('default', { month: 'short' })}):</b><br>
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
              ${historyData.map((h, i) => `<th class="${i === historyData.length-1 ? 'header-orange' : ''}">${formatShortDate(h.date)}${i === historyData.length-1 ? ' *' : ''}</th>`).join('')}
            </tr>
            <tr><td><b>Total Sales</b></td>${historyData.map(h => `<td>${formatRM(h.ts)}</td>`).join('')}</tr>
            <tr><td><b>HB</b></td>${historyData.map(h => `<td>${formatRM(h.hb)}</td>`).join('')}</tr>
            <tr><td><b>HB%</b></td>${historyData.map(h => `<td>${h.ts > 0 ? ((h.hb/h.ts)*100).toFixed(1) : 0}%</td>`).join('')}</tr>
            <tr><td><b>HM</b></td>${historyData.map(h => `<td>${formatRM(h.hm)}</td>`).join('')}</tr>
            <tr><td><b>HM%</b></td>${historyData.map(h => `<td>${h.ts > 0 ? ((h.hm/h.ts)*100).toFixed(1) : 0}%</td>`).join('')}</tr>
            <tr><td><b>No. of tranx</b></td>${historyData.map(h => `<td>${h.cust}</td>`).join('')}</tr>
            <tr><td><b>Total Sales BS</b></td>${historyData.map(h => `<td>${h.cust > 0 ? formatRM(h.ts/h.cust) : 0}</td>`).join('')}</tr>
            <tr><td><b>HB BS</b></td>${historyData.map(h => `<td>${h.cust > 0 ? formatRM(h.hb/h.cust) : 0}</td>`).join('')}</tr>
            <tr><td><b>PMG APP</b></td>${historyData.map(h => `<td>${h.pmgApp || 0}</td>`).join('')}</tr>
            <tr class="header-yellow"><td><b>Daily Comment:</b></td>${historyData.map(h => `<td style="font-size:0.65rem; white-space:normal; text-align:left; max-width:130px; word-wrap:break-word;">${getConstructiveComment(h.ts, h.hb)}</td>`).join('')}</tr>
          </table>
        </div>
      </div>
    </div>`;
    content.innerHTML = html;
  } 
  else if (type === 'teammates') {
    let html = `
    <div class="excel-report" id="captureArea" style="min-width: 840px; width: max-content;">
      <div class="excel-title">PMG ${selectedBranch.toUpperCase()} - TEAMMATE PERFORMANCE & TARGET GAP (${reportDate} MTD)</div>
      <table class="excel-table">
        <tr class="header-red">
          <th>Teammate Name</th>
          <th>Cust</th>
          <th>MTD Sales (RM)</th>
          <th>TS Gap (MTD)</th>
          <th>MTD HB (RM)</th>
          <th>HB Gap (MTD)</th>
          <th>MTD HM (RM)</th>
          <th>HB %</th>
        </tr>`;
    
    let totalCust=0, totalTs=0, totalHb=0, totalHm=0, totalTsGap=0, totalHbGap=0;

    staff.forEach(s => {
      let tsGap = s.mtdTs - (s.targetTs * currentData.currentDay);
      let hbGap = s.mtdHb - (s.targetHb * currentData.currentDay);
      let hbPct = s.mtdTs > 0 ? ((s.mtdHb / s.mtdTs) * 100).toFixed(1) : 0;
      
      totalCust += s.mtdCust || 0;   // MTD total transactions
      totalTs += s.mtdTs; totalHb += s.mtdHb; totalHm += s.mtdHm;
      totalTsGap += tsGap; totalHbGap += hbGap;

      html += `<tr>
        <td style="text-align:left;"><b>${s.name}</b><br><span style="font-size:0.6rem; color:#666;">${s.role}</span></td>
        <td>${s.mtdCust || 0}</td>
        <td>${formatRM(s.mtdTs)}</td>
        <td style="color:${tsGap >= 0 ? '#2e7d32' : '#c62828'}; font-weight:bold;">${tsGap > 0 ? '+' : ''}${formatRM(tsGap)}</td>
        <td>${formatRM(s.mtdHb)}</td>
        <td style="color:${hbGap >= 0 ? '#2e7d32' : '#c62828'}; font-weight:bold;">${hbGap > 0 ? '+' : ''}${formatRM(hbGap)}</td>
        <td>${formatRM(s.mtdHm)}</td>
        <td>${hbPct}%</td>
      </tr>`;
    });

    let totalHbPct = totalTs > 0 ? ((totalHb / totalTs) * 100).toFixed(1) : 0;
    html += `<tr style="background:#f5f5f5; font-weight:bold;">
      <td style="text-align:left;">OUTLET CUMULATIVE</td>
      <td>${totalCust}</td>
      <td>${formatRM(totalTs)}</td>
      <td style="color:${totalTsGap >= 0 ? '#2e7d32' : '#c62828'};">${totalTsGap > 0 ? '+' : ''}${formatRM(totalTsGap)}</td>
      <td>${formatRM(totalHb)}</td>
      <td style="color:${totalHbGap >= 0 ? '#2e7d32' : '#c62828'};">${totalHbGap > 0 ? '+' : ''}${formatRM(totalHbGap)}</td>
      <td>${formatRM(totalHm)}</td>
      <td>${totalHbPct}%</td>
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

