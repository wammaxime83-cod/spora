/* MODEL : client HTTP du serveur Spora. Aucune dépendance à React ici. */
export class ApiError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status = 0, field?: string) { super(message); this.status = status; this.field = field; }
}

export async function api<T = any>(method: string, url: string, body?: unknown): Promise<T> {
  let r: Response;
  try {
    r = await fetch('/api' + url, {
      method, credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch { throw new ApiError('Connexion impossible. Vérifie ta connexion internet.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(j.error || 'Une erreur est survenue.', r.status, j.field);
  return j as T;
}
