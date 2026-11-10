'use client';
/* CONTROLLER : fil de vidéos (style TikTok) : chargement, recherche, j'aime, commentaires, partage. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FeedService } from '@/models/services';
import type { CommentItem, VideoItem } from '@/models/types';
import { norm } from '@/models/helpers';
import { useAuth } from './AuthController';

export const ROLE_SHORT: Record<string, string> = { joueur: 'Joueur', agent: 'Agent', club: 'Club' };

export function useHighlights() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[] | null>(null);   // null = chargement
  const [q, setQ] = useState('');
  useEffect(() => { FeedService.list().then(setVideos, () => setVideos([])); }, [user?.id]);

  const list = useMemo(() => {
    const vs = videos || []; const t = norm(q).trim(); if (!t) return vs;
    const ws = t.split(/\s+/);
    return vs.filter(v => { const p = v.player, h = norm([p.name, p.pos, p.nat, ROLE_SHORT[p.role || ''], v.title].join(' ')); return ws.every(w => h.includes(w)); });
  }, [videos, q]);

  const patch = useCallback((id: number, change: Partial<VideoItem>) => setVideos(vs => (vs || []).map(v => (v.id === id ? { ...v, ...change } : v))), []);
  const toggleLike = useCallback(async (id: number) => {
    const r = await FeedService.like(id); patch(id, { liked: r.liked, likes: r.likes });
  }, [patch]);
  return { videos, list, q, setQ, toggleLike, patch };
}

/** Commentaires d'une vidéo (chargés à l'ouverture du panneau). */
export function useVideoComments(videoId: number, onCount: (n: number) => void) {
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => { try { const c = await FeedService.comments(videoId); setComments(c); onCount(c.length); } catch { /* ignoré */ } }, [videoId, onCount]);
  async function add(body: string) {
    setError(''); try { await FeedService.addComment(videoId, body); await load(); return true; } catch (e) { setError((e as Error).message); return false; }
  }
  async function remove(cid: number) { try { await FeedService.deleteComment(cid); await load(); } catch { /* ignoré */ } }
  return { comments, error, load, add, remove };
}

export async function shareHighlights(text: string): Promise<'shared' | 'copied' | 'manual'> {
  const url = location.origin + '/highlights/';
  if (navigator.share) { try { await navigator.share({ title: 'Spora', text, url }); } catch { /* annulé */ } return 'shared'; }
  if (navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(url); return 'copied'; } catch { return 'manual'; } }
  return 'manual';
}

/** Lance la vidéo visible à plus de 60 % dans le conteneur et met les autres en pause. */
export function useAutoplay(rootRef: React.RefObject<HTMLElement | null>, deps: unknown[], withSound = false) {
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const io = new IntersectionObserver(es => es.forEach(en => {
      const vd = en.target.querySelector('video'); if (!vd) return;
      if (en.isIntersecting && en.intersectionRatio >= .6) {
        if (withSound) vd.muted = false;
        const pr = vd.play(); if (pr?.catch) pr.catch(() => { if (withSound) { vd.muted = true; vd.play().catch(() => {}); } });
      } else vd.pause();
    }), { root, threshold: [.6] });
    root.querySelectorAll('[data-snap]').forEach(a => io.observe(a));
    return () => { io.disconnect(); root.querySelectorAll('video').forEach(v => v.pause()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
