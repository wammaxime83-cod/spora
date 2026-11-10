'use client';
/* CONTROLLER : annuaire des joueurs (vrais profils vérifiés, sinon profils d'illustration) + filtres. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlayerService } from '@/models/services';
import type { PlayerCard } from '@/models/types';
import { SAMPLE_PLAYERS, type SamplePlayer } from '@/models/sampleData';
import { norm, posMatches } from '@/models/helpers';
import { useAuth } from './AuthController';

export interface PlayerFilters { q: string; pos: string; age: string; country: string; level: string }
export const NO_FILTER: PlayerFilters = { q: '', pos: '', age: '', country: '', level: '' };

/** Joueurs réels, rechargés à chaque changement de session (les droits d'affichage dépendent de l'utilisateur). */
export function useRealPlayers() {
  const { user } = useAuth();
  const [real, setReal] = useState<PlayerCard[] | null>(null);
  const reload = useCallback(() => { PlayerService.list().then(l => setReal(l.length ? l : null), () => {}); }, []);
  useEffect(() => { reload(); }, [reload, user?.id]);
  return { real, reload };
}

export function usePlayerDirectory() {
  const { real } = useRealPlayers();
  const [filters, setFilters] = useState<PlayerFilters>(NO_FILTER);
  const set = (k: keyof PlayerFilters, v: string) => setFilters(f => ({ ...f, [k]: v }));

  const realList = useMemo(() => (real || []).filter(p => {
    const q = filters.q.toLowerCase().trim();
    if (q && !(p.name + ' ' + (p.city || '') + ' ' + (p.nat || '')).toLowerCase().includes(q)) return false;
    if (!posMatches(filters.pos, p.pos)) return false;
    if (filters.country && p.nat !== filters.country) return false;
    if (filters.level && !(p.lvl || '').startsWith(filters.level)) return false;
    if (filters.age) { const [a, b] = filters.age.split('-').map(Number); if (p.age == null || p.age < a || p.age > b) return false; }
    return true;
  }), [real, filters]);

  const sampleList = useMemo<{ p: SamplePlayer; i: number }[]>(() => SAMPLE_PLAYERS.map((p, i) => ({ p, i })).filter(({ p }) => {
    const q = filters.q.toLowerCase().trim();
    if (q && !(p[0] + ' ' + p[3] + ' ' + p[2] + ' ' + p[9]).toLowerCase().includes(q)) return false;
    if (filters.pos && p[4] !== filters.pos) return false;
    if (filters.country && p[2] !== filters.country) return false;
    if (filters.level && p[8] !== filters.level) return false;
    if (filters.age) { const [a, b] = filters.age.split('-').map(Number); if (p[1] < a || p[1] > b) return false; }
    return true;
  }), [filters]);

  const count = real ? realList.length : sampleList.length;
  return { real, realList, sampleList, filters, set, count, norm };
}
