'use strict';
const crypto = require('crypto');

const newToken = () => crypto.randomBytes(32).toString('base64url');
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
const inDays = d => new Date(Date.now() + d * 86400000).toISOString().replace('T', ' ').slice(0, 19);
const inMinutes = m => new Date(Date.now() + m * 60000).toISOString().replace('T', ' ').slice(0, 19);

function ageFrom(dob, now = new Date()) {
  const b = new Date(dob + 'T00:00:00Z');
  if (Number.isNaN(b.getTime())) return null;
  let a = now.getUTCFullYear() - b.getUTCFullYear();
  const m = now.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) a--;
  return a;
}

// "Prénom Nom" -> "Prénom N."
function shortName(full) {
  const p = String(full || '').trim().split(/\s+/);
  if (p.length < 2) return p[0] || '';
  return p[0] + ' ' + p[p.length - 1].charAt(0).toUpperCase() + '.';
}

const likeEscape = s => String(s).replace(/[\\%_]/g, c => '\\' + c);

class HttpError extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}

const planActive = u => u.plan && u.plan !== 'gratuit' && (!u.plan_until || u.plan_until >= new Date().toISOString().slice(0, 10));

module.exports = { newToken, sha256, inDays, inMinutes, ageFrom, shortName, likeEscape, HttpError, planActive };
