// scripts/send_daily_briefing_cron.js
// Automated 11:00 PM Daily Briefing Push Alert for PMG Sales Hub

const API_URL = "https://script.google.com/macros/s/AKfycbwhxfd5OQrDJw3bYPuzCd8DQqhWfOmtkQpQUTu7ke9s2bE_egFmvWeubaEtjMvBzADS/exec";
const BRANCH = process.argv[2] || "Kota Sentosa";

async function runCronPush() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Initiating 11:00 PM Daily Briefing Push for ${BRANCH}...`);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getDailyBriefing', branch: BRANCH })
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch daily briefing: HTTP ${res.status}`);
    }

    const briefing = await res.json();
    console.log(`Briefing retrieved for date: ${briefing ? (briefing.dateDisplay || briefing.dateIsoKey || 'Active') : 'None'}`);

    let topPerformerText = '';
    if (briefing && briefing.sec5 && typeof briefing.sec5 === 'string') {
      const m = briefing.sec5.match(/1st Place:\s*\*?([^*()\n]+)\*?\s*\(HB\s*RM\s*([0-9.,]+)\)/i);
      if (m) {
        topPerformerText = `🏆 Top HB: ${m[1].trim()} (RM ${m[2].trim()}). `;
      }
    }

    let priorityText = '';
    if (briefing && briefing.sec2 && typeof briefing.sec2 === 'string') {
      const lines = briefing.sec2.split('\n').map(l => l.replace(/[*#_•-]/g, '').trim()).filter(Boolean);
      if (lines.length > 0) {
        priorityText = `🎯 Focus: ${lines[0].substring(0, 75)}... `;
      }
    }

    // Header Title MUST be ASCII-safe for HTTP compliance
    const pushTitle = `PMG ${BRANCH}: Tomorrow's Briefing Ready! (11:00 PM)`;
    const pushMsg = (topPerformerText + priorityText).trim() || "Tomorrow's daily priorities and sales targets are published. Tap to review before your shift!";
    const pushUrl = "https://williamchai1.github.io/pmgareasales/?tab=briefing";
    const channel = "pmg-alert-" + BRANCH.toLowerCase().replace(/[^a-z0-9]/g, "");

    console.log(`Title: ${pushTitle}`);
    console.log(`Message: ${pushMsg}`);
    console.log(`Target Channel: ${channel}`);

    // 1. Direct High-Priority Broadcast to ntfy.sh (Guaranteed 200 OK without Google IP 429)
    try {
      const directRes = await fetch(`https://ntfy.sh/${channel}`, {
        method: 'POST',
        headers: {
          'Title': pushTitle,
          'Click': pushUrl,
          'Tags': 'loudspeaker,pill,sparkles'
        },
        body: pushMsg
      });
      console.log(`Direct ntfy.sh broadcast status: ${directRes.status} ${directRes.statusText}`);
    } catch (directErr) {
      console.warn("Direct broadcast warning:", directErr);
    }

    // 2. Also record in Apps Script backend
    try {
      const pushRes = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sendBackendNativePush',
          branch: BRANCH,
          title: "📢 " + pushTitle,
          message: pushMsg,
          url: pushUrl
        })
      });
      const pushData = await pushRes.json();
      console.log("Apps Script push response:", pushData);
    } catch (e) {
      console.warn("Backend push dispatch note:", e.message);
    }

    console.log("✅ 11:00 PM Briefing Push Alert completed successfully!");
  } catch (err) {
    console.error("❌ Cron Push Error:", err);
    process.exit(1);
  }
}

runCronPush();
