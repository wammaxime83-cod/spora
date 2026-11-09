'use strict';
const db = require('./db');
const config = require('./config');
const { HttpError } = require('./util');

const MAGIC = {
  'image/jpeg': b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': b => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP',
};

// Valide une image reçue en data URL et l'enregistre dans la base. Retourne le type MIME.
// Contrôle l'image (type réel, taille) sans l'enregistrer.
function checkPhoto(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) throw new HttpError(400, 'Image non valide (JPEG, PNG ou WebP).', 'photo');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > config.maxPhotoBytes) throw new HttpError(413, 'Image trop lourde (600 Ko maximum).', 'photo');
  if (!MAGIC[m[1]](buf)) throw new HttpError(400, 'Le fichier n\'est pas une vraie image.', 'photo');
  return { mime: m[1], buf };
}
async function savePhoto(userId, dataUrl, ex = db) {
  const { mime, buf } = checkPhoto(dataUrl);
  await ex.run('INSERT INTO photos (user_id, mime, data) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET mime=excluded.mime, data=excluded.data', [userId, mime, buf]);
  return mime;
}
async function getPhoto(id) {
  const r = await db.get('SELECT mime, data FROM photos WHERE user_id=?', [Number(id)]);
  return r ? { mime: r.mime, data: Buffer.from(r.data) } : null;
}
const removePhoto = id => db.run('DELETE FROM photos WHERE user_id=?', [Number(id)]);

module.exports = { checkPhoto, savePhoto, getPhoto, removePhoto };
