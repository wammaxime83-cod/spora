'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const V = require('../validators');
const { HttpError, ageFrom, shortName, likeEscape, planActive } = require('../util');
const { requireAuth, audit } = require('../middleware');
const { sendMail } = require('../mailer');
const { getPhoto } = require('../photos');

const router = express.Router();
const ORDER = { elite: 3, premium: 2, standard: 1, gratuit: 0 };

// Fiche publique : jamais d'e-mail ni de téléphone ; ville et photo masquées pour les mineurs.
function card(row, full) {
  const d = JSON.parse(row.data || '{}');
  const plan = planActive(row) ? row.plan : 'gratuit';
  const out = {
    id: row.id, name: shortName(row.name), age: ageFrom(row.dob), nat: row.nat, pos: row.pos, lvl: row.lvl,
    city: row.city, photo: row.has_photo ? `/uploads/avatars/${row.id}` : null,
    featured: plan === 'premium' || plan === 'elite', plan, videos: row.vcount || 0,
  };
  // Fiche complète : tout sauf l'e-mail et le téléphone.
  if (full) Object.assign(out, { name: row.name, dob: row.dob || null, res: d.res || null, pos2: d.pos2 && d.pos2.length ? d.pos2 : null, foot: d.foot || null, h: d.h || null, w: d.w || null, club: d.club || null, bio: d.bio || null });
  return out;
}

const SELECT = `SELECT u.id, u.name, u.plan, u.plan_until, p.data, p.dob, p.nat, p.city, p.pos, p.lvl, p.has_photo, (SELECT COUNT(*) FROM videos v WHERE v.user_id = u.id) AS vcount, p.minor
  FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.role='joueur' AND u.status='verifie' AND u.is_admin=0`;

router.get('/', async (req, res) => {
  const q = req.query;
  const where = []; const args = [];
  if (q.pos && V.POSITIONS.includes(String(q.pos))) { where.push('p.pos = ?'); args.push(String(q.pos)); }
  if (q.nat && V.COUNTRIES.includes(String(q.nat))) { where.push('p.nat = ?'); args.push(String(q.nat)); }
  if (q.lvl && V.LEVELS.includes(String(q.lvl))) { where.push('p.lvl = ?'); args.push(String(q.lvl)); }
  if (q.q) { where.push("u.name LIKE ? ESCAPE '\\'"); args.push('%' + likeEscape(String(q.q).slice(0, 60)) + '%'); }
  const amin = parseInt(q.agemin, 10), amax = parseInt(q.agemax, 10);
  if (amax >= 0) { where.push("p.dob >= date('now', ?)"); args.push(`-${amax + 1} years`); }
  if (amin >= 0) { where.push("p.dob <= date('now', ?)"); args.push(`-${amin} years`); }
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 12, 1), 24);
  const page = Math.max(parseInt(q.page, 10) || 1, 1);
  const sql = SELECT + (where.length ? ' AND ' + where.join(' AND ') : '');
  const total = (await db.prepare(`SELECT COUNT(*) n FROM (${sql})`).get(...args)).n;
  // Les profils Premium / Élite actifs sont mis en avant en tête de liste.
  const rows = await db.prepare(sql + ` ORDER BY (CASE WHEN u.plan IN ('premium','elite') AND (u.plan_until IS NULL OR u.plan_until >= date('now')) THEN 1 ELSE 0 END) DESC, u.id DESC LIMIT ? OFFSET ?`)
    .all(...args, limit, (page - 1) * limit);
  res.json({ total, page, limit, players: rows.map(r => card(r, false)) });
});

router.get('/:id/videos', async (req, res) => {
  const cl = require('../cloudinary');
  const ok = await db.get("SELECT 1 FROM users WHERE id=? AND status='verifie' AND is_admin=0", [Number(req.params.id)]);
  if (!ok) return res.json({ videos: [] });
  const rows = await db.all('SELECT * FROM videos WHERE user_id=? ORDER BY id DESC', [Number(req.params.id)]);
  res.json({ videos: rows.map(r => ({ id: r.id, title: r.title, ...cl.urls(r.public_id) })) });
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await db.prepare(SELECT + ' AND u.id = ?').get(Number(req.params.id));
    if (!row) throw new HttpError(404, 'Profil introuvable.');
    res.json({ player: card(row, true) });
  } catch (e) { next(e); }
});

module.exports = router;

// ---- Mise en relation (agents / clubs vérifiés → joueurs majeurs) ----
const contactLimiter = rateLimit({ windowMs: 24 * 3600 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Limite quotidienne de demandes atteinte.' } });
const contactsRouter = express.Router();
contactsRouter.post('/', requireAuth, contactLimiter, async (req, res, next) => {
  try {
    const p = V.contact.safeParse(req.body);
    if (!p.success) { const e = V.firstError(p.error); throw new HttpError(400, e.message); }
    const me = req.user;
    if (me.role === 'joueur') throw new HttpError(403, 'Seuls les agents et clubs peuvent contacter un joueur.');
    if (me.status !== 'verifie') throw new HttpError(403, 'Ton profil doit d\'abord être vérifié par l\'équipe Spora.');
    const to = await db.prepare("SELECT u.* FROM users u WHERE u.id=? AND u.role='joueur' AND u.status='verifie' AND u.is_admin=0").get(p.data.to);
    if (!to) throw new HttpError(404, 'Joueur introuvable.');
    if (await db.prepare('SELECT 1 FROM contacts WHERE from_user=? AND to_user=?').get(me.id, to.id)) throw new HttpError(409, 'Tu as déjà envoyé une demande à ce joueur.');
    await db.prepare('INSERT INTO contacts (from_user, to_user, message) VALUES (?,?,?)').run(me.id, to.id, p.data.message);
    await audit(me.id, 'contact_sent', to.id);
    sendMail(to.email, 'Nouvelle demande sur Spora', `Bonjour ${to.name},\n\n${shortName(me.name)} (${me.role}) souhaite entrer en contact avec toi sur Spora. Connecte-toi pour lire le message et répondre :\n${require('../config').siteUrl}/#espace\n`).catch(() => {});
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

// Photo d'un joueur (uniquement si profil vérifié, ou si c'est son propre compte / un admin)
const uploadsRouter = express.Router();
uploadsRouter.get('/avatars/:id', async (req, res) => {
  const id = Number(req.params.id);
  const row = await db.get('SELECT p.has_photo, u.status FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=?', [id]);
  const self = req.user && (req.user.id === id || req.user.is_admin);
  if (!row || !row.has_photo || (!self && row.status !== 'verifie')) return res.status(404).end();
  const ph = await getPhoto(id);
  if (!ph) return res.status(404).end();
  res.set({ 'Content-Type': ph.mime, 'Cache-Control': self ? 'private, no-cache' : 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' });
  res.send(ph.data);
});

// Vidéos enregistrées sur le serveur (mode test) : lecture avec Range, uniquement si le propriétaire est vérifié (ou c'est lui / un admin)
uploadsRouter.get('/videos/:id', async (req, res) => {
  const id = String(req.params.id);
  if (!/^[a-f0-9]{24}$/.test(id)) return res.status(404).end();
  const v = await db.get("SELECT v.user_id, u.status FROM videos v JOIN users u ON u.id=v.user_id WHERE v.public_id=?", ['local:' + id]);
  const self = req.user && v && (req.user.id === v.user_id || req.user.is_admin);
  if (!v || (!self && v.status !== 'verifie')) return res.status(404).end();
  res.sendFile(require('path').join(require('../config').videoDir, id), { headers: { 'Content-Type': 'video/mp4', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=300' } }, () => {});
});

module.exports.contacts = contactsRouter;
module.exports.uploads = uploadsRouter;
