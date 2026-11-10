'use client';
/* VIEW : espace d'administration (comptes, conversations, invités). Réservé aux comptes administrateurs côté serveur. */
import Link from 'next/link';
import { useState } from 'react';
import '@/styles/admin.css';
import { useAdmin, type AdminView } from '@/controllers/useAdmin';
import { useAuth } from '@/controllers/AuthController';
import type { AdminUser } from '@/models/types';

const TABS: [AdminView, string][] = [['users', 'Comptes'], ['chats', 'Conversations'], ['guests', 'Invités']];
const STATS: [string, string][] = [['users', 'Comptes'], ['joueurs', 'Joueurs'], ['agents', 'Agents'], ['clubs', 'Clubs'], ['en_attente', 'À vérifier'], ['payants', 'Payants'], ['invites', 'Invités'], ['contacts', 'Contacts']];
const FILTERS: [string, string][] = [['en_attente', 'À vérifier'], ['verifie', 'Vérifiés'], ['refuse', 'Refusés'], ['', 'Tous']];

function UserRow({ u, a, note }: { u: AdminUser; a: ReturnType<typeof useAdmin>; note: string }) {
  const [plan, setPlan] = useState(u.plan); const [until, setUntil] = useState(u.plan_until || '');
  const [profile, setProfile] = useState<string | null>(null); const [armed, setArmed] = useState(false); const [outline, setOutline] = useState('');
  const savePlan = async (p: string, d: string) => { try { await a.setPlan(u.id, p, d || undefined); setOutline('2px solid #12a36f'); } catch { setOutline('2px solid #e5484d'); } };
  return (
    <tr>
      <td><b>{u.name}</b><br />{u.email}{u.tel && <><br />{u.tel}</>}<br />
        <a href="#" onClick={async e => { e.preventDefault(); setProfile(JSON.stringify(await a.profileOf(u.id), null, 1)); }}>Voir le profil</a>{profile && <pre>{profile}</pre>}</td>
      <td>{u.role}</td>
      <td><span className={'tag ' + u.status}>{u.status}</span>{!u.email_verified && <><br /><small>e-mail non confirmé</small></>}</td>
      <td>
        <select value={plan} style={{ outline }} onChange={e => { setPlan(e.target.value as AdminUser['plan']); savePlan(e.target.value, until); }}>{['gratuit', 'standard', 'premium', 'elite'].map(p => <option key={p}>{p}</option>)}</select><br />
        <input type="date" value={until} title="Valable jusqu'au" style={{ outline }} onChange={e => { setUntil(e.target.value); savePlan(plan, e.target.value); }} />
      </td>
      <td>{u.created_at}</td>
      <td>
        <button onClick={() => a.setStatus(u.id, 'verifie')}>Vérifier</button>{' '}
        <button onClick={() => a.setStatus(u.id, 'refuse', note || undefined)}>Refuser</button>{' '}
        <button onClick={() => { if (!armed) return setArmed(true); a.remove(u.id); }}>{armed ? 'Confirmer ?' : 'Supprimer'}</button>
      </td>
    </tr>
  );
}

function ChatRow({ c, a }: { c: ReturnType<typeof useAdmin>['chats'][number]; a: ReturnType<typeof useAdmin> }) {
  const [text, setText] = useState<string | null>(null);
  return (
    <tr>
      <td>{c.from_name}<br /><small>{c.from_role}</small></td><td>{c.to_name}<br /><small>{c.to_role}</small></td>
      <td><span className={'tag ' + (c.status === 'accepte' ? 'verifie' : c.status === 'refuse' ? 'refuse' : '')}>{c.status}</span></td>
      <td>{c.n}</td><td>{c.last_at || c.created_at}</td>
      <td><button onClick={async () => { const j = await a.conversation(c.id); setText('Demande : ' + j.first_message + '\n\n' + j.messages.map(m => `[${m.created_at}] ${m.author} : ${m.body}`).join('\n')); }}>Lire</button>{text && <pre>{text}</pre>}</td>
    </tr>
  );
}

export function AdminPage() {
  const a = useAdmin(); const { user, ready } = useAuth(); const [note, setNote] = useState('');
  const tabs = <div className="bar">{TABS.map(([v, l]) => <button key={v} className={a.view === v ? 'on' : ''} onClick={() => a.setView(v)}>{l}</button>)}</div>;
  let body;
  if (ready && !user) body = <div className="msg">Connecte-toi d&apos;abord avec un compte administrateur sur <Link href="/connexion/">le site</Link>.</div>;
  else if (a.error) body = <div className="msg">{a.error.status === 401 ? <>Connecte-toi d&apos;abord avec un compte administrateur sur <Link href="/connexion/">le site</Link>.</> : a.error.status === 403 ? 'Accès réservé aux administrateurs (variable ADMIN_EMAILS).' : a.error.message}</div>;
  else if (a.loading) body = <p>Chargement…</p>;
  else if (a.view === 'guests') body = <>{tabs}<p className="muted">{a.guests.length} profil(s) invité(s) enregistré(s).</p><div className="tw"><table><thead><tr><th>Date</th><th>Pays</th><th>Profil</th><th>Centres d&apos;intérêt</th><th>E-mail</th></tr></thead><tbody>
    {a.guests.length ? a.guests.map(g => { let it: string[] = []; try { it = JSON.parse(g.interests || '[]'); } catch { /* vide */ } return <tr key={g.id}><td>{g.created_at}</td><td>{g.country}</td><td>{g.who || '—'}</td><td>{it.join(', ') || '—'}</td><td>{g.email || '—'}</td></tr>; }) : <tr><td colSpan={5}>Aucun invité pour le moment.</td></tr>}</tbody></table></div></>;
  else if (a.view === 'chats') body = <>{tabs}<p className="muted">Supervision en lecture seule. Chaque consultation est enregistrée.</p><div className="tw"><table><thead><tr><th>De</th><th>Vers</th><th>Statut</th><th>Messages</th><th>Dernier</th><th></th></tr></thead><tbody>
    {a.chats.length ? a.chats.map(c => <ChatRow key={c.id} c={c} a={a} />) : <tr><td colSpan={6}>Aucune conversation.</td></tr>}</tbody></table></div></>;
  else body = <>
    {a.stats && <div className="st">{STATS.map(([k, l]) => <div key={k}><b>{(a.stats as any)[k]}</b><small>{l}</small></div>)}</div>}
    {tabs}
    <div className="bar">{FILTERS.map(([f, l]) => <button key={f} className={a.filter === f ? 'on' : ''} onClick={() => a.setFilter(f)}>{l}</button>)}<input placeholder="Motif du refus (optionnel)" style={{ flex: 1, minWidth: 200 }} value={note} onChange={e => setNote(e.target.value)} /></div>
    <div className="tw"><table><thead><tr><th>Compte</th><th>Rôle</th><th>Statut</th><th>Offre</th><th>Inscrit</th><th>Actions</th></tr></thead><tbody>
      {a.users.length ? a.users.map(u => <UserRow key={u.id + ':' + u.status} u={u} a={a} note={note} />) : <tr><td colSpan={6}>Aucun compte.</td></tr>}</tbody></table></div>
  </>;
  return <div className="adm"><h1>Administration Spora</h1><p className="muted" style={{ margin: 0 }}><Link href="/espace/">← Retour au site</Link></p>{body}</div>;
}
