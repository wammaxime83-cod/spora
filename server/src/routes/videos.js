'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const config = require('../config');
const cl = require('../cloudinary');
const { HttpError, shortName } = require('../util');
const { requireAuth, audit } = require('../middleware');

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Trop de demandes. Réessaie plus tard.' } });
const item = r => ({ id: r.id, title: r.title, duration: r.duration, created_at: r.created_at, ...cl.urls(r.public_id) });

// ---- Mes vidéos (joueur connecté) ----
const me = express.Router();
me.use(requireAuth);
const onlyPlayer = () => {}; // tous les membres inscrits peuvent publier
const count = async uid => (await db.get('SELECT COUNT(*) n FROM videos WHERE user_id=?', [uid])).n;

me.get('/videos', async (req, res) => {
  const rows = await db.all('SELECT * FROM videos WHERE user_id=? ORDER BY id DESC', [req.user.id]);
  res.set('Cache-Control', 'no-store');
  res.json({ mode: cl.enabled() ? 'cloud' : (config.localVideos ? 'local' : null), enabled: cl.enabled() || config.localVideos, max: config.maxVideos, max_seconds: config.maxVideoSeconds, videos: rows.map(item) });
});

me.post('/videos/sign', limiter, async (req, res) => {
  onlyPlayer(req);
  if (await count(req.user.id) >= config.maxVideos) throw new HttpError(400, `Tu as atteint la limite de ${config.maxVideos} vidéos. Supprime-en une pour en ajouter.`);
  res.json(cl.uploadTicket(req.user.id));
});

// Mode test (sans Cloudinary) : le fichier est envoyé tel quel au serveur.
const sniff = b => (b.length > 12 && b.subarray(4, 8).toString() === 'ftyp') || (b.length > 4 && b.readUInt32BE(0) === 0x1a45dfa3);
me.post('/videos/local', limiter, express.raw({ type: 'video/*', limit: config.maxLocalVideoBytes }), async (req, res) => {
  if (cl.enabled() || !config.localVideos) throw new HttpError(404, 'Introuvable.');
  if (await count(req.user.id) >= config.maxVideos) throw new HttpError(400, `Tu as atteint la limite de ${config.maxVideos} vidéos.`);
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || !buf.length) throw new HttpError(400, 'Aucun fichier reçu.');
  if (!sniff(buf)) throw new HttpError(400, 'Ce fichier n\'est pas une vidéo MP4, MOV ou WebM.');
  const id = require('crypto').randomBytes(12).toString('hex');
  await require('fs').promises.mkdir(config.videoDir, { recursive: true });
  await require('fs').promises.writeFile(require('path').join(config.videoDir, id), buf);
  const title = String(req.query.title || '').trim().slice(0, 80);
  const r = await db.run('INSERT INTO videos (user_id, public_id, title, duration, bytes) VALUES (?,?,?,?,?)', [req.user.id, 'local:' + id, title || null, 0, buf.length]);
  await audit(req.user.id, 'video_added', Number(r.lastInsertRowid));
  res.status(201).json({ ok: true });
});

me.post('/videos', limiter, async (req, res) => {
  onlyPlayer(req);
  const b = req.body || {};
  const pid = String(b.public_id || '');
  if (!cl.idOk(req.user.id, pid)) throw new HttpError(400, 'Vidéo invalide.');
  if (await db.get('SELECT 1 FROM videos WHERE public_id=?', [pid])) throw new HttpError(409, 'Vidéo déjà ajoutée.');
  if (await count(req.user.id) >= config.maxVideos) { await cl.destroy(pid); throw new HttpError(400, `Limite de ${config.maxVideos} vidéos atteinte.`); }
  const info = await cl.inspect(pid);
  if (!info) throw new HttpError(400, 'Vidéo introuvable : l\'envoi n\'a pas abouti.');
  if (info.duration > config.maxVideoSeconds) { await cl.destroy(pid); throw new HttpError(400, `Vidéo trop longue (${Math.floor(config.maxVideoSeconds / 60)} min maximum).`); }
  const title = typeof b.title === 'string' ? b.title.trim().slice(0, 80) : '';
  const r = await db.run('INSERT INTO videos (user_id, public_id, title, duration, bytes) VALUES (?,?,?,?,?)', [req.user.id, pid, title || null, info.duration, info.bytes]);
  await audit(req.user.id, 'video_added', Number(r.lastInsertRowid));
  res.status(201).json({ ok: true });
});

me.delete('/videos/:id', async (req, res) => {
  const v = await db.get('SELECT * FROM videos WHERE id=? AND user_id=?', [Number(req.params.id), req.user.id]);
  if (!v) throw new HttpError(404, 'Vidéo introuvable.');
  await db.run('DELETE FROM videos WHERE id=?', [v.id]);
  await cl.destroy(v.public_id);
  res.json({ ok: true });
});

// ---- Fil public (Highlights) : vidéos des joueurs vérifiés ----
const feed = express.Router();
feed.get('/', async (req, res) => {
  const rows = await db.all(`SELECT v.*, u.name, u.role, u.id AS uid, p.pos, p.nat FROM videos v JOIN users u ON u.id=v.user_id JOIN profiles p ON p.user_id=u.id
    WHERE u.status='verifie' ORDER BY v.id DESC LIMIT 30`);
  res.json({ videos: rows.map(r => ({ ...item(r), player: { id: r.uid, role: r.role, name: shortName(r.name), pos: r.pos, nat: r.nat } })) });
});

// Supprime les vidéos d'un compte chez Cloudinary (avant suppression du compte).
async function purgeUserVideos(uid) {
  const rows = await db.all('SELECT public_id FROM videos WHERE user_id=?', [uid]);
  await Promise.allSettled(rows.map(r => cl.destroy(r.public_id)));
}

module.exports = { me, feed, purgeUserVideos };
