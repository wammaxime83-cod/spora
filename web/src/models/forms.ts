/* MODEL : description des formulaires d'inscription et de profil (une seule source pour l'inscription et « Mon espace »). */
import type { Role } from './types';

export const COUNTRIES = ['Cameroun', "Côte d'Ivoire", 'Sénégal', 'Ghana', 'Nigeria', 'RD Congo', 'Mali', 'Burkina Faso', 'Gabon', 'Maroc', 'Autre pays'];
export const POSITIONS = ['Gardien', 'Défenseur central', 'Latéral droit', 'Latéral gauche', 'Milieu défensif', 'Milieu central', 'Milieu offensif', 'Ailier', 'Attaquant'];
export const LEVELS = ['Académie / formation', 'Amateur', 'Régional', 'Division 2', 'Division 1', 'Semi-professionnel', 'Professionnel'];

export type FieldType = 'text' | 'email' | 'tel' | 'password' | 'date' | 'number' | 'select' | 'textarea' | 'chips' | 'radio' | 'photo';
export interface Field { id: string; l: string; t: FieldType; req?: boolean; full?: boolean; ph?: string; o?: string[]; max?: number }
const F = (id: string, l: string, t: FieldType, o: Partial<Field> = {}): Field => ({ id, l, t, ...o });

export const ROLES: Record<Role, { n: string; d: string; icon: string }> = {
  joueur: { n: 'Joueur', d: 'Je veux être repéré par les clubs et les agents.', icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 5h-5L8 10z"/>' },
  agent: { n: 'Agent', d: 'Je cherche des talents et je développe mon réseau.', icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M3 13h18"/>' },
  club: { n: 'Club ou académie', d: 'Je recrute et je fais connaître ma structure.', icon: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>' },
  invite: { n: 'Invité', d: 'Je découvre Spora : highlights, commentaires et opportunités.', icon: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>' },
};
export const ROLE_LABEL: Record<Role, string> = { invite: 'Invité', joueur: 'Joueur', agent: 'Agent', club: 'Club ou académie' };

export const ACCOUNT_FIELDS: Field[] = [
  F('name', 'Nom complet', 'text', { req: true, ph: 'Prénom et nom', full: true }),
  F('email', 'Adresse e-mail', 'email', { req: true, ph: 'toi@exemple.com' }),
  F('tel', 'Téléphone', 'tel', { ph: '+237 6XX XX XX XX' }),
  F('pw', 'Mot de passe', 'password', { req: true, ph: '8 caractères minimum', full: true }),
];

export const INFO_FIELDS: Record<Role, Field[]> = {
  joueur: [
    F('photo', 'Photo de profil (obligatoire)', 'photo', { full: true, req: true }), F('dob', 'Date de naissance', 'date', { req: true }),
    F('nat', 'Nationalité', 'select', { req: true, o: COUNTRIES }), F('res', 'Pays de résidence', 'select', { o: COUNTRIES }),
    F('city', 'Ville où tu évolues', 'text', { ph: 'Douala, Yaoundé…' }), F('pos', 'Poste principal', 'select', { req: true, o: POSITIONS }),
    F('pos2', 'Postes secondaires (2 max)', 'chips', { o: POSITIONS, max: 2, full: true }), F('foot', 'Pied dominant', 'radio', { o: ['Droit', 'Gauche', 'Ambidextre'] }),
    F('h', 'Taille (cm)', 'number', { ph: '178' }), F('w', 'Poids (kg)', 'number', { ph: '70' }),
    F('club', 'Club ou académie actuelle', 'text', { ph: 'Nom de ton club', full: true }), F('lvl', 'Niveau de compétition', 'select', { o: LEVELS, full: true }),
    F('bio', 'Parcours et objectifs', 'textarea', { ph: 'Ton parcours, tes qualités, ce que tu recherches…', full: true }),
  ],
  agent: [
    F('photo', 'Photo', 'photo', { full: true }), F('org', 'Nom professionnel ou agence', 'text', { req: true, ph: 'Nom affiché sur ton profil', full: true }),
    F('ctr', "Pays d'activité", 'chips', { req: true, o: COUNTRIES.slice(0, 10), full: true }),
    F('exp', 'Expérience', 'select', { o: ['Moins de 2 ans', '2 à 5 ans', '5 à 10 ans', 'Plus de 10 ans'] }),
    F('lic', 'Licence ou accréditation', 'select', { req: true, o: ['Agent licencié FIFA', "Licence d'une fédération nationale", 'Autre accréditation', 'Pas encore de licence'] }),
    F('licn', 'Numéro de licence (si applicable)', 'text', { full: true }),
    F('dom', "Domaines d'intervention", 'chips', { o: ['Gardiens', 'Défenseurs', 'Milieux', 'Attaquants', 'Jeunes U17-U21', "Transferts vers l'Europe", 'Transferts en Afrique', 'Académies'], full: true }),
    F('pemail', 'E-mail professionnel', 'email'), F('ptel', 'Téléphone professionnel', 'tel'),
    F('priv', 'Visibilité de tes coordonnées', 'select', { o: ['Visibles par les membres vérifiés', 'Visibles après mise en contact', 'Masquées'], full: true }),
    F('bio', 'Présentation', 'textarea', { ph: "Ton activité, les profils que tu recherches…", full: true }),
  ],
  club: [
    F('photo', 'Logo ou photo de la structure', 'photo', { full: true }), F('org', 'Nom de la structure', 'text', { req: true, full: true }),
    F('typ', 'Type', 'select', { req: true, o: ['Club professionnel', 'Club amateur', 'Académie', 'Centre de formation'] }), F('crea', 'Année de création', 'number', { ph: '2010' }),
    F('ctry', 'Pays', 'select', { req: true, o: COUNTRIES }), F('city', 'Ville', 'text', { req: true }),
    F('champ', 'Championnat ou niveau', 'text', { ph: 'Ex. Élite Two, régional…', full: true }),
    F('resp', 'Responsable (nom et fonction)', 'text', { req: true, ph: 'Ex. A. Mbarga, directeur sportif', full: true }),
    F('pemail', 'E-mail professionnel', 'email', { req: true }), F('ptel', 'Téléphone', 'tel'),
    F('seek', 'Postes recherchés', 'chips', { o: POSITIONS, full: true }), F('web', 'Site ou réseau social', 'text', { full: true }),
    F('bio', 'Présentation', 'textarea', { ph: 'Ta structure, ton projet sportif…', full: true }),
  ],
  invite: [
    F('ctry', 'Ton pays', 'select', { req: true, o: COUNTRIES }),
    F('who', 'Tu es plutôt…', 'radio', { o: ['Parent', 'Entraîneur', 'Supporter', 'Journaliste', 'Curieux'], full: true }),
    F('see', 'Ce que tu veux découvrir', 'chips', { o: ['Joueurs', 'Agents', 'Clubs', 'Highlights', 'Opportunités'], full: true }),
  ],
};

export const STATUS_TEXT: Record<string, [string, string]> = {
  en_attente: ['En cours de vérification', "Ton profil sera visible par les autres membres une fois vérifié par l'équipe Spora."],
  verifie: ['Profil vérifié', "Ton profil est visible dans l'annuaire."],
  refuse: ['Vérification refusée', 'Corrige ton profil ci-dessous : il repassera en vérification après enregistrement.'],
};
export const PLAN_LABEL: Record<string, string> = { gratuit: 'Gratuit', standard: 'Standard', premium: 'Premium', elite: 'Élite' };
