'use client';
/* CONTROLLER : comportements globaux du site (en-tête transparent, barre de lecture, apparition au défilement,
   inclinaison 3D des cartes, halo sous le curseur, boutons magnétiques, thème jour/nuit, ancres de défilement). */
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const LEGACY: Record<string, string> = { accueil: '/', joueurs: '/joueurs/', agents: '/agents/', clubs: '/clubs/', highlights: '/highlights/', opportunites: '/opportunites/', confiance: '/confiance/', premium: '/offres/', inscription: '/inscription/', connexion: '/connexion/', espace: '/espace/', reinitialiser: '/reinitialiser/' };

export function useSiteEffects() {
  const path = usePathname(); const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useRef<HTMLDivElement>(null);

  // anciens liens du type /#joueurs ou /#reinitialiser?token=… (e-mails déjà envoyés, favoris)
  useEffect(() => {
    const m = /^#([a-z]+)(\?.*)?$/.exec(location.hash);
    if (m && LEGACY[m[1]] && path === '/' ) router.replace(LEGACY[m[1]] + (m[2] || ''));
  }, [path, router]);

  useEffect(() => { setMenuOpen(false); }, [path]);
  useEffect(() => { document.body.classList.toggle('menu', menuOpen); }, [menuOpen]);

  // en-tête transparent tout en haut de l'accueil + barre de progression de lecture
  useEffect(() => {
    const on = () => {
      document.body.classList.toggle('atop', path === '/' && scrollY < 40);
      const m = document.documentElement.scrollHeight - innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${m > 0 ? Math.min(1, scrollY / m) : 0})`;
    };
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); document.body.classList.remove('atop'); };
  }, [path]);

  // apparition progressive des blocs « .rv » et halo « .spot »
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = !reduce && 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io!.unobserve(en.target); } }), { threshold: .1 }) : null;
    const scan = () => {
      document.querySelectorAll('.rv:not(.in)').forEach(el => { if (io) io.observe(el); else el.classList.add('in'); });
      if (matchMedia('(hover:hover)').matches && !reduce) document.querySelectorAll('.panel,.step,.explore a,.cp,.pc').forEach(e => e.classList.add('spot'));
    };
    scan(); const t = setTimeout(scan, 400);
    const mo = new MutationObserver(() => scan()); mo.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
    return () => { clearTimeout(t); io?.disconnect(); mo.disconnect(); };
  }, [path]);

  // inclinaison 3D, halo, boutons magnétiques (délégation : fonctionne aussi pour les cartes ajoutées plus tard)
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer:fine)').matches;
    if (reduce) return;
    const move = (ev: PointerEvent) => {
      const t = ev.target as Element; if (!t.closest) return;
      const spot = t.closest<HTMLElement>('.spot'); if (spot) { const r = spot.getBoundingClientRect(); spot.style.setProperty('--mx', ev.clientX - r.left + 'px'); spot.style.setProperty('--my', ev.clientY - r.top + 'px'); }
      if (!fine) return;
      const b = t.closest<HTMLElement>('.hero .btn,.cta .btn'); if (b) { const q = b.getBoundingClientRect(); b.style.translate = (ev.clientX - q.left - q.width / 2) * .18 + 'px ' + (ev.clientY - q.top - q.height / 2) * .28 + 'px'; }
      const el = t.closest<HTMLElement>('[data-tilt]'); if (el && !el.closest('.ring')) { const r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5; el.style.transition = 'transform .1s'; el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(14px)`; }
    };
    const out = (ev: PointerEvent) => {
      const t = ev.target as Element; if (!t.closest) return;
      const b = t.closest<HTMLElement>('.hero .btn,.cta .btn'); if (b) b.style.translate = '';
      const el = t.closest<HTMLElement>('[data-tilt]'); if (el && !el.contains(ev.relatedTarget as Node)) { el.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)'; el.style.transform = ''; }
    };
    document.addEventListener('pointermove', move); document.addEventListener('pointerout', out);
    return () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerout', out); };
  }, []);

  // ancres « data-scroll » (ex. boutons App Store → pied de page)
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const t = (e.target as Element).closest?.<HTMLElement>('[data-scroll]'); if (!t) return;
      const el = document.querySelector(t.dataset.scroll!); if (!el) return;
      e.preventDefault(); setMenuOpen(false);
      scrollTo({ top: el.getBoundingClientRect().top + scrollY - (t.dataset.scroll === '#contact' ? 0 : 90), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    document.addEventListener('click', click); return () => document.removeEventListener('click', click);
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement, dark = root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    const n = dark ? 'light' : 'dark'; root.dataset.theme = n; try { localStorage.setItem('spora-theme', n); } catch { /* stockage indisponible */ }
  }, []);

  return { menuOpen, toggleMenu: () => setMenuOpen(o => !o), progress, toggleTheme, path };
}
