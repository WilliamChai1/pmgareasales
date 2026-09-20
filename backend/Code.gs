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
      
      // EXCLUDE HQ STAFF DYNAMICALLY OR BY NAME
      if (sRole.toLowerCase() === 'hq' || sNameLower.includes("ngu chuin") || sNameLower.includes("public medicare")) {
        continue; 
      }

      let rowDate = new Date(salesData[i][0]);
      if(rowDate > latestDate) latestDate = rowDate;

      if (!staffMap[sName]) {
        staffMap[sName] = { name: sName, role: sRole, mtdTs: 0, mtdHb: 0, mtdHm: 0, dailyTs: 0, dailyHb: 0, dailyHm: 0, dailyCust: 0, lastDate: new Date(0) };
        branchStaffList.push({ name: sName, role: sRole });
      }
      
      let ts = parseFloat(salesData[i][3]) || 0;
      let hb = parseFloat(salesData[i][4]) || 0;
      let hm = parseFloat(salesData[i][5]) || 0;
      let cust = parseInt(salesData[i][6]) || 0;

      staffMap[sName].mtdTs += ts;
      staffMap[sName].mtdHb += hb;
      staffMap[sName].mtdHm += hm;

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

  return { 
    targets: targets, summary: summary, staff: staff, history: history,
    actionPlan: actionPlan, amNote: amNote, branches: originalBranchNames, currentDay: currentDayOfMonth,
    daysInMonth: daysInMonth, pendingUsers: pendingUsers
  };
}
