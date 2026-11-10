'use client';
/* CONTROLLER : état de connexion partagé par toute l'application (qui est connecté ? connexion, déconnexion…). */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@/models/types';
import { AuthService } from '@/models/services';

interface AuthCtx {
  user: User | null;
  ready: boolean;                       // false tant que la session n'a pas été vérifiée auprès du serveur
  setUser: (u: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try { const u = await AuthService.me(); if (alive.current) setUser(u); return u; }
    catch { if (alive.current) setUser(null); return null; }
    finally { if (alive.current) setReady(true); }
  }, []);
  useEffect(() => { alive.current = true; refresh(); return () => { alive.current = false; }; }, [refresh]);

  const login = useCallback(async (email: string, password: string) => { const u = await AuthService.login(email, password); setUser(u); return u; }, []);
  const logout = useCallback(async () => { try { await AuthService.logout(); } finally { setUser(null); } }, []);

  const value = useMemo(() => ({ user, ready, setUser, login, logout, refresh }), [user, ready, login, logout, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth() { const c = useContext(Ctx); if (!c) throw new Error('useAuth doit être utilisé dans <AuthProvider>'); return c; }
