'use strict';
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { HttpError } = require('./util');

const dir = path.join(config.uploadDir, 'avatars');
fs.mkdirSync(dir, { recursive: true });

const MAGIC = {
  'image/jpeg': b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': b => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': b => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP',
};

// Valide une image reçue en data URL et l'enregistre. Retourne le type MIME.
function savePhoto(userId, dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) throw new HttpError(400, 'Image non valide (JPEG, PNG ou WebP).', 'photo');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > config.maxPhotoBytes) throw new HttpError(413, 'Image trop lourde (600 Ko maximum).', 'photo');
  if (!MAGIC[m[1]](buf)) throw new HttpError(400, 'Le fichier n\'est pas une vraie image.', 'photo');
  fs.writeFileSync(path.join(dir, String(userId)), buf);
  return m[1];
}
const photoPath = id => path.join(dir, String(Number(id)));
function removePhoto(id) { try { fs.unlinkSync(photoPath(id)); } catch { /* absent */ } }

module.exports = { savePhoto, photoPath, removePhoto };
