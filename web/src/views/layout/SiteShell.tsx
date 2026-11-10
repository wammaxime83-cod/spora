'use client';
/* VIEW : coque commune à toutes les pages (en-tête, menu mobile, barre de progression, pied de page). */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useSiteEffects } from '@/controllers/useSiteEffects';
import { useAuth } from '@/controllers/AuthController';
import { useRouter } from 'next/navigation';

const NAV: [string, string][] = [['/', 'Accueil'], ['/joueurs/', 'Joueurs'], ['/agents/', 'Agents'], ['/clubs/', 'Clubs'], ['/highlights/', 'Highlights'], ['/opportunites/', 'Opportunités'], ['/offres/', 'Offres']];

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Spora, accueil">
      <img className="mk" src="/assets/logo-icon.svg" alt="" width={40} height={40} /><span className="wm" role="img" aria-label="Spora"></span>
    </Link>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { menuOpen, toggleMenu, progress, toggleTheme, path } = useSiteEffects();
  const { user, logout } = useAuth(); const router = useRouter();
  const cur = (h: string) => (h === path ? 'page' : undefined);
  const out = async () => { await logout(); router.push('/'); };

  return (
    <>
      <noscript><p style={{ padding: 24, fontFamily: 'sans-serif' }}>Spora a besoin de JavaScript pour fonctionner. Active-le dans ton navigateur.</p></noscript>
      <header>
        <Brand />
        <nav className="main" aria-label="Navigation principale">
          {NAV.map(([h, l]) => <Link key={h} href={h} aria-current={cur(h)}>{l}</Link>)}
        </nav>
        <div className="hr">
          <button className="theme" id="theme" type="button" aria-label="Changer de thème (jour / nuit)" title="Jour / nuit" onClick={toggleTheme}>
            <svg className="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            <svg className="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" /></svg>
          </button>
          {user?.is_admin && <a className="login" href="/admin/" style={{ fontWeight: 800 }}>Administration</a>}
          <Link className="login" href={user ? '/espace/' : '/connexion/'}>{user ? 'Mon espace' : 'Connexion'}</Link>
          {user
            ? <button type="button" className="btn sm hide-s" style={{ border: 0, cursor: 'pointer' }} onClick={out}>Se déconnecter</button>
            : <Link className="btn sm hide-s" href="/inscription/">Créer un compte</Link>}
          <button className="burger" id="burger" type="button" aria-label="Ouvrir le menu" aria-expanded={menuOpen} onClick={toggleMenu}><span></span></button>
        </div>
      </header>
      <div id="menu" aria-label="Menu">
        {[...NAV.slice(0, 6), ['/confiance/', 'Confiance'] as [string, string], NAV[6]].map(([h, l]) => <Link key={h} href={h} aria-current={cur(h)}>{l}</Link>)}
      </div>
      <main>{children}</main>
      <footer id="contact">
        <div className="box">
          <div className="fm">
            <div><Brand /><p>La plateforme qui connecte les talents, les agents et les clubs.</p></div>
            <div><h4>Plateforme</h4><Link href="/joueurs/">Joueurs</Link><Link href="/agents/">Agents</Link><Link href="/clubs/">Clubs</Link><Link href="/highlights/">Highlights</Link><Link href="/opportunites/">Opportunités</Link></div>
            <div><h4>SPORA</h4><Link href="/confiance/">Confiance &amp; sécurité</Link><Link href="/offres/">Offres</Link><Link href="/">Contact</Link><Link href="/">TikTok · Instagram · Facebook</Link></div>
          </div>
          <div className="copy"><span>© 2026 SPORA — Tous droits réservés.</span><span>Spora ne promet pas de carrière professionnelle. Lancement au Cameroun, puis dans toute l&apos;Afrique.</span></div>
        </div>
      </footer>
      <div id="sp" ref={progress}></div>
    </>
  );
}
