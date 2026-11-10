/* MODEL : petites fonctions pures (aucun React, aucun accès réseau). */
export const norm = (t: unknown) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export const initials = (x: string) => { const p = String(x || '').trim().split(/\s+/); return ((p[0] || '').charAt(0) + (p[1] || '').charAt(0)).toUpperCase(); };
export const SHORT_POS: Record<string, string> = { Gardien: 'GAR', Attaquant: 'ATT', Ailier: 'AIL', 'Défenseur central': 'DC', 'Latéral droit': 'LD', 'Latéral gauche': 'LG' };
export const shortPos = (pos?: string) => SHORT_POS[pos || ''] || (/^Milieu/.test(pos || '') ? 'MIL' : '');
export function posMatches(filter: string, pos = '') {
  return !filter || pos === filter || (filter === 'Milieu' && /^Milieu/.test(pos)) || (filter === 'Défenseur' && /^(Défenseur|Latéral)/.test(pos)) || (filter === 'Attaquant' && pos === 'Ailier');
}
export function ageFromDate(d?: string): number | null {
  if (!d) return null; const b = new Date(d), n = new Date(); if (isNaN(b.getTime())) return null;
  let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a >= 0 && a < 80 ? a : null;
}
export const strengthScore = (p: string) => Number(p.length >= 8) + Number(/[A-Z]/.test(p)) + Number(/\d/.test(p)) + Number(/[^A-Za-z0-9]/.test(p));
export function ago(t: string) {
  const s = (Date.now() - new Date(String(t).replace(' ', 'T') + 'Z').getTime()) / 1000; if (isNaN(s)) return '';
  if (s < 60) return "à l'instant"; if (s < 3600) return Math.floor(s / 60) + ' min'; if (s < 86400) return Math.floor(s / 3600) + ' h'; return Math.floor(s / 86400) + ' j';
}
export function clockTime(t: string) {
  const d = new Date(String(t).replace(' ', 'T') + 'Z'); return isNaN(d.getTime()) ? '' : d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
/** Réduit une photo à 512 px (JPEG) avant l'envoi. */
export function shrinkImage(file: File): Promise<string | null> {
  return new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 512 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k)); c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .82)); }; im.onerror = () => res(null); im.src = String(fr.result); };
    fr.onerror = () => res(null); fr.readAsDataURL(file);
  });
}
