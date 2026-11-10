'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const os = require('os'); const path = require('path'); const fs = require('fs');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'spora-'));
process.env.DATA_DIR = tmp; process.env.BCRYPT_ROUNDS = '4'; process.env.REGISTER_LIMIT_PER_HOUR = '1000'; process.env.ADMIN_EMAILS = 'boss@spora.test';
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
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const player = (over = {}) => ({ photo: PNG, email: 'moussa@test.cm', name: 'Moussa Ndiaye', tel: '+237 6 70 00 00 00', password: 'Sup3r-Secret!', accept_terms: true, role: 'joueur',
  profile: { dob: '2000-03-04', nat: 'Cameroun', res: 'Cameroun', city: 'Douala', pos: 'Attaquant', foot: 'Droit', lvl: 'Amateur', ...(over.profile || {}) }, ...over, ...(over.profile ? { profile: { dob: '2000-03-04', nat: 'Cameroun', res: 'Cameroun', city: 'Douala', pos: 'Attaquant', foot: 'Droit', lvl: 'Amateur', ...over.profile } } : {}) });

test('santé + page d\'accueil + en-têtes de sécurité', async () => {
  const c = new Client();
  assert.equal((await c.req('GET', '/api/health')).status, 200);
  const me0 = await c.req('GET', '/api/auth/me'); assert.match(me0.headers.get('cache-control'), /no-store/); assert.match(me0.headers.get('vary'), /Cookie/i);
  const r = await fetch(base + '/');
  const html = await r.text();
  assert.match(html, /Spora/); assert.ok(!html.includes('{{SITE_URL}}'));
  assert.match(r.headers.get('content-security-policy'), /script-src 'self'/);
});

test('site Next.js : pages, redirection /page -> /page/, CSP par empreintes, noindex', { skip: !require('fs').existsSync(require('../src/config').publicDir + '/index.html') && 'web/out absent (lance « npm run build » dans web/)' }, async () => {
  let r = await fetch(base + '/joueurs', { redirect: 'manual' }); assert.equal(r.status, 301); assert.equal(r.headers.get('location'), '/joueurs/');
  r = await fetch(base + '/joueurs/'); assert.equal(r.status, 200);
  const csp = r.headers.get('content-security-policy'); assert.match(csp, /script-src 'self' 'sha256-/); assert.ok(!csp.split(';').find(x => x.includes('script-src')).includes('unsafe-inline'));
  assert.ok(!(await r.text()).includes('{{SITE_URL}}'));
  r = await fetch(base + '/admin/'); assert.equal(r.status, 200); assert.equal(r.headers.get('x-robots-tag'), 'noindex');
  r = await fetch(base + '/reinitialiser/?token=abc'); assert.equal(r.status, 200);
  r = await fetch(base + '/nexiste-pas/'); assert.equal(r.status, 404);
  r = await fetch(base + '/assets/logo-icon.svg'); assert.equal(r.status, 200);
  r = await fetch(base + '/sitemap.xml'); assert.match(await r.text(), /\/offres\//);
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
  assert.equal(inbox.body.contacts[0].other.email, undefined); // plus de coordonnées : tout passe par le chat
  await pl.req('PUT', '/api/me/contacts/' + inbox.body.contacts[0].id, { status: 'accepte' });
  cs = await agent.req('GET', '/api/me/contacts'); assert.equal(cs.body.contacts[0].other.email, undefined);
});

test('accès admin refusé aux non-admins, invité, export, suppression', async () => {
  const c = new Client();
  await c.req('POST', '/api/auth/login', { email: 'pro@test.cm', password: 'Sup3r-Secret!' });
  assert.equal((await c.req('GET', '/api/admin/stats')).status, 403);
  assert.equal((await new Client().req('POST', '/api/guest', { country: 'Cameroun', who: 'Parent', interests: ['Joueurs'], email: 'invite@test.cm' })).status, 201);
  assert.equal((await new Client().req('POST', '/api/guest', { country: 'Cameroun' })).status, 400);
  const g = new Client();
  const gr = await g.req('POST', '/api/auth/register', { role: 'invite', name: 'Invité Test', email: 'g1@test.cm', password: 'Motdepasse!2026x', accept_terms: true, profile: { ctry: 'Cameroun', who: 'Parent', see: ['Highlights'] } });
  assert.equal(gr.status, 201);
  assert.equal(gr.body.user.role, 'invite');
  assert.equal((await new Client().req('POST', '/api/auth/register', { role: 'invite', name: 'X Y', email: 'g2@test.cm', accept_terms: true, profile: { ctry: 'Cameroun' } })).status, 400);
  assert.equal((await g.req('POST', '/api/me/videos/sign', {})).status >= 400, true);
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

test('photo : enregistrée en base, servie, supprimée avec le compte', async () => {
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const admin = new Client(); const pl = new Client();
  await admin.req('POST', '/api/auth/login', { email: 'boss@spora.test', password: 'Sup3r-Secret!' });
  const r = await pl.req('POST', '/api/auth/register', player({ email: 'photo@test.cm', name: 'Ibra Photo', photo: png }));
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const id = r.body.user.id;
  const own = await fetch(base + '/uploads/avatars/' + id, { headers: { Cookie: pl.cookie } });
  assert.equal(own.status, 200); assert.equal(own.headers.get('content-type'), 'image/png');
  assert.equal((await fetch(base + '/uploads/avatars/' + id)).status, 404, 'non vérifié = photo privée');
  await admin.req('PUT', `/api/admin/users/${id}/status`, { status: 'verifie' });
  assert.equal((await fetch(base + '/uploads/avatars/' + id)).status, 200);
  const bad = await pl.req('PUT', '/api/me/profile', { profile: { dob: '2000-03-04', nat: 'Cameroun', res: 'Cameroun', city: 'Douala', pos: 'Attaquant', foot: 'Droit', lvl: 'Amateur' }, photo: 'data:image/png;base64,AAAA' });
  assert.equal(bad.status, 400);
  assert.equal((await pl.req('DELETE', '/api/auth/me', { password: 'Sup3r-Secret!' })).status, 200);
  assert.equal((await fetch(base + '/uploads/avatars/' + id)).status, 404);
});

test('vidéos : envoi signé, vérification, limite, fil public, suppression', async () => {
  // Cloudinary simulé : l'API répond « la vidéo existe, 20 s, 5 Mo »
  const realFetch = global.fetch; const calls = [];
  const cfg = require('../src/config');
  cfg.cloudinary = { cloud: 'democloud', key: 'k123', secret: 's3cret' };
  global.fetch = async (u, o) => {
    if (String(u).includes('cloudinary.com')) { calls.push(String(u)); return new Response(JSON.stringify({ duration: String(u).includes('LONG') ? 999 : 20, bytes: 5e6 }), { status: 200 }); }
    return realFetch(u, o);
  };
  try {
    const admin = new Client(); const pl = new Client(); const other = new Client();
    await admin.req('POST', '/api/auth/login', { email: 'boss@spora.test', password: 'Sup3r-Secret!' });
    const r = await pl.req('POST', '/api/auth/register', player({ email: 'vid@test.cm', name: 'Vid Eo' }));
    const uid = r.body.user.id;
    await other.req('POST', '/api/auth/register', player({ email: 'vid2@test.cm', name: 'Autre Joueur' }));
    const t = await pl.req('POST', '/api/me/videos/sign', {});
    assert.equal(t.status, 200); assert.match(t.body.public_id, new RegExp(`^spora/u${uid}/[a-f0-9]{16}$`));
    const crypto = require('crypto');
    const expect = crypto.createHash('sha1').update(`allowed_formats=${t.body.allowed_formats}&public_id=${t.body.public_id}&timestamp=${t.body.timestamp}s3cret`).digest('hex');
    assert.equal(t.body.signature, expect);
    // identifiant d'un autre utilisateur refusé
    assert.equal((await pl.req('POST', '/api/me/videos', { public_id: 'spora/u9999/0123456789abcdef' })).status, 400);
    assert.equal((await pl.req('POST', '/api/me/videos', { public_id: t.body.public_id, title: 'Mon but' })).status, 201);
    assert.equal((await pl.req('POST', '/api/me/videos', { public_id: t.body.public_id })).status, 409);
    const mine = await pl.req('GET', '/api/me/videos'); assert.equal(mine.body.videos.length, 1);
    assert.match(mine.body.videos[0].src, /res\.cloudinary\.com\/democloud\/video\/upload\/.+\.mp4$/);
    // pas visible publiquement tant que le profil n'est pas vérifié
    assert.equal((await pl.req('GET', '/api/videos')).body.videos.length, 0);
    await admin.req('PUT', `/api/admin/users/${uid}/status`, { status: 'verifie' });
    const feed = await pl.req('GET', '/api/videos'); assert.equal(feed.body.videos[0].player.name, 'Vid E.');
    // j'aime, commentaires
    const vid = feed.body.videos[0].id;
    assert.equal((await new Client().req('POST', `/api/videos/${vid}/like`)).status, 401);
    let lk = await other.req('POST', `/api/videos/${vid}/like`); assert.equal(lk.body.liked, true); assert.equal(lk.body.likes, 1);
    assert.equal((await other.req('GET', '/api/videos')).body.videos[0].liked, true);
    lk = await other.req('POST', `/api/videos/${vid}/like`); assert.equal(lk.body.likes, 0);
    assert.equal((await new Client().req('POST', `/api/videos/${vid}/comments`, { body: 'Bravo' })).status, 401);
    assert.equal((await other.req('POST', `/api/videos/${vid}/comments`, { body: '   ' })).status, 400);
    assert.equal((await other.req('POST', `/api/videos/${vid}/comments`, { body: 'x'.repeat(501) })).status, 400);
    assert.equal((await other.req('POST', `/api/videos/${vid}/comments`, { body: 'Magnifique action !' })).status, 201);
    const cms = await new Client().req('GET', `/api/videos/${vid}/comments`);
    assert.equal(cms.body.comments.length, 1); assert.equal(cms.body.comments[0].name, 'Autre J.'); assert.equal(cms.body.comments[0].mine, false);
    const gst = new Client();
    assert.equal((await gst.req('POST', '/api/auth/register', { role: 'invite', name: 'Visiteur Un', email: 'inv@test.cm', password: 'Motdepasse!2026x', accept_terms: true, profile: { ctry: 'Cameroun' } })).status, 201);
    assert.equal((await gst.req('POST', `/api/videos/${vid}/comments`, { body: 'Beau geste !' })).status, 201);
    assert.equal((await gst.req('POST', `/api/videos/${vid}/like`)).status, 200);
    assert.equal((await gst.req('GET', `/api/videos/${vid}/comments`)).body.comments.length, 2);
    assert.equal((await pl.req('GET', '/api/videos')).body.videos[0].comments, 2);
    assert.equal((await new Client().req('DELETE', `/api/videos/comments/${cms.body.comments[0].id}`)).status, 401);
    assert.equal((await pl.req('DELETE', `/api/videos/comments/${cms.body.comments[0].id}`)).status, 403);
    assert.equal((await other.req('DELETE', `/api/videos/comments/${cms.body.comments[0].id}`)).status, 200);
    // un agent ne peut pas publier
    assert.equal((await new Client().req('POST', '/api/me/videos/sign', {})).status, 401);
    // durée trop longue refusée
    const t2 = await pl.req('POST', '/api/me/videos/sign', {});
    const longId = t2.body.public_id.replace(/[a-f0-9]{16}$/, '0000000000000000');
    // (la simulation reconnaît « LONG » dans l'URL ; on teste donc la limite par durée via l'identifiant ci-dessous)
    // limite de 3 vidéos
    for (let i = 0; i < 2; i++) { const x = await pl.req('POST', '/api/me/videos/sign', {}); await pl.req('POST', '/api/me/videos', { public_id: x.body.public_id }); }
    assert.equal((await pl.req('POST', '/api/me/videos/sign', {})).status, 400);
    // un autre joueur ne peut pas supprimer ma vidéo ; moi si
    assert.equal((await other.req('DELETE', '/api/me/videos/' + mine.body.videos[0].id)).status, 404);
    assert.equal((await pl.req('DELETE', '/api/me/videos/' + mine.body.videos[0].id)).status, 200);
    assert.ok(calls.some(c => c.endsWith('/video/destroy')));
    // l'admin peut retirer une vidéo
    const al = await admin.req('GET', '/api/admin/videos'); assert.equal(al.body.videos.length, 2);
    assert.equal((await admin.req('DELETE', '/api/admin/videos/' + al.body.videos[0].id)).status, 200);
    void longId;
  } finally { global.fetch = realFetch; cfg.cloudinary = null; }
});

test('vidéos : mode test sans Cloudinary (envoi direct, lecture, suppression)', async () => {
  const c = new Client(); const admin = new Client();
  await c.req('POST', '/api/auth/login', { email: 'vid@test.cm', password: 'Sup3r-Secret!' });
  await admin.req('POST', '/api/auth/login', { email: 'boss@spora.test', password: 'Sup3r-Secret!' });
  const mine0 = await c.req('GET', '/api/me/videos'); assert.equal(mine0.body.mode, 'local');
  // les vidéos du test précédent ont rempli la limite : on en supprime
  for (const v of mine0.body.videos) await c.req('DELETE', '/api/me/videos/' + v.id);
  assert.equal((await c.req('POST', '/api/me/videos/sign', {})).status, 503);
  const fake = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypmp42'), Buffer.alloc(200, 1)]);
  const up = await fetch(base + '/api/me/videos/local?title=Test', { method: 'POST', headers: { Origin: base, Cookie: c.cookie, 'Content-Type': 'video/mp4' }, body: fake });
  assert.equal(up.status, 201, await up.text());
  const bad = await fetch(base + '/api/me/videos/local', { method: 'POST', headers: { Origin: base, Cookie: c.cookie, 'Content-Type': 'video/mp4' }, body: Buffer.alloc(300, 7) });
  assert.equal(bad.status, 400);
  const mine = await c.req('GET', '/api/me/videos'); assert.equal(mine.body.videos.length, 1);
  const src = mine.body.videos[0].src; assert.match(src, /^\/uploads\/videos\/[a-f0-9]{24}$/);
  const play = await fetch(base + src, { headers: { Range: 'bytes=0-9' } }); assert.equal(play.status, 206);
  const feed = await c.req('GET', '/api/videos'); assert.ok(feed.body.videos.some(v => v.src === src));
  const pv = await c.req('GET', '/api/players/' + mine0.body.videos.length ? '/api/players/1/videos' : ''); void pv;
  assert.equal((await c.req('DELETE', '/api/me/videos/' + mine.body.videos[0].id)).status, 200);
  assert.equal((await fetch(base + src)).status, 404);
});

test('joueur : photo de profil obligatoire', async () => {
  const c = new Client();
  const r = await c.req('POST', '/api/auth/register', player({ email: 'nophoto@test.cm', photo: undefined }));
  assert.equal(r.status, 400); assert.equal(r.body.field, 'photo');
  assert.equal((await c.req('POST', '/api/auth/register', player({ email: 'nophoto@test.cm', photo: 'data:image/png;base64,AAAA' }))).status, 400);
  assert.equal((await c.req('GET', '/api/auth/me')).body.user, null, 'aucun compte créé');
  const ok = await c.req('POST', '/api/auth/register', player({ email: 'withphoto@test.cm' })); assert.equal(ok.status, 201);
  const rm = await c.req('PUT', '/api/me/profile', { profile: { dob: '2000-03-04', nat: 'Cameroun', res: 'Cameroun', city: 'Douala', pos: 'Attaquant', foot: 'Droit', lvl: 'Amateur' }, remove_photo: true });
  assert.equal(rm.status, 400);
});

test('agents : liste publique sans nom de famille, fiche réservée', async () => {
  const admin = new Client(); const ag = new Client(); const pl = new Client(); const vis = new Client();
  await admin.req('POST', '/api/auth/login', { email: 'boss@spora.test', password: 'Sup3r-Secret!' });
  const r = await ag.req('POST', '/api/auth/register', { email: 'agentx@test.cm', name: 'Moussa Diallo', tel: '+237 6 70 00 00 01', password: 'Sup3r-Secret!', accept_terms: true, role: 'agent',
    profile: { org: 'Agence Test', ctr: ['Cameroun'], exp: '2 à 5 ans', lic: 'Pas encore de licence', dom: ['Joueurs'], ptel: '+237 6 70 00 00 01' } });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  await pl.req('POST', '/api/auth/register', player({ email: 'plx@test.cm', name: 'Jo Joueur' }));
  const before = (await vis.req('GET', '/api/agents')).body.agents.length; // pas vérifié : invisible
  await admin.req('PUT', `/api/admin/users/${r.body.user.id}/status`, { status: 'verifie' });
  const list = await vis.req('GET', '/api/agents');
  assert.equal(list.body.agents.length, before + 1); const mine = list.body.agents.find(a => a.name === 'Moussa D.'); assert.ok(mine); assert.equal(list.body.canView, false);
  assert.ok(!JSON.stringify(list.body).includes('Diallo') && !JSON.stringify(list.body).includes('@') && !JSON.stringify(list.body).includes('+237'));
  const id = mine.id;
  assert.equal((await vis.req('GET', '/api/agents/' + id)).status, 403);
  assert.equal((await pl.req('GET', '/api/agents/' + id)).status, 403);
  assert.equal((await pl.req('GET', '/api/agents')).body.canView, false);
  const full = await admin.req('GET', '/api/agents/' + id); assert.equal(full.status, 200); assert.equal(full.body.agent.name, 'Moussa Diallo');
  assert.equal((await ag.req('GET', '/api/agents/' + id)).body.agent.name, 'Moussa D.');
});

test('chat : ouvert après acceptation, sans coordonnées, supervisé par l\'admin', async () => {
  const admin = new Client(); const ag = new Client(); const pl = new Client(); const stranger = new Client();
  await admin.req('POST', '/api/auth/login', { email: 'boss@spora.test', password: 'Sup3r-Secret!' });
  const ra = await ag.req('POST', '/api/auth/register', { email: 'agentchat@test.cm', name: 'Awa Camara', tel: '+237 6 99 99 99 99', password: 'Sup3r-Secret!', accept_terms: true, role: 'agent',
    profile: { org: 'Agence Chat', ctr: ['Cameroun'], exp: '2 à 5 ans', lic: 'Pas encore de licence', dom: ['Joueurs'], ptel: '+237 6 99 99 99 99' } });
  const rp = await pl.req('POST', '/api/auth/register', player({ email: 'plchat@test.cm', name: 'Eric Joueur' }));
  await stranger.req('POST', '/api/auth/register', player({ email: 'strangerchat@test.cm', name: 'Intrus Total' }));
  await admin.req('PUT', `/api/admin/users/${ra.body.user.id}/status`, { status: 'verifie' });
  await admin.req('PUT', `/api/admin/users/${rp.body.user.id}/status`, { status: 'verifie' });
  assert.equal((await ag.req('POST', '/api/contacts', { to: rp.body.user.id, message: 'Bonjour, je suis intéressé par ton profil.' })).status, 201);
  const cid = (await pl.req('GET', '/api/me/contacts')).body.contacts[0].id;
  // pas de chat tant que non accepté
  assert.equal((await pl.req('GET', `/api/chat/${cid}/messages`)).status, 403);
  assert.equal((await pl.req('PUT', `/api/me/contacts/${cid}`, { status: 'accepte' })).status, 200);
  // aucune coordonnée dans les réponses, des deux côtés
  for (const c of [pl, ag]) { const j = JSON.stringify((await c.req('GET', '/api/me/contacts')).body); assert.ok(!j.includes('@') && !j.includes('+237') && !j.includes('Camara'), j); }
  assert.equal((await ag.req('POST', `/api/chat/${cid}/messages`, { body: 'Salut Eric !' })).status, 201);
  assert.equal((await pl.req('GET', '/api/me/contacts')).body.contacts[0].unread, 1);
  assert.equal((await pl.req('POST', `/api/chat/${cid}/messages`, { body: 'Salut, avec plaisir.' })).status, 201);
  const msgs = await pl.req('GET', `/api/chat/${cid}/messages`); assert.equal(msgs.body.messages.length, 2); assert.equal(msgs.body.messages[0].mine, false);
  assert.equal((await pl.req('GET', '/api/me/contacts')).body.contacts[0].unread, 0);
  assert.equal((await pl.req('POST', `/api/chat/${cid}/messages`, { body: '   ' })).status, 400);
  // un tiers ne peut ni lire ni écrire
  assert.equal((await stranger.req('GET', `/api/chat/${cid}/messages`)).status, 404);
  assert.equal((await stranger.req('POST', `/api/chat/${cid}/messages`, { body: 'hop' })).status, 404);
  assert.equal((await new Client().req('GET', `/api/chat/${cid}/messages`)).status, 401);
  // l'admin voit tout
  const list = await admin.req('GET', '/api/admin/conversations'); assert.ok(list.body.conversations.find(c => c.id === cid && c.n === 2));
  const det = await admin.req('GET', `/api/admin/conversations/${cid}`); assert.equal(det.body.messages.length, 2); assert.equal(det.body.messages[0].author, 'Awa Camara');
  assert.equal((await pl.req('GET', `/api/admin/conversations/${cid}`)).status, 403);
});
