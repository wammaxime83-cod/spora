'use strict';
const db = require('./db');
const config = require('./config');
const { sha256, HttpError } = require('./util');

const COOKIE = 'spora_sid';

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

// Charge l'utilisateur de la session (si présente).
async function loadUser(req, res, next) {
  req.user = null;
  const tok = parseCookies(req)[COOKIE];
  if (tok && tok.length < 200) {
    const row = await db.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > datetime('now')`).get(sha256(tok));
    if (row && !row.is_admin && config.adminEmails.includes(String(row.email).toLowerCase())) {
      // Compte créé avant que ADMIN_EMAILS soit renseigné : on le promeut automatiquement.
      await db.prepare("UPDATE users SET is_admin = 1, status = 'verifie' WHERE id = ?").run(row.id);
      row.is_admin = 1; row.status = 'verifie';
    }
    if (row) { req.user = row; req.sessionHash = sha256(tok); }
  }
  next();
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: config.cookieSecure, path: '/',
    maxAge: config.sessionDays * 86400000,
  });
}
const clearSessionCookie = res => res.clearCookie(COOKIE, { path: '/', httpOnly: true, sameSite: 'lax', secure: config.cookieSecure });

const requireAuth = async (req, res, next) => (req.user ? next() : next(new HttpError(401, 'Connecte-toi pour continuer.', 'auth')));
const requireAdmin = async (req, res, next) => (req.user && req.user.is_admin ? next() : next(new HttpError(403, 'Accès réservé.', 'forbidden')));

// Protection CSRF : les requêtes qui modifient des données doivent venir de notre site
// (en-tête Origin ou Referer) et être en JSON.
function sameOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const o = req.headers.origin || req.headers.referer;
  if (!o) return next(new HttpError(403, 'Origine manquante.', 'csrf'));
  let host;
  try { host = new URL(o).host; } catch { return next(new HttpError(403, 'Origine invalide.', 'csrf')); }
  const allowed = new Set([req.headers.host, new URL(config.siteUrl).host]);
  if (!allowed.has(host)) return next(new HttpError(403, 'Origine refusée.', 'csrf'));
  if (req.method !== 'DELETE' && !req.is('application/json') && !req.is('video/*') && Number(req.headers['content-length'] || 0) > 0) {
    return next(new HttpError(415, 'JSON attendu.', 'type'));
  }
  next();
}

async function audit(actor, action, target, detail) {
  await db.prepare('INSERT INTO audit (actor, action, target, detail) VALUES (?,?,?,?)').run(actor || null, action, target || null, detail ? String(detail).slice(0, 500) : null);
}

module.exports = { COOKIE, parseCookies, loadUser, setSessionCookie, clearSessionCookie, requireAuth, requireAdmin, sameOrigin, audit };
