const { connect } = require('./lib/whatsapp');

connect().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
