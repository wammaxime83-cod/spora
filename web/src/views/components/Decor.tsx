/* VIEW : décor animé de l'en-tête d'une page. */
import { DECOR } from './decor';

export function Decor({ k }: { k: string }) {
  const d = DECOR[k]; if (!d) return null;
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: typeof d === 'function' ? d() : d }} />;
}
