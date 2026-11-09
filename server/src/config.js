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
  registerLimit: num(env.REGISTER_LIMIT_PER_HOUR, 30),
  bcryptRounds: num(env.BCRYPT_ROUNDS, 12),
  adminEmails: (env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  smtpUrl: env.SMTP_URL || '',
  mailFrom: env.MAIL_FROM || 'Spora <no-reply@localhost>',
  maxPhotoBytes: num(env.MAX_PHOTO_BYTES, 600 * 1024),
};
config.dbFile = path.join(config.dataDir, 'spora.db');
// Production : base Turso (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN). Sinon : fichier local.
config.dbUrl = env.TURSO_DATABASE_URL || 'file:' + config.dbFile;
config.dbToken = env.TURSO_AUTH_TOKEN || '';
if (config.dbUrl.startsWith('file:')) fs.mkdirSync(config.dataDir, { recursive: true });

// Vidéos : stockées chez Cloudinary (offre gratuite). CLOUDINARY_URL=cloudinary://clé:secret@nom_du_cloud
(function () {
  let cloud = env.CLOUDINARY_CLOUD_NAME, key = env.CLOUDINARY_API_KEY, secret = env.CLOUDINARY_API_SECRET;
  const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(env.CLOUDINARY_URL || '');
  if (m) { key = m[1]; secret = m[2]; cloud = m[3]; }
  config.cloudinary = cloud && key && secret ? { cloud, key, secret } : null;
  config.maxVideos = num(env.MAX_VIDEOS, 3);
  // Sans Cloudinary : envoi direct sur le serveur (mode TEST : sur un hébergement gratuit, les fichiers peuvent être effacés).
  config.localVideos = env.LOCAL_VIDEOS !== 'off';
  config.maxLocalVideoBytes = num(env.MAX_LOCAL_VIDEO_MB, 30) * 1024 * 1024;
  config.videoDir = path.join(config.dataDir, 'videos');
  config.maxVideoSeconds = num(env.MAX_VIDEO_SECONDS, 180);
})();
module.exports = config;
