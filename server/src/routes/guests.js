'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const V = require('../validators');
const { HttpError } = require('../util');

const router = express.Router();
const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Trop de demandes. Réessaie plus tard.' } });

// Profil invité : accès libre sans compte, on garde juste le pays et les centres d'intérêt (liste d'attente).
router.post('/', limiter, async (req, res, next) => {
  try {
    const p = V.guest.safeParse(req.body);
    if (!p.success) { const e = V.firstError(p.error); throw new HttpError(400, e.message, e.field); }
    const d = p.data;
    await db.prepare('INSERT INTO guests (country, who, interests, email) VALUES (?,?,?,?)').run(d.country, d.who || null, JSON.stringify(d.interests), d.email || null);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});
module.exports = router;
