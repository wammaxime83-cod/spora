'use strict';
const express = require('express');
const db = require('../db');
const { shortName } = require('../util');
const V = require('../validators');
const { HttpError, ageFrom } = require('../util');
const { requireAuth, audit } = require('../middleware');
const { savePhoto, removePhoto } = require('../photos');
const { publicUser } = require('./auth');

const router = express.Router();
router.use(requireAuth);

async function loadProfile(userId) {
  const p = await db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
  return p ? { ...JSON.parse(p.data || '{}'), has_photo: !!p.has_photo, minor: !!p.minor } : {};
}

router.get('/profile', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ user: publicUser(req.user), profile: await loadProfile(req.user.id) });
});

router.put('/profile', async (req, res, next) => {
  try {
    const b = req.body || {};
    const u = req.user;
    const pr = V.profileSchemas[u.role].safeParse(b.profile);
    if (!pr.success) { const e = V.firstError(pr.error); throw new HttpError(400, e.message, 'profile.' + e.field); }
    const prof = pr.data;
    await db.tx(async t => {
      await t.prepare('UPDATE profiles SET data=?, dob=?, nat=?, city=?, pos=?, lvl=?, updated_at=datetime(\'now\') WHERE user_id=?')
        .run(JSON.stringify(prof), prof.dob || null, prof.nat || prof.ctry || null, prof.city || null, prof.pos || null, prof.lvl || null, u.id);
      if (typeof b.name === 'string' && b.name.trim().length >= 2 && b.name.length <= 80) await t.prepare('UPDATE users SET name=? WHERE id=?').run(b.name.trim(), u.id);
      if (typeof b.tel === 'string' && b.tel.length <= 30) await t.prepare('UPDATE users SET tel=? WHERE id=?').run(b.tel.trim() || null, u.id);
    });
    if (b.remove_photo && u.role === 'joueur') throw new HttpError(400, 'La photo de profil est obligatoire pour les joueurs : remplace-la au lieu de la retirer.', 'photo');
    if (b.remove_photo) { await removePhoto(u.id); await db.prepare('UPDATE profiles SET has_photo=0, photo_mime=NULL WHERE user_id=?').run(u.id); }
    else if (b.photo) { const mime = await savePhoto(u.id, b.photo); await db.prepare('UPDATE profiles SET has_photo=1, photo_mime=? WHERE user_id=?').run(mime, u.id); }
    // Toute modification d'un profil déjà refusé le remet en attente de vérification.
    if (u.status === 'refuse') await db.prepare("UPDATE users SET status='en_attente', status_note=NULL WHERE id=?").run(u.id);
    const fresh = await db.prepare('SELECT * FROM users WHERE id=?').get(u.id);
    res.json({ user: publicUser(fresh), profile: await loadProfile(u.id) });
  } catch (e) { next(e); }
});

// Droit d'accès / portabilité (RGPD)
router.get('/export', async (req, res) => {
  const u = req.user;
  const contacts = await db.prepare('SELECT * FROM contacts WHERE from_user=? OR to_user=?').all(u.id, u.id);
  const { pass_hash, ...safe } = u;
  await audit(u.id, 'export', u.id);
  res.set('Content-Disposition', 'attachment; filename="spora-mes-donnees.json"');
  res.json({ exported_at: new Date().toISOString(), account: safe, profile: await loadProfile(u.id), contacts });
});

// Mes mises en relation (envoyées et reçues). Les coordonnées (e-mail, téléphone) ne sont JAMAIS transmises :
// une fois la demande acceptée, les échanges passent par le chat de Spora.
router.get('/contacts', async (req, res) => {
  const u = req.user;
  const rows = await db.prepare(`SELECT c.*, fu.name AS from_name, fu.role AS from_role, tu.name AS to_name, tu.role AS to_role,
      (SELECT COUNT(*) FROM chat_messages m WHERE m.contact_id=c.id AND m.sender_id<>? AND m.read_at IS NULL) AS unread
    FROM contacts c JOIN users fu ON fu.id=c.from_user JOIN users tu ON tu.id=c.to_user
    WHERE c.from_user=? OR c.to_user=? ORDER BY c.created_at DESC LIMIT 200`).all(u.id, u.id, u.id);
  res.set('Cache-Control', 'no-store');
  res.json({ contacts: rows.map(r => {
    const incoming = r.to_user === u.id;
    const other = incoming ? { id: r.from_user, name: r.from_name, role: r.from_role } : { id: r.to_user, name: r.to_name, role: r.to_role };
    return { id: r.id, direction: incoming ? 'recu' : 'envoye', status: r.status, message: r.message, created_at: r.created_at, unread: r.unread || 0,
      other: { id: other.id, name: other.role === 'joueur' ? other.name : shortName(other.name), role: other.role } };
  }) });
});

router.put('/contacts/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = req.body && req.body.status;
    if (!['accepte', 'refuse'].includes(status)) throw new HttpError(400, 'Statut invalide.');
    const c = await db.prepare('SELECT * FROM contacts WHERE id=? AND to_user=?').get(id, req.user.id);
    if (!c) throw new HttpError(404, 'Demande introuvable.');
    await db.prepare("UPDATE contacts SET status=?, answered_at=datetime('now') WHERE id=?").run(status, id);
    await audit(req.user.id, 'contact_' + status, id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
