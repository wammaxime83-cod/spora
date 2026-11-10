'use client';
/* VIEW : opportunités (exemples d'illustration). */
import { useOpportunities } from '@/controllers/useCatalogs';
import { Chips, OppCard } from '../components/Cards';
import { B0, B2 } from './static/opportunites';

export function OpportunitiesPage() {
  const d = useOpportunities();
  return (
    <>
      <B0 />
      <div className="box">
        <Chips id="oChips" style={{ paddingTop: 34 }} list={['Toutes', 'Détection', 'Essai', 'Académie', 'Tournoi', 'Formation']} value={d.cat} onChange={d.setCat} />
        <p className="count" id="oCount">{d.list.length}{d.list.length > 1 ? ' opportunités' : ' opportunité'}</p>
        <div className="ogrid" id="oGrid">{d.list.map(o => <OppCard key={o[1]} o={o} />)}</div>
        <p className="note">Exemples fictifs. Les annonces réelles seront contrôlées pour limiter les fausses détections, les arnaques et les propositions trompeuses.</p>
      </div>
      <B2 />
    </>
  );
}
