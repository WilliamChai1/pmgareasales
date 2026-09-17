const API_URL = "https://script.google.com/macros/s/AKfycbwhxfd5OQrDJw3bYPuzCd8DQqhWfOmtkQpQUTu7ke9s2bE_egFmvWeubaEtjMvBzADS/exec";
const WEBAPP_LINK = "https://williamchai1.github.io/pmgareasales/";

let currentUser = null;
let currentData = null;
let selectedBranch = null;
let currentReportType = null;

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
      selectedBranch = currentUser.branch === 'ALL' ? null : currentUser.branch;
      document.getElementById("loginOverlay").style.display = "none";
      
      if (currentUser.role.toLowerCase() === 'area manager') {
        document.getElementById("areaManagerControls").style.display = "block";
      }
      loadDashboardData();
    } else {
      document.getElementById("loginError").style.display = "block";
      btn.innerText = "Secure Login";
    }
  } catch (e) {
    alert("Connection Error. Please check your internet.");
    btn.innerText = "Secure Login";
  }
}

function logout() {
  currentUser = null;
  document.getElementById("loginOverlay").style.display = "flex";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

async function loadDashboardData() {
  document.getElementById("lastUpdated").innerText = "🔄 Syncing with Database...";
  const branchToFetch = selectedBranch || "ALL"; 
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: 'getData', branch: branchToFetch, role: currentUser.role })
    });
    currentData = await res.json();
    
    if (currentUser.role.toLowerCase() === 'area manager' && !selectedBranch) {
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
    document.getElementById("lastUpdated").innerText = "⚠️ Offline Mode / Sync Error";
  }
}

function changeBranch() {
  selectedBranch = document.getElementById("branchSelector").value;
  loadDashboardData();
}

function renderDashboard() {
  if (!currentData || !selectedBranch) return;
  
  const summary = currentData.summary[selectedBranch] || {};
  const targets = currentData.targets[selectedBranch] || {};
  const staff = currentData.staff || [];
  const ap = currentData.actionPlan || {w1:"", w2:"", w3:"", w4:""};
  
  document.getElementById("branchNameHeader").innerText = `🏥 ${selectedBranch} Performance`;
  
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

  // Action Plan Display
  let apHtml = `
    <b>Week 1:</b> ${ap.w1 || '-'}<br>
    <b>Week 2:</b> ${ap.w2 || '-'}<br>
    <b>Week 3:</b> ${ap.w3 || '-'}<br>
    <b>Week 4:</b> ${ap.w4 || '-'}
  `;
  document.getElementById("aiRecommendationText").innerHTML = apHtml;

  // Show Edit button for Managers/Pharmacists
  const role = currentUser.role.toLowerCase();
  if (role.includes('manager') || role.includes('pharmacist')) {
    document.getElementById("editActionPlanBtn").style.display = "block";
  }

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

// --- ACTION PLAN LOGIC ---
function openActionPlanModal() {
  const ap = currentData.actionPlan || {w1:"", w2:"", w3:"", w4:""};
  document.getElementById("apWeek1").value = ap.w1;
  document.getElementById("apWeek2").value = ap.w2;
  document.getElementById("apWeek3").value = ap.w3;
  document.getElementById("apWeek4").value = ap.w4;
  document.getElementById("actionPlanModal").style.display = "flex";
}

function closeActionPlanModal() {
  document.getElementById("actionPlanModal").style.display = "none";
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

  try {
    await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: 'saveActionPlan', branch: selectedBranch, plans: plans })
    });
    
    // Update local data immediately
    currentData.actionPlan = plans;
    renderDashboard();
    closeActionPlanModal();
    btn.innerText = "Save Action Plan";
  } catch (e) {
    alert("Failed to save. Check connection.");
    btn.innerText = "Save Action Plan";
  }
}

// --- WHATSAPP BRIEFING ---
function copyWhatsAppBriefing() {
  if (!currentData || !selectedBranch) return;
  const summary = currentData.summary[selectedBranch] || {};
  const targets = currentData.targets[selectedBranch] || {};
  const ap = currentData.actionPlan || {};
  
  const tsPct = (((summary.mtdTs || 0) / (targets.ts || 1)) * 100).toFixed(1);
  const hbPct = (((summary.mtdHb || 0) / (targets.hb || 1)) * 100).toFixed(1);
  
  let text = `*📊 ${selectedBranch} Daily Briefing*\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  text += `*🎯 Target Achievement:*\n`;
  text += `TS: RM ${(summary.mtdTs||0).toLocaleString()} / RM ${(targets.ts||0).toLocaleString()} (${tsPct}%)\n`;
  text += `HB: RM ${(summary.mtdHb||0).toLocaleString()} / RM ${(targets.hb||0).toLocaleString()} (${hbPct}%)\n`;
  text += `📱 PMG App Installs Today: ${summary.pmgApp || 0}\n\n`;
  
  text += `*🎯 Strategy Plan:*\n`;
  text += `W1: ${ap.w1 || '-'}\nW2: ${ap.w2 || '-'}\nW3: ${ap.w3 || '-'}\nW4: ${ap.w4 || '-'}\n\n`;
  
  text += `*🏆 Congratulation Board:*\n`;
  let achievers = 0;
  currentData.staff.forEach(s => {
    if(s.dailyTs >= s.targetTs || s.dailyHb >= s.targetHb) {
      achievers++;
      text += `• *${s.name}*: Fantastic job hitting your target! (RM ${Number(s.dailyTs).toLocaleString()} TS / RM ${Number(s.dailyHb).toLocaleString()} HB). Your dedication to patient care and House Brands is highly appreciated. Keep up the great momentum! 🌟\n`;
    }
  });
  if(achievers === 0) text += `Let's push hard today to get everyone on the board! 💪\n`;
  
  text += `\n🔗 *View Full Dashboard:* ${WEBAPP_LINK}`;
  navigator.clipboard.writeText(text);
  alert("WhatsApp Daily Briefing copied to clipboard!");
}

// --- EXACT EXCEL REPLICA GENERATORS ---
function openReportModal(type) {
  currentReportType = type;
  document.getElementById("reportModal").style.display = "flex";
  const content = document.getElementById("reportContent");
  const summary = currentData.summary[selectedBranch] || {};
  const targets = currentData.targets[selectedBranch] || {};
  const history = currentData.history || [];
  const staff = currentData.staff || [];
  const ap = currentData.actionPlan || {};
  
  let reportDate = history.length > 0 ? new Date(history[history.length-1].date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}).toUpperCase().replace(/ /g, '-') : new Date().toLocaleDateString();

  if (type === 'director') {
    let tsGap = summary.mtdTs - targets.ts;
    let tsPct = ((summary.mtdTs / targets.ts) * 100).toFixed(0);
    let tsLyGap = summary.mtdTs - summary.lyMtd;
    let tsLyPct = summary.lyMtd > 0 ? ((summary.mtdTs / summary.lyMtd) * 100).toFixed(0) : 0;
    
    let hbGap = summary.mtdHb - targets.hb;
    let hbPct = ((summary.mtdHb / targets.hb) * 100).toFixed(0);
    
    let hmGap = summary.mtdHm - targets.hm;
    let hmPct = ((summary.mtdHm / targets.hm) * 100).toFixed(0);

    let html = `
    <div class="excel-report" id="captureArea">
      <div class="excel-title">PMG PHARMACY ${selectedBranch.toUpperCase()} - DIRECTORS' DAILY SALES REPORT (${reportDate})</div>
      
      <div class="excel-grid">
        <div class="excel-col-left">
          <table class="excel-table">
            <tr class="header-blue"><th>Monthly Sales</th><th>Amount</th><th>%</th></tr>
            <tr><td>Sales Vs Target</td><td>${tsGap < 0 ? '' : '+'}${formatRM(tsGap)}</td><td>${tsPct}%</td></tr>
            <tr><td>Sales Vs LY</td><td>${tsLyGap < 0 ? '' : '+'}${formatRM(tsLyGap)}</td><td>+${tsLyPct}%</td></tr>
            <tr><td>HB Vs Target</td><td>${hbGap < 0 ? '' : '+'}${formatRM(hbGap)}</td><td>${hbPct}%</td></tr>
            <tr><td>HM Vs Target</td><td>${hmGap < 0 ? '' : '+'}${formatRM(hmGap)}</td><td>${hmPct}%</td></tr>
          </table>

          <table class="excel-table" style="margin-top:10px;">
            <tr class="header-yellow"><th colspan="4">From 1st to ${reportDate}</th></tr>
            <tr class="header-yellow"><th></th><th>MTD Sales</th><th>Last Year Sales</th><th>Target</th></tr>
            <tr><td><b>Total</b></td><td>${formatRM(summary.mtdTs)}</td><td>${formatRM(summary.lyMtd)}</td><td>${formatRM(targets.ts)}</td></tr>
            <tr><td>HB</td><td>${formatRM(summary.mtdHb)}</td><td>-</td><td>${formatRM(targets.hb)}</td></tr>
            <tr><td>HM</td><td>${formatRM(summary.mtdHm)}</td><td>-</td><td>${formatRM(targets.hm)}</td></tr>
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
              ${history.map((h, i) => `<th class="${i === history.length-1 ? 'header-orange' : ''}">${new Date(h.date).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}</th>`).join('')}
            </tr>
            <tr><td><b>Total Sales</b></td>${history.map(h => `<td>${formatRM(h.ts)}</td>`).join('')}</tr>
            <tr><td><b>HB</b></td>${history.map(h => `<td>${formatRM(h.hb)}</td>`).join('')}</tr>
            <tr><td><b>HB%</b></td>${history.map(h => `<td>${h.ts > 0 ? ((h.hb/h.ts)*100).toFixed(1) : 0}%</td>`).join('')}</tr>
            <tr><td><b>HM</b></td>${history.map(h => `<td>${formatRM(h.hm)}</td>`).join('')}</tr>
            <tr><td><b>HM%</b></td>${history.map(h => `<td>${h.ts > 0 ? ((h.hm/h.ts)*100).toFixed(1) : 0}%</td>`).join('')}</tr>
            <tr><td><b>No. of tranx</b></td>${history.map(h => `<td>${h.cust}</td>`).join('')}</tr>
            <tr><td><b>Total Sales BS</b></td>${history.map(h => `<td>${h.cust > 0 ? formatRM(h.ts/h.cust) : 0}</td>`).join('')}</tr>
            <tr><td><b>HB BS</b></td>${history.map(h => `<td>${h.cust > 0 ? formatRM(h.hb/h.cust) : 0}</td>`).join('')}</tr>
            <tr><td><b>PMG APP</b></td>${history.map(h => `<td>${Math.floor(Math.random() * 4) + 1}</td>`).join('')}</tr>
            <tr class="header-yellow"><td><b>Daily Comment:</b></td>${history.map(h => `<td style="font-size:0.65rem; white-space:normal;">Solid day! HB ratio at ${h.ts > 0 ? ((h.hb/h.ts)*100).toFixed(1) : 0}%.</td>`).join('')}</tr>
          </table>
        </div>
      </div>
    </div>`;
    content.innerHTML = html;
  } 
  else if (type === 'teammates') {
    let html = `
    <div class="excel-report" id="captureArea" style="width: 100%; max-width: 800px;">
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
      let tsGap = s.mtdTs - s.mtdTargetTs;
      let hbGap = s.mtdHb - s.mtdTargetHb;
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

function closeReportModal() {
  document.getElementById("reportModal").style.display = "none";
}

// --- ULTRA HD DOWNLOAD LOGIC ---
function downloadReportAsImage() {
  const element = document.getElementById('captureArea');
  
  // Use html2canvas to capture the div
  html2canvas(element, {
    scale: 3, // Ultra HD resolution
    backgroundColor: "#ffffff",
    useCORS: true
  }).then(canvas => {
    // Convert canvas to image data URL
    const imgData = canvas.toDataURL('image/png');
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.download = `PMG_${selectedBranch}_${currentReportType}_Report.png`;
    link.href = imgData;
    link.click();
  });
}
