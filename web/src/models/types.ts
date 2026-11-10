/* MODEL : types des données échangées avec le serveur. */
export type Role = 'joueur' | 'agent' | 'club' | 'invite';
export type Status = 'en_attente' | 'verifie' | 'refuse';
export type Plan = 'gratuit' | 'standard' | 'premium' | 'elite';

export interface User {
  id: number; email: string; role: Role; name: string; tel: string | null;
  status: Status; status_note: string | null; plan: Plan; plan_until: string | null;
  is_admin: boolean; email_verified: boolean;
}
export interface PlayerCard {
  id: number; name: string; age: number | null; nat?: string; city?: string; pos?: string; lvl?: string;
  photo?: string; videos?: number; featured?: boolean;
}
export interface PlayerFull extends PlayerCard {
  dob?: string; res?: string; pos2?: string[]; foot?: string; h?: number; w?: number; club?: string; bio?: string;
}
export interface AgentCard { id: number; name: string; ctr: string[]; exp?: string | null; dom: string[] }
export interface AgentFull extends AgentCard { org?: string | null; lic?: string | null; bio?: string | null }
export interface VideoItem {
  id: number; title?: string; src: string; poster?: string; likes: number; comments: number; liked: boolean;
  player: { id: number; name: string; pos?: string; nat?: string; role?: string };
}
export interface CommentItem { id: number; name: string; body: string; created_at: string; mine: boolean }
export interface ContactItem {
  id: number; status: 'envoye' | 'accepte' | 'refuse'; direction: 'recu' | 'envoye'; message: string; unread?: number;
  other: { id: number; name: string; role: Role };
}
export interface ChatMessage { id: number; body: string; mine: boolean; created_at: string }
export interface MyVideo { id: number; title?: string; src: string; poster: string }
export interface VideoSettings { mode: 'cloud' | 'local' | null; enabled: boolean; max: number; max_seconds: number; videos: MyVideo[] }
export interface UploadTicket { url: string; api_key: string; timestamp: string | number; public_id: string; allowed_formats: string; signature: string }

export interface AdminStats { users: number; joueurs: number; agents: number; clubs: number; en_attente: number; payants: number; invites: number; contacts: number }
export interface AdminUser { id: number; email: string; role: string; name: string; tel?: string; status: Status; plan: Plan; plan_until?: string; email_verified: number; created_at: string }
export interface AdminGuest { id: number; country: string; who?: string; interests?: string; email?: string; created_at: string }
export interface AdminConversation { id: number; from_name: string; from_role: string; to_name: string; to_role: string; status: string; n: number; last_at?: string; created_at: string }
