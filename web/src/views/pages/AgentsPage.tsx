'use client';
/* VIEW : annuaire des agents. */
import { useDialogs } from '@/controllers/DialogController';
import { useAgentDirectory } from '@/controllers/useAgents';
import { RealAgentCard, SampleAgentCard } from '../components/Cards';
import { B0, B2 } from './static/agents';

export function AgentsPage() {
  const d = useAgentDirectory(); const dlg = useDialogs(); const f = d.filters;
  return (
    <>
      <B0 />
      <div className="box">
        <div className="search s3">
          <input type="search" id="aq" placeholder="Rechercher un agent, une spécialité…" aria-label="Rechercher un agent" value={f.q} onChange={e => d.set('q', e.target.value)} />
          <select id="aPays" aria-label="Pays d'activité" value={f.country} onChange={e => d.set('country', e.target.value)}><option value="">Tous les pays</option><option>Cameroun</option><option>Côte d&apos;Ivoire</option><option>Sénégal</option><option>Ghana</option><option>Nigeria</option></select>
          <select id="aSp" aria-label="Spécialité" value={f.spec} onChange={e => d.set('spec', e.target.value)}><option value="">Toutes les spécialités</option><option>Jeunes talents</option><option>Attaquants</option><option>Défenseurs</option><option>Gardiens</option></select>
        </div>
        <p className="count" id="aCount">{d.count}{d.count > 1 ? ' agents' : ' agent'}</p>
        <div className="ogrid" id="aGrid">
          {d.real ? d.realList.map((a, i) => <RealAgentCard key={a.id} a={a} i={i} onOpen={d.canView ? () => dlg.openAgent(a.id) : undefined} />) : d.sampleList.map(({ a, i }) => <SampleAgentCard key={a[0]} a={a} i={i} />)}
        </div>
        <div className="empty" id="aEmpty" style={{ display: d.count ? 'none' : 'block' }}>Aucun agent ne correspond à cette recherche.</div>
        <p className="note">{d.real ? "Agents vérifiés par l'équipe Spora. Seuls le prénom et l'initiale sont affichés : les coordonnées ne sont jamais publiques." : "Profils fictifs, à titre d'illustration. Les agents réels auront un statut vérifié après contrôle de leurs informations et licences."}</p>
      </div>
      <B2 />
    </>
  );
}
