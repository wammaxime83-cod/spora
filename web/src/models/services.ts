/* MODEL : un service par ressource du serveur (auth, joueurs, agents, vidéos, contacts, chat, admin). */
import { api } from './api';
import type * as T from './types';

export const AuthService = {
  me: () => api<{ user: T.User | null }>('GET', '/auth/me').then(j => j.user),
  login: (email: string, password: string) => api<{ user: T.User }>('POST', '/auth/login', { email, password }).then(j => j.user),
  logout: () => api('POST', '/auth/logout', {}),
  register: (payload: Record<string, unknown>) => api<{ user: T.User }>('POST', '/auth/register', payload).then(j => j.user),
  forgot: (email: string) => api('POST', '/auth/forgot', { email }),
  reset: (token: string, password: string) => api('POST', '/auth/reset', { token, password }),
  resendVerification: () => api('POST', '/auth/resend-verification', {}),
  deleteAccount: (password: string) => api('DELETE', '/auth/me', { password }),
};

export const PlayerService = {
  list: () => api<{ players: T.PlayerCard[] }>('GET', '/players?limit=24').then(j => j.players || []),
  get: (id: number | string) => api<{ player: T.PlayerFull }>('GET', `/players/${id}`).then(j => j.player),
  videos: (id: number | string) => api<{ videos: T.MyVideo[] }>('GET', `/players/${id}/videos`).then(j => j.videos || []),
};

export const AgentService = {
  list: () => api<{ canView: boolean; agents: T.AgentCard[] }>('GET', '/agents'),
  get: (id: number | string) => api<{ agent: T.AgentFull }>('GET', `/agents/${id}`).then(j => j.agent),
};

export const FeedService = {
  list: () => api<{ videos: T.VideoItem[] }>('GET', '/videos').then(j => j.videos || []),
  like: (id: number) => api<{ liked: boolean; likes: number }>('POST', `/videos/${id}/like`),
  comments: (id: number) => api<{ comments: T.CommentItem[] }>('GET', `/videos/${id}/comments`).then(j => j.comments || []),
  addComment: (id: number, body: string) => api('POST', `/videos/${id}/comments`, { body }),
  deleteComment: (cid: number) => api('DELETE', `/videos/comments/${cid}`),
};

export const ProfileService = {
  get: () => api<{ user: T.User; profile: Record<string, any> }>('GET', '/me/profile'),
  save: (body: Record<string, unknown>) => api<{ user: T.User; profile: Record<string, any> }>('PUT', '/me/profile', body),
  contacts: () => api<{ contacts: T.ContactItem[] }>('GET', '/me/contacts').then(j => j.contacts || []),
  answerContact: (id: number, status: 'accepte' | 'refuse') => api('PUT', `/me/contacts/${id}`, { status }),
  videos: () => api<T.VideoSettings>('GET', '/me/videos'),
  videoTicket: () => api<T.UploadTicket>('POST', '/me/videos/sign', {}),
  videoRegister: (public_id: string, title: string) => api('POST', '/me/videos', { public_id, title }),
  videoDelete: (id: number) => api('DELETE', `/me/videos/${id}`),
};

export const ContactService = {
  send: (to: number, message: string) => api('POST', '/contacts', { to, message }),
};

export const ChatService = {
  messages: (contactId: number) => api<{ messages: T.ChatMessage[] }>('GET', `/chat/${contactId}/messages`).then(j => j.messages || []),
  send: (contactId: number, body: string) => api('POST', `/chat/${contactId}/messages`, { body }),
};


export const AdminService = {
  stats: () => api<T.AdminStats>('GET', '/admin/stats'),
  users: (status?: string) => api<{ users: T.AdminUser[] }>('GET', '/admin/users' + (status ? `?status=${status}` : '')).then(j => j.users),
  user: (id: number) => api<{ profile: unknown }>('GET', `/admin/users/${id}`),
  setStatus: (id: number, status: string, note?: string) => api('PUT', `/admin/users/${id}/status`, { status, note }),
  setPlan: (id: number, plan: string, until?: string) => api('PUT', `/admin/users/${id}/plan`, { plan, until }),
  deleteUser: (id: number) => api('DELETE', `/admin/users/${id}`),
  guests: () => api<{ guests: T.AdminGuest[] }>('GET', '/admin/guests').then(j => j.guests),
  conversations: () => api<{ conversations: T.AdminConversation[] }>('GET', '/admin/conversations').then(j => j.conversations),
  conversation: (id: number) => api<{ first_message: string; messages: { created_at: string; author: string; body: string }[] }>('GET', `/admin/conversations/${id}`),
};
