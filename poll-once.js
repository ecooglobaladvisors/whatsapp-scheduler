require('dotenv').config();
const { connect } = require('./lib/whatsapp');
const { getSheetsClient } = require('./lib/sheets');
const { makeGroupResolver } = require('./lib/groups');
const { runOnce } = require('./lib/poll');

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

async function main() {
  const sock = await withTimeout(connect(), 60_000, 'Timed out connecting to WhatsApp (session missing or invalid — needs re-pairing)');
  const sheets = getSheetsClient();
  const groupResolver = makeGroupResolver(sock);

  await groupResolver.refresh();
  await runOnce(sock, sheets, groupResolver);

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
