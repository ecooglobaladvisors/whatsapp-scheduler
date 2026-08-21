const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const AUTH_DIR = path.join(__dirname, '..', 'auth');

function toJid(number) {
  if (number.includes('@')) return number;
  const digits = number.replace(/[^0-9]/g, '');
  return `${digits}@s.whatsapp.net`;
}

async function connect({ onOpen } = {}) {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  return new Promise((resolve, reject) => {
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\nScan this QR code with WhatsApp (Linked Devices > Link a device):\n');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        console.log('Connected to WhatsApp.');
        if (onOpen) onOpen(sock);
        resolve(sock);
      }

      if (connection === 'close') {
        const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        if (loggedOut) {
          console.error('Session logged out. Delete the auth/ folder and re-scan the QR code.');
          reject(new Error('logged_out'));
          return;
        }

        console.log('Connection closed, reconnecting...');
        connect({ onOpen }).then(resolve).catch(reject);
      }
    });
  });
}

module.exports = { connect, toJid };
