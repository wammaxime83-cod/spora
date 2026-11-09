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
  await db.run('DELETE FROM video_likes WHERE video_id=?', [v.id]);
  await db.run('DELETE FROM video_comments WHERE video_id=?', [v.id]);
  await db.run('DELETE FROM videos WHERE id=?', [v.id]);
  await cl.destroy(v.public_id);
  res.json({ ok: true });
});

// ---- Fil public (Highlights) : vidéos des joueurs vérifiés ----
const feed = express.Router();
const interLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Trop d\'actions. Réessaie dans quelques minutes.' } });
const publicVideo = id => db.get("SELECT v.id FROM videos v JOIN users u ON u.id=v.user_id WHERE v.id=? AND u.status='verifie'", [id]);

feed.get('/', async (req, res) => {
  const uid = req.user ? req.user.id : 0;
  const rows = await db.all(`SELECT v.*, u.name, u.role, u.id AS uid, p.pos, p.nat,
      (SELECT COUNT(*) FROM video_likes l WHERE l.video_id=v.id) AS likes,
      (SELECT COUNT(*) FROM video_comments c WHERE c.video_id=v.id) AS comments,
      (SELECT COUNT(*) FROM video_likes l WHERE l.video_id=v.id AND l.user_id=?) AS liked
    FROM videos v JOIN users u ON u.id=v.user_id JOIN profiles p ON p.user_id=u.id
    WHERE u.status='verifie' ORDER BY v.id DESC LIMIT 100`, [uid]);
  res.set('Cache-Control', 'no-store');
  res.json({ videos: rows.map(r => ({ ...item(r), likes: r.likes, comments: r.comments, liked: !!r.liked, player: { id: r.uid, role: r.role, name: shortName(r.name), pos: r.pos, nat: r.nat } })) });
});

feed.post('/:id/like', requireAuth, interLimiter, async (req, res) => {
  const id = Number(req.params.id);
  if (!(await publicVideo(id))) throw new HttpError(404, 'Vidéo introuvable.');
  const had = await db.get('SELECT 1 FROM video_likes WHERE video_id=? AND user_id=?', [id, req.user.id]);
  if (had) await db.run('DELETE FROM video_likes WHERE video_id=? AND user_id=?', [id, req.user.id]);
  else await db.run('INSERT INTO video_likes (video_id, user_id) VALUES (?,?)', [id, req.user.id]);
  const n = (await db.get('SELECT COUNT(*) n FROM video_likes WHERE video_id=?', [id])).n;
  res.json({ liked: !had, likes: n });
});

feed.get('/:id/comments', async (req, res) => {
  const id = Number(req.params.id);
  if (!(await publicVideo(id))) return res.json({ comments: [] });
  const rows = await db.all(`SELECT c.id, c.body, c.created_at, c.user_id, u.name FROM video_comments c JOIN users u ON u.id=c.user_id WHERE c.video_id=? ORDER BY c.id DESC LIMIT 50`, [id]);
  const uid = req.user ? req.user.id : 0, adm = !!(req.user && req.user.is_admin);
  res.set('Cache-Control', 'no-store');
  res.json({ comments: rows.map(r => ({ id: r.id, body: r.body, created_at: r.created_at, name: shortName(r.name), mine: r.user_id === uid || adm })) });
});

feed.post('/:id/comments', requireAuth, interLimiter, async (req, res) => {
  const id = Number(req.params.id);
  if (!(await publicVideo(id))) throw new HttpError(404, 'Vidéo introuvable.');
  const body = String((req.body || {}).body || '').replace(/\s+/g, ' ').trim();
  if (!body) throw new HttpError(400, 'Écris un commentaire.');
  if (body.length > 500) throw new HttpError(400, 'Commentaire trop long (500 caractères maximum).');
  const r = await db.run('INSERT INTO video_comments (video_id, user_id, body) VALUES (?,?,?)', [id, req.user.id, body]);
  res.status(201).json({ ok: true, id: Number(r.lastInsertRowid) });
});

feed.delete('/comments/:cid', requireAuth, async (req, res) => {
  const c = await db.get('SELECT * FROM video_comments WHERE id=?', [Number(req.params.cid)]);
  if (!c) throw new HttpError(404, 'Commentaire introuvable.');
  if (c.user_id !== req.user.id && !req.user.is_admin) throw new HttpError(403, 'Action non autorisée.');
  await db.run('DELETE FROM video_comments WHERE id=?', [c.id]);
  res.json({ ok: true });
});

// Supprime les vidéos d'un compte chez Cloudinary (avant suppression du compte).
async function purgeUserVideos(uid) {
  const rows = await db.all('SELECT public_id FROM videos WHERE user_id=?', [uid]);
  await Promise.allSettled(rows.map(r => cl.destroy(r.public_id)));
}

module.exports = { me, feed, purgeUserVideos };
