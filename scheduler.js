require('dotenv').config();
const { connect } = require('./lib/whatsapp');
const { getSheetsClient } = require('./lib/sheets');
const { makeGroupResolver } = require('./lib/groups');
const { runOnce } = require('./lib/poll');

const POLL_MS = Number(process.env.POLL_INTERVAL_MS || 5 * 60 * 1000);
const GROUP_REFRESH_MS = 60 * 60 * 1000;

async function main() {
  const sock = await connect();
  const sheets = getSheetsClient();
  const groupResolver = makeGroupResolver(sock);

  await groupResolver.refresh();
  setInterval(() => groupResolver.refresh().catch((e) => console.error('Group refresh failed:', e.message)), GROUP_REFRESH_MS);

  console.log(`Polling sheet every ${POLL_MS / 1000}s.`);
  const poll = () => runOnce(sock, sheets, groupResolver).catch((e) => console.error('Poll failed:', e.message));
  poll();
  setInterval(poll, POLL_MS);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
