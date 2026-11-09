'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const os = require('os'); const path = require('path'); const fs = require('fs');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'spora-'));
process.env.DATA_DIR = tmp; process.env.BCRYPT_ROUNDS = '4'; process.env.ADMIN_EMAILS = 'boss@spora.test';
process.env.SITE_URL = 'http://localhost:0';
const { createApp } = require('../src/server');
let srv, base;
before(async () => { srv = createApp().listen(0); await new Promise(r => srv.once('listening', r)); base = 'http://localhost:' + srv.address().port; process.env.SITE_URL = base; });
after(() => srv.close());

class Client {
  constructor() { this.cookie = ''; }
  async req(method, url, body, headers = {}) {
    const r = await fetch(base + url, { method, redirect: 'manual', headers: { Origin: base, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(this.cookie ? { Cookie: this.cookie } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc) this.cookie = sc.split(';')[0];
    let j = null; try { j = await r.json(); } catch {}
    return { status: r.status, body: j, headers: r.headers };
  }
}
const player = (over = {}) => ({ email: 'moussa@test.cm', name: 'Moussa Ndiaye', tel: '+237 6 70 00 00 00', password: 'Sup3r-Secret!', accept_terms: true, role: 'joueur',
  profile: { dob: '2000-03-04', nat: 'Cameroun', res: 'Cameroun', city: 'Douala', pos: 'Attaquant', foot: 'Droit', lvl: 'Amateur', ...(over.profile || {}) }, ...over, ...(over.profile ? { profile: { dob: '2000-03-04', nat: 'Cameroun', res: 'Cameroun', city: 'Douala', pos: 'Attaquant', foot: 'Droit', lvl: 'Amateur', ...over.profile } } : {}) });

test('santé + page d\'accueil + en-têtes de sécurité', async () => {
  const c = new Client();
  assert.equal((await c.req('GET', '/api/health')).status, 200);
  const r = await fetch(base + '/');
  const html = await r.text();
  assert.match(html, /Spora/); assert.ok(!html.includes('{{SITE_URL}}'));
  assert.match(r.headers.get('content-security-policy'), /script-src 'self'/);
});

test('inscription, session, déconnexion, connexion', async () => {
  const c = new Client();
  let r = await c.req('POST', '/api/auth/register', player());
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.user.status, 'en_attente');
  r = await c.req('GET', '/api/auth/me'); assert.equal(r.body.user.email, 'moussa@test.cm');
  assert.equal((await c.req('POST', '/api/auth/register', player())).status, 409);
  await c.req('POST', '/api/auth/logout', {});
  assert.equal((await c.req('GET', '/api/auth/me')).body.user, null);
  assert.equal((await c.req('POST', '/api/auth/login', { email: 'moussa@test.cm', password: 'mauvais-mdp' })).status, 401);
  assert.equal((await c.req('POST', '/api/auth/login', { email: 'moussa@test.cm', password: 'Sup3r-Secret!' })).status, 200);
});

test('CSRF : origine étrangère refusée', async () => {
  const c = new Client();
  const r = await c.req('POST', '/api/auth/login', { email: 'a@b.cm', password: 'x' }, { Origin: 'https://evil.example' });
  assert.equal(r.status, 403);
});

test('validation : mot de passe faible refusé', async () => {
  const c = new Client();
  assert.equal((await c.req('POST', '/api/auth/register', player({ email: 'x@test.cm', password: 'motdepasse' }))).status, 400);
});

test('agent vérifié (préparation)', async () => {
  const admin = new Client(); const agent = new Client();
  await admin.req('POST', '/api/auth/register', { ...player({ email: 'boss@spora.test', name: 'Boss Admin' }) });
  assert.equal((await admin.req('GET', '/api/auth/me')).body.user.is_admin, true);
  const ra = await agent.req('POST', '/api/auth/register', { email: 'agent@test.cm', name: 'Agent Z', password: 'Sup3r-Secret!', accept_terms: true, role: 'agent',
    profile: { org: 'Agence Z', ctr: ['Cameroun'], exp: '2 à 5 ans', lic: 'Pas encore de licence', dom: ['Joueurs'], ptel: '+237 6 99 00 00 00' } });
  assert.equal(ra.status, 201, JSON.stringify(ra.body));
  await admin.req('PUT', `/api/admin/users/${ra.body.user.id}/status`, { status: 'verifie' });
});

test('profils vérifiés listés, contact, acceptation, coordonnées', async () => {
  const admin = new Client(); const pl = new Client(); const agent = new Client();
  await admin.req('POST', '/api/auth/login', { email: 'boss@spora.test', password: 'Sup3r-Secret!' });
  const rp = await pl.req('POST', '/api/auth/register', player({ email: 'pro@test.cm', name: 'Samuel Kone' }));
  const id = rp.body.user.id;
  assert.ok(!(await pl.req('GET', '/api/players')).body.players.some(p => p.id === id), 'non vérifié = non listé');
  await admin.req('PUT', `/api/admin/users/${id}/status`, { status: 'verifie' });
  await admin.req('PUT', `/api/admin/users/${id}/plan`, { plan: 'premium', until: '2099-01-01' });
  const l = await pl.req('GET', '/api/players?pos=Attaquant');
  assert.equal(l.body.players[0].id, id); assert.ok(l.body.players[0].featured);
  const one = await pl.req('GET', '/api/players/' + id);
  assert.ok(!JSON.stringify(one.body).includes('pro@test.cm'));
  await agent.req('POST', '/api/auth/login', { email: 'agent@test.cm', password: 'Sup3r-Secret!' });
  assert.equal((await agent.req('POST', '/api/contacts', { to: id, message: 'Essai possible le mois prochain ?' })).status, 201);
  assert.equal((await agent.req('POST', '/api/contacts', { to: id, message: 'Essai possible le mois prochain ?' })).status, 409);
  let cs = await agent.req('GET', '/api/me/contacts'); assert.equal(cs.body.contacts[0].other.email, null);
  const inbox = await pl.req('GET', '/api/me/contacts');
  assert.equal(inbox.body.contacts[0].other.email, 'agent@test.cm');
  await pl.req('PUT', '/api/me/contacts/' + inbox.body.contacts[0].id, { status: 'accepte' });
  cs = await agent.req('GET', '/api/me/contacts'); assert.equal(cs.body.contacts[0].other.email, 'pro@test.cm');
});

test('accès admin refusé aux non-admins, invité, export, suppression', async () => {
  const c = new Client();
  await c.req('POST', '/api/auth/login', { email: 'pro@test.cm', password: 'Sup3r-Secret!' });
  assert.equal((await c.req('GET', '/api/admin/stats')).status, 403);
  assert.equal((await new Client().req('POST', '/api/guest', { country: 'Cameroun', who: 'Parent', interests: ['Joueurs'] })).status, 201);
  const ex = await c.req('GET', '/api/me/export'); assert.equal(ex.status, 200); assert.ok(!('pass_hash' in ex.body.account));
  assert.equal((await c.req('DELETE', '/api/auth/me', { password: 'faux' })).status, 403);
  assert.equal((await c.req('DELETE', '/api/auth/me', { password: 'Sup3r-Secret!' })).status, 200);
  assert.equal((await new Client().req('POST', '/api/auth/login', { email: 'pro@test.cm', password: 'Sup3r-Secret!' })).status, 401);
});

test('mot de passe oublié ne révèle pas si le compte existe', async () => {
  const c = new Client();
  const a = await c.req('POST', '/api/auth/forgot', { email: 'inconnu@test.cm' });
  const b = await c.req('POST', '/api/auth/forgot', { email: 'agent@test.cm' });
  assert.deepEqual(a.body, b.body);
});
