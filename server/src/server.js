'use strict';
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const db = require('./db');
const { loadUser, sameOrigin } = require('./middleware');
const { HttpError } = require('./util');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
        'media-src': ["'self'", 'https://res.cloudinary.com'],
        'connect-src': ["'self'", 'https://api.cloudinary.com'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        ...(config.isProd ? { 'upgrade-insecure-requests': [] } : {}),
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: config.isProd ? undefined : false,
  }));
  app.use(compression());
  app.use((req, res, next) => { db.ready.then(() => next(), next); });
  app.use(express.json({ limit: '1mb' }));
  app.use(loadUser);

  app.get('/api/health', async (req, res) => { await db.get('SELECT 1 AS ok'); res.json({ ok: true }); });

  const api = express.Router();
  api.use(rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
  api.use(sameOrigin);
  api.use('/auth', require('./routes/auth'));
  const videos = require('./routes/videos');
  api.use('/me', require('./routes/profile'));
  api.use('/me', videos.me);
  api.use('/videos', videos.feed);
  const players = require('./routes/players');
  api.use('/agents', require('./routes/agents'));
  api.use('/chat', require('./routes/chat'));
  api.use('/players', players);
  api.use('/contacts', players.contacts);
  api.use('/guest', require('./routes/guests'));
  api.use('/admin', require('./routes/admin'));
  api.use((req, res) => res.status(404).json({ error: 'Introuvable.' }));
  app.use('/api', api);
  app.use('/uploads', players.uploads);

  // Fichiers statiques. index.html, robots.txt : {{SITE_URL}} est remplacé par l'adresse réelle.
  const tpl = {};
  const render = name => {
    if (!tpl[name]) tpl[name] = fs.readFileSync(path.join(config.publicDir, name), 'utf8').replaceAll('{{SITE_URL}}', config.siteUrl);
    return tpl[name];
  };
  app.get(['/', '/index.html'], (req, res) => res.type('html').set('Cache-Control', 'no-cache').send(render('index.html')));
  app.get('/robots.txt', (req, res) => res.type('text/plain').send(render('robots.txt')));
  app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${config.siteUrl}/</loc></url></urlset>`));
  if (fs.existsSync(path.join(config.publicDir, 'admin.html'))) {
    app.get('/admin', (req, res) => res.sendFile(path.join(config.publicDir, 'admin.html'), { headers: { 'X-Robots-Tag': 'noindex' } }));
  }
  app.use(express.static(config.publicDir, { index: false, maxAge: config.isProd ? '1d' : 0, setHeaders: (res, p) => { if (/\.(html|webmanifest|css|js)$/.test(p)) res.set('Cache-Control', 'no-cache'); } }));

  app.use((req, res) => res.status(404).type('text').send('Page introuvable.'));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON invalide.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Requête trop volumineuse.' });
    const status = err.status || 500;
    const known = err instanceof HttpError;
    if (status >= 500 && !known) console.error('[erreur]', err);
    res.status(status).json({ error: status >= 500 && !known ? 'Erreur du serveur.' : err.message, field: err.code });
  });
  return app;
}

module.exports = { createApp };

if (require.main === module) {
  const app = createApp();
  const srv = app.listen(config.port, () => console.log(`Spora en ligne sur ${config.siteUrl} (port ${config.port}) — base : ${config.dbUrl.startsWith('file:') ? 'fichier local' : 'Turso'}`));
  db.ready.catch(e => { console.error('Base de données inaccessible :', e.message); process.exit(1); });
  const stop = () => srv.close(() => { db.close(); process.exit(0); });
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
