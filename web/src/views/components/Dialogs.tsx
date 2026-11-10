'use client';
/* VIEW : les fenêtres de l'application (fiche joueur, fiche agent, vidéos, contact, chat). */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDialogs } from '@/controllers/DialogController';
import { useAuth } from '@/controllers/AuthController';
import { useChat, useContactForm } from '@/controllers/useMyAccount';
import { AgentService, PlayerService } from '@/models/services';
import type { AgentFull, MyVideo, PlayerFull } from '@/models/types';
import { clockTime } from '@/models/helpers';
import { Modal, linkBtn } from './Modal';

export function Dialogs() {
  const { dialog: d, close } = useDialogs();
  if (!d) return null;
  switch (d.kind) {
    case 'player': return <PlayerDialog key={'p' + d.id} id={d.id} />;
    case 'agent': return <AgentDialog key={'a' + d.id} id={d.id} />;
    case 'videos': return <VideosDialog key={'v' + d.id} id={d.id} name={d.name} />;
    case 'contact': return <ContactDialog key={'c' + d.id} id={d.id} name={d.name} />;
    case 'chat': return <ChatDialog key={'h' + d.id} id={d.id} name={d.name} />;
  }
  void close; return null;
}

function Rows({ rows, cols = 2 }: { rows: [string, string | null | undefined][]; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10, marginBottom: 12 }}>
      {rows.filter(r => r[1]).map(r => <div key={r[0]} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '10px 12px' }}><small style={{ color: 'var(--text2)', fontWeight: 700, display: 'block' }}>{r[0]}</small><b>{r[1]}</b></div>)}
    </div>
  );
}

function PlayerDialog({ id }: { id: number }) {
  const { close, openVideos, openContact } = useDialogs(); const { user } = useAuth();
  const [p, setP] = useState<PlayerFull | null>(null); const [err, setErr] = useState('');
  useEffect(() => { PlayerService.get(id).then(setP, e => setErr(e.message || 'Profil introuvable.')); }, [id]);
  return (
    <Modal onClose={close} width={440}>
      {err ? <><p style={{ margin: '0 0 12px' }}>{err}</p><button type="button" className="btn ghost" style={{ cursor: 'pointer' }} onClick={close}>Fermer</button></>
        : !p ? <p style={{ margin: 0 }}>Chargement…</p> : (() => {
          const dn = p.dob ? new Date(p.dob + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
          return <>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              {p.photo ? <img alt="" src={p.photo} style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover' }} />
                : <span style={{ width: 76, height: 76, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--primary)', color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>{(p.name || '?').charAt(0).toUpperCase()}</span>}
              <div style={{ flex: 1, minWidth: 0 }}><h2 style={{ margin: 0, fontSize: '1.35rem' }}>{p.name} <span title="Profil vérifié" style={{ color: 'var(--primary)' }}>✓</span></h2><small style={{ color: 'var(--text2)', fontWeight: 600 }}>Joueur vérifié Spora{p.featured ? ' · ★ Mis en avant' : ''}</small></div>
              <button type="button" aria-label="Fermer" style={{ ...linkBtn, alignSelf: 'flex-start' }} onClick={close}>✕</button>
            </div>
            <Rows rows={[['Poste', p.pos], ['Autres postes', p.pos2?.join(', ')], ['Âge', p.age != null ? p.age + ' ans' : null], ['Né(e) le', dn], ['Nationalité', p.nat], ['Réside en', p.res], ['Ville', p.city], ['Niveau', p.lvl], ['Pied fort', p.foot], ['Taille', p.h ? p.h + ' cm' : null], ['Poids', p.w ? p.w + ' kg' : null], ['Club actuel', p.club]]} />
            {p.bio && <p style={{ margin: '0 0 14px', overflowWrap: 'anywhere' }}>{p.bio}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!!p.videos && <button type="button" className="btn" style={{ border: 0, cursor: 'pointer', width: '100%' }} onClick={() => openVideos(p.id, p.name)}>▶ Voir ses vidéos ({p.videos})</button>}
              {!user ? <Link className="btn ghost" href="/connexion/" onClick={close} style={{ width: '100%', textAlign: 'center' }}>Se connecter pour contacter →</Link>
                : user.id === p.id ? <Link className="btn ghost" href="/espace/" onClick={close} style={{ width: '100%', textAlign: 'center' }}>C’est ton profil · gérer →</Link>
                : user.role !== 'joueur' && user.role !== 'invite' && user.status === 'verifie' ? <button type="button" className="btn ghost" style={{ cursor: 'pointer', width: '100%' }} onClick={() => openContact(p.id, p.name)}>Contacter →</button>
                : <p style={{ margin: 0, color: 'var(--text2)', fontSize: '.9rem', textAlign: 'center' }}>{user.role === 'joueur' || user.role === 'invite' ? 'Contact réservé aux agents et aux clubs vérifiés.' : 'Contact disponible après vérification de ton profil.'}</p>}
            </div>
          </>;
        })()}
    </Modal>
  );
}

function AgentDialog({ id }: { id: number }) {
  const { close } = useDialogs(); const [a, setA] = useState<AgentFull | null>(null); const [err, setErr] = useState('');
  useEffect(() => { AgentService.get(id).then(setA, e => setErr(e.message || 'Profil introuvable.')); }, [id]);
  return (
    <Modal onClose={close} width={440}>
      {err ? <><p style={{ margin: '0 0 12px' }}>{err}</p><button type="button" className="btn ghost" style={{ cursor: 'pointer' }} onClick={close}>Fermer</button></>
        : !a ? <p style={{ margin: 0 }}>Chargement…</p> : <>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}><h2 style={{ margin: 0, fontSize: '1.35rem' }}>{a.name} <span title="Agent vérifié" style={{ color: 'var(--primary)' }}>✓</span></h2><small style={{ color: 'var(--text2)', fontWeight: 600 }}>Agent vérifié Spora</small></div>
            <button type="button" aria-label="Fermer" style={{ ...linkBtn, alignSelf: 'flex-start' }} onClick={close}>✕</button>
          </div>
          <Rows cols={1} rows={[['Pays d’activité', (a.ctr || []).join(', ')], ['Expérience', a.exp], ['Licence', a.lic], ['Organisation', a.org], ['Domaines', (a.dom || []).join(', ')]]} />
          {a.bio && <p style={{ margin: '0 0 14px', overflowWrap: 'anywhere' }}>{a.bio}</p>}
          <button type="button" className="btn ghost" style={{ cursor: 'pointer', width: '100%' }} onClick={close}>Fermer</button>
        </>}
    </Modal>
  );
}

function VideosDialog({ id, name }: { id: number; name: string }) {
  const { close } = useDialogs(); const [vs, setVs] = useState<MyVideo[] | null>(null); const [err, setErr] = useState('');
  useEffect(() => { PlayerService.videos(id).then(setVs, e => setErr(e.message)); }, [id]);
  return (
    <Modal onClose={close} width={520} padding={20}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><h2 style={{ margin: 0, fontSize: '1.3rem' }}>Vidéos de {name}</h2><button type="button" style={linkBtn} onClick={close}>Fermer</button></div>
      {err ? err : !vs ? 'Chargement…' : vs.length ? vs.map(v => (
        <div key={v.id} style={{ marginBottom: 14 }}><video controls playsInline preload="metadata" poster={v.poster || undefined} src={v.src} style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 12, display: 'block' }} /><b>{v.title || ''}</b></div>
      )) : 'Aucune vidéo.'}
    </Modal>
  );
}

function ContactDialog({ id, name }: { id: number; name: string }) {
  const { close } = useDialogs(); const router = useRouter();
  const f = useContactForm(id, () => { close(); router.push('/espace/'); });
  return (
    <Modal onClose={close} width={480} padding={24}>
      <form className="jn" onSubmit={e => { e.preventDefault(); f.send(); }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem' }}>Écrire à {name}</h2>
        <p className="lead" style={{ margin: '0 0 14px' }}>Présente-toi et explique ta démarche (10 caractères minimum). Le joueur peut accepter ou refuser ; ses coordonnées ne te sont transmises qu&apos;après son accord.</p>
        <textarea maxLength={600} value={f.message} onChange={e => f.setMessage(e.target.value)} style={{ width: '100%', minHeight: 120, padding: 13, borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', font: 'inherit' }} />
        {f.error && <div className="jn-msg w">{f.error}</div>}
        <div className="jn-act"><button type="button" className="back" style={linkBtn} onClick={close}>Annuler</button><button type="submit" className="btn" style={{ border: 0, cursor: 'pointer' }}>Envoyer</button></div>
      </form>
    </Modal>
  );
}

function ChatDialog({ id, name }: { id: number; name: string }) {
  const { close } = useDialogs(); const { messages, error, send } = useChat(id);
  const [text, setText] = useState(''); const list = useRef<HTMLDivElement>(null);
  useEffect(() => { const l = list.current; if (l && messages) { if (l.scrollHeight - l.scrollTop - l.clientHeight < 120 || l.dataset.init !== '1') { l.scrollTop = l.scrollHeight; l.dataset.init = '1'; } } }, [messages]);
  return (
    <Modal onClose={close} width={520} padding={0}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}><b>Chat avec {name}</b><button type="button" style={linkBtn} onClick={close}>Fermer</button></div>
      <div ref={list} style={{ height: 'min(55vh,420px)', overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg)' }}>
        {!messages ? 'Chargement…' : messages.length ? messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.mine ? 'var(--primary)' : 'var(--surface)', color: m.mine ? '#fff' : 'var(--text)', border: '1px solid var(--border)', borderRadius: 16, padding: '8px 12px', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
            {m.body}<small style={{ display: 'block', opacity: .7, fontSize: '.7rem', marginTop: 2 }}>{clockTime(m.created_at)}</small>
          </div>
        )) : <p style={{ color: 'var(--text2)', margin: 'auto', textAlign: 'center' }}>Dis bonjour pour démarrer la conversation.</p>}
      </div>
      <form style={{ display: 'flex', gap: 8, padding: '12px 14px', borderTop: '1px solid var(--border)' }} onSubmit={async e => { e.preventDefault(); const t = text.trim(); if (!t) return; if (await send(t)) setText(''); }}>
        <input type="text" maxLength={1000} value={text} onChange={e => setText(e.target.value)} placeholder="Écris ton message…" autoComplete="off" style={{ flex: 1, minWidth: 0, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', borderRadius: 50, padding: '10px 16px', font: 'inherit' }} />
        <button type="submit" className="btn sm" style={{ border: 0, cursor: 'pointer' }}>Envoyer</button>
      </form>
      {error && <p style={{ margin: 0, padding: '0 18px 12px', color: '#c0392b', fontSize: '.9rem' }}>{error}</p>}
    </Modal>
  );
}
