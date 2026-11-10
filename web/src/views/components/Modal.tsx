'use client';
/* VIEW : fenêtre modale basée sur l'élément natif <dialog>. */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export function Modal({ onClose, children, width = 480, padding = 22, style }: { onClose: () => void; children: ReactNode; width?: number; padding?: number | string; style?: CSSProperties }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
    return () => { if (d.open) d.close(); };
  }, []);
  return (
    <dialog ref={ref} onClose={onClose} onClick={e => { if (e.target === ref.current) onClose(); }}
      style={{ border: '1px solid var(--border)', borderRadius: 22, padding, maxWidth: width, width: 'calc(100% - 32px)', background: 'var(--surface)', color: 'var(--text)', overflow: 'hidden', ...style }}>
      {children}
    </dialog>
  );
}

export const linkBtn: CSSProperties = { background: 'none', border: 0, color: 'var(--text2)', font: 'inherit', fontWeight: 800, cursor: 'pointer' };
