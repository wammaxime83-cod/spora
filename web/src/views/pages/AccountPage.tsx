'use client';
/* VIEW : « Mon espace » (profil, vidéos, mises en relation, offre, données). */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/controllers/AuthController';
import { useDialogs } from '@/controllers/DialogController';
import { useAccountActions, useMyContacts, useMyProfile, useMyVideos } from '@/controllers/useMyAccount';
import { INFO_FIELDS, PLAN_LABEL, ROLE_LABEL, STATUS_TEXT } from '@/models/forms';
import type { User } from '@/models/types';
import { Field, PhotoPicker } from '../components/Field';
import { linkBtn } from '../components/Modal';
import { B0 } from './static/espace';

const note = { color: 'var(--text2)' };

function ProfileForm({ user }: { user: User }) {
  const p = useMyProfile(user);
  if (p.loadError) return <>{p.loadError}</>;
  if (!p.profile) return <>Chargement…</>;
  const avatar = p.photo || (!p.removePhoto && p.profile.has_photo ? `/uploads/avatars/${user.id}?t=${p.photoKey}` : null);
  return (
    <form id="espF" noValidate onSubmit={e => { e.preventDefault(); p.save(); }}>
      <div className="jn-g">
        <div className="full"><label className="l" htmlFor="e_name">Nom complet</label><input id="e_name" value={p.name} onChange={e => p.setName(e.target.value)} /></div>
        <div><label className="l" htmlFor="e_tel">Téléphone</label><input id="e_tel" value={p.tel} onChange={e => p.setTel(e.target.value)} /></div>
      </div>
      <div className="jn-g" style={{ marginTop: 14 }}>
        {INFO_FIELDS[user.role].map(f => f.t === 'photo'
          ? <div className="full" key={f.id}><label className="l">Photo</label><PhotoPicker id="e_photo" src={avatar} label="Changer la photo" onPick={p.pickPhoto} onRemove={user.role !== 'joueur' ? () => p.setRemovePhoto(true) : undefined} /></div>
          : <Field key={f.id} f={f} prefix="e" optionalLabel={false} value={p.data[f.id]} error={p.errors[f.id]} onChange={p.set} onToggle={(fd, v) => p.toggle(fd.id, fd.t, v, fd.max)} />)}
      </div>
      <div className="jn-act"><span></span><button className="btn" type="submit">Enregistrer</button></div>
      {p.msg && <div className={'jn-msg' + (p.msg.ok ? '' : ' w')}>{p.msg.t}</div>}
    </form>
  );
}

function Videos() {
  const v = useMyVideos(); const [title, setTitle] = useState('');
  if (v.error) return <>{v.error}</>;
  if (!v.settings) return <>Chargement…</>;
  const s = v.settings;
  return (
    <>
      {s.videos.map(x => (
        <div key={x.id} style={{ marginTop: 14 }}>
          <video controls preload="none" playsInline poster={x.poster} src={x.src} style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 14, display: 'block' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginTop: 6 }}><b>{x.title || 'Sans titre'}</b><button type="button" style={{ ...linkBtn, color: '#e5484d' }} onClick={() => v.remove(x.id)}>Supprimer</button></div>
        </div>
      ))}
      {!s.enabled ? <div className="jn-msg w" style={{ marginTop: 0 }}>L&apos;envoi de vidéos n&apos;est pas activé sur ce site.</div>
        : s.videos.length < s.max ? (
          <div style={{ marginTop: 16 }}>
            <label className="l" htmlFor="vtitle">Titre (facultatif)</label>
            <input id="vtitle" maxLength={80} placeholder="Ex. But en finale U19" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="jn-up" style={{ marginTop: 12, gap: 12 }}>
              <label className="fb" htmlFor="vfile">Choisir une vidéo</label>
              <input type="file" id="vfile" accept="video/mp4,video/quicktime,video/webm,video/*" disabled={!!v.progress} onChange={e => { const f = e.target.files?.[0]; if (f) { v.upload(f, title); e.target.value = ''; } }} />
              <span style={{ color: 'var(--text2)', fontSize: 13 }}>MP4, MOV ou WebM · {s.mode === 'local' ? '30 Mo' : `100 Mo et ${Math.floor(s.max_seconds / 60)} min`} maximum · {s.videos.length}/{s.max}</span>
              {s.mode === 'local' && <div className="jn-msg w" style={{ marginTop: 12 }}><b>Mode test.</b> Les vidéos sont gardées sur le serveur du site et peuvent être effacées lors d&apos;une mise à jour.</div>}
            </div>
            {v.progress && <div style={{ marginTop: 12 }}><div style={{ height: 10, borderRadius: 99, background: 'var(--surface2)', overflow: 'hidden' }}><div style={{ height: '100%', width: v.progress.pct + '%', background: 'var(--primary)', transition: 'width .2s' }}></div></div><small style={note}>{v.progress.text}</small></div>}
          </div>
        ) : <p style={{ ...note, marginTop: 14 }}>Limite de {s.max} vidéos atteinte : supprime-en une pour en ajouter.</p>}
      {v.msg && <div className="jn-msg w">{v.msg}</div>}
    </>
  );
}

function Contacts({ user }: { user: User }) {
  const c = useMyContacts(); const dlg = useDialogs();
  void user;
  if (c.error) return <>{c.error}</>;
  if (!c.list) return <>Chargement…</>;
  if (!c.list.length) return <p style={note}>Aucune demande pour le moment.</p>;
  return (
    <>
      {c.list.map(x => {
        const o = x.other, lab = { envoye: 'En attente', accepte: 'Acceptée', refuse: 'Refusée' }[x.status];
        return (
          <div className="jn-msg" style={{ marginTop: 10 }} key={x.id}>
            <b>{x.direction === 'recu' ? `${o.name} (${ROLE_LABEL[o.role] || o.role}) t'a écrit` : `Toi → ${o.name}`}</b> · {lab}<br />{x.message}
            {x.status === 'accepte' && <div style={{ marginTop: 10 }}>
              <button type="button" className="btn sm" style={{ border: 0, cursor: 'pointer' }} onClick={() => dlg.openChat(x.id, o.name, c.load)}>💬 Ouvrir le chat{x.unread ? ` · ${x.unread} nouveau${x.unread > 1 ? 'x' : ''}` : ''}</button>
              <small style={{ display: 'block', marginTop: 6, ...note }}>Vos échanges se font ici, sur Spora. Vos e-mails et numéros restent privés.</small>
            </div>}
            {x.direction === 'recu' && x.status === 'envoye' && <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button type="button" className="btn sm" style={{ border: 0, cursor: 'pointer' }} onClick={() => c.answer(x.id, 'accepte')}>Accepter</button>
              <button type="button" style={linkBtn} onClick={() => c.answer(x.id, 'refuse')}>Refuser</button>
            </div>}
          </div>
        );
      })}
    </>
  );
}

export function AccountPage() {
  const { user, ready } = useAuth(); const a = useAccountActions(); const router = useRouter();
  const [pw, setPw] = useState('');
  if (!ready) return <><B0 /><section className="sec"><div className="box"><div className="jn" aria-live="polite"><div className="jn-card"><p className="lead">Chargement…</p></div></div></div></section></>;
  if (!user) return <><B0 /><section className="sec"><div className="box"><div className="jn"><div className="jn-card"><h2>Connecte-toi</h2><p className="lead">Ton espace est réservé aux membres.</p><Link className="btn" href="/connexion/">Se connecter</Link> <Link href="/inscription/" style={{ marginLeft: 14, color: 'var(--primary)', fontWeight: 800 }}>Créer un compte</Link></div></div></div></section></>;
  const st = STATUS_TEXT[user.status] || STATUS_TEXT.en_attente; const guest = user.role === 'invite';
  return (
    <>
      <B0 />
      <section className="sec"><div className="box"><div className="jn" id="esp" aria-live="polite">
        <div className="jn-card">
          <h2>Bonjour {user.name.split(' ')[0]}</h2><p className="lead">{ROLE_LABEL[user.role]} · {user.email}</p>
          {!guest && <div className={'jn-msg' + (user.status === 'verifie' ? '' : ' w')} style={{ marginTop: 0 }}><b>{st[0]}.</b> {user.status_note || st[1]}</div>}
          {!user.email_verified && <div className="jn-msg w"><b>Adresse e-mail non confirmée.</b> Clique sur le lien reçu par e-mail. <button type="button" onClick={a.resend} style={{ background: 'none', border: 0, color: 'var(--primary)', font: 'inherit', fontWeight: 800, cursor: 'pointer' }}>{a.resent || "Renvoyer l'e-mail"}</button></div>}
          {guest && <div className="jn-msg" style={{ marginTop: 0 }}>Ton compte invité te permet de regarder les <Link href="/highlights/" style={{ color: 'var(--primary)', fontWeight: 800 }}>highlights</Link>, d&apos;aimer et de commenter les vidéos des joueurs.</div>}
        </div>
        {!guest && <>
          <div className="jn-card" id="espProf"><h2>Mon profil</h2><p className="lead">Ces informations alimentent ta fiche.</p><div id="espForm"><ProfileForm user={user} /></div></div>
          {user.role === 'joueur' && <div className="jn-card" id="espVid"><h2>Mes vidéos</h2><p className="lead">Montre tes meilleures actions aux agents et aux clubs.</p><div id="espVidBody"><Videos /></div></div>}
          <div className="jn-card"><h2>Mes mises en relation</h2><p className="lead">{user.role === 'joueur' ? 'Les agents et clubs vérifiés qui souhaitent te contacter.' : "Les demandes que tu as envoyées."}</p><div id="espCt"><Contacts user={user} /></div></div>
        </>}
        {user.role === 'joueur'
          ? <div className="jn-card"><h2>Mon offre</h2><p className="lead">Offre actuelle : <b>{PLAN_LABEL[user.plan] || 'Gratuit'}</b>{user.plan !== 'gratuit' && user.plan_until ? ` · valable jusqu'au ${user.plan_until}` : ''}</p><p style={note}>Le paiement en ligne n&apos;est pas encore ouvert. Pour passer à Standard, Premium ou Élite, écris à l&apos;équipe Spora : ton offre est activée dès réception du règlement.</p><p><Link className="btn sm" href="/offres/">Voir les offres</Link> <a href="#contact" data-scroll="#contact" style={{ marginLeft: 14, color: 'var(--primary)', fontWeight: 800 }}>Contacter l&apos;équipe</a></p></div>
          : !guest && <div className="jn-card"><h2>Mon offre</h2><p className="lead">Spora est <b>gratuit</b> pour les {user.role === 'agent' ? 'agents' : 'clubs et académies'}. Aucun paiement n&apos;est demandé.</p></div>}
        <div className="jn-card"><h2>Mes données</h2><p className="lead">Tu peux télécharger ou supprimer toutes tes données à tout moment.</p>
          <p><a className="btn sm" href="/api/me/export" download>Télécharger mes données</a> <button type="button" style={{ ...linkBtn, marginLeft: 14 }} onClick={async () => { await a.logout(); router.push('/'); }}>Se déconnecter</button></p>
          <details style={{ marginTop: 18 }}><summary style={{ cursor: 'pointer', fontWeight: 800, color: '#e5484d' }}>Supprimer mon compte</summary>
            <p className="lead" style={{ marginTop: 10 }}>Suppression définitive du compte, du profil, de la photo et des échanges. Saisis ton mot de passe pour confirmer.</p>
            <div className="jn-g"><div className="full"><input type="password" placeholder="Mot de passe" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></div></div>
            <div className="jn-act"><span></span><button type="button" className="btn" style={{ background: '#e5484d' }} onClick={async () => { if (await a.deleteAccount(pw)) router.push('/'); }}>Supprimer définitivement</button></div>
            {a.delMsg && <div className="jn-msg w">{a.delMsg}</div>}
          </details>
        </div>
      </div></div></section>
    </>
  );
}
