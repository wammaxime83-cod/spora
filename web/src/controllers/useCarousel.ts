'use client';
/* CONTROLLER : carrousel 3D des talents à la une (glisser, flèches, rotation automatique). */
import { useEffect, useRef } from 'react';

export function useCarousel(count: number) {
  const wrap = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null);
  const st = useRef({ ang: 0, shown: 0, vel: 0, drag: false, lx: 0, paused: false, n: count });
  st.current.n = count;

  useEffect(() => {
    const w = wrap.current, r = ring.current; if (!w || !r) return;
    const s = st.current, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layout = () => { const width = r.offsetWidth || 240, step = 360 / s.n, rad = Math.round((width / 2 + 22) / Math.tan(Math.PI / s.n)); r.style.setProperty('--step', step + 'deg'); r.style.setProperty('--r', rad + 'px'); };
    layout(); addEventListener('resize', layout);
    const down = (e: PointerEvent) => { s.drag = true; s.lx = e.clientX; w.setPointerCapture?.(e.pointerId); };
    const move = (e: PointerEvent) => { if (!s.drag) return; const d = e.clientX - s.lx; s.lx = e.clientX; s.ang += d * .35; s.vel = d * .35; };
    const up = () => { s.drag = false; }, enter = () => { s.paused = true; }, leave = () => { s.paused = false; };
    w.addEventListener('pointerdown', down); w.addEventListener('pointermove', move); w.addEventListener('pointerup', up); w.addEventListener('pointercancel', up); w.addEventListener('mouseenter', enter); w.addEventListener('mouseleave', leave);
    let raf = 0;
    const loop = () => { if (!s.drag && !s.paused && !reduce) s.ang -= .12; s.vel *= .92; s.shown += (s.ang - s.shown) * .12; r.style.setProperty('--a', s.shown + 'deg'); raf = requestAnimationFrame(loop); };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', layout); w.removeEventListener('pointerdown', down); w.removeEventListener('pointermove', move); w.removeEventListener('pointerup', up); w.removeEventListener('pointercancel', up); w.removeEventListener('mouseenter', enter); w.removeEventListener('mouseleave', leave); };
  }, [count]);

  return { wrap, ring, prev: () => { st.current.ang += 360 / st.current.n; }, next: () => { st.current.ang -= 360 / st.current.n; } };
}
