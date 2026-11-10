'use client';
/* CONTROLLER : filtres des listes d'illustration (clubs, vidéos d'exemple, opportunités). */
import { useMemo, useState } from 'react';
import { SAMPLE_CLUBS, SAMPLE_OPPORTUNITIES, SAMPLE_VIDEOS } from '@/models/sampleData';

export function useClubDirectory() {
  const [q, setQ] = useState(''); const [type, setType] = useState('');
  const list = useMemo(() => SAMPLE_CLUBS.map((c, i) => ({ c, i })).filter(({ c }) => (!q.trim() || (c[0] + ' ' + c[2]).toLowerCase().includes(q.toLowerCase().trim())) && (!type || c[1] === type)), [q, type]);
  return { list, q, setQ, type, setType };
}
export function useSampleHighlights() {
  const [q, setQ] = useState(''); const [cat, setCat] = useState('');
  const list = useMemo(() => SAMPLE_VIDEOS.filter(v => (!cat || v[0] === cat) && (!q.trim() || (v[1] + ' ' + v[2]).toLowerCase().includes(q.toLowerCase().trim()))), [q, cat]);
  return { list, q, setQ, cat, setCat };
}
export function useOpportunities() {
  const [cat, setCat] = useState('');
  const list = useMemo(() => SAMPLE_OPPORTUNITIES.filter(o => !cat || o[0] === cat), [cat]);
  return { list, cat, setCat };
}
