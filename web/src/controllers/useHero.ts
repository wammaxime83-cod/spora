'use client';
/* CONTROLLER : fond animé de la page d'accueil (diaporama de 3 scènes, particules, parallaxe des cartes). */
import { useEffect, useRef, useState } from 'react';

export function useHeroScenes(count = 3) {
  const [cur, setCur] = useState(0);
  const [tick, setTick] = useState(0);          // relancé à chaque action manuelle pour repartir de zéro
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setCur(c => (c + 1) % count), 7000); return () => clearInterval(t);
  }, [count, tick]);
  const go = (n: number) => { setCur((n + count) % count); setTick(x => x + 1); };
  return { cur, go, next: () => go(cur + 1), prev: () => go(cur - 1) };
}

/** Particules (mode "p") et réseau (mode "n") dessinés sur les <canvas class="fx">. */
export function useParticles(rootRef: React.RefObject<HTMLElement | null>, active: number) {
  const activeRef = useRef(active); activeRef.current = active;
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dark = () => getComputedStyle(document.documentElement).getPropertyValue('--hdark').trim() === '1';
    type Pt = { x: number; y: number; vx: number; vy: number; r: number; g: boolean };
    const cvs = Array.from(root.querySelectorAll<HTMLCanvasElement>('canvas.fx')).map(c => ({ c, x: c.getContext('2d')!, m: c.dataset.m || 'p', pts: [] as Pt[], w: 0, h: 0 }));
    const size = (o: typeof cvs[number]) => {
      const r = o.c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); o.w = r.width; o.h = r.height; o.c.width = r.width * d; o.c.height = r.height * d; o.x.setTransform(d, 0, 0, d, 0, 0);
      const n = o.m === 'n' ? (r.width < 600 ? 38 : 72) : (r.width < 600 ? 30 : 60); o.pts = [];
      for (let i = 0; i < n; i++) o.pts.push({ x: Math.random() * o.w, y: Math.random() * o.h, vx: (Math.random() - .5) * .35, vy: o.m === 'n' ? (Math.random() - .5) * .35 : -(.15 + Math.random() * .5), r: o.m === 'n' ? 2 + Math.random() * 2 : .8 + Math.random() * 2, g: Math.random() < .12 });
    };
    const resize = () => cvs.forEach(size); resize(); addEventListener('resize', resize);
    const draw = (o: typeof cvs[number]) => {
      const x = o.x, w = o.w, h = o.h; x.clearRect(0, 0, w, h);
      o.pts.forEach(p => { if (!reduce) { p.x += p.vx; p.y += p.vy; } if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0; });
      if (o.m === 'n') { x.lineWidth = 1; for (let i = 0; i < o.pts.length; i++) for (let j = i + 1; j < o.pts.length; j++) { const a = o.pts[i], b = o.pts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy); if (d < 150) { x.strokeStyle = (dark() ? 'rgba(243,195,132,' : 'rgba(21,53,122,') + (.4 * (1 - d / 150)) + ')'; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); } } }
      o.pts.forEach(p => { x.beginPath(); x.fillStyle = p.g ? (dark() ? 'rgba(255,198,41,.95)' : 'rgba(240,170,0,.95)') : (dark() ? (o.m === 'n' ? 'rgba(247,217,178,.9)' : 'rgba(180,200,245,.65)') : 'rgba(21,53,122,.55)'); x.arc(p.x, p.y, p.g && o.m === 'n' ? p.r + 1.5 : p.r, 0, 6.283); x.fill(); });
    };
    let raf = 0;
    const loop = () => { if (!document.hidden && scrollY < innerHeight) cvs.forEach(o => { if ((o.c.parentElement as HTMLElement).dataset.s === String(activeRef.current)) draw(o); }); raf = requestAnimationFrame(loop); };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, [rootRef]);
}

/** Les cartes du hero suivent légèrement la souris (parallaxe). */
export function useHeroParallax(heroRef: React.RefObject<HTMLElement | null>, cardsRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = heroRef.current, hc = cardsRef.current; if (!hero || !hc) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer:fine)').matches) return;
    const f = (e: PointerEvent) => { const r = hero.getBoundingClientRect(); hc.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5) * 40 + 'px'); hc.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5) * 30 + 'px'); };
    hero.addEventListener('pointermove', f); return () => hero.removeEventListener('pointermove', f);
  }, [heroRef, cardsRef]);
}

/** Les téléphones de l'éventail suivent la souris. */
export function useFollowMouse(hostRef: React.RefObject<HTMLElement | null>, targetRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = hostRef.current, tgt = targetRef.current; if (!host || !tgt) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer:fine)').matches) return;
    const m = (e: PointerEvent) => { const r = host.getBoundingClientRect(); tgt.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 22 + 'deg'); tgt.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 14 + 'deg'); };
    const l = () => { tgt.style.setProperty('--ry', '0deg'); tgt.style.setProperty('--rx', '0deg'); };
    host.addEventListener('pointermove', m); host.addEventListener('pointerleave', l);
    return () => { host.removeEventListener('pointermove', m); host.removeEventListener('pointerleave', l); };
  }, [hostRef, targetRef]);
}

/** Cartes du hero : rotation des vrais joueurs vérifiés toutes les 4,5 s. */
export function useRotatingIndex(length: number, every = 4500) {
  const [off, setOff] = useState(0);
  useEffect(() => {
    if (length <= 3 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setOff(o => (o + 1) % length), every); return () => clearInterval(t);
  }, [length, every]);
  return off;
}
