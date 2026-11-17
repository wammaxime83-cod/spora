'use client';
/* VIEW : accueil = fil de vidéos plein écran (style TikTok). Sans vraie vidéo, on garde la présentation de Spora. */
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAutoplay, useHighlights } from '@/controllers/useHighlights';
import { FeedCard } from '../components/FeedCard';
import { HomePage } from './HomePage';

export function FeedHomePage() {
  const h = useHighlights(); const router = useRouter();
  const list = useRef<HTMLDivElement>(null);
  useAutoplay(list, [h.list.length], true);
  const feed = h.videos === null || h.videos.length > 0;
  useEffect(() => { document.body.classList.toggle('feedhome', feed); return () => document.body.classList.remove('feedhome'); }, [feed]);
  if (h.videos === null) return <div className="zap tk" aria-busy="true" />;
  if (!h.videos.length) return <HomePage />;
  const go = (d: number) => list.current?.scrollBy({ top: d * (list.current?.clientHeight || 0), behavior: 'smooth' });
  return (
    <div className="zap tk" role="region" aria-label="Fil de highlights">
      <div className="zn"><button type="button" className="zp" aria-label="Vidéo précédente" onClick={() => go(-1)}>▲</button><button type="button" className="zd" aria-label="Vidéo suivante" onClick={() => go(1)}>▼</button></div>
      <div className="zl" ref={list}>
        {h.list.map(v => <div className="zs" data-snap="" key={v.id}><FeedCard v={v} inZap onLike={h.toggleLike} onCount={(id, n) => h.patch(id, { comments: n })} onNeedLogin={() => router.push('/connexion/')} /></div>)}
      </div>
    </div>
  );
}
