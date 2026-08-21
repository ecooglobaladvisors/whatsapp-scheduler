const { toJid } = require('./whatsapp');
const { readRows, updateRow, COL } = require('./sheets');
const { parseScheduleTime, formatScheduleTime, formatLastRun, nextOccurrence } = require('./time');

function resolveDestination(phoneCell, groupResolver) {
  const value = phoneCell.trim();
  if (value.toLowerCase().startsWith('group:')) {
    return groupResolver.resolve(value.slice('group:'.length));
  }
  return toJid(value);
}

async function runOnce(sock, sheets, groupResolver) {
  const rows = await readRows(sheets);
  const now = new Date();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // sheet is 1-indexed and has a header row
    const status = (row[COL.STATUS] || '').trim().toLowerCase();
    const scheduleCell = row[COL.SCHEDULE_TIME];
    if (status !== 'pending' || !scheduleCell) continue;

    const scheduledAt = parseScheduleTime(scheduleCell);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt > now) continue;

    const id = row[COL.ID] || `row ${rowNumber}`;
    try {
      const jid = resolveDestination(row[COL.PHONE] || '', groupResolver);
      await sock.sendMessage(jid, { text: row[COL.MESSAGE] || '' });
      console.log(`Sent "${id}" to ${row[COL.PHONE]}`);

      const next = nextOccurrence(scheduledAt, row[COL.FREQUENCY]);
      await updateRow(sheets, rowNumber, {
        status: next ? 'Pending' : 'Sent',
        lastRun: formatLastRun(now),
        ...(next ? { scheduleTime: formatScheduleTime(next) } : {}),
      });
    } catch (err) {
      console.error(`Failed to send "${id}": ${err.message}`);
      await updateRow(sheets, rowNumber, { status: 'Error', lastRun: formatLastRun(now) });
    }
  }
}

module.exports = { runOnce, resolveDestination };
