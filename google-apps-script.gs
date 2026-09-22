/**
 * Muhammad & Salma — Wedding Invitation backend
 * ---------------------------------------------------------------
 * Saves guest wishes and RSVP replies into this Google Sheet, and
 * sends the latest wishes back to the invitation's wishes wall.
 *
 * Setup (full steps in README.md):
 *   1. Google Sheet → Extensions → Apps Script → paste this file → Save
 *   2. Deploy → New deployment → type: Web app
 *        Execute as: Me
 *        Who has access: Anyone
 *   3. Copy the Web app URL into CONFIG.googleSheetWebAppUrl in script.js
 *
 * After editing this file, deploy again:
 *   Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy
 *
 * To hide a wish from the wall: type x in its "Hide" column.
 * ---------------------------------------------------------------
 */

const WISHES_SHEET = "Wishes";
const RSVP_SHEET = "RSVP";
const WALL_LIMIT = 40;

const HEADERS = {
  [WISHES_SHEET]: ["Timestamp", "Name", "Wish", "Language", "Hide (type x)"],
  [RSVP_SHEET]: ["Timestamp", "Name", "Response", "Guests", "Note", "Language"]
};

/* ---------- Receives wishes and RSVPs ---------- */

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) || {};

    // Honeypot: real guests never see this field, bots fill it in.
    if (p.website) return json_({ result: "ok" });

    const language = p.lang === "ar" ? "Arabic" : "English";

    if (p.type === "rsvp") {
      const name = clean_(p.name, 60);
      if (!name) return json_({ result: "error", message: "Name is required" });
      const attending = p.attending === "yes";
      const guests = attending ? Math.max(1, Math.min(20, parseInt(p.guests, 10) || 1)) : 0;
      sheet_(RSVP_SHEET).appendRow([
        new Date(),
        name,
        attending ? "Attending" : "Not attending",
        guests,
        clean_(p.note, 200),
        language
      ]);
      return json_({ result: "ok" });
    }

    // Default: a wish
    const name = clean_(p.name, 60);
    const wish = clean_(p.wish, 500);
    if (!name || !wish) return json_({ result: "error", message: "Name and wish are required" });
    sheet_(WISHES_SHEET).appendRow([new Date(), name, wish, language, ""]);
    return json_({ result: "ok" });

  } catch (err) {
    return json_({ result: "error", message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e) { /* lock was never taken */ }
  }
}

/* ---------- Sends the latest wishes to the wall ---------- */

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action !== "wishes") return json_({ result: "ready" });

  const sheet = sheet_(WISHES_SHEET);
  const rows = sheet.getLastRow() - 1;
  if (rows < 1) return json_({ result: "ok", wishes: [] });

  const values = sheet.getRange(2, 1, rows, 5).getValues();
  const wishes = [];
  for (let i = values.length - 1; i >= 0 && wishes.length < WALL_LIMIT; i--) {
    const [, name, wish, , hide] = values[i];
    if (!name || !wish) continue;
    if (String(hide).trim() !== "") continue; // anything typed in "Hide" hides it
    wishes.push({ name: unguard_(name), wish: unguard_(wish) });
  }
  return json_({ result: "ok", wishes: wishes });
}

/* ---------- Helpers ---------- */

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    const headers = HEADERS[name];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#E1E9F4");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Trims, limits length, and stops text from being run as a spreadsheet formula.
function clean_(value, max) {
  let s = String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

// Removes the formula guard before showing text on the wall.
function unguard_(value) {
  const s = String(value);
  return /^'[=+\-@]/.test(s) ? s.slice(1) : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
