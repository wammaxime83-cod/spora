'use client';
/* VIEW : cartes (joueur, agent, club, vidéo d'exemple, opportunité). Elles n'ont aucune logique propre : tout vient des props. */
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { COL, type SampleAgent, type SampleClub, type SampleOpportunity, type SamplePlayer, type SampleVideo } from '@/models/sampleData';
import type { AgentCard, PlayerCard, User } from '@/models/types';
import { shortPos } from '@/models/helpers';

export const art = (i: number): CSSProperties => { const c = COL[i % COL.length]; return { '--c1': c[0], '--c2': c[1], '--jr': c[2], '--sk': c[3] }; };
const fill: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };
const flat: CSSProperties = { border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 800, width: '100%' };

export function SamplePlayerCard({ p, i }: { p: SamplePlayer; i: number }) {
  return (
    <article className="pcard" data-tilt="">
      <div className="pimg" style={art(i)}><span className="num">{i * 3 % 11 + 7}</span><span className="st">● Disponible</span><span className="ps">{p[5]}</span></div>
      <div className="bd">
        <div className="nm"><div><h3>{p[0]}</h3><div className="sub">{p[1]} ans · {p[2]}</div></div><span className="vf">✓</span></div>
        <div className="sub">{p[3]} · {p[9]}</div>
        <div className="ps3"><div><b>{p[7]}</b><small>Taille</small></div><div><b>{p[6]}</b><small>Pied</small></div><div><b>{p[5]}</b><small>Poste</small></div></div>
        <Link className="go" href="/inscription/">Créer mon profil →</Link>
      </div>
    </article>
  );
}

export function RealPlayerCard({ p, i, user, onProfile, onVideos, onContact }: { p: PlayerCard; i: number; user: User | null; onProfile: () => void; onVideos: () => void; onContact: () => void }) {
  let action;
  if (user && user.id === p.id) action = <Link className="go" href="/espace/">C&apos;est ton profil · gérer →</Link>;
  else if (!user) action = <Link className="go" href="/connexion/">Se connecter pour contacter →</Link>;
  else if (user.role === 'joueur' || user.role === 'invite') action = <span className="go" style={{ opacity: .7 }}>Réservé aux agents et aux clubs</span>;
  else if (user.status !== 'verifie') action = <span className="go" style={{ opacity: .7 }}>Disponible après vérification de ton profil</span>;
  else action = <button type="button" className="go" style={flat} onClick={onContact}>Contacter →</button>;
  return (
    <article className="pcard" data-tilt="">
      <div className="pimg" style={{ ...art(i), cursor: 'pointer' }} onClick={onProfile}>
        {p.photo ? <img alt="" src={p.photo} style={{ ...fill, zIndex: 1 }} /> : <span className="num">{p.id * 3 % 11 + 7}</span>}
        {p.featured && <span className="st" style={{ zIndex: 2 }}>★ Mis en avant</span>}
        <span className="ps" style={{ zIndex: 2 }}>{shortPos(p.pos)}</span>
      </div>
      <div className="bd">
        <div className="nm"><div><h3 style={{ cursor: 'pointer' }} onClick={onProfile}>{p.name}</h3><div className="sub">{p.age != null ? p.age + ' ans · ' : ''}{p.nat || ''}</div></div><span className="vf" title="Profil vérifié">✓</span></div>
        <div className="sub">{[p.city, p.lvl].filter(Boolean).join(' · ')}</div>
        <div className="ps3"><div><b>{p.pos || '—'}</b><small>Poste</small></div><div><b>{p.lvl || '—'}</b><small>Niveau</small></div><div><b>{p.nat || '—'}</b><small>Pays</small></div></div>
        <button type="button" className="go" style={{ ...flat, marginBottom: 8 }} onClick={onProfile}>Voir le profil →</button>
        {!!p.videos && <button type="button" className="go" style={{ ...flat, marginBottom: 8 }} onClick={onVideos}>▶ Voir les vidéos ({p.videos})</button>}
        {action}
      </div>
    </article>
  );
}

export function SampleAgentCard({ a, i }: { a: SampleAgent; i: number }) {
  const c = COL[i % COL.length], ini = a[0].split(' ').map(x => x[0]).join('');
  return (
    <article className="agent" data-tilt="">
      <div className="top"><div className="av" style={{ '--c1': c[0], '--c2': c[1] }}>{ini}</div><div><h3>{a[0].split(' ')[0]} {a[0].split(' ')[1][0]}.</h3><div className="sub">{a[2]}, {a[1]}</div></div></div>
      <span className="ver">✓ Agent vérifié</span>
      <div className="tags">{a[3].map(t => <span key={t}>{t}</span>)}</div>
      <div className="sub">Langues : {a[4]}</div>
    </article>
  );
}

export function RealAgentCard({ a, i, onOpen }: { a: AgentCard; i: number; onOpen?: () => void }) {
  const c = COL[i % COL.length], ini = a.name.split(' ').map(x => x[0]).join('').toUpperCase();
  return (
    <article className="agent" data-tilt="" style={onOpen ? { cursor: 'pointer' } : undefined} tabIndex={onOpen ? 0 : undefined} onClick={onOpen} onKeyDown={e => { if (onOpen && e.key === 'Enter') onOpen(); }}>
      <div className="top"><div className="av" style={{ '--c1': c[0], '--c2': c[1] }}>{ini}</div><div><h3>{a.name}</h3><div className="sub">{a.ctr.slice(0, 3).join(', ')}</div></div></div>
      <span className="ver">✓ Agent vérifié</span>
      <div className="tags">{a.dom.map(t => <span key={t}>{t}</span>)}</div>
      {a.exp && <div className="sub">Expérience : {a.exp}</div>}
    </article>
  );
}

export function ClubCard({ c, i }: { c: SampleClub; i: number }) {
  const k = COL[(i + 2) % COL.length];
  return (
    <article className="agent" data-tilt="">
      <div className="top"><div className="av" style={{ '--c1': k[0], '--c2': k[1], borderRadius: 16 }}>{c[0][0]}</div><div><h3>{c[0]}</h3><div className="sub">{c[2]}, Cameroun</div></div></div>
      <div className="tags"><span>{c[1]}</span><span>{c[3]}</span></div>
    </article>
  );
}

export function SampleVideoCard({ v }: { v: SampleVideo }) {
  return (
    <article className="vcard" data-tilt="">
      <div className="vimg" style={{ '--c1': COL[v[4]][0], '--c2': COL[v[4]][1] }}><span className="cat">{v[0]}</span><div className="play">▶</div><span className="du">{v[3]}</span></div>
      <div className="vb"><h3>{v[1]}</h3><p>{v[2]}</p></div>
    </article>
  );
}

export function OppCard({ o }: { o: SampleOpportunity }) {
  return (
    <article className="ocard" data-tilt="" data-type={o[0]}>
      <span className="ty">{o[0]}</span><h3>{o[1]}</h3><p>{o[2]}</p><span className="ver">✓ Annonce vérifiée</span><div className="ft">{o[3]}<span>{o[4]}</span></div>
    </article>
  );
}

export function Chips({ list, value, onChange, id, style }: { list: string[]; value: string; onChange: (v: string) => void; id?: string; style?: CSSProperties }) {
  return <div className="chipsbar" id={id} style={style}>{list.map((l, i) => <button key={l} type="button" className={'fc' + ((i ? l : '') === value ? ' on' : '')} onClick={() => onChange(i ? l : '')}>{l}</button>)}</div>;
}
