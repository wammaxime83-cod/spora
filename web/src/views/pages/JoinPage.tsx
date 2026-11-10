'use client';
/* VIEW : inscription (assistant en 4 étapes) et connexion. */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ACCOUNT_FIELDS, ROLES, type Field as FieldDef } from '@/models/forms';
import type { Role } from '@/models/types';
import { initials } from '@/models/helpers';
import { useSignup, STEP_NAMES } from '@/controllers/useSignup';
import { useLogin } from '@/controllers/useLogin';
import { Field, PhotoPicker } from '../components/Field';
import { B0 } from './static/inscription';

const ic = (p: string, size?: number) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: p }} />;
const link: React.CSSProperties = { color: 'var(--primary)', fontWeight: 800 };

const TITLES: Record<Role, [string, string]> = {
  joueur: ['Ton profil de joueur', 'Ces informations permettent aux agents et aux clubs de te trouver par poste, âge, pays ou niveau.'],
  agent: ['Ton profil professionnel', 'Les joueurs découvrent ton activité. Ton statut « Vérifié » viendra après contrôle de tes documents.'],
  club: ['Ta structure', 'Présente ton club ou ton académie aux joueurs, agents et recruteurs.'],
  invite: ['Quelques infos sur toi', 'Dis-nous ce qui t’intéresse : ton compte invité te permet de regarder les highlights, d’aimer et de commenter.'],
};
const NEXT: Record<Role, string[]> = {
  joueur: ['Ajoute tes premières vidéos dans Highlights.', 'Complète ton parcours et tes statistiques.', 'Consulte les opportunités qui correspondent à ton poste.'],
  agent: ['Envoie tes documents pour la vérification.', 'Précise les profils que tu recherches.', 'Parcours les joueurs par poste, âge et pays.'],
  club: ['Envoie un justificatif pour la vérification.', 'Indique les postes que tu recherches.', 'Publie ta première détection ou ton premier essai.'],
  invite: ['Regarde les highlights et réagis aux vidéos.', 'Commente les publications des joueurs.', 'Découvre les opportunités publiées.'],
};

function Preview({ s }: { s: ReturnType<typeof useSignup> }) {
  const { v, role, photo } = s; const av = (t: React.ReactNode) => <div className="av">{photo ? <img alt="" src={photo} /> : t}</div>;
  const pg = <div className="pg"><div><span>Profil complété</span><span>{s.completion}%</span></div><u><i style={{ width: s.completion + '%' }}></i></u></div>;
  const fk = <div className="fk">PROFIL D&apos;ILLUSTRATION · APERÇU</div>;
  const tags = (l: string[]) => l.map(x => <span key={x}>{x}</span>);
  if (!role) return <div className="cd"><div className="hd no"><small>Ta carte Spora</small></div><div className="bd" style={{ paddingTop: 26 }}><h3>Choisis ton profil</h3><div className="sb">Ton aperçu apparaîtra ici et se remplira au fil de l&apos;inscription.</div></div></div>;
  if (role === 'joueur') return (
    <div className="cd"><div className="hd"><small>Joueur</small>{av(initials(v.name) || 'S')}</div><div className="bd"><h3>{v.name || 'Ton nom'}</h3><div className="sb">{v.pos || 'Poste'}{s.age !== null ? ` · ${s.age} ans` : ''}</div>
      <div className="tg">{tags([v.nat, v.city, v.lvl].filter(Boolean))}{tags(v.pos2 || [])}</div>
      <div className="st"><div><b>{v.h ? v.h + ' cm' : '—'}</b><small>Taille</small></div><div><b>{v.foot || '—'}</b><small>Pied</small></div><div><b>{v.w ? v.w + ' kg' : '—'}</b><small>Poids</small></div></div>
      {v.club && <div className="sb" style={{ marginTop: 14 }}>{v.club}</div>}{pg}{fk}</div></div>);
  if (role === 'agent') return (
    <div className="cd"><div className="hd ag"><small>Agent</small>{av(initials(v.org || v.name) || 'A')}</div><div className="bd"><h3>{v.org || v.name || 'Ton nom professionnel'}</h3><div className="sb">{(v.ctr || []).join(', ') || "Pays d'activité"}{v.exp ? ' · ' + v.exp : ''}</div><div className="tg">{tags(v.dom || [])}</div><div className="vf">Vérification en cours{v.lic ? ' · ' + v.lic : ''}</div>{pg}{fk}</div></div>);
  if (role === 'club') return (
    <div className="cd"><div className="hd cl"><small>{v.typ || 'Club ou académie'}</small>{av(initials(v.org) || 'C')}</div><div className="bd"><h3>{v.org || 'Nom de la structure'}</h3><div className="sb">{[v.city, v.ctry].filter(Boolean).join(', ') || 'Ville, pays'}{v.champ ? ' · ' + v.champ : ''}</div><div className="tg">{tags(v.seek || [])}</div><div className="vf">Vérification de la structure en attente</div>{pg}{fk}</div></div>);
  return (
    <div className="cd"><div className="hd gu"><small>Invité</small><div className="av">{ic(ROLES.invite.icon, 34)}</div></div><div className="bd"><h3>Accès invité</h3><div className="sb">{[v.who, v.ctry].filter(Boolean).join(' · ') || 'Découverte de Spora'}</div><div className="tg">{tags(v.see || [])}</div><div className="vf">Tu peux regarder, aimer et commenter. Pour publier ou contacter, crée un profil joueur, agent ou club.</div></div></div>);
}

function Signup({ s }: { s: ReturnType<typeof useSignup> }) {
  const photoField = (f: FieldDef) => (
    <PhotoPicker id="f_photo" src={s.photo} hint="Image réduite sur ton appareil, puis enregistrée avec ton profil." onPick={s.pickPhoto} />
  );
  const act = (back: boolean, next?: string) => (
    <div className="jn-act">
      {back ? <button type="button" className="back" onClick={s.back}>← Retour</button> : <span></span>}
      {next && <button type="submit" className="btn">{next}</button>}
    </div>
  );
  const head = (t: string, d: string) => <><h2>{t}</h2><p className="lead">{d}</p></>;
  const role = s.role;
  return (
    <div id="jnSign">
      <ol className="jn-steps" id="jnSteps">{STEP_NAMES.map((n, i) => <li key={n} className={i === s.step ? 'on' : i < s.step ? 'dn' : ''}><b>{i < s.step ? '✓' : i + 1}</b>{n}</li>)}</ol>
      <form id="jnForm" noValidate onSubmit={e => { e.preventDefault(); if (s.stepKey !== 'done') s.next(); }}>
        {s.stepKey === 'role' && <>
          {head('Vous êtes…', 'Choisis ton profil pour adapter ton inscription.')}
          <div className="jn-roles" role="radiogroup">
            {(Object.keys(ROLES) as Role[]).map(r => <button key={r} type="button" className={'jn-role' + (r === 'invite' ? ' guest' : '') + (role === r ? ' on' : '')} role="radio" aria-checked={role === r} onClick={() => s.chooseRole(r)}><span className="ic">{ic(ROLES[r].icon)}</span><span><b>{ROLES[r].n}</b><span>{ROLES[r].d}</span></span></button>)}
          </div>
          {s.err.role && <div className="er" style={{ marginTop: 10 }}>{s.err.role}</div>}
          {act(false, 'Continuer →')}
        </>}
        {s.stepKey === 'acc' && role && <>
          {head('Créer mon compte', `Quelques informations pour sécuriser ton espace ${ROLES[role].n.toLowerCase()}.`)}
          <div className="jn-g">{ACCOUNT_FIELDS.map(f => <Field key={f.id} f={f} prefix="f" value={s.v[f.id]} error={s.err[f.id]} onChange={s.setValue} onToggle={s.toggleChip} />)}</div>
          <div className="jn-ck" style={{ marginTop: 16 }}><input type="checkbox" id="f_cgu" checked={!!s.v.cgu} onChange={e => s.setValue('cgu', e.target.checked)} /><label htmlFor="f_cgu">J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité de Spora.</label></div>
          {s.err.cgu && <div className="er">{s.err.cgu}</div>}
          <div className="jn-sep">ou continuer avec</div>
          <div className="jn-oauth"><button type="button" onClick={() => s.setMsg('Google et Apple ne sont pas encore disponibles : utilise ton e-mail.')}>Google</button><button type="button" onClick={() => s.setMsg('Google et Apple ne sont pas encore disponibles : utilise ton e-mail.')}>Apple</button></div>
          {s.msg && <div className="jn-msg">{s.msg}</div>}
          {act(true, 'Continuer →')}
        </>}
        {s.stepKey === 'info' && role && <>
          {head(TITLES[role][0], TITLES[role][1])}
          {role === 'agent' && <><div className="jn-msg w">Pour obtenir le badge « Vérifié », Spora contrôlera ton identité et ta licence. D&apos;ici là, ton profil affiche « Vérification en cours ».</div><div style={{ height: 14 }}></div></>}
          {role === 'club' && <><div className="jn-msg w">Un document justificatif (statuts, agrément ou attestation fédérale) sera demandé pour vérifier la structure avant le badge « Vérifié ».</div><div style={{ height: 14 }}></div></>}
          {role === 'invite' && <><ul className="jn-cmp"><li><b>✓</b>Regarder les highlights des joueurs</li><li><b>✓</b>Aimer et commenter les vidéos</li><li><b>✓</b>Consulter les opportunités publiées</li><li className="no"><b>×</b>Publier des vidéos ou contacter un joueur, un agent ou un club</li></ul><div style={{ height: 14 }}></div></>}
          <div className="jn-g">{s.info.map(f => <Field key={f.id} f={f} prefix="f" value={s.v[f.id]} error={s.err[f.id] || (f.t === 'photo' ? s.err.photo : undefined)} onChange={s.setValue} onToggle={s.toggleChip} photo={photoField(f)} />)}</div>
          {s.msg && <div className="jn-msg">{s.msg}</div>}
          {act(true, s.busy ? 'Envoi…' : role === 'invite' ? 'Créer mon compte invité' : 'Créer mon profil')}
        </>}
        {s.stepKey === 'done' && role && <>
          <div className="jn-ok">{ic('<path d="M5 12l5 5 9-10"/>')}</div>
          {head(role === 'invite' ? 'Bienvenue, invité !' : 'Ton profil est prêt.', 'Voici ce que tu peux faire ensuite :')}
          <ol className="jn-next">{NEXT[role].map(x => <li key={x}>{x}</li>)}</ol>
          <div className="jn-msg w" style={{ marginTop: 18 }}>{role === 'invite' ? <><b>Compte créé.</b> Tu peux déjà regarder les highlights, aimer et commenter.</> : <><b>Compte créé.</b> Un e-mail de confirmation t&apos;a été envoyé. Ton profil apparaîtra dans l&apos;annuaire après vérification par l&apos;équipe Spora.</>}</div>
          <div className="jn-act">{role === 'invite' ? <Link className="btn" href="/highlights/">Voir les highlights</Link> : <Link className="btn" href="/espace/">Ouvrir mon espace</Link>}<button type="button" className="back" onClick={s.restart}>Créer un autre profil</button></div>
        </>}
      </form>
    </div>
  );
}

function Login() {
  const l = useLogin();
  return (
    <div id="jnLogin">
      <h2>Bon retour parmi nous</h2><p className="lead">Connecte-toi à ton espace Spora.</p>
      <form id="jnLog" noValidate onSubmit={e => { e.preventDefault(); l.submit(); }}>
        <div className="jn-g">
          <div className="full"><label className="l" htmlFor="lg_e">Adresse e-mail</label><input id="lg_e" type="email" placeholder="toi@exemple.com" value={l.email} onChange={e => l.setEmail(e.target.value)} autoComplete="email" /></div>
          <div className="full"><label className="l" htmlFor="lg_p">Mot de passe</label><input id="lg_p" type="password" value={l.password} onChange={e => l.setPassword(e.target.value)} autoComplete="current-password" /></div>
        </div>
        <div className="jn-act"><button type="button" className="back" onClick={l.forgot}>Mot de passe oublié ?</button><button className="btn" type="submit" disabled={l.busy}>Se connecter</button></div>
        <div className="jn-sep">ou</div>
        <div className="jn-oauth"><button type="button" className="lgo" onClick={l.oauth}>Google</button><button type="button" className="lgo" onClick={l.oauth}>Apple</button></div>
        <p className="lead" style={{ margin: '18px 0 0' }}>Pas encore de compte ? <Link href="/inscription/" style={link}>Créer un compte</Link> · <Link href="/inscription/?role=invite" style={link}>Continuer en invité</Link></p>
        {l.msg && <div className="jn-msg">{l.msg}</div>}
      </form>
    </div>
  );
}

export function JoinPage({ mode }: { mode: 'sign' | 'log' }) {
  const s = useSignup(); const [m, setM] = useState(mode);
  useEffect(() => setM(mode), [mode]);
  return (
    <>
      <B0 />
      <section className="sec"><div className="box"><div className="jn">
        <div className="jn-card">
          <div className="jn-tabs" role="tablist">
            <button type="button" role="tab" id="tabSign" className={m === 'sign' ? 'on' : ''} aria-selected={m === 'sign'} onClick={() => setM('sign')}>Créer un compte</button>
            <button type="button" role="tab" id="tabLog" className={m === 'log' ? 'on' : ''} aria-selected={m === 'log'} onClick={() => setM('log')}>Connexion</button>
          </div>
          {m === 'sign' ? <Signup s={s} /> : <Login />}
        </div>
        {m === 'sign' && <aside className="jn-side"><div id="jnPv" className="jn-pv"><Preview s={s} /></div><p className="note" style={{ marginTop: 14 }}>Aperçu en direct de ta carte. Tes informations sont enregistrées à la fin de l&apos;inscription ; ton profil devient visible après vérification par l&apos;équipe Spora.</p></aside>}
      </div></div></section>
    </>
  );
}
