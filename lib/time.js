// Sheet times are always entered in IST (Asia/Kolkata), regardless of which
// timezone the host machine (or CI runner) actually runs in.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function pad(n) {
  return String(n).padStart(2, '0');
}

function parseScheduleTime(value) {
  const [datePart, timePart] = value.trim().split(' ');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi] = (timePart || '0:0').split(':').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi) - IST_OFFSET_MS);
}

function istParts(date) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
    seconds: shifted.getUTCSeconds(),
  };
}

function formatScheduleTime(date) {
  const p = istParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)} ${pad(p.hours)}:${pad(p.minutes)}`;
}

function formatLastRun(date) {
  const p = istParts(date);
  return `${p.month}/${p.day}/${p.year} ${p.hours}:${pad(p.minutes)}:${pad(p.seconds)}`;
}

function nextOccurrence(date, frequency) {
  const next = new Date(date);
  switch ((frequency || '').trim().toLowerCase()) {
    case 'daily':
      next.setUTCDate(next.getUTCDate() + 1);
      return next;
    case 'weekly':
      next.setUTCDate(next.getUTCDate() + 7);
      return next;
    case 'monthly':
      next.setUTCMonth(next.getUTCMonth() + 1);
      return next;
    default:
      return null; // one-off, no recurrence
  }
}

module.exports = { parseScheduleTime, formatScheduleTime, formatLastRun, nextOccurrence };
