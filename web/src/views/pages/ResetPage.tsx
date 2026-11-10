'use client';
/* VIEW : nouveau mot de passe (lien reçu par e-mail : /reinitialiser/?token=…). */
import Link from 'next/link';
import { useResetPassword } from '@/controllers/useLogin';
import { B0 } from './static/reinitialiser';

export function ResetPage() {
  const r = useResetPassword();
  return (
    <>
      <B0 />
      <section className="sec"><div className="box"><div className="jn"><div className="jn-card" id="rst">
        {r.token === undefined ? <p className="lead">Chargement…</p>
          : !r.token ? <><h2>Lien invalide</h2><p className="lead">Demande un nouveau lien depuis la page de connexion.</p><Link className="btn" href="/connexion/">Connexion</Link></>
          : r.done ? <><h2>Mot de passe modifié</h2><p className="lead">Tu peux maintenant te connecter.</p><Link className="btn" href="/connexion/">Se connecter</Link></>
          : <>
            <h2>Choisis un nouveau mot de passe</h2><p className="lead">8 caractères minimum.</p>
            <form onSubmit={e => { e.preventDefault(); r.submit(); }}>
              <div className="jn-g"><div className="full"><label className="l" htmlFor="rp">Nouveau mot de passe</label><input id="rp" type="password" autoComplete="new-password" value={r.password} onChange={e => r.setPassword(e.target.value)} /></div></div>
              <div className="jn-act"><span></span><button className="btn" type="submit" style={{ border: 0, cursor: 'pointer' }}>Enregistrer</button></div>
              {r.msg && <div className="jn-msg w">{r.msg}</div>}
            </form>
          </>}
      </div></div></div></section>
    </>
  );
}
