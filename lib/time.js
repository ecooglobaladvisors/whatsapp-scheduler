function pad(n) {
  return String(n).padStart(2, '0');
}

// Parses "YYYY-MM-DD HH:mm" as local time
function parseScheduleTime(value) {
  return new Date(value.trim().replace(' ', 'T'));
}

function formatScheduleTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatLastRun(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function nextOccurrence(date, frequency) {
  const next = new Date(date);
  switch ((frequency || '').trim().toLowerCase()) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      return next;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      return next;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      return next;
    default:
      return null; // one-off, no recurrence
  }
}

module.exports = { parseScheduleTime, formatScheduleTime, formatLastRun, nextOccurrence };
