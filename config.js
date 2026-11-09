'use strict';
const fs = require('fs');
const path = require('path');

// Charge .env s'il existe (Node >= 20.12). Les variables déjà définies gardent la priorité.
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile(envFile); } catch (e) { console.warn('[config] .env illisible :', e.message); }
}

const env = process.env;
const isProd = env.NODE_ENV === 'production';
const num = (v, d) => { const n = Number(v); return Number.isFinite(n) && v !== undefined && v !== '' ? n : d; };

const config = {
  isProd,
  port: num(env.PORT, 3000),
  siteUrl: (env.SITE_URL || 'http://localhost:' + num(env.PORT, 3000)).replace(/\/+$/, ''),
  dataDir: path.resolve(env.DATA_DIR || path.join(__dirname, '..', 'data')),
  publicDir: path.resolve(env.PUBLIC_DIR || path.join(__dirname, '..', '..', 'public')),
  sessionDays: num(env.SESSION_DAYS, 30),
  // Derrière un proxy (Render, Railway, Nginx...), mettre TRUST_PROXY=1
  trustProxy: env.TRUST_PROXY || (isProd ? '1' : ''),
  cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : isProd,
  bcryptRounds: num(env.BCRYPT_ROUNDS, 12),
  adminEmails: (env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  smtpUrl: env.SMTP_URL || '',
  mailFrom: env.MAIL_FROM || 'Spora <no-reply@localhost>',
  maxPhotoBytes: num(env.MAX_PHOTO_BYTES, 600 * 1024),
};
config.dbFile = path.join(config.dataDir, 'spora.db');
config.uploadDir = path.join(config.dataDir, 'uploads');
fs.mkdirSync(config.uploadDir, { recursive: true });
module.exports = config;
