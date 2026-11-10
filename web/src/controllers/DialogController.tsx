'use client';
/* CONTROLLER : quelle fenêtre (profil joueur, fiche agent, vidéos, contact, chat) est ouverte ? */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type DialogState =
  | { kind: 'player'; id: number }
  | { kind: 'agent'; id: number }
  | { kind: 'videos'; id: number; name: string }
  | { kind: 'contact'; id: number; name: string }
  | { kind: 'chat'; id: number; name: string; onClose?: () => void }
  | null;

interface DialogCtx {
  dialog: DialogState;
  openPlayer: (id: number) => void;
  openAgent: (id: number) => void;
  openVideos: (id: number, name: string) => void;
  openContact: (id: number, name: string) => void;
  openChat: (id: number, name: string, onClose?: () => void) => void;
  close: () => void;
}
const Ctx = createContext<DialogCtx | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const close = useCallback(() => setDialog(d => { if (d && d.kind === 'chat') d.onClose?.(); return null; }), []);
  const value = useMemo<DialogCtx>(() => ({
    dialog, close,
    openPlayer: id => setDialog({ kind: 'player', id }),
    openAgent: id => setDialog({ kind: 'agent', id }),
    openVideos: (id, name) => setDialog({ kind: 'videos', id, name }),
    openContact: (id, name) => setDialog({ kind: 'contact', id, name }),
    openChat: (id, name, onClose) => setDialog({ kind: 'chat', id, name, onClose }),
  }), [dialog, close]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useDialogs() { const c = useContext(Ctx); if (!c) throw new Error('useDialogs doit être utilisé dans <DialogProvider>'); return c; }
