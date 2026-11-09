'use strict';
const express = require('express');
const db = require('../db');
const { HttpError } = require('../util');
const { requireAuth, requireAdmin, audit } = require('../middleware');

const router = express.Router();
router.use(requireAuth, requireAdmin);
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

router.get('/stats', async (req, res) => {
  const n = async (sql) => (await db.prepare(sql).get()).n;
  res.json({
    users: await n('SELECT COUNT(*) n FROM users'),
    joueurs: await n("SELECT COUNT(*) n FROM users WHERE role='joueur'"),
    agents: await n("SELECT COUNT(*) n FROM users WHERE role='agent'"),
    clubs: await n("SELECT COUNT(*) n FROM users WHERE role='club'"),
    en_attente: await n("SELECT COUNT(*) n FROM users WHERE status='en_attente'"),
    payants: await n("SELECT COUNT(*) n FROM users WHERE plan!='gratuit'"),
    invites: await n('SELECT COUNT(*) n FROM guests'),
    contacts: await n('SELECT COUNT(*) n FROM contacts'),
  });
});

router.get('/users', async (req, res) => {
  const st = ['en_attente', 'verifie', 'refuse'].includes(req.query.status) ? req.query.status : null;
  const rows = await db.prepare(`SELECT id,email,role,name,tel,status,status_note,plan,plan_until,email_verified,created_at,last_login FROM users
    ${st ? 'WHERE status = ?' : ''} ORDER BY created_at DESC LIMIT 200`).all(...(st ? [st] : []));
  res.json({ users: rows });
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const u = await db.prepare('SELECT id,email,role,name,tel,status,status_note,plan,plan_until,email_verified,created_at FROM users WHERE id=?').get(Number(req.params.id));
    if (!u) throw new HttpError(404, 'Introuvable.');
    const p = await db.prepare('SELECT data,has_photo,minor FROM profiles WHERE user_id=?').get(u.id);
    res.json({ user: u, profile: p ? { ...JSON.parse(p.data), has_photo: !!p.has_photo, minor: !!p.minor } : null });
  } catch (e) { next(e); }
});

router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { status, note } = req.body || {};
    if (!['en_attente', 'verifie', 'refuse'].includes(status)) throw new HttpError(400, 'Statut invalide.');
    const r = await db.prepare('UPDATE users SET status=?, status_note=? WHERE id=?').run(status, note ? String(note).slice(0, 300) : null, Number(req.params.id));
    if (!r.changes) throw new HttpError(404, 'Introuvable.');
    await audit(req.user.id, 'set_status', Number(req.params.id), status);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.put('/users/:id/plan', async (req, res, next) => {
  try {
    const { plan, until } = req.body || {};
    if (!['gratuit', 'standard', 'premium', 'elite'].includes(plan)) throw new HttpError(400, 'Offre invalide.');
    if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) throw new HttpError(400, 'Date invalide (AAAA-MM-JJ).');
    const r = await db.prepare('UPDATE users SET plan=?, plan_until=? WHERE id=?').run(plan, plan === 'gratuit' ? null : (until || null), Number(req.params.id));
    if (!r.changes) throw new HttpError(404, 'Introuvable.');
    await audit(req.user.id, 'set_plan', Number(req.params.id), plan + ' ' + (until || ''));
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) throw new HttpError(400, 'Tu ne peux pas supprimer ton propre compte ici.');
    await require('./videos').purgeUserVideos(id);
    const r = await db.deleteUser(id);
    if (!r.changes) throw new HttpError(404, 'Introuvable.');
    await audit(req.user.id, 'admin_delete', id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get('/videos', async (req, res) => {
  const cl = require('../cloudinary');
  const rows = await db.all('SELECT v.*, u.name, u.email FROM videos v JOIN users u ON u.id=v.user_id ORDER BY v.id DESC LIMIT 200');
  res.json({ videos: rows.map(r => ({ id: r.id, title: r.title, name: r.name, email: r.email, created_at: r.created_at, ...cl.urls(r.public_id) })) });
});
router.delete('/videos/:id', async (req, res, next) => {
  try {
    const v = await db.get('SELECT * FROM videos WHERE id=?', [Number(req.params.id)]);
    if (!v) throw new HttpError(404, 'Introuvable.');
    await db.run('DELETE FROM videos WHERE id=?', [v.id]);
    await require('../cloudinary').destroy(v.public_id);
    await audit(req.user.id, 'video_removed', v.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get('/guests', async (req, res) => {
  res.json({ guests: await db.prepare('SELECT * FROM guests ORDER BY id DESC LIMIT 500').all() });
});

module.exports = router;
