'use strict';
const { z } = require('zod');
const { ageFrom } = require('./util');

const COUNTRIES = ['Cameroun', "Côte d'Ivoire", 'Sénégal', 'Ghana', 'Nigeria', 'RD Congo', 'Mali', 'Burkina Faso', 'Gabon', 'Maroc', 'Autre pays'];
const POSITIONS = ['Gardien', 'Défenseur central', 'Latéral droit', 'Latéral gauche', 'Milieu défensif', 'Milieu central', 'Milieu offensif', 'Ailier', 'Attaquant'];
const LEVELS = ['Académie / formation', 'Amateur', 'Régional', 'Division 2', 'Division 1', 'Semi-professionnel', 'Professionnel'];

const txt = (max, min = 0) => z.string().trim().min(min).max(max);
const opt = s => s.optional().or(z.literal('')).transform(v => (v === '' ? undefined : v));
const optNum = (lo, hi) => z.preprocess(v => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(lo).max(hi).optional());
const email = z.string().trim().toLowerCase().email('Adresse e-mail invalide.').max(254);
const phone = opt(z.string().trim().max(30).regex(/^[+0-9 ()._-]{6,30}$/, 'Numéro de téléphone invalide.'));

const dob = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de naissance invalide.').refine(v => {
  const a = ageFrom(v); return a !== null && a >= 10 && a <= 50;
}, 'Date de naissance invalide.');

const joueur = z.object({
  dob,
  nat: z.enum(COUNTRIES, { message: 'Nationalité requise.' }),
  res: opt(z.enum(COUNTRIES)),
  city: opt(txt(80)),
  pos: z.enum(POSITIONS, { message: 'Poste principal requis.' }),
  pos2: z.array(z.enum(POSITIONS)).max(2).optional().default([]),
  foot: opt(z.enum(['Droit', 'Gauche', 'Ambidextre'])),
  h: optNum(100, 230),
  w: optNum(30, 160),
  club: opt(txt(120)),
  lvl: opt(z.enum(LEVELS)),
  bio: opt(txt(1000)),
}).strict();

const agent = z.object({
  org: txt(120, 2),
  ctr: z.array(z.enum(COUNTRIES)).min(1, 'Choisis au moins un pays.').max(10),
  exp: opt(z.enum(['Moins de 2 ans', '2 à 5 ans', '5 à 10 ans', 'Plus de 10 ans'])),
  lic: z.enum(['Agent licencié FIFA', "Licence d'une fédération nationale", 'Autre accréditation', 'Pas encore de licence']),
  licn: opt(txt(60)),
  dom: z.array(txt(60)).max(8).optional().default([]),
  pemail: opt(email),
  ptel: phone,
  priv: opt(z.enum(['Visibles par les membres vérifiés', 'Visibles après mise en contact', 'Masquées'])),
  bio: opt(txt(1000)),
}).strict();

const club = z.object({
  org: txt(120, 2),
  typ: z.enum(['Club professionnel', 'Club amateur', 'Académie', 'Centre de formation']),
  crea: optNum(1850, new Date().getFullYear()),
  ctry: z.enum(COUNTRIES),
  city: txt(80, 1),
  champ: opt(txt(120)),
  resp: txt(120, 2),
  pemail: email,
  ptel: phone,
  seek: z.array(z.enum(POSITIONS)).max(9).optional().default([]),
  web: opt(txt(200)),
  bio: opt(txt(1000)),
}).strict();

const profileSchemas = { joueur, agent, club };

const register = z.object({
  role: z.enum(['joueur', 'agent', 'club']),
  name: txt(120, 2),
  email,
  tel: phone,
  password: z.string().min(8, '8 caractères minimum.').max(200),
  accept_terms: z.literal(true, { message: 'Tu dois accepter les conditions.' }),
  profile: z.record(z.string(), z.any()),
  photo: z.string().max(900000).optional().nullable(),
}).strict();

const login = z.object({ email, password: z.string().min(1).max(200) }).strict();
const guest = z.object({
  country: z.enum(COUNTRIES),
  who: opt(z.enum(['Parent', 'Entraîneur', 'Supporter', 'Journaliste', 'Curieux'])),
  interests: z.array(z.enum(['Joueurs', 'Agents', 'Clubs', 'Highlights', 'Opportunités'])).max(5).optional().default([]),
  email,
}).strict();
const contact = z.object({ to: z.number().int().positive(), message: txt(600, 10) }).strict();

// Mot de passe : au moins 8 caractères et pas trop évident.
const WEAK = new Set(['password', '12345678', '123456789', 'azertyuiop', 'motdepasse', 'qwertyuiop', '00000000', '11111111', 'football1', 'spora1234']);
const isWeak = (p, mail) => WEAK.has(p.toLowerCase()) || p.toLowerCase() === String(mail || '').split('@')[0].toLowerCase();

function firstError(err) {
  const i = err.issues && err.issues[0];
  if (!i) return 'Données invalides.';
  const where = i.path && i.path.length ? i.path.join('.') : '';
  return { message: i.message && !/^Invalid|^Expected|^Required/.test(i.message) ? i.message : 'Champ invalide' + (where ? ' : ' + where : '') + '.', field: where };
}

module.exports = { profileSchemas, register, login, guest, contact, isWeak, firstError, COUNTRIES, POSITIONS, LEVELS, email };
