'use client';
/* CONTROLLER : « Mon espace » : profil, vidéos, mises en relation, chat, suppression du compte. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatService, ContactService, ProfileService, AuthService } from '@/models/services';
import type { ChatMessage, ContactItem, User, VideoSettings } from '@/models/types';
import { INFO_FIELDS } from '@/models/forms';
import { shrinkImage } from '@/models/helpers';
import { ApiError } from '@/models/api';
import { useAuth } from './AuthController';

export function useMyProfile(user: User) {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [data, setData] = useState<Record<string, any>>({});
  const [name, setName] = useState(user.name); const [tel, setTel] = useState(user.tel || '');
  const [photo, setPhoto] = useState<string | null>(null); const [removePhoto, setRemovePhoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({}); const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [loadError, setLoadError] = useState(''); const [photoKey, setPhotoKey] = useState(() => Date.now());

  useEffect(() => { ProfileService.get().then(j => { setProfile(j.profile || {}); setData({ ...(j.profile || {}) }); setName(j.user.name); setTel(j.user.tel || ''); }, e => setLoadError((e as Error).message)); }, [user.id]);

  const set = (id: string, v: any) => setData(d => ({ ...d, [id]: v }));
  const toggle = (id: string, kind: string, v: string, max?: number) => setData(d => {
    if (kind === 'radio') return { ...d, [id]: d[id] === v ? '' : v };
    const a: string[] = (d[id] || []).slice(), i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else if (!max || a.length < max) a.push(v); return { ...d, [id]: a };
  });
  const pickPhoto = async (f: File) => { const d = await shrinkImage(f); if (d) { setPhoto(d); setRemovePhoto(false); } };

  async function save() {
    setErrors({}); const prof: Record<string, unknown> = {};
    Object.keys(data).forEach(k => { const v = data[k]; if (v === undefined || v === '' || v === null) return; const fd = INFO_FIELDS[user.role].find(x => x.id === k); if (fd) prof[k] = fd.t === 'number' ? Number(v) : v; });
    const body: Record<string, unknown> = { profile: prof, name, tel };
    if (photo) body.photo = photo; if (removePhoto) body.remove_photo = true;
    try { const j = await ProfileService.save(body); setUser(j.user); setProfile(j.profile); setPhoto(null); setRemovePhoto(false); setPhotoKey(Date.now()); setMsg({ t: 'Profil enregistré.', ok: true }); }
    catch (e) { const er = e as ApiError, id = (er.field || '').replace(/^profile\./, ''); if (id) setErrors({ [id]: er.message }); setMsg({ t: er.message, ok: false }); }
  }
  return { profile, data, name, setName, tel, setTel, photo, removePhoto, setRemovePhoto, errors, msg, loadError, photoKey, set, toggle, pickPhoto, save };
}

export function useMyVideos() {
  const [settings, setSettings] = useState<VideoSettings | null>(null);
  const [error, setError] = useState(''); const [progress, setProgress] = useState<{ pct: number; text: string } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(() => ProfileService.videos().then(setSettings, e => setError((e as Error).message)), []);
  useEffect(() => { load(); }, [load]);

  const fail = (m: string) => { setProgress(null); setMsg(m); };
  async function upload(file: File, title: string) {
    if (!settings) return; setMsg(null);
    const local = settings.mode === 'local', lim = local ? 30 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > lim) return fail(`Vidéo trop lourde (${local ? 30 : 100} Mo maximum). Réduis-la ou raccourcis-la.`);
    if (file.type && !file.type.startsWith('video/')) return fail("Ce fichier n'est pas une vidéo.");
    setProgress({ pct: 0, text: 'Préparation…' });
    const send = (xhr: XMLHttpRequest, body: XMLHttpRequestBodyInit) => new Promise<{ status: number; json: any }>(res => {
      xhr.upload.onprogress = e => { if (e.lengthComputable) { const p = Math.round(e.loaded / e.total * 100); setProgress({ pct: p, text: `Envoi… ${p} %` }); } };
      xhr.onerror = () => res({ status: 0, json: {} });
      xhr.onload = () => { let j: any = {}; try { j = JSON.parse(xhr.responseText); } catch { /* vide */ } res({ status: xhr.status, json: j }); };
      xhr.send(body);
    });
    try {
      if (local) {
        const x = new XMLHttpRequest(); x.open('POST', '/api/me/videos/local?title=' + encodeURIComponent(title)); x.setRequestHeader('Content-Type', file.type || 'video/mp4');
        const r = await send(x, file); if (!r.status) return fail("Connexion perdue pendant l'envoi. Réessaie."); if (r.status >= 300) return fail(r.json.error || 'Envoi refusé.');
      } else {
        const t = await ProfileService.videoTicket();
        const fd = new FormData(); (['api_key', 'timestamp', 'public_id', 'allowed_formats', 'signature'] as const).forEach(k => fd.append(k, String(t[k]))); fd.append('file', file);
        const x = new XMLHttpRequest(); x.open('POST', t.url);
        const r = await send(x, fd); if (!r.status) return fail("Connexion perdue pendant l'envoi. Réessaie."); if (r.status >= 300) return fail(r.json.error?.message || 'Le service vidéo a refusé le fichier.');
        setProgress({ pct: 100, text: 'Vérification…' }); await ProfileService.videoRegister(r.json.public_id || t.public_id, title);
      }
      setProgress(null); await load();
    } catch (e) { fail((e as Error).message || 'Envoi impossible.'); }
  }
  async function remove(id: number) { try { await ProfileService.videoDelete(id); await load(); } catch (e) { setMsg((e as Error).message); } }
  return { settings, error, progress, msg, upload, remove };
}

export function useMyContacts() {
  const [list, setList] = useState<ContactItem[] | null>(null); const [error, setError] = useState('');
  const load = useCallback(() => ProfileService.contacts().then(setList, e => setError((e as Error).message)), []);
  useEffect(() => { load(); }, [load]);
  async function answer(id: number, status: 'accepte' | 'refuse') { try { await ProfileService.answerContact(id, status); await load(); } catch (e) { setError((e as Error).message); } }
  return { list, error, load, answer };
}

export function useChat(contactId: number) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null); const [error, setError] = useState('');
  const last = useRef(-1);
  const load = useCallback(async (force = false) => {
    try { const m = await ChatService.messages(contactId), id = m.length ? m[m.length - 1].id : 0; if (!force && id === last.current) return; last.current = id; setMessages(m); }
    catch (e) { setError((e as Error).message); }
  }, [contactId]);
  useEffect(() => { last.current = -1; load(true); const t = setInterval(() => load(false), 4000); return () => clearInterval(t); }, [load]);
  async function send(body: string) { setError(''); try { await ChatService.send(contactId, body); await load(true); return true; } catch (e) { setError((e as Error).message); return false; } }
  return { messages, error, send };
}

export function useContactForm(to: number, onDone: () => void) {
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function send() { try { await ContactService.send(to, message.trim()); onDone(); } catch (e) { setError((e as Error).message); } }
  return { message, setMessage, error, send };
}

export function useAccountActions() {
  const { logout, setUser } = useAuth();
  const [resent, setResent] = useState(''); const [delMsg, setDelMsg] = useState('');
  async function resend() { try { await AuthService.resendVerification(); setResent('E-mail envoyé'); } catch (e) { setResent((e as Error).message); } }
  async function deleteAccount(password: string) {
    if (!password) return setDelMsg('Saisis ton mot de passe.');
    try { await AuthService.deleteAccount(password); setUser(null); return true; } catch (e) { setDelMsg((e as Error).message); }
  }
  return { logout, resent, resend, delMsg, deleteAccount };
}
