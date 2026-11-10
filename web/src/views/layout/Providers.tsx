'use client';
/* VIEW : fournisseurs d'état global (connexion, fenêtres) + fenêtres affichées par-dessus les pages. */
import type { ReactNode } from 'react';
import { AuthProvider } from '@/controllers/AuthController';
import { DialogProvider } from '@/controllers/DialogController';
import { SiteShell } from './SiteShell';
import { Dialogs } from '../components/Dialogs';

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider><DialogProvider><SiteShell>{children}</SiteShell><Dialogs /></DialogProvider></AuthProvider>;
}
