const { google } = require('googleapis');

const SHEET_ID = process.env.SHEET_ID;
const TAB = process.env.SHEET_TAB || 'Schedules';
const KEY_PATH = process.env.GOOGLE_KEY_PATH;

// Column order fixed by the sheet: ID, Phone, Message, ScheduleTime, Frequency, Status, LastRun, Purpose
const COL = { ID: 0, PHONE: 1, MESSAGE: 2, SCHEDULE_TIME: 3, FREQUENCY: 4, STATUS: 5, LAST_RUN: 6, PURPOSE: 7 };

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function readRows(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A2:H`,
  });
  return res.data.values || [];
}

// rowNumber is 1-indexed as it appears in the sheet (row 2 = first data row)
async function updateRow(sheets, rowNumber, { scheduleTime, status, lastRun }) {
  const data = [];
  if (scheduleTime !== undefined) {
    data.push({ range: `${TAB}!D${rowNumber}`, values: [[scheduleTime]] });
  }
  if (status !== undefined) {
    data.push({ range: `${TAB}!F${rowNumber}`, values: [[status]] });
  }
  if (lastRun !== undefined) {
    data.push({ range: `${TAB}!G${rowNumber}`, values: [[lastRun]] });
  }
  if (data.length === 0) return;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data },
  });
}

module.exports = { getSheetsClient, readRows, updateRow, COL };
