const API_URL = "https://script.google.com/macros/s/AKfycbwhxfd5OQrDJw3bYPuzCd8DQqhWfOmtkQpQUTu7ke9s2bE_egFmvWeubaEtjMvBzADS/exec";
const WEBAPP_LINK = "https://williamchai1.github.io/pmgareasales/";

let currentUser = null;
let currentData = null;
let selectedBranch = null;

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
      if(currentData.branches.length === 0) {
        alert("No branches found in BranchTargets sheet!");
        return;
      }
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

  document.getElementById("aiRecommendationText").innerText = summary.recommendation || "AI is analyzing data...";

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

// --- WHATSAPP BRIEFING ---
function copyWhatsAppBriefing() {
  if (!currentData || !selectedBranch) return;
  const summary = currentData.summary[selectedBranch] || {};
  const targets = currentData.targets[selectedBranch] || {};
  
  const tsPct = (((summary.mtdTs || 0) / (targets.ts || 1)) * 100).toFixed(1);
  const hbPct = (((summary.mtdHb || 0) / (targets.hb || 1)) * 100).toFixed(1);
  
  let text = `*📊 ${selectedBranch} Daily Briefing*\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  text += `*🎯 Target Achievement:*\n`;
  text += `TS: RM ${(summary.mtdTs||0).toLocaleString()} / RM ${(targets.ts||0).toLocaleString()} (${tsPct}%)\n`;
  text += `HB: RM ${(summary.mtdHb||0).toLocaleString()} / RM ${(targets.hb||0).toLocaleString()} (${hbPct}%)\n`;
  text += `📱 PMG App Installs Today: ${summary.pmgApp || 0}\n\n`;
  
  text += `*🎯 Strategy Plan:*\n`;
  text += `${summary.recommendation || "Proactively pair localized joint pain queries with House Brand supplements."}\n\n`;
  
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

// --- ON-SCREEN REPORT GENERATORS ---
function openReportModal(type) {
  document.getElementById("reportModal").style.display = "flex";
  const content = document.getElementById("reportContent");
  
  if (type === 'director') {
    let html = `<h3 style="color:var(--primary-dark); text-align:center;">📊 ${selectedBranch} - 7 Day Director Report</h3>`;
    html += `<table class="report-table"><thead><tr><th>Date</th><th>Total Sales</th><th>House Brand</th><th>HB %</th><th>Customers</th></tr></thead><tbody>`;
    
    if(currentData.history && currentData.history.length > 0) {
      currentData.history.forEach(day => {
        let hbPct = day.ts > 0 ? ((day.hb / day.ts) * 100).toFixed(1) : 0;
        html += `<tr>
          <td>${new Date(day.date).toLocaleDateString()}</td>
          <td>RM ${Number(day.ts).toLocaleString()}</td>
          <td>RM ${Number(day.hb).toLocaleString()}</td>
          <td>${hbPct}%</td>
          <td>${day.cust}</td>
        </tr>`;
      });
    } else {
      html += `<tr><td colspan="5" style="text-align:center;">Not enough historical data yet.</td></tr>`;
    }
    html += `</tbody></table>`;
    content.innerHTML = html;
  } 
  else if (type === 'teammates') {
    let html = `<h3 style="color:var(--primary-dark); text-align:center;">👥 ${selectedBranch} - Teammate Gap Report</h3>`;
    html += `<table class="report-table"><thead><tr><th>Name</th><th>MTD TS</th><th>TS Gap</th><th>MTD HB</th><th>HB Gap</th></tr></thead><tbody>`;
    
    currentData.staff.forEach(s => {
      // Note: Since we only have daily sales in the staff array right now, 
      // this shows daily gap. To show MTD gap, you need to track MTD per staff in the sheet.
      let tsGap = s.dailyTs - s.targetTs;
      let hbGap = s.dailyHb - s.targetHb;
      let tsColor = tsGap >= 0 ? 'green' : 'red';
      let hbColor = hbGap >= 0 ? 'green' : 'red';
      
      html += `<tr>
        <td><b>${s.name}</b><br><span style="font-size:0.6rem;">${s.role}</span></td>
        <td>RM ${Number(s.dailyTs).toLocaleString()}</td>
        <td style="color:${tsColor}; font-weight:bold;">${tsGap > 0 ? '+' : ''}RM ${tsGap.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
        <td>RM ${Number(s.dailyHb).toLocaleString()}</td>
        <td style="color:${hbColor}; font-weight:bold;">${hbGap > 0 ? '+' : ''}RM ${hbGap.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
    content.innerHTML = html;
  }
}

function closeReportModal() {
  document.getElementById("reportModal").style.display = "none";
}
