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

function copyWhatsAppBriefing() {
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

  let tsStatus = (summary.mtdTs >= expectedTs) ? "🟢 On Track" : `🔴 Off Track (Need RM ${formatRM(tsReqPerDay)}/day)`;
  let hbStatus = (summary.mtdHb >= expectedHb) ? "🟢 On Track" : `🔴 Off Track (Need RM ${formatRM(hbReqPerDay)}/day)`;
  
  let text = `*📊 ${selectedBranch} Daily Briefing*\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  text += `*🎯 Target Achievement:*\n`;
  text += `TS: RM ${(summary.mtdTs||0).toLocaleString()} / RM ${(targets.ts||0).toLocaleString()} (${tsPct}%) - ${tsStatus}\n`;
  text += `HB: RM ${(summary.mtdHb||0).toLocaleString()} / RM ${(targets.hb||0).toLocaleString()} (${hbPct}%) - ${hbStatus}\n`;
  text += `📱 PMG App Installs Today: ${summary.pmgApp || 0}\n\n`;
  
  text += `*🎯 Strategy Plan:*\n`;
  text += `W1: ${ap.w1 || '-'}\nW2: ${ap.w2 || '-'}\nW3: ${ap.w3 || '-'}\nW4: ${ap.w4 || '-'}\n\n`;
  
  text += `*🏆 Congratulation Board:*\n`;
  let achievers = 0;
  
  // Actionable Tips Array
  const tips = [
    "Tip: Pair Vitamin C with every cough/cold consult today.",
    "Tip: Suggest a 30-day joint supplement pack for pain relief.",
    "Tip: Recommend probiotics with every antibiotic script.",
    "Tip: Offer a PWP item at checkout for baskets over RM30.",
    "Tip: Upgrade 15-day supplies to 30-day for better compliance."
  ];

  currentData.staff.forEach(s => {
    let hits = [];
    if(s.dailyTs >= s.targetTs) hits.push("TS");
    if(s.dailyHb >= s.targetHb) hits.push("HB");
    
    if(hits.length > 0) {
      achievers++;
      let randomTip = tips[Math.floor(Math.random() * tips.length)];
      text += `• *${s.name}*: Hit ${hits.join(" & ")}! 🌟 ${randomTip}\n\n`;
    }
  });
  
  if(achievers === 0) text += `Let's push hard today to get everyone on the board! Focus on PWP at checkout. 💪\n\n`;
  
  text += `🔗 *View Full Dashboard:* ${WEBAPP_LINK}`;
  navigator.clipboard.writeText(text);
  alert("WhatsApp Daily Briefing copied to clipboard!");
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
      
      totalCust += s.dailyCust; 
      totalTs += s.mtdTs; totalHb += s.mtdHb; totalHm += s.mtdHm;
      totalTsGap += tsGap; totalHbGap += hbGap;

      html += `<tr>
        <td style="text-align:left;"><b>${s.name}</b><br><span style="font-size:0.6rem; color:#666;">${s.role}</span></td>
        <td>${s.dailyCust}</td>
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
      <td>-</td>
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

// ─── MOBILE GESTURE & BACK NAVIGATION HANDLER ───────────────────────────────
window.addEventListener('popstate', (e) => {
  const reportModal = document.getElementById("reportModal");
  const actionPlanModal = document.getElementById("actionPlanModal");
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
    const signupBox = document.getElementById("signupBox");

    if (reportModal && reportModal.style.display === "flex") {
      closeReportModal(true);
    } else if (actionPlanModal && actionPlanModal.style.display === "flex") {
      closeActionPlanModal(true);
    } else if (signupBox && signupBox.style.display === "block") {
      toggleAuthView('login');
    }
  }
}, { passive: true });
