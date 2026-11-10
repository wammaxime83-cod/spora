'use client';
/* VIEW : page d'accueil. */
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/controllers/AuthController';
import { useDialogs } from '@/controllers/DialogController';
import { useCarousel } from '@/controllers/useCarousel';
import { useFollowMouse, useHeroParallax, useHeroScenes, useParticles, useRotatingIndex } from '@/controllers/useHero';
import { useRealPlayers } from '@/controllers/usePlayers';
import { SAMPLE_PLAYERS } from '@/models/sampleData';
import type { PlayerCard } from '@/models/types';
import { art, RealPlayerCard, SamplePlayerCard } from '../components/Cards';
import { B1, B2, B4, B5, B6, B7 } from './static/accueil';

const arrow = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;

function HeroCard({ k, real, off, sample }: { k: number; real: PlayerCard[] | null; off: number; sample: number }) {
  const cls = ['h1c', 'h2c', 'h3c'][k], kk = ['1.2', '-1', '.7'][k];
  if (real) {
    if (real.length <= k) return null;
    const idx = (off + k) % real.length, p = real[idx];
    return (
      <div key={idx + ':' + off} className={`hc ${cls} sw`} style={{ '--k': kk }}>
        <div className="pimg" style={art(idx)}>{p.photo ? <img alt="" src={p.photo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : <span className="num">{p.id * 3 % 11 + 7}</span>}</div>
        <div className="pb"><div><b>{p.name}</b><small>{[p.pos, p.age != null ? p.age + ' ans' : ''].filter(Boolean).join(' · ')}</small></div><span className="vf">✓</span></div>
      </div>
    );
  }
  const p = SAMPLE_PLAYERS[sample];
  return (
    <div className={`hc ${cls}`} style={{ '--k': kk }}>
      <div className="pimg" style={art(sample)}><span className="num">{sample * 3 % 11 + 7}</span></div>
      <div className="pb"><div><b>{p[0].split(' ')[0]} {p[0].split(' ')[1][0]}.</b><small>{p[4]} · {p[1]} ans</small></div><span className="vf">★</span></div>
    </div>
  );
}

function Hero({ real }: { real: PlayerCard[] | null }) {
  const sc = useHeroScenes(3); const root = useRef<HTMLElement>(null), cards = useRef<HTMLDivElement>(null);
  const off = useRotatingIndex(real?.length || 0);
  useParticles(root, sc.cur); useHeroParallax(root, cards);
  return (
    <section className="hero" id="hero" ref={root}>
      <div className={'bgs' + (sc.cur === 0 ? ' on' : '')} data-s="0"><div className="beams"></div><img className="ball" alt="" src="/assets/logo-icon.svg" /><canvas className="fx" data-m="p"></canvas></div>
      <div className={'bgs' + (sc.cur === 1 ? ' on' : '')} data-s="1"><div className="pitch"><i></i></div><div className="beams b2"></div><canvas className="fx" data-m="p"></canvas></div>
      <div className={'bgs' + (sc.cur === 2 ? ' on' : '')} data-s="2"><canvas className="fx" data-m="n"></canvas></div>
      <div className="shade"></div>
      <div className="box hero-in">
        <div className="hcopy">
          <span className="badge hin"><i></i>La plateforme des talents du football africain</span>
          <h1 className="hin" style={{ '--d': '.08s' }}>Le prochain talent <span className="grad">est peut-être ici.</span></h1>
          <p className="desc hin" style={{ '--d': '.16s' }}>Spora est l&apos;application qui permet aux footballeurs africains de créer leur profil, publier leurs highlights et être découverts par des agents, des clubs et des recruteurs.</p>
          <div className="row hin" style={{ '--d': '.24s' }}><Link className="btn wb" href="/joueurs/">Explorer les talents {arrow}</Link><Link className="btn gl" href="/inscription/">Créer mon profil {arrow}</Link></div>
          <p className="hnote hin" style={{ '--d': '.32s' }}><i></i>Lancement au Cameroun, puis dans toute l&apos;Afrique</p>
        </div>
        <div className="hcards" id="hcards" ref={cards} aria-hidden="true">
          <HeroCard k={0} real={real} off={off} sample={0} /><HeroCard k={1} real={real} off={off} sample={2} /><HeroCard k={2} real={real} off={off} sample={1} />
        </div>
      </div>
      <div className="sctl">
        <span className="dots" id="dots">{[0, 1, 2].map(i => <i key={i} className={sc.cur === i ? 'on' : ''} />)}</span>
        <button type="button" id="sprev" aria-label="Fond précédent" onClick={sc.prev}>‹</button><button type="button" id="snext" aria-label="Fond suivant" onClick={sc.next}>›</button>
      </div>
    </section>
  );
}

function Carousel({ real }: { real: PlayerCard[] | null }) {
  const n = real ? Math.max(5, Math.min(real.length, 9)) : 9;
  const car = useCarousel(n); const { user } = useAuth(); const dlg = useDialogs();
  const list = real || [];
  return (
    <section className="sec"><div className="box">
      <div className="sh rv"><div><small>Talents à la une</small><h2>Découvrez les joueurs qui font parler d&apos;eux.</h2></div><Link className="more" href="/joueurs/">Voir tous les joueurs →</Link></div>
      <div className="carwrap" id="carwrap" ref={car.wrap}>
        <div className="ring" id="ring" ref={car.ring}>
          {Array.from({ length: n }, (_, k) => (
            <div key={k} className="pcard-wrap" style={{ position: 'absolute', inset: 0, transform: `rotateY(calc(${k}*var(--step))) translateZ(var(--r))`, backfaceVisibility: 'hidden' }}>
              {real ? <RealPlayerCard p={list[k % list.length]} i={k} user={user} onProfile={() => dlg.openPlayer(list[k % list.length].id)} onVideos={() => dlg.openVideos(list[k % list.length].id, list[k % list.length].name)} onContact={() => dlg.openContact(list[k % list.length].id, list[k % list.length].name)} /> : <SamplePlayerCard p={SAMPLE_PLAYERS[k % SAMPLE_PLAYERS.length]} i={k} />}
            </div>
          ))}
        </div>
      </div>
      <div className="carctl"><button type="button" id="prev" aria-label="Précédent" onClick={car.prev}>‹</button><span id="carNote">Glisse ou utilise les flèches · {real ? 'profils vérifiés' : 'profils fictifs'}</span><button type="button" id="next" aria-label="Suivant" onClick={car.next}>›</button></div>
    </div></section>
  );
}

/** Les téléphones de la section « application » suivent la souris. */
function FanEffects() {
  const host = useRef<HTMLElement | null>(null), tgt = useRef<HTMLElement | null>(null);
  useEffect(() => { host.current = document.getElementById('fan'); tgt.current = document.getElementById('fanin'); }, []);
  useFollowMouse(host, tgt);
  return null;
}

export function HomePage() {
  const { real } = useRealPlayers();
  return (
    <>
      <Hero real={real} />
      <B1 />
      <B2 />
      <Carousel real={real} />
      <B4 /><FanEffects />
      <B5 />
      <B6 />
      <B7 />
    </>
  );
}
