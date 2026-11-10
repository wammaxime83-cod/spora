'use client';
/* CONTROLLER : annuaire des agents + filtres. */
import { useEffect, useMemo, useState } from 'react';
import { AgentService } from '@/models/services';
import type { AgentCard } from '@/models/types';
import { SAMPLE_AGENTS } from '@/models/sampleData';
import { useAuth } from './AuthController';

export function useAgentDirectory() {
  const { user } = useAuth();
  const [real, setReal] = useState<AgentCard[] | null>(null);
  const [canView, setCanView] = useState(false);
  const [f, setF] = useState({ q: '', country: '', spec: '' });
  useEffect(() => { AgentService.list().then(j => { setReal(j.agents?.length ? j.agents : null); setCanView(!!j.canView); }, () => {}); }, [user?.id]);

  const realList = useMemo(() => (real || []).filter(a => {
    const q = f.q.toLowerCase().trim();
    return (!q || (a.name + ' ' + a.ctr.join(' ') + ' ' + a.dom.join(' ')).toLowerCase().includes(q)) && (!f.country || a.ctr.includes(f.country)) && (!f.spec || a.dom.includes(f.spec));
  }), [real, f]);
  const sampleList = useMemo(() => SAMPLE_AGENTS.map((a, i) => ({ a, i })).filter(({ a }) => {
    const q = f.q.toLowerCase().trim();
    return (!q || (a[0] + ' ' + a[2] + ' ' + a[3].join(' ')).toLowerCase().includes(q)) && (!f.country || a[1] === f.country) && (!f.spec || a[3].includes(f.spec));
  }), [f]);
  return { real, realList, sampleList, canView, filters: f, set: (k: 'q' | 'country' | 'spec', v: string) => setF(x => ({ ...x, [k]: v })), count: real ? realList.length : sampleList.length };
}
