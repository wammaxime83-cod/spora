'use client';
/* VIEW : page Highlights : fil de vraies vidéos (sinon aperçus d'illustration) + mode plein écran. */
import { useEffect, useRef, useState } from 'react';
import { useAutoplay, useHighlights } from '@/controllers/useHighlights';
import { useSampleHighlights } from '@/controllers/useCatalogs';
import { Chips, SampleVideoCard } from '../components/Cards';
import { FeedCard } from '../components/FeedCard';
import { B0, B2 } from './static/highlights';

function Zap({ h, startId, onClose }: { h: ReturnType<typeof useHighlights>; startId: number; onClose: () => void }) {
  const list = useRef<HTMLDivElement>(null);
  useAutoplay(list, [h.list.length], true);
  useEffect(() => {
    const el = list.current; if (!el) return;
    const i = h.list.findIndex(v => v.id === startId); if (i > 0) el.scrollTop = i * el.clientHeight;
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (/INPUT/.test((e.target as HTMLElement)?.tagName || '')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); el.scrollBy({ top: el.clientHeight, behavior: 'smooth' }); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); el.scrollBy({ top: -el.clientHeight, behavior: 'smooth' }); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', key); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = (d: number) => list.current?.scrollBy({ top: d * (list.current?.clientHeight || 0), behavior: 'smooth' });
  return (
    <div className="zap" role="dialog" aria-label="Vidéos">
      <button type="button" className="zx" aria-label="Fermer" onClick={onClose}>✕</button>
      <div className="zn"><button type="button" className="zp" aria-label="Vidéo précédente" onClick={() => go(-1)}>▲</button><button type="button" className="zd" aria-label="Vidéo suivante" onClick={() => go(1)}>▼</button></div>
      <div className="zl" ref={list}>
        {h.list.map(v => <div className="zs" data-snap="" key={v.id}><FeedCard v={v} inZap onLike={h.toggleLike} onCount={(id, n) => h.patch(id, { comments: n })} onNeedLogin={onClose} /></div>)}
      </div>
    </div>
  );
}

export function HighlightsPage() {
  const h = useHighlights(); const s = useSampleHighlights();
  const feed = useRef<HTMLDivElement>(null); const [zap, setZap] = useState<number | null>(null);
  useAutoplay(feed, [h.list.map(v => v.id).join(',')]);
  const real = !!h.videos?.length;
  return (
    <>
      <B0 />
      <div className="box">
        {real ? (
          <>
            <div className="hvs" id="hvs"><input type="search" id="hvq" placeholder="Rechercher un talent, un poste, un pays…" aria-label="Rechercher un talent" value={h.q} onChange={e => h.setQ(e.target.value)} /><p id="hvc">{h.list.length}{h.list.length > 1 ? ' vidéos' : ' vidéo'}{h.q.trim() ? ` pour « ${h.q.trim()} »` : ''}</p></div>
            <div className="hvl" id="hReal" ref={feed}>
              {h.list.length ? h.list.map(v => <FeedCard key={v.id} v={v} onLike={h.toggleLike} onCount={(id, n) => h.patch(id, { comments: n })} onZap={setZap} />) : <p className="none" style={{ textAlign: 'center' }}>Aucun talent ne correspond à cette recherche.</p>}
            </div>
          </>
        ) : (
          <>
            <div className="search s2">
              <input type="search" id="hq" placeholder="Rechercher un joueur ou une vidéo…" aria-label="Rechercher une vidéo" value={s.q} onChange={e => s.setQ(e.target.value)} />
              <select id="hCat" aria-label="Catégorie" value={s.cat} onChange={e => s.setCat(e.target.value)}><option value="">Toutes les catégories</option><option>Buts</option><option>Skills</option><option>Passes</option><option>Défense</option><option>Arrêts</option></select>
            </div>
            <Chips id="hChips" list={['Tous', 'Buts', 'Skills', 'Passes', 'Défense', 'Arrêts']} value={s.cat} onChange={s.setCat} />
            <p className="count" id="hCount">{s.list.length}{s.list.length > 1 ? ' vidéos' : ' vidéo'}</p>
            <div className="vgrid" id="hGrid">{s.list.map(v => <SampleVideoCard key={v[1]} v={v} />)}</div>
            <div className="empty" id="hEmpty" style={{ display: s.list.length ? 'none' : 'block' }}>Aucune vidéo ne correspond à cette recherche.</div>
          </>
        )}
        <p className="note">{real ? 'Les vidéos sont publiées par des joueurs vérifiés. Spora privilégie les vidéos authentiques, récentes et représentatives du niveau du joueur.' : 'Aperçus fictifs. Dès que des joueurs publient leurs vidéos, elles apparaissent ici.'}</p>
      </div>
      <B2 />
      {zap !== null && <Zap h={h} startId={zap} onClose={() => setZap(null)} />}
    </>
  );
}
