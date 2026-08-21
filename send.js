const { connect, toJid } = require('./lib/whatsapp');

async function main() {
  const [number, ...messageParts] = process.argv.slice(2);
  const message = messageParts.join(' ');

  if (!number || !message) {
    console.error('Usage: node send.js <number-with-country-code> <message>');
    console.error('Example: node send.js 919876543210 "Reminder: pay rent"');
    process.exit(1);
  }

  const sock = await connect();
  await sock.sendMessage(toJid(number), { text: message });
  console.log('Message sent.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to send:', err.message);
  process.exit(1);
});
