// Replace with your deployed Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbwhxfd5OQrDJw3bYPuzCd8DQqhWfOmtkQpQUTu7ke9s2bE_egFmvWeubaEtjMvBzADS/exec";

let currentUser = null;
let currentData = null;
let selectedBranch = null;

// --- AUTHENTICATION ---
async function executeLogin() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const btn = document.getElementById("loginBtn");
  
  if(!user || !pass) return alert("Enter username and password");
  
  btn.innerText = "Authenticating...";
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', username: user, password: pass })
    });
    const data = await res.json();
    
    if (data.success) {
      currentUser = data.user;
      selectedBranch = currentUser.branch === 'ALL' ? null : currentUser.branch;
      document.getElementById("loginOverlay").style.display = "none";
      
      // Setup Area Manager View
      if (currentUser.role === 'Area Manager') {
        document.getElementById("areaManagerControls").style.display = "block";
      }
      
      loadDashboardData();
    } else {
      document.getElementById("loginError").style.display = "block";
      btn.innerText = "Login";
    }
  } catch (e) {
    alert("Connection error. Please try again.");
    btn.innerText = "Login";
  }
}

function logout() {
  currentUser = null;
  document.getElementById("loginOverlay").style.display = "flex";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

// --- DATA FETCHING & RENDERING ---
async function loadDashboardData() {
  document.getElementById("lastUpdated").innerText = "🔄 Syncing with Database...";
  
  // If Area Manager hasn't selected a branch yet, default to the first one they load
  const branchToFetch = selectedBranch || "ALL"; 
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'getData', branch: branchToFetch, role: currentUser.role })
    });
    currentData = await res.json();
    
    // Populate Branch Selector for Area Manager
    if (currentUser.role === 'Area Manager' && !selectedBranch) {
      const selector = document.getElementById("branchSelector");
      selector.innerHTML = "";
      currentData.branches.forEach(b => {
        selector.innerHTML += `<option value="${b}">${b}</option>`;
      });
      selectedBranch = currentData.branches[0];
      // Re-fetch for specific branch
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
  
  // Render Outlet Progress
  const tsPct = Math.min(100, ((summary.mtdTs || 0) / (targets.ts || 1)) * 100);
  document.getElementById("outletTsProgressText").innerText = `RM ${(summary.mtdTs||0).toLocaleString()} / RM ${(targets.ts||0).toLocaleString()} (${tsPct.toFixed(1)}%)`;
  document.getElementById("outletTsBar").style.width = tsPct + "%";
  
  const hbPct = Math.min(100, ((summary.mtdHb || 0) / (targets.t3 || 1)) * 100);
  document.getElementById("outletHbProgressText").innerText = `RM ${(summary.mtdHb||0).toLocaleString()} / RM ${(targets.t3||0).toLocaleString()} (${hbPct.toFixed(1)}%)`;
  document.getElementById("outletHbBar").style.width = hbPct + "%";

  // Render AI Recommendation
  document.getElementById("aiRecommendationText").innerText = summary.recommendation || "AI is analyzing data...";

  // Render Staff Table
  const tbody = document.querySelector("#teammatesTable tbody");
  tbody.innerHTML = "";
  staff.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td><b>${s.name}</b></td>
        <td>RM ${Number(s.dailyTs).toLocaleString()}</td>
        <td>RM ${Number(s.dailyHb).toLocaleString()}</td>
        <td>RM ${Number(s.dailyHm).toLocaleString()}</td>
        <td>${s.dailyCust}</td>
      </tr>
    `;
  });
}

// --- WHATSAPP BRIEFING GENERATOR ---
function copyWhatsAppBriefing() {
  if (!currentData || !selectedBranch) return;
  
  const summary = currentData.summary[selectedBranch] || {};
  const targets = currentData.targets[selectedBranch] || {};
  
  const tsPct = (((summary.mtdTs || 0) / (targets.ts || 1)) * 100).toFixed(1);
  const hbPct = (((summary.mtdHb || 0) / (targets.t3 || 1)) * 100).toFixed(1);
  
  let text = `*📊 ${selectedBranch} Daily Briefing*\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  text += `*🎯 Target Achievement:*\n`;
  text += `TS: RM ${(summary.mtdTs||0).toLocaleString()} / RM ${(targets.ts||0).toLocaleString()} (${tsPct}%)\n`;
  text += `HB: RM ${(summary.mtdHb||0).toLocaleString()} / RM ${(targets.t3||0).toLocaleString()} (${hbPct}%)\n\n`;
  
  text += `*🤖 AI Strategic Recommendation:*\n`;
  text += `${summary.recommendation || "Keep pushing House Brands at checkout!"}\n\n`;
  
  text += `*🏆 Today's Top Performers:*\n`;
  currentData.staff.forEach(s => {
    if(s.dailyTs > 1000) { // Example threshold
      text += `• ${s.name}: RM ${Number(s.dailyTs).toLocaleString()} TS\n`;
    }
  });
  
  text += `\nLet's hit our targets today! 💪`;

  navigator.clipboard.writeText(text);
  alert("WhatsApp Daily Briefing copied to clipboard!");
}
