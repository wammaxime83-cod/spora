'use client';
/* VIEW : un champ de formulaire décrit par le modèle (texte, liste, choix, photo…), utilisé par l'inscription et « Mon espace ». */
import type { Field as F } from '@/models/forms';
import { strengthScore } from '@/models/helpers';

interface Props {
  f: F; value: any; error?: string; prefix: string;
  onChange: (id: string, v: any) => void; onToggle: (f: F, v: string) => void;
  photo?: React.ReactNode; optionalLabel?: boolean;
}
export function Field({ f, value, error, prefix, onChange, onToggle, photo, optionalLabel = true }: Props) {
  const id = `${prefix}_${f.id}`;
  return (
    <div className={(f.full ? 'full ' : '') + (error ? 'bad' : '')}>
      <label className="l" htmlFor={id}>{f.l}{f.req ? <> <i>*</i></> : optionalLabel ? <> <small>(facultatif)</small></> : null}</label>
      {f.t === 'select' ? (
        <select id={id} value={value || ''} onChange={e => onChange(f.id, e.target.value)}><option value="">Choisir…</option>{f.o!.map(x => <option key={x}>{x}</option>)}</select>
      ) : f.t === 'textarea' ? (
        <textarea id={id} placeholder={f.ph || ''} value={value || ''} onChange={e => onChange(f.id, e.target.value)} />
      ) : f.t === 'chips' || f.t === 'radio' ? (
        <div className="jn-ch" id={id}>{f.o!.map(x => { const on = f.t === 'chips' ? (value || []).includes(x) : value === x; return <button key={x} type="button" className={on ? 'on' : ''} aria-pressed={on} onClick={() => onToggle(f, x)}>{x}</button>; })}</div>
      ) : f.t === 'photo' ? photo : (
        <>
          <input id={id} type={f.t} value={value ?? ''} placeholder={f.ph || ''} autoComplete="off" onChange={e => onChange(f.id, e.target.value)} />
          {f.t === 'password' && <div className="jn-str"><i style={{ width: (value ? strengthScore(value) * 25 : 0) + '%', background: strengthScore(value || '') < 2 ? '#e5484d' : strengthScore(value || '') < 3 ? '#f5a623' : '#12c48b' }}></i></div>}
        </>
      )}
      {error && <div className="er">{error}</div>}
    </div>
  );
}

export function PhotoPicker({ src, id, label = 'Choisir une image', hint, onPick, onRemove }: { src: string | null; id: string; label?: string; hint?: string; onPick: (f: File) => void; onRemove?: () => void }) {
  return (
    <div className="jn-up">
      <div className="jn-av">{src ? <img alt="" src={src} /> : '+'}</div>
      <div>
        <label className="fb" htmlFor={id}>{label}</label>
        <input type="file" id={id} accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
        {onRemove && src && <button type="button" className="back" onClick={onRemove} style={{ background: 'none', border: 0, color: 'var(--text2)', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}>Retirer</button>}
        {hint && <div className="jn-sub">{hint}</div>}
      </div>
    </div>
  );
}
