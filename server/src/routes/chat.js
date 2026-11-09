'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { HttpError } = require('../util');
const { requireAuth } = require('../middleware');

const router = express.Router();
router.use(requireAuth);
const sendLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Trop de messages. Réessaie dans quelques minutes.' } });

// Un chat n'existe que pour une demande ACCEPTÉE, et seulement entre les deux personnes concernées.
async function conversation(req) {
  const c = await db.get('SELECT * FROM contacts WHERE id=?', [Number(req.params.id)]);
  if (!c || (c.from_user !== req.user.id && c.to_user !== req.user.id)) throw new HttpError(404, 'Conversation introuvable.');
  if (c.status !== 'accepte') throw new HttpError(403, 'La conversation s\'ouvre quand le joueur accepte la demande.');
  return c;
}

router.get('/:id/messages', async (req, res) => {
  const c = await conversation(req);
  const rows = await db.all('SELECT id, sender_id, body, created_at FROM chat_messages WHERE contact_id=? ORDER BY id DESC LIMIT 200', [c.id]);
  await db.run("UPDATE chat_messages SET read_at=datetime('now') WHERE contact_id=? AND sender_id<>? AND read_at IS NULL", [c.id, req.user.id]);
  res.set('Cache-Control', 'no-store');
  res.json({ messages: rows.reverse().map(m => ({ id: m.id, mine: m.sender_id === req.user.id, body: m.body, created_at: m.created_at })) });
});

router.post('/:id/messages', sendLimiter, async (req, res) => {
  const c = await conversation(req);
  const body = String((req.body || {}).body || '').replace(/\r\n/g, '\n').trim();
  if (!body) throw new HttpError(400, 'Écris un message.');
  if (body.length > 1000) throw new HttpError(400, 'Message trop long (1000 caractères maximum).');
  const r = await db.run('INSERT INTO chat_messages (contact_id, sender_id, body) VALUES (?,?,?)', [c.id, req.user.id, body]);
  res.status(201).json({ ok: true, id: Number(r.lastInsertRowid) });
});

module.exports = router;
