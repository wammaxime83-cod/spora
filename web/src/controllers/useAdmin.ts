'use client';
/* CONTROLLER : espace d'administration (comptes, conversations, invités). */
import { useCallback, useEffect, useState } from 'react';
import { AdminService } from '@/models/services';
import type { AdminConversation, AdminGuest, AdminStats, AdminUser } from '@/models/types';
import { ApiError } from '@/models/api';

export type AdminView = 'users' | 'chats' | 'guests';
export function useAdmin() {
  const [view, setView] = useState<AdminView>('users');
  const [filter, setFilter] = useState('en_attente');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [chats, setChats] = useState<AdminConversation[]>([]);
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (view === 'guests') setGuests(await AdminService.guests());
      else if (view === 'chats') setChats(await AdminService.conversations());
      else { const [s, u] = await Promise.all([AdminService.stats(), AdminService.users(filter)]); setStats(s); setUsers(u); }
    } catch (e) { setError(e as ApiError); } finally { setLoading(false); }
  }, [view, filter]);
  useEffect(() => { load(); }, [load]);

  return {
    view, setView, filter, setFilter, stats, users, chats, guests, error, loading, reload: load,
    setStatus: async (id: number, status: string, note?: string) => { await AdminService.setStatus(id, status, note); await load(); },
    setPlan: (id: number, plan: string, until?: string) => AdminService.setPlan(id, plan, until),
    remove: async (id: number) => { await AdminService.deleteUser(id); await load(); },
    profileOf: (id: number) => AdminService.user(id).then(j => j.profile),
    conversation: (id: number) => AdminService.conversation(id),
  };
}
