'use client';
/* VIEW : clubs et académies (exemples d'illustration). */
import { useClubDirectory } from '@/controllers/useCatalogs';
import { ClubCard } from '../components/Cards';
import { B0, B2 } from './static/clubs';

export function ClubsPage() {
  const d = useClubDirectory();
  return (
    <>
      <B0 />
      <div className="box">
        <div className="search s2">
          <input type="search" id="cq" placeholder="Rechercher un club ou une académie…" aria-label="Rechercher un club" value={d.q} onChange={e => d.setQ(e.target.value)} />
          <select id="cType" aria-label="Type" value={d.type} onChange={e => d.setType(e.target.value)}><option value="">Clubs et académies</option><option>Club</option><option>Académie</option></select>
        </div>
        <p className="count" id="cCount">{d.list.length}{d.list.length > 1 ? ' structures' : ' structure'}</p>
        <div className="ogrid" id="cGrid">{d.list.map(({ c, i }) => <ClubCard key={c[0]} c={c} i={i} />)}</div>
        <div className="empty" id="cEmpty" style={{ display: d.list.length ? 'none' : 'block' }}>Aucun résultat pour cette recherche.</div>
        <p className="note">Exemples fictifs, à titre d&apos;illustration de l&apos;application.</p>
      </div>
      <B2 />
    </>
  );
}
