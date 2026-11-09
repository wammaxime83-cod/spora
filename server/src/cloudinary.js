'use strict';
const crypto = require('crypto');
const config = require('./config');
const { HttpError } = require('./util');

const FORMATS = 'mp4,mov,webm,m4v,3gp';
const need = () => { if (!config.cloudinary) throw new HttpError(503, 'L\'envoi de vidéos n\'est pas encore activé sur ce serveur.', 'video'); return config.cloudinary; };
const sign = (params, secret) => crypto.createHash('sha1').update(Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + secret).digest('hex');

// Paramètres signés pour un envoi direct depuis le navigateur (le fichier ne passe pas par notre serveur).
function uploadTicket(userId) {
  const c = need();
  const params = { allowed_formats: FORMATS, public_id: `spora/u${userId}/${crypto.randomBytes(8).toString('hex')}`, timestamp: Math.floor(Date.now() / 1000) };
  return { url: `https://api.cloudinary.com/v1_1/${c.cloud}/video/upload`, api_key: c.key, ...params, signature: sign(params, c.secret) };
}

const idOk = (userId, pid) => new RegExp(`^spora/u${Number(userId)}/[a-f0-9]{16}$`).test(String(pid));

// Vérifie auprès de Cloudinary que la vidéo existe, et lit sa durée et sa taille.
async function inspect(pid) {
  const c = need();
  const r = await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/resources/video/upload/${pid}`, { headers: { Authorization: 'Basic ' + Buffer.from(`${c.key}:${c.secret}`).toString('base64') } });
  if (!r.ok) return null;
  const j = await r.json();
  return { duration: Number(j.duration) || 0, bytes: Number(j.bytes) || 0 };
}

async function destroy(pid) {
  if (String(pid).startsWith('local:')) { require('fs').promises.unlink(require('path').join(config.videoDir, pid.slice(6))).catch(() => {}); return; }
  const c = config.cloudinary; if (!c) return;
  const params = { invalidate: 'true', public_id: pid, timestamp: Math.floor(Date.now() / 1000) };
  const body = new URLSearchParams({ ...params, api_key: c.key, signature: sign(params, c.secret) });
  await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/video/destroy`, { method: 'POST', body }).catch(() => {});
}

function urls(pid) {
  if (String(pid).startsWith('local:')) return { src: `/uploads/videos/${pid.slice(6)}`, poster: null };
  const c = config.cloudinary; if (!c) return { src: null, poster: null };
  const b = `https://res.cloudinary.com/${c.cloud}/video/upload`;
  return { src: `${b}/f_mp4,vc_h264,q_auto,w_720,c_limit/${pid}.mp4`, poster: `${b}/so_1,w_640,h_360,c_fill,q_auto/${pid}.jpg` };
}

module.exports = { uploadTicket, idOk, inspect, destroy, urls, enabled: () => !!config.cloudinary };
