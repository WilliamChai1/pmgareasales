const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    
    if (request.action === "login") {
      return ContentService.createTextOutput(JSON.stringify(authenticateUser(request.username, request.password)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "signup") {
      return ContentService.createTextOutput(JSON.stringify(registerUser(request)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "approveUser") {
      return ContentService.createTextOutput(JSON.stringify(approveUser(request.targetUsername, request.adminUsername)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (request.action === "getData") {
      return ContentService.createTextOutput(JSON.stringify(getDashboardData(request.branch, request.role, request.username)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "saveActionPlan") {
      return ContentService.createTextOutput(JSON.stringify(saveActionPlan(request.branch, request.plans, request.pmgCount, request.date)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "saveAmNote") {
      return ContentService.createTextOutput(JSON.stringify(saveAmNote(request.note)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "dposGetWeek") {
      return ContentService.createTextOutput(JSON.stringify(dposGetActiveWeek(request.username)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "dposSaveScore") {
      return ContentService.createTextOutput(JSON.stringify(dposSaveScore(request)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "dposGetReview") {
      return ContentService.createTextOutput(JSON.stringify(dposGetReview(request)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "geminiProxy") {
      return ContentService.createTextOutput(JSON.stringify(geminiProxy(request)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === "saveGeminiApiKey") {
      return ContentService.createTextOutput(JSON.stringify(saveBackendGeminiApiKey(request)))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: true, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput("").setHeaders(headers);
}

function getStaffSheet(ss) {
  return ss.getSheetByName("PMG_Master_Staff") || ss.getSheetByName("Auth");
}

function hashPassword(pass) {
  if (!pass) return "";
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(pass).trim() + "PMG_SALT");
  return rawHash.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function authenticateUser(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getStaffSheet(ss);
  if (!sheet) return { success: false, message: "Staff directory sheet (PMG_Master_Staff / Auth) not found." };

  const data = sheet.getDataRange().getValues();
  const inputUser = String(username).trim().toLowerCase();
  const inputPass = String(password).trim();
  const inputPassHash = hashPassword(inputPass);
  
  for (let i = 1; i < data.length; i++) {
    const rowUser = String(data[i][0]).trim().toLowerCase();
    const rowPass = String(data[i][1]).trim();
    
    if (rowUser === inputUser) {
      // Check password (supports plain text or SHA-256 hash)
      const passMatches = (rowPass === inputPass) || (rowPass === inputPassHash);
      if (!passMatches) {
        return { success: false, message: "Invalid credentials" };
      }

      // Check Status (Col H / Index 7)
      const status = data[i][7] ? String(data[i][7]).trim().toLowerCase() : 'active';
      if (status === 'pending') {
        return { success: false, message: "Your account is pending Area Manager approval. Please notify William Chai." };
      }
      if (status === 'inactive') {
        return { success: false, message: "Account is inactive. Please contact your Area Manager." };
      }
      
      const role = String(data[i][3]).trim();
      const branch = String(data[i][4]).trim();
      const empId = data[i][5] ? String(data[i][5]).trim() : '';
      const race = data[i][6] ? String(data[i][6]).trim() : '';
      
      return {
        success: true,
        user: {
          username: data[i][0],
          name: data[i][2],
          role: role,
          position: role,
          branch: branch,
          empId: empId,
          race: race,
          status: status
        }
      };
    }
  }
  return { success: false, message: "Invalid credentials" };
}

function registerUser(req) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getStaffSheet(ss);
    if (!sheet) return { success: false, message: "Staff directory sheet not found." };

    const username = String(req.username || '').trim();
    const password = String(req.password || '').trim();
    const name = String(req.name || '').trim();
    const role = String(req.role || 'Staff').trim();
    const branch = String(req.branch || '').trim();
    const empId = String(req.empId || '').trim();
    const race = String(req.race || '').trim();

    if (!username || !password || !name || !branch) {
      return { success: false, message: "Please fill in all required fields." };
    }

    const data = sheet.getDataRange().getValues();
    const uLower = username.toLowerCase();
    const eLower = empId.toLowerCase();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === uLower) {
        return { success: false, message: "Username already taken. Please choose another." };
      }
      if (empId && data[i][5] && String(data[i][5]).trim().toLowerCase() === eLower) {
        return { success: false, message: "Employee ID already registered." };
      }
    }

    // Append new row with 'Pending' status
    // Columns: [Username, Password, Name, Role, Branch, EmpID, Race, Status]
    sheet.appendRow([username, password, name, role, branch, empId, race, "Pending"]);
    return { 
      success: true, 
      message: "Registration submitted successfully! Your account is pending Area Manager approval." 
    };
  } catch (err) {
    return { success: false, message: "Registration failed: " + err.toString() };
  }
}

function approveUser(targetUsername, adminUsername) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getStaffSheet(ss);
    if (!sheet) return { success: false, message: "Staff directory sheet not found." };

    const data = sheet.getDataRange().getValues();
    const aLower = String(adminUsername || '').trim().toLowerCase();
    const tLower = String(targetUsername || '').trim().toLowerCase();

    // Verify admin is Area Manager
    let isAdmin = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === aLower) {
        const role = String(data[i][3]).trim().toLowerCase();
        if (role === 'area manager') isAdmin = true;
        break;
      }
    }

    if (!isAdmin) {
      return { success: false, message: "Unauthorized. Only Area Manager can approve registrations." };
    }

    // Find target user and set status to 'Active'
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === tLower) {
        // Col H is column 8 (1-based index 8)
        sheet.getRange(i + 1, 8).setValue("Active");
        return { success: true, message: `Account for ${data[i][2]} (${data[i][0]}) approved successfully!` };
      }
    }

    return { success: false, message: "Target user not found." };
  } catch (err) {
    return { success: false, message: "Approval failed: " + err.toString() };
  }
}

function saveActionPlan(branch, plans, pmgCount, dateStr) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const branchUpper = String(branch).trim().toUpperCase();
  
  // 1. Save Action Plan
  const apSheet = ss.getSheetByName("ActionPlans");
  if (apSheet) {
    const data = apSheet.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toUpperCase() === branchUpper) {
        apSheet.getRange(i + 1, 2, 1, 4).setValues([[plans.w1, plans.w2, plans.w3, plans.w4]]);
        found = true;
        break;
      }
    }
    if (!found) apSheet.appendRow([branch, plans.w1, plans.w2, plans.w3, plans.w4]);
  }

  // 2. Save PMG App Count
  let pmgSheet = ss.getSheetByName("PMG_Apps");
  if (!pmgSheet) {
    pmgSheet = ss.insertSheet("PMG_Apps");
    pmgSheet.appendRow(["Date", "Branch", "AppCount"]);
  }
  const pmgData = pmgSheet.getDataRange().getValues();
  let pmgFound = false;
  for (let i = 1; i < pmgData.length; i++) {
    if (new Date(pmgData[i][0]).toDateString() === new Date(dateStr).toDateString() && String(pmgData[i][1]).trim().toUpperCase() === branchUpper) {
      pmgSheet.getRange(i + 1, 3).setValue(pmgCount);
      pmgFound = true;
      break;
    }
  }
  if (!pmgFound) {
    pmgSheet.appendRow([new Date(dateStr).toLocaleDateString(), branch, pmgCount]);
  }

  return { success: true };
}

function saveAmNote(note) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("ActionPlans");
  const data = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === "AreaManager") {
      sheet.getRange(i + 1, 2).setValue(note);
      found = true;
      break;
    }
  }
  if (!found) sheet.appendRow(["AreaManager", note, "", "", ""]);
  return { success: true };
}

function calculateDynamicTargets(branchTarget, staffList) {
  let numPharm = staffList.filter(s => s.role.toLowerCase().includes('pharmacist')).length;
  let numBM = staffList.filter(s => s.role.toLowerCase() === 'branch manager').length;
  let numABM = staffList.filter(s => s.role.toLowerCase() === 'assistant branch manager').length;
  let numStaff = staffList.filter(s => !s.role.toLowerCase().includes('manager') && !s.role.toLowerCase().includes('pharmacist')).length;

  let pPct = 0.15, bmPct = 0.12, abmPct = 0.12;
  let totalAllocated = (numPharm * pPct) + (numBM * bmPct) + (numABM * abmPct);
  let staffPct = numStaff > 0 ? (1 - totalAllocated) / numStaff : 0;

  if (totalAllocated > 0 && numStaff > 0) {
    let minMgrPct = Math.min(numPharm > 0 ? pPct : 1, numBM > 0 ? bmPct : 1, numABM > 0 ? abmPct : 1);
    while (staffPct >= minMgrPct * 0.95) {
      if (numPharm > 0) pPct += 0.01;
      if (numBM > 0) bmPct += 0.01;
      if (numABM > 0) abmPct += 0.01;
      totalAllocated = (numPharm * pPct) + (numBM * bmPct) + (numABM * abmPct);
      if (totalAllocated >= 1) break; 
      staffPct = (1 - totalAllocated) / numStaff;
      minMgrPct = Math.min(numPharm > 0 ? pPct : 1, numBM > 0 ? bmPct : 1, numABM > 0 ? abmPct : 1);
    }
  }

  return {
    'Pharmacist': branchTarget * pPct,
    'Branch Manager': branchTarget * bmPct,
    'Assistant Branch Manager': branchTarget * abmPct,
    'Staff': branchTarget * staffPct
  };
}

function getDashboardData(requestedBranch, role, username) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 0. Server-Side Role & Branch Verification
  let verifiedRole = String(role || '').trim().toLowerCase();
  let verifiedBranch = String(requestedBranch || '').trim().toUpperCase();
  
  if (username) {
    const staffSheet = getStaffSheet(ss);
    if (staffSheet) {
      const staffData = staffSheet.getDataRange().getValues();
      const uLower = String(username).trim().toLowerCase();
      for (let i = 1; i < staffData.length; i++) {
        if (String(staffData[i][0]).trim().toLowerCase() === uLower) {
          verifiedRole = String(staffData[i][3]).trim().toLowerCase();
          const userBranch = String(staffData[i][4]).trim().toUpperCase();
          if (verifiedRole !== 'area manager' && userBranch !== 'ALL') {
            verifiedBranch = userBranch; // Restrict non-AM to assigned branch
          }
          break;
        }
      }
    }
  }
  
  const isAreaManager = verifiedRole === 'area manager';
  const reqBranchUpper = verifiedBranch;
  
  // 1. Fetch Targets (Case Insensitive)
  const targetData = ss.getSheetByName("BranchTargets").getDataRange().getValues();
  let targets = {};
  let originalBranchNames = [];
  for(let i=1; i<targetData.length; i++) {
    let bNameOriginal = String(targetData[i][0]).trim();
    let bNameUpper = bNameOriginal.toUpperCase();
    originalBranchNames.push(bNameOriginal);
    
    if(bNameUpper === reqBranchUpper || isAreaManager) {
      let hbTarget = targetData[i][2] || 0;
      targets[bNameUpper] = {
        ts: targetData[i][1], hb: hbTarget, hm: targetData[i][3],
        r1: targetData[i][4], r2: targetData[i][5], r3: targetData[i][6],
        t1: Math.round(hbTarget * 0.889115), t2: Math.round(hbTarget * 0.942374), t3: hbTarget
      };
    }
  }

  // 2. Fetch PMG Apps History
  let pmgAppsMap = {};
  const pmgSheet = ss.getSheetByName("PMG_Apps");
  if (pmgSheet) {
    const pmgData = pmgSheet.getDataRange().getValues();
    for (let i = 1; i < pmgData.length; i++) {
      if (String(pmgData[i][1]).trim().toUpperCase() === reqBranchUpper) {
        let dKey = new Date(pmgData[i][0]).toDateString();
        pmgAppsMap[dKey] = parseInt(pmgData[i][2]) || 0;
      }
    }
  }

  // 3. Fetch Branch Summary
  const summaryData = ss.getSheetByName("BranchSummary").getDataRange().getValues();
  let summary = {};
  for(let i=1; i<summaryData.length; i++) { 
    let bNameUpper = String(summaryData[i][1]).trim().toUpperCase();
    if(bNameUpper === reqBranchUpper || isAreaManager || reqBranchUpper === 'ALL') {
      summary[bNameUpper] = {
        date: summaryData[i][0], 
        mtdTs: summaryData[i][2] || 0, mtdHb: summaryData[i][3] || 0, mtdHm: summaryData[i][4] || 0, 
        mtdCust: summaryData[i][5] || 0, lyMtd: summaryData[i][6] || 0, lyMtdHb: summaryData[i][7] || 0, 
        lyMtdHm: summaryData[i][8] || 0, recommendation: summaryData[i][9] || summaryData[i][7] || "", 
        pmgApp: pmgAppsMap[new Date().toDateString()] || 0 
      };
    }
  }

  // 4. Fetch Action Plans & AM Note
  let actionPlan = { w1: "", w2: "", w3: "", w4: "" };
  let amNote = "";
  const apSheet = ss.getSheetByName("ActionPlans");
  if (apSheet) {
    const apData = apSheet.getDataRange().getValues();
    for (let i = 1; i < apData.length; i++) {
      let bNameUpper = String(apData[i][0]).trim().toUpperCase();
      if (bNameUpper === reqBranchUpper) {
        actionPlan = { w1: apData[i][1], w2: apData[i][2], w3: apData[i][3], w4: apData[i][4] };
      }
      if (bNameUpper === "AREAMANAGER") {
        amNote = apData[i][1];
      }
    }
  }

  // 5. Fetch Staff Daily Sales
  const authData = getStaffSheet(ss).getDataRange().getValues();
  let staffRoles = {};
  for(let i=1; i<authData.length; i++) {
    staffRoles[String(authData[i][2]).trim()] = String(authData[i][3]).trim(); 
  }

  const salesData = ss.getSheetByName("DailySales").getDataRange().getValues();
  let staffMap = {};
  let branchStaffList = [];
  let latestDate = new Date(0);
  let dailyHistoryMap = {};
  
  for(let i=1; i<salesData.length; i++) {
    let bNameUpper = String(salesData[i][1]).trim().toUpperCase();
    if(bNameUpper === reqBranchUpper) {
      let sName = String(salesData[i][2]).trim();
      let sNameLower = sName.toLowerCase();
      let sRole = staffRoles[sName] || 'Staff';
      
      // EXCLUDE HQ AND RESIGNED STAFF DYNAMICALLY OR BY NAME
      if (sRole.toLowerCase() === 'hq' || sRole.toLowerCase().includes("resign") || sNameLower.includes("daniela") || sNameLower.includes("janet") || sNameLower.includes("ngu chuin") || sNameLower.includes("public medicare")) {
        continue; 
      }

      let rowDate = new Date(salesData[i][0]);
      if(rowDate > latestDate) latestDate = rowDate;

      if (!staffMap[sName]) {
        staffMap[sName] = { name: sName, role: sRole, mtdTs: 0, mtdHb: 0, mtdHm: 0, mtdCust: 0, dailyTs: 0, dailyHb: 0, dailyHm: 0, dailyCust: 0, lastDate: new Date(0) };
        branchStaffList.push({ name: sName, role: sRole });
      }
      
      let ts = parseFloat(salesData[i][3]) || 0;
      let hb = parseFloat(salesData[i][4]) || 0;
      let hm = parseFloat(salesData[i][5]) || 0;
      let cust = parseInt(salesData[i][6]) || 0;

      // Accumulate MTD strictly for the current calendar month
      const now = new Date();
      if (rowDate.getMonth() === now.getMonth() && rowDate.getFullYear() === now.getFullYear()) {
        staffMap[sName].mtdTs += ts;
        staffMap[sName].mtdHb += hb;
        staffMap[sName].mtdHm += hm;
        staffMap[sName].mtdCust += cust;
      }

      if(rowDate >= staffMap[sName].lastDate) {
        staffMap[sName].dailyTs = ts; staffMap[sName].dailyHb = hb;
        staffMap[sName].dailyHm = hm; staffMap[sName].dailyCust = cust;
        staffMap[sName].lastDate = rowDate;
      }


      let dateKey = rowDate.toDateString();
      if (!dailyHistoryMap[dateKey]) {
        dailyHistoryMap[dateKey] = { date: rowDate, ts: 0, hb: 0, hm: 0, cust: 0, pmgApp: pmgAppsMap[dateKey] || 0 };
      }
      dailyHistoryMap[dateKey].ts += ts; dailyHistoryMap[dateKey].hb += hb;
      dailyHistoryMap[dateKey].hm += hm; dailyHistoryMap[dateKey].cust += cust;
    }
  }

  let staff = Object.values(staffMap);
  let currentDayOfMonth = latestDate.getDate() || new Date().getDate();

  let history = Object.values(dailyHistoryMap)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 7).reverse();

  // Dynamic days in current month (28, 29, 30, or 31)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (targets[reqBranchUpper]) {
    let dailyBranchTarget = targets[reqBranchUpper].ts / daysInMonth; 
    let dailyHbTarget = targets[reqBranchUpper].hb / daysInMonth;
    let dailyHmTarget = targets[reqBranchUpper].hm / daysInMonth;
    
    let tsAllocations = calculateDynamicTargets(dailyBranchTarget, branchStaffList);
    let hbAllocations = calculateDynamicTargets(dailyHbTarget, branchStaffList);
    let hmAllocations = calculateDynamicTargets(dailyHmTarget, branchStaffList);

    staff = staff.map(s => {
      let roleKey = s.role.toLowerCase().includes('pharmacist') ? 'Pharmacist' : 
                    s.role.toLowerCase() === 'branch manager' ? 'Branch Manager' : 
                    s.role.toLowerCase() === 'assistant branch manager' ? 'Assistant Branch Manager' : 'Staff';
      
      s.targetTs = tsAllocations[roleKey] || 0; 
      s.targetHb = hbAllocations[roleKey] || 0; 
      s.targetHm = hmAllocations[roleKey] || 0;
      return s;
    });
  }

  // 6. Fetch Pending Approvals for Area Manager
  let pendingUsers = [];
  if (isAreaManager) {
    const staffSheet = getStaffSheet(ss);
    if (staffSheet) {
      const sData = staffSheet.getDataRange().getValues();
      for (let i = 1; i < sData.length; i++) {
        const st = sData[i][7] ? String(sData[i][7]).trim().toLowerCase() : '';
        if (st === 'pending') {
          pendingUsers.push({
            username: sData[i][0],
            name: sData[i][2],
            role: sData[i][3],
            branch: sData[i][4],
            empId: sData[i][5] || '',
            race: sData[i][6] || ''
          });
        }
      }
    }
  }

  const scriptKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY") || "";

  return { 
    targets: targets, summary: summary, staff: staff, history: history,
    actionPlan: actionPlan, amNote: amNote, branches: originalBranchNames, currentDay: currentDayOfMonth,
    daysInMonth: daysInMonth, pendingUsers: pendingUsers,
    geminiKey: scriptKey
  };
}

// ─── DPOS ACADEMY MODULE BACKEND ─────────────────────────────────────────────
const DPOS_REVIEWER_USERNAMES = ["williamchai", "william"];

function isDposReviewer(username, role) {
  const u = String(username || '').trim().toLowerCase();
  const r = String(role || '').trim().toLowerCase();
  if (DPOS_REVIEWER_USERNAMES.includes(u)) return true;
  if (r.includes('area manager') || r.includes('in-charge') || r.includes('pharmacist') || r.includes('branch manager')) return true;
  return false;
}

function dposGetActiveWeek(username) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const weekSheet = ss.getSheetByName("DPOS_Active_Week");
  if (!weekSheet) {
    return { success: false, message: "DPOS_Active_Week sheet not found" };
  }

  const values = weekSheet.getDataRange().getValues();
  if (values.length <= 1) {
    return { success: false, message: "No active DPOS training row found in DPOS_Active_Week" };
  }

  // Find bottom-most filled row
  let activeRow = null;
  for (let i = values.length - 1; i >= 1; i--) {
    if (values[i][0] && String(values[i][0]).trim()) {
      activeRow = values[i];
      break;
    }
  }

  if (!activeRow) {
    return { success: false, message: "No valid DPOS training week found" };
  }

  const topicTitle = String(activeRow[0]).trim();
  const clinicalSummary = String(activeRow[1] || "");
  const skus = String(activeRow[2] || "");
  const quizJson = String(activeRow[3] || "[]");
  const persona = String(activeRow[4] || "");
  const promo = String(activeRow[5] || "");

  // Find staff info & user's personal score if available
  let myScore = null;
  let userStaffName = "";
  let userRole = "Staff";

  if (username) {
    const staffSheet = getStaffSheet(ss);
    if (staffSheet) {
      const sData = staffSheet.getDataRange().getValues();
      const uLower = String(username).trim().toLowerCase();
      for (let i = 1; i < sData.length; i++) {
        if (String(sData[i][0]).trim().toLowerCase() === uLower) {
          userStaffName = String(sData[i][2]).trim();
          userRole = String(sData[i][3]).trim();
          break;
        }
      }
    }
  }

  // Lookup personal score in DPOS_Weekly_Scores
  const scoreSheet = ss.getSheetByName("DPOS_Weekly_Scores");
  if (scoreSheet && userStaffName) {
    const scoreData = scoreSheet.getDataRange().getValues();
    const uStaffLower = userStaffName.toLowerCase();
    const topicLower = topicTitle.toLowerCase();
    for (let i = 1; i < scoreData.length; i++) {
      const rowStaff = String(scoreData[i][1] || '').trim().toLowerCase();
      const rowTopic = String(scoreData[i][3] || '').trim().toLowerCase();
      if ((rowStaff === uStaffLower || uStaffLower.includes(rowStaff) || rowStaff.includes(uStaffLower)) && rowTopic === topicLower) {
        myScore = {
          timestamp: scoreData[i][0],
          staffName: scoreData[i][1],
          role: scoreData[i][2],
          topicTitle: scoreData[i][3],
          quizScore: scoreData[i][4],
          rolePlayScore: scoreData[i][5],
          languageUsed: scoreData[i][6],
          speakingConfidenceRating: scoreData[i][7],
          status: scoreData[i][8] || 'Completed'
        };
        break;
      }
    }
  }

  const canReview = isDposReviewer(username, userRole);
  const geminiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY") || "";

  return {
    success: true,
    week: {
      topic: topicTitle,
      summaryMd: clinicalSummary,
      skus: skus,
      quizJson: quizJson,
      persona: persona,
      promo: promo
    },
    mine: myScore,
    canReview: canReview,
    geminiKey: geminiKey
  };
}

function dposSaveScore(req) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: "Could not obtain lock to save score. Please try again." };
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let scoreSheet = ss.getSheetByName("DPOS_Weekly_Scores");
    if (!scoreSheet) {
      scoreSheet = ss.insertSheet("DPOS_Weekly_Scores");
      scoreSheet.appendRow(["Timestamp", "Staff_Name", "Role", "Topic_Title", "Quiz_Score", "RolePlay_Score", "Language_Used", "Speaking_Confidence_Rating", "Status", "Transcript", "Coaching_Tip", "Breakdown_Json"]);
    } else if (scoreSheet.getLastColumn() < 12) {
      scoreSheet.getRange(1, 1, 1, 12).setValues([["Timestamp", "Staff_Name", "Role", "Topic_Title", "Quiz_Score", "RolePlay_Score", "Language_Used", "Speaking_Confidence_Rating", "Status", "Transcript", "Coaching_Tip", "Breakdown_Json"]]);
    }

    const username = String(req.username || '').trim();
    let staffName = String(req.staffName || '').trim();
    let role = String(req.role || 'Staff').trim();

    // Verify staff name from master sheet
    if (username) {
      const staffSheet = getStaffSheet(ss);
      if (staffSheet) {
        const sData = staffSheet.getDataRange().getValues();
        const uLower = username.toLowerCase();
        for (let i = 1; i < sData.length; i++) {
          if (String(sData[i][0]).trim().toLowerCase() === uLower) {
            staffName = String(sData[i][2]).trim();
            role = String(sData[i][3]).trim();
            break;
          }
        }
      }
    }

    if (!staffName) {
      staffName = username || "Teammate";
    }

    const topicTitle = String(req.topicTitle || 'DPOS Training').trim();
    const quizScore = req.quizScore !== undefined && req.quizScore !== null ? Number(req.quizScore) : null;
    const rolePlayScore = req.rolePlayScore !== undefined && req.rolePlayScore !== null ? Number(req.rolePlayScore) : null;
    const languageUsed = String(req.languageUsed || '').trim();
    const confidenceRating = String(req.speakingConfidenceRating || '').trim();
    
    const tz = ss.getSpreadsheetTimeZone() || "Asia/Kuala_Lumpur";
    const timestampStr = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss");

    const scoreData = scoreSheet.getDataRange().getValues();
    let foundRowIndex = -1;
    const staffLower = staffName.toLowerCase();
    const topicLower = topicTitle.toLowerCase();

    for (let i = 1; i < scoreData.length; i++) {
      const rowStaff = String(scoreData[i][1] || '').trim().toLowerCase();
      const rowTopic = String(scoreData[i][3] || '').trim().toLowerCase();
      if ((rowStaff === staffLower || staffLower.includes(rowStaff) || rowStaff.includes(staffLower)) && rowTopic === topicLower) {
        foundRowIndex = i + 1; // 1-indexed for Sheet API
        break;
      }
    }

    let existingQuiz = null;
    let existingRolePlay = null;
    let existingLang = "";
    let existingConf = "";
    let existingTranscript = "";
    let existingCoaching = "";
    let existingBreakdown = "";

    if (foundRowIndex > 0) {
      const currentRow = scoreData[foundRowIndex - 1];
      existingQuiz = (currentRow[4] !== "" && currentRow[4] !== null) ? Number(currentRow[4]) : null;
      existingRolePlay = (currentRow[5] !== "" && currentRow[5] !== null) ? Number(currentRow[5]) : null;
      existingLang = String(currentRow[6] || "");
      existingConf = String(currentRow[7] || "");
      existingTranscript = String(currentRow[9] || "");
      existingCoaching = String(currentRow[10] || "");
      existingBreakdown = String(currentRow[11] || "");
    }

    const finalQuiz = (quizScore !== null) ? quizScore : existingQuiz;
    const finalRolePlay = (rolePlayScore !== null) ? rolePlayScore : existingRolePlay;
    const finalLang = languageUsed || existingLang;
    const finalConf = confidenceRating || existingConf;
    const isCompleted = (finalQuiz !== null && finalRolePlay !== null);
    const finalStatus = isCompleted ? "Completed" : "In Progress";
    const finalTranscript = req.transcript || existingTranscript || "";
    const finalCoaching = req.coachingTip || existingCoaching || "";
    const finalBreakdown = req.breakdown || existingBreakdown || "";

    const rowValues = [
      timestampStr,
      staffName,
      role,
      topicTitle,
      finalQuiz !== null ? finalQuiz : "",
      finalRolePlay !== null ? finalRolePlay : "",
      finalLang,
      finalConf,
      finalStatus,
      finalTranscript,
      finalCoaching,
      finalBreakdown
    ];

    if (foundRowIndex > 0) {
      scoreSheet.getRange(foundRowIndex, 1, 1, 12).setValues([rowValues]);
    } else {
      scoreSheet.appendRow(rowValues);
    }

    return {
      success: true,
      saved: {
        timestamp: timestampStr,
        staffName: staffName,
        role: role,
        topicTitle: topicTitle,
        quizScore: finalQuiz,
        rolePlayScore: finalRolePlay,
        languageUsed: finalLang,
        speakingConfidenceRating: finalConf,
        status: finalStatus
      }
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function dposGetReview(req) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const username = String(req.username || '').trim();
  const role = String(req.role || '').trim();

  if (!isDposReviewer(username, role)) {
    return { success: false, message: "Unauthorized. Review dashboard is reserved for Pharmacist / Management." };
  }

  const weekSheet = ss.getSheetByName("DPOS_Active_Week");
  let activeTopic = "Week 1: Joint Health & Osteoarthritis Care";
  if (weekSheet) {
    const wVals = weekSheet.getDataRange().getValues();
    for (let i = wVals.length - 1; i >= 1; i--) {
      if (wVals[i][0]) {
        activeTopic = String(wVals[i][0]).trim();
        break;
      }
    }
  }

  // 1. Read DPOS_Weekly_Scores
  const scoreMap = {};
  const scoreSheet = ss.getSheetByName("DPOS_Weekly_Scores");
  if (scoreSheet) {
    const sData = scoreSheet.getDataRange().getValues();
    const topicLower = activeTopic.toLowerCase();
    for (let i = 1; i < sData.length; i++) {
      const rowTopic = String(sData[i][3] || '').trim().toLowerCase();
      if (rowTopic === topicLower) {
        const sName = String(sData[i][1] || '').trim();
        scoreMap[sName.toLowerCase()] = {
          timestamp: sData[i][0],
          staffName: sName,
          role: sData[i][2],
          quizScore: sData[i][4] !== "" ? Number(sData[i][4]) : null,
          rolePlayScore: sData[i][5] !== "" ? Number(sData[i][5]) : null,
          languageUsed: sData[i][6] || '-',
          confidence: sData[i][7] || '-',
          status: sData[i][8] || 'In Progress',
          transcript: sData[i][9] || '',
          coachingTip: sData[i][10] || '',
          breakdown: sData[i][11] || ''
        };
      }
    }
  }

  // 2. Read Active Kota Sentosa Roster
  const staffSheet = getStaffSheet(ss);
  const masterRoster = [];
  if (staffSheet) {
    const mData = staffSheet.getDataRange().getValues();
    for (let i = 1; i < mData.length; i++) {
      const b = String(mData[i][4] || '').trim().toUpperCase();
      const st = String(mData[i][7] || '').trim().toLowerCase();
      const sName = String(mData[i][2] || '').trim();
      const sNameLower = sName.toLowerCase();
      const sRole = String(mData[i][3] || '').trim();

      if (st === 'inactive' || sNameLower.includes("daniela") || sNameLower.includes("janet") || sNameLower.includes("ngu chuin") || sNameLower.includes("public medicare") || sRole.toLowerCase() === 'hq') {
        continue;
      }
      if (b === "KOTA SENTOSA" || b === "ALL") {
        masterRoster.push({
          username: mData[i][0],
          name: sName,
          role: sRole
        });
      }
    }
  }

  // 3. Compute Weekly Sales for Kota Sentosa (Mon-Sun around latest date)
  const salesSheet = ss.getSheetByName("DailySales");
  const weeklySalesMap = {};
  let weekLabel = "Current Week";

  if (salesSheet) {
    const sData = salesSheet.getDataRange().getValues();
    let maxDate = new Date(0);
    // Find latest sales date for Kota Sentosa
    for (let i = 1; i < sData.length; i++) {
      if (String(sData[i][1] || '').trim().toUpperCase() === "KOTA SENTOSA") {
        const d = new Date(sData[i][0]);
        if (d > maxDate) maxDate = d;
      }
    }

    if (maxDate.getTime() > 0) {
      // Find Monday of that week
      const dayOfWeek = maxDate.getDay(); // 0 is Sun, 1 is Mon
      const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      const monday = new Date(maxDate);
      monday.setDate(maxDate.getDate() + diffToMon);
      monday.setHours(0,0,0,0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23,59,59,999);

      const tz = ss.getSpreadsheetTimeZone() || "Asia/Kuala_Lumpur";
      weekLabel = `${Utilities.formatDate(monday, tz, "dd MMM")} – ${Utilities.formatDate(sunday, tz, "dd MMM yyyy")}`;

      for (let i = 1; i < sData.length; i++) {
        if (String(sData[i][1] || '').trim().toUpperCase() === "KOTA SENTOSA") {
          const d = new Date(sData[i][0]);
          if (d >= monday && d <= sunday) {
            const sName = String(sData[i][2] || '').trim().toLowerCase();
            if (!weeklySalesMap[sName]) weeklySalesMap[sName] = { ts: 0, hb: 0 };
            weeklySalesMap[sName].ts += parseFloat(sData[i][3]) || 0;
            weeklySalesMap[sName].hb += parseFloat(sData[i][4]) || 0;
          }
        }
      }
    }
  }

  // Combine Roster with Scores & Sales
  const results = masterRoster.map(m => {
    const mLower = m.name.toLowerCase();
    // match score
    let score = scoreMap[mLower];
    if (!score) {
      const matchKey = Object.keys(scoreMap).find(k => k.includes(mLower) || mLower.includes(k));
      if (matchKey) score = scoreMap[matchKey];
    }

    // match sales
    let sales = weeklySalesMap[mLower];
    if (!sales) {
      const matchKey = Object.keys(weeklySalesMap).find(k => k.includes(mLower) || mLower.includes(k));
      if (matchKey) sales = weeklySalesMap[matchKey];
    }

    const ts = sales ? sales.ts : 0;
    const hb = sales ? sales.hb : 0;
    const hbPct = ts > 0 ? ((hb / ts) * 100).toFixed(1) : "0.0";

    const qScore = score ? score.quizScore : null;
    const rpScore = score ? score.rolePlayScore : null;
    const isCompleted = qScore !== null && rpScore !== null;
    const needsCoaching = !isCompleted || (qScore !== null && qScore < 7) || (rpScore !== null && rpScore < 70);

    return {
      name: m.name,
      role: m.role,
      username: m.username,
      quizScore: qScore,
      rolePlayScore: rpScore,
      language: score ? score.languageUsed : '-',
      confidence: score ? score.confidence : '-',
      status: isCompleted ? 'Completed' : (qScore !== null || rpScore !== null ? 'In Progress' : 'Not Started'),
      weeklyTs: ts,
      weeklyHb: hb,
      weeklyHbPct: hbPct,
      needsCoaching: needsCoaching,
      transcript: score ? (score.transcript || '') : '',
      coachingTip: score ? (score.coachingTip || '') : '',
      breakdown: score ? (score.breakdown || '') : ''
    };
  });

  return {
    success: true,
    topicTitle: activeTopic,
    weekRange: weekLabel,
    roster: results
  };
}

function geminiProxy(req) {
  try {
    const rawKeys = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY") || "";
    const keyList = rawKeys.split(/[\s,;]+/).map(function(k) { return k.replace(/['"]/g, '').trim(); }).filter(function(k) { return k.length >= 10; });
    if (keyList.length === 0) {
      return { success: false, code: "NO_KEY", message: "Script Property GEMINI_API_KEY is not set in Apps Script." };
    }

    const requestedModel = String(req.model || 'gemini-3.5-flash-lite').trim();
    var candidateModels = [
      requestedModel,
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-1.5-flash'
    ].filter(function(m, idx, arr) { return m && arr.indexOf(m) === idx; });

    const payload = {
      contents: req.contents
    };
    if (req.systemInstruction) {
      payload.systemInstruction = req.systemInstruction;
    }
    if (req.generationConfig) {
      payload.generationConfig = req.generationConfig;
    }

    var lastError = "";
    for (var k = 0; k < keyList.length; k++) {
      var curKey = keyList[k];
      for (var m = 0; m < candidateModels.length; m++) {
        var chosenModel = candidateModels[m];
        var url = "https://generativelanguage.googleapis.com/v1beta/models/" + chosenModel + ":generateContent?key=" + curKey;
        var options = {
          method: "post",
          contentType: "application/json",
          headers: {
            "x-goog-api-key": curKey
          },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        };

        try {
          var resp = UrlFetchApp.fetch(url, options);
          var code = resp.getResponseCode();
          var text = resp.getContentText();

          if (code >= 200 && code < 300) {
            return { success: true, data: JSON.parse(text) };
          } else {
            var errJson = null;
            try { errJson = JSON.parse(text); } catch (e) {}
            var errMsg = (errJson && errJson.error && errJson.error.message) ? errJson.error.message : text;
            lastError = "Key #" + (k + 1) + " (" + chosenModel + ") HTTP " + code + ": " + errMsg;
            if (code === 429 || errMsg.toLowerCase().indexOf('quota') !== -1 || errMsg.toLowerCase().indexOf('resource_exhausted') !== -1) {
              break; // Skip to next key if quota exceeded
            }
          }
        } catch (e) {
          lastError = "Key #" + (k + 1) + " (" + chosenModel + ") fetch error: " + e.toString();
        }
      }
    }

    return { success: false, message: lastError || "All backend Gemini API keys failed." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function saveBackendGeminiApiKey(req) {
  const username = String(req.adminUsername || req.username || '').trim().toLowerCase().replace(/\s+/g, '');
  const role = String(req.role || 'Pharmacist').trim();
  if (isDposReviewer(username, role) || username === 'williamchai' || username === 'william') {
    const rawKey = String(req.apiKey || '').trim();
    const cleanKeys = rawKey.split(/[\s,;]+/).map(function(k) { return k.replace(/['"]/g, '').trim(); }).filter(function(k) { return k.length >= 10; });
    if (cleanKeys.length > 0) {
      PropertiesService.getScriptProperties().setProperty("GEMINI_API_KEY", cleanKeys.join(", "));
      return { success: true, count: cleanKeys.length, message: "Gemini API keys (" + cleanKeys.length + ") saved to server script properties." };
    }
  }
  return { success: false, message: "Unauthorized or invalid key length." };
}
