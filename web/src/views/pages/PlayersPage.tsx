'use client';
/* VIEW : annuaire des joueurs. */
import { useAuth } from '@/controllers/AuthController';
import { useDialogs } from '@/controllers/DialogController';
import { usePlayerDirectory } from '@/controllers/usePlayers';
import { RealPlayerCard, SamplePlayerCard } from '../components/Cards';
import { B0, B2 } from './static/joueurs';

export function PlayersPage() {
  const { user } = useAuth(); const dlg = useDialogs();
  const d = usePlayerDirectory(); const f = d.filters, set = d.set;
  return (
    <>
      <B0 />
      <div className="box">
        <div className="search" id="pSearch">
          <input type="search" id="pq" placeholder="Rechercher un joueur, une ville, un club…" aria-label="Rechercher un joueur" value={f.q} onChange={e => set('q', e.target.value)} />
          <select id="pPos" aria-label="Poste" value={f.pos} onChange={e => set('pos', e.target.value)}><option value="">Tous les postes</option><option>Attaquant</option><option>Milieu</option><option>Défenseur</option><option>Gardien</option></select>
          <select id="pAge" aria-label="Âge" value={f.age} onChange={e => set('age', e.target.value)}><option value="">Tous les âges</option><option value="16-18">16 - 18 ans</option><option value="19-21">19 - 21 ans</option><option value="22-25">22 - 25 ans</option></select>
          <select id="pPays" aria-label="Pays" value={f.country} onChange={e => set('country', e.target.value)}><option value="">Tous les pays</option><option>Cameroun</option><option>Côte d&apos;Ivoire</option><option>Sénégal</option><option>Ghana</option><option>Nigeria</option></select>
          <select id="pLvl" aria-label="Niveau" value={f.level} onChange={e => set('level', e.target.value)}><option value="">Tous les niveaux</option><option>Professionnel</option><option>Semi-professionnel</option><option>Amateur</option><option>Académie</option></select>
        </div>
        <p className="count" id="pCount">{d.count}{d.count > 1 ? ' joueurs à découvrir' : ' joueur à découvrir'}</p>
        <div className="pgrid" id="pGrid">
          {d.real
            ? d.realList.map((p, i) => <RealPlayerCard key={p.id} p={p} i={i} user={user} onProfile={() => dlg.openPlayer(p.id)} onVideos={() => dlg.openVideos(p.id, p.name)} onContact={() => dlg.openContact(p.id, p.name)} />)
            : d.sampleList.map(({ p, i }) => <SamplePlayerCard key={p[0]} p={p} i={i} />)}
        </div>
        <div className="empty" id="pEmpty" style={{ display: d.count ? 'none' : 'block' }}>Aucun joueur ne correspond à cette recherche.</div>
        <p className="note">{d.real ? "Profils vérifiés par l'équipe Spora. Les coordonnées ne sont partagées qu'avec l'accord du joueur." : "Profils fictifs, à titre d'illustration. Dès que des joueurs sont vérifiés, ils apparaissent ici à la place."}</p>
      </div>
      <B2 />
    </>
  );
}
