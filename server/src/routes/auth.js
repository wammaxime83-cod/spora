'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const config = require('../config');
const V = require('../validators');
const { newToken, sha256, inDays, inMinutes, ageFrom, HttpError } = require('../util');
const { setSessionCookie, clearSessionCookie, requireAuth, audit } = require('../middleware');
const { sendMail } = require('../mailer');
const { savePhoto, checkPhoto } = require('../photos');

const router = express.Router();
const DUMMY = bcrypt.hashSync('spora-dummy-password', 10); // évite de révéler si un e-mail existe (temps de réponse)

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false, message: { error: 'Trop de tentatives. Réessaie dans quelques minutes.' } });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: config.registerLimit, standardHeaders: true, legacyHeaders: false, message: { error: 'Trop d\'inscriptions depuis cette adresse. Réessaie plus tard.' } });

function publicUser(u) {
  return { id: u.id, email: u.email, role: u.is_guest ? 'invite' : u.role, name: u.name, tel: u.tel || null, status: u.status, status_note: u.status_note || null,
    plan: u.plan, plan_until: u.plan_until || null, is_admin: !!u.is_admin, email_verified: !!u.email_verified };
}

async function createSession(res, userId, req) {
  const token = newToken();
  await db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at, ua) VALUES (?,?,?,?)')
    .run(userId, sha256(token), inDays(config.sessionDays), String(req.headers['user-agent'] || '').slice(0, 200));
  setSessionCookie(res, token);
}

async function sendVerification(user) {
  const token = newToken();
  await db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND kind = 'verify'").run(user.id);
  await db.prepare('INSERT INTO email_tokens (user_id, kind, token_hash, expires_at) VALUES (?,?,?,?)').run(user.id, 'verify', sha256(token), inDays(3));
  await sendMail(user.email, 'Confirme ton adresse e-mail Spora',
    `Bonjour ${user.name},\n\nBienvenue sur Spora. Confirme ton adresse e-mail avec ce lien (valable 3 jours) :\n${config.siteUrl}/api/auth/verify?token=${token}\n\nSi tu n'es pas à l'origine de cette inscription, ignore ce message.`);
}

router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const p = V.register.safeParse(req.body);
    if (!p.success) { const e = V.firstError(p.error); throw new HttpError(400, e.message, e.field); }
    const d = p.data;
    if (V.isWeak(d.password, d.email)) throw new HttpError(400, 'Ce mot de passe est trop facile à deviner.', 'password');
    const pr = V.profileSchemas[d.role].safeParse(d.profile);
    if (!pr.success) { const e = V.firstError(pr.error); throw new HttpError(400, e.message, 'profile.' + e.field); }
    const prof = pr.data;

    if (await db.prepare('SELECT 1 FROM users WHERE email = ?').get(d.email)) throw new HttpError(409, 'Un compte existe déjà avec cette adresse e-mail.', 'email');

    const isAdmin = config.adminEmails.includes(d.email) ? 1 : 0;
    const isGuest = d.role === 'invite' ? 1 : 0;
    const dbRole = isGuest ? 'joueur' : d.role; // un invité n'a pas de rôle métier : stocké comme membre simple, marqué is_guest
    const hash = await bcrypt.hash(d.password, config.bcryptRounds);
    // Photo de profil : obligatoire pour les joueurs, contrôlée avant de créer le compte.
    if (d.role === 'joueur' && !d.photo) throw new HttpError(400, 'La photo de profil est obligatoire pour les joueurs.', 'photo');
    if (d.photo) checkPhoto(d.photo);
    let id;
    try {
      id = await db.tx(async t => {
        const r = await t.prepare('INSERT INTO users (email, pass_hash, role, name, tel, status, is_admin, is_guest) VALUES (?,?,?,?,?,?,?,?)')
          .run(d.email, hash, dbRole, d.name, d.tel || null, (isAdmin || isGuest) ? 'verifie' : 'en_attente', isAdmin, isGuest);
        const uid = Number(r.lastInsertRowid);
        await t.prepare('INSERT INTO profiles (user_id, data, dob, nat, city, pos, lvl, minor) VALUES (?,?,?,?,?,?,?,?)')
          .run(uid, JSON.stringify(prof), prof.dob || null, prof.nat || prof.ctry || null, prof.city || null, prof.pos || null, prof.lvl || null, 0);
        if (isGuest) await t.prepare('INSERT INTO guests (country, who, interests, email) VALUES (?,?,?,?)').run(prof.ctry, prof.who || null, JSON.stringify(prof.see || []), d.email);
        if (d.photo) { const mime = await savePhoto(uid, d.photo, t); await t.prepare('UPDATE profiles SET has_photo = 1, photo_mime = ? WHERE user_id = ?').run(mime, uid); }
        return uid;
      });
    } catch (e) {
      if (/UNIQUE|constraint/i.test(String(e.message))) throw new HttpError(409, 'Un compte existe déjà avec cette adresse e-mail.', 'email');
      throw e;
    }
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    await audit(id, 'register', id, d.role);
    await createSession(res, id, req);
    sendVerification(user).catch(() => {});
    res.status(201).json({ user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const p = V.login.safeParse(req.body);
    if (!p.success) throw new HttpError(400, 'E-mail ou mot de passe invalide.');
    const u = await db.prepare('SELECT * FROM users WHERE email = ?').get(p.data.email);
    const ok = await bcrypt.compare(p.data.password, u ? u.pass_hash : DUMMY);
    if (!u || !ok) throw new HttpError(401, 'E-mail ou mot de passe incorrect.');
    await db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(u.id);
    await createSession(res, u.id, req);
    res.json({ user: publicUser(u) });
  } catch (e) { next(e); }
});

router.post('/logout', async (req, res) => {
  if (req.sessionHash) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(req.sessionHash);
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ user: req.user ? publicUser(req.user) : null });
});

router.get('/verify', async (req, res) => {
  const t = String(req.query.token || '');
  const row = t ? await db.prepare("SELECT * FROM email_tokens WHERE token_hash = ? AND kind = 'verify' AND expires_at > datetime('now')").get(sha256(t)) : null;
  if (row) {
    await db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(row.user_id);
    await db.prepare('DELETE FROM email_tokens WHERE id = ?').run(row.id);
  }
  res.redirect('/#connexion' + (row ? '' : ''));
});

router.post('/resend-verification', authLimiter, requireAuth, async (req, res) => {
  if (!req.user.email_verified) await sendVerification(req.user);
  res.json({ ok: true });
});

router.post('/forgot', authLimiter, async (req, res, next) => {
  try {
    const p = V.login.pick({ email: true }).safeParse({ email: req.body && req.body.email });
    if (p.success) {
      const u = await db.prepare('SELECT * FROM users WHERE email = ?').get(p.data.email);
      if (u) {
        const token = newToken();
        await db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND kind = 'reset'").run(u.id);
        await db.prepare('INSERT INTO email_tokens (user_id, kind, token_hash, expires_at) VALUES (?,?,?,?)').run(u.id, 'reset', sha256(token), inMinutes(60));
        sendMail(u.email, 'Réinitialise ton mot de passe Spora',
          `Bonjour ${u.name},\n\nPour choisir un nouveau mot de passe (lien valable 1 heure) :\n${config.siteUrl}/#reinitialiser?token=${token}\n\nSi tu n'as rien demandé, ignore ce message.`).catch(() => {});
      }
    }
    res.json({ ok: true }); // même réponse que l'adresse existe ou non
  } catch (e) { next(e); }
});

router.post('/reset', authLimiter, async (req, res, next) => {
  try {
    const token = String((req.body && req.body.token) || '');
    const pw = String((req.body && req.body.password) || '');
    if (pw.length < 8 || pw.length > 200) throw new HttpError(400, '8 caractères minimum.', 'password');
    const row = token ? await db.prepare("SELECT * FROM email_tokens WHERE token_hash = ? AND kind = 'reset' AND expires_at > datetime('now')").get(sha256(token)) : null;
    if (!row) throw new HttpError(400, 'Lien expiré ou invalide. Demande un nouveau lien.');
    const u = await db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id);
    if (V.isWeak(pw, u.email)) throw new HttpError(400, 'Ce mot de passe est trop facile à deviner.', 'password');
    const hash = await bcrypt.hash(pw, config.bcryptRounds);
    await db.tx(async t => {
      await t.prepare('UPDATE users SET pass_hash = ?, email_verified = 1 WHERE id = ?').run(hash, u.id);
      await t.prepare('DELETE FROM email_tokens WHERE user_id = ?').run(u.id);
      await t.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id); // déconnecte les autres appareils
    });
    await audit(u.id, 'password_reset', u.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Suppression du compte (droit à l'effacement)
router.delete('/me', authLimiter, requireAuth, async (req, res, next) => {
  try {
    const pw = String((req.body && req.body.password) || '');
    if (!(await bcrypt.compare(pw, req.user.pass_hash))) throw new HttpError(403, 'Mot de passe incorrect.');
    await audit(req.user.id, 'account_deleted', req.user.id);
    await require('./videos').purgeUserVideos(req.user.id);
    await db.deleteUser(req.user.id);
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
module.exports.publicUser = publicUser;
