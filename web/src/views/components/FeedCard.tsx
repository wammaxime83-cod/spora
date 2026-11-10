'use client';
/* VIEW : une vidéo du fil Highlights (j'aime, commentaires, partage, plein écran). */
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/controllers/AuthController';
import { useDialogs } from '@/controllers/DialogController';
import { ROLE_SHORT, shareHighlights, useVideoComments } from '@/controllers/useHighlights';
import type { VideoItem } from '@/models/types';
import { ago } from '@/models/helpers';

interface Props { v: VideoItem; onLike: (id: number) => Promise<void>; onCount: (id: number, n: number) => void; onZap?: (id: number) => void; inZap?: boolean; onNeedLogin?: () => void }

export function FeedCard({ v, onLike, onCount, onZap, inZap, onNeedLogin }: Props) {
  const { user } = useAuth(); const router = useRouter(); const dlg = useDialogs();
  const p = v.player;
  const [open, setOpen] = useState(false); const [muted, setMuted] = useState(true); const [shareTxt, setShareTxt] = useState('Partager');
  const [text, setText] = useState('');
  const count = useCallback((n: number) => onCount(v.id, n), [onCount, v.id]);
  const cm = useVideoComments(v.id, count);
  const needLogin = () => { onNeedLogin?.(); router.push('/connexion/'); };

  async function like() { if (!user) return needLogin(); try { await onLike(v.id); } catch { /* ignoré */ } }
  function toggleComments() { const o = !open; setOpen(o); if (o) cm.load(); }
  async function share() {
    const r = await shareHighlights((p.name || 'Un joueur') + ' sur Spora');
    if (r === 'copied') { setShareTxt('Lien copié !'); setTimeout(() => setShareTxt('Partager'), 1800); }
  }
  function togglePlay(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as Element).closest('.snd')) return;
    const vd = e.currentTarget.querySelector('video'); if (!vd) return; if (vd.paused) vd.play().catch(() => {}); else vd.pause();
  }
  const openProfile = () => { if (p.id) dlg.openPlayer(p.id); };

  return (
    <article className="hv" data-id={v.id} data-pid={p.id || ''} data-snap={inZap ? undefined : ''}>
      <div className="who">
        <span className="av pp" role="button" tabIndex={0} aria-label="Voir le profil" onClick={openProfile}>{(p.name || '?').charAt(0).toUpperCase()}</span>
        <div><b className="pp" role="button" tabIndex={0} onClick={openProfile}>{p.name}</b><small>{[ROLE_SHORT[p.role || ''], p.pos, p.nat].filter(Boolean).join(' · ')}</small>{v.title && <p>{v.title}</p>}</div>
      </div>
      <div className="vw" onClick={togglePlay}>
        <video playsInline loop muted={muted} preload="metadata" poster={v.poster || undefined} src={v.src} ref={el => { if (el) el.muted = muted; }}></video>
        <button type="button" className="snd" aria-label="Activer le son" onClick={() => setMuted(m => !m)}>{muted ? '🔇' : '🔊'}</button>
      </div>
      <div className="act">
        <button type="button" className={v.liked ? 'on' : ''} aria-pressed={v.liked} onClick={like}><i>{v.liked ? '♥' : '♡'}</i><span>{v.likes || 0}</span></button>
        <button type="button" onClick={toggleComments}><i>💬</i><span>{v.comments || 0}</span></button>
        <button type="button" onClick={share}><i>↗</i><em>{shareTxt}</em></button>
        {!inZap && onZap && <button type="button" aria-label="Plein écran" onClick={() => onZap(v.id)}><i>⛶</i><em>Plein écran</em></button>}
      </div>
      {open && (
        <div className="cmw">
          <div className="cml">
            {!cm.comments ? null : cm.comments.length ? cm.comments.map(c => (
              <div className="c" key={c.id}><b>{c.name}</b> <small>{ago(c.created_at)}</small>{c.mine && <> <button type="button" className="cx" aria-label="Supprimer" onClick={() => cm.remove(c.id)}>✕</button></>}<p>{c.body}</p></div>
            )) : <p className="none">Aucun commentaire pour l’instant. Sois le premier !</p>}
          </div>
          <form className="cmf" onSubmit={async e => { e.preventDefault(); if (!user) return needLogin(); const t = text.trim(); if (!t) return; if (await cm.add(t)) setText(''); }}>
            <input type="text" maxLength={500} placeholder="Ajouter un commentaire…" aria-label="Commentaire" value={text} onChange={e => setText(e.target.value)} />
            <button type="submit">Publier</button>
          </form>
          {cm.error && <p className="cme">{cm.error}</p>}
        </div>
      )}
    </article>
  );
}
