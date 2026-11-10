'use client';
/* CONTROLLER : connexion et mot de passe oublié. */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/models/services';
import { useAuth } from './AuthController';

export function useLogin() {
  const { login } = useAuth(); const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) return setMsg('Saisis ton e-mail et ton mot de passe.');
    setBusy(true); setMsg('');
    try { await login(email.trim(), password); setPassword(''); router.push('/espace/'); }
    catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  }
  async function forgot() {
    if (!email.trim()) return setMsg("Saisis d'abord ton adresse e-mail ci-dessus.");
    try { await AuthService.forgot(email.trim()); setMsg("Si un compte existe avec cette adresse, un lien de réinitialisation vient d'être envoyé."); }
    catch (e) { setMsg((e as Error).message); }
  }
  const oauth = () => setMsg('Google et Apple ne sont pas encore disponibles : utilise ton e-mail.');
  return { email, setEmail, password, setPassword, msg, busy, submit, forgot, oauth };
}

export function useResetPassword() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [password, setPassword] = useState(''); const [msg, setMsg] = useState(''); const [done, setDone] = useState(false);
  const { setUser } = useAuth();
  // lu côté navigateur : /reinitialiser/?token=…
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get('token')); }, []);
  async function submit() {
    try { await AuthService.reset(token!, password); setUser(null); setDone(true); } catch (e) { setMsg((e as Error).message); }
  }
  return { token, password, setPassword, msg, done, submit };
}
