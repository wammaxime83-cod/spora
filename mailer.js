'use strict';
const config = require('./config');

let transport = null;
if (config.smtpUrl) {
  try { transport = require('nodemailer').createTransport(config.smtpUrl); }
  catch (e) { console.warn('[mail] SMTP_URL invalide :', e.message); }
}

// Sans SMTP configuré, les e-mails sont écrits dans la console (utile en développement).
async function sendMail(to, subject, text) {
  if (!transport) {
    console.log(`[mail:console] à=${to} | ${subject}\n${text}\n`);
    return false;
  }
  try {
    await transport.sendMail({ from: config.mailFrom, to, subject, text });
    return true;
  } catch (e) {
    console.error('[mail] échec d\'envoi :', e.message);
    return false;
  }
}
module.exports = { sendMail };
