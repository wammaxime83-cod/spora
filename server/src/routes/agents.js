'use strict';
const express = require('express');
const db = require('../db');
const { HttpError, shortName } = require('../util');

const router = express.Router();
const SELECT = `SELECT u.id, u.name, p.data FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.role='agent' AND u.status='verifie' AND u.is_admin=0 AND u.is_guest=0`;
const parse = r => { try { return JSON.parse(r.data || '{}'); } catch { return {}; } };

// Seuls l'administrateur et les agents / clubs vérifiés peuvent ouvrir une fiche.
const canView = u => !!(u && (u.is_admin || (['agent', 'club'].includes(u.role) && u.status === 'verifie')));

// Liste publique : prénom + initiale du nom, jamais le nom de famille, l'e-mail ni le téléphone.
router.get('/', async (req, res) => {
  const rows = await db.all(SELECT + ' ORDER BY u.id DESC LIMIT 100');
  res.set('Cache-Control', 'no-store');
  res.json({ canView: canView(req.user), agents: rows.map(r => { const d = parse(r); return { id: r.id, name: shortName(r.name), ctr: d.ctr || [], exp: d.exp || null, dom: d.dom || [] }; }) });
});

router.get('/:id', async (req, res) => {
  if (!canView(req.user)) throw new HttpError(403, 'Fiche réservée aux agents et aux clubs vérifiés.');
  const r = await db.get(SELECT + ' AND u.id = ?', [Number(req.params.id)]);
  if (!r) throw new HttpError(404, 'Profil introuvable.');
  const d = parse(r);
  res.json({ agent: { id: r.id, name: req.user.is_admin ? r.name : shortName(r.name), org: d.org || null, ctr: d.ctr || [], exp: d.exp || null, lic: d.lic || null, dom: d.dom || [], bio: d.bio || null } });
});

module.exports = router;
