'use client';
/* CONTROLLER : assistant d'inscription en 4 étapes (profil → compte → informations → terminé). */
import { useCallback, useEffect, useState } from 'react';
import { ACCOUNT_FIELDS, INFO_FIELDS, ROLES, type Field } from '@/models/forms';
import { AuthService } from '@/models/services';
import { ageFromDate, shrinkImage } from '@/models/helpers';
import type { Role } from '@/models/types';
import { ApiError } from '@/models/api';
import { useAuth } from './AuthController';

export type Values = Record<string, any>;
export const STEP_NAMES = ['Profil', 'Compte', 'Informations', 'Terminé'];
const MAIL = /^\S+@\S+\.\S+$/;

function validate(list: Field[], v: Values, photo: string | null, extra?: (e: Record<string, string>) => void) {
  const e: Record<string, string> = {};
  list.forEach(f => {
    const val = f.t === 'photo' ? photo : v[f.id];
    if (f.req && !(Array.isArray(val) ? val.length : val)) e[f.id] = f.t === 'photo' ? 'La photo de profil est obligatoire pour les joueurs.' : 'Ce champ est obligatoire.';
  });
  extra?.(e);
  return e;
}

export function useSignup() {
  const { setUser } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>({});
  const [err, setErr] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // /inscription/?role=invite : le lien « Continuer en invité » de la page de connexion démarre directement à l'étape « Compte ».
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('role') as Role | null;
    if (r && r in ROLES) { setRole(r); setStep(1); }
  }, []);

  const info = role ? INFO_FIELDS[role] : [];
  const age = ageFromDate(v.dob);
  const stepKey = (['role', 'acc', 'info', 'done'] as const)[step];

  const setValue = useCallback((id: string, val: any) => {
    setV(x => ({ ...x, [id]: val }));
    setErr(e => { if (!e[id]) return e; const n = { ...e }; delete n[id]; return n; });
  }, []);
  const toggleChip = (f: Field, val: string) => {
    if (f.t === 'radio') return setValue(f.id, v[f.id] === val ? '' : val);
    const a: string[] = (v[f.id] || []).slice(), i = a.indexOf(val);
    if (i >= 0) a.splice(i, 1); else if (!f.max || a.length < f.max) a.push(val);
    setValue(f.id, a);
  };
  const chooseRole = (r: Role) => { setRole(r); setErr({}); setV(x => (x.name ? { name: x.name, email: x.email, tel: x.tel } : {})); setPhoto(null); };
  const pickPhoto = async (file: File) => { const d = await shrinkImage(file); if (!d) return setErr(e => ({ ...e, photo: 'Image illisible.' })); setPhoto(d); setErr(e => { const n = { ...e }; delete n.photo; return n; }); };
  const back = () => { setErr({}); setStep(s => Math.max(0, s - 1)); };
  const restart = () => { setRole(null); setStep(0); setV({}); setErr({}); setPhoto(null); setMsg(''); };

  function payload() {
    const p: Record<string, unknown> = {};
    info.forEach(f => { if (f.t === 'photo') return; const x = v[f.id]; if (Array.isArray(x)) p[f.id] = x; else if (x !== undefined && x !== '' && x !== null) p[f.id] = f.t === 'number' ? Number(x) : x; });
    return { role, name: v.name, email: v.email, tel: v.tel || undefined, password: v.pw, accept_terms: true, profile: p, photo: photo || undefined };
  }

  async function next() {
    setMsg('');
    if (stepKey === 'role') { if (!role) return setErr({ role: 'Choisis un profil pour continuer.' }); setErr({}); return setStep(1); }
    if (stepKey === 'acc') {
      const e = validate(ACCOUNT_FIELDS, v, photo, e => {
        if (v.email && !MAIL.test(v.email)) e.email = 'Adresse e-mail invalide.';
        if (v.pw && v.pw.length < 8) e.pw = '8 caractères minimum.';
        if (!v.cgu) e.cgu = 'Tu dois accepter les conditions pour continuer.';
      });
      setErr(e); if (Object.keys(e).length) return; return setStep(2);
    }
    if (stepKey === 'info') {
      if (busy) return;
      const e = validate(info, v, photo, e => {
        const m = v.email || v.pemail; if (m && !MAIL.test(m)) e[v.email ? 'email' : 'pemail'] = 'Adresse e-mail invalide.';
        if (role === 'joueur' && v.dob && age === null) e.dob = 'Date de naissance invalide.';
      });
      setErr(e); if (Object.keys(e).length) return;
      setBusy(true);
      try { const u = await AuthService.register(payload()); setUser(u); setStep(3); }
      catch (x) {
        const er = x as ApiError, f = er.field || ''; setMsg(er.message);
        if (/^profile\./.test(f)) setErr(o => ({ ...o, [f.slice(8).split('.')[0]]: er.message }));
        else if (['email', 'password', 'name', 'tel', 'accept_terms'].includes(f)) { const m = ({ password: 'pw', accept_terms: 'cgu' } as Record<string, string>)[f] || f; setErr(o => ({ ...o, [m]: er.message })); setStep(1); }
      } finally { setBusy(false); }
    }
  }

  /** Part du formulaire remplie (pour la barre « Profil complété » de l'aperçu). */
  const completion = (() => {
    const fs = info.filter(f => f.t !== 'photo'); let n = 0;
    fs.forEach(f => { const x = v[f.id]; if (Array.isArray(x) ? x.length : x) n++; });
    if (photo) n++;
    let tot = fs.length + 1; tot += 2; if (v.name) n++; if (v.email) n++;
    return Math.round(100 * n / tot);
  })();

  return { role, step, stepKey, v, err, photo, msg, busy, info, age, completion, setValue, toggleChip, chooseRole, pickPhoto, back, next, restart, setMsg };
}
