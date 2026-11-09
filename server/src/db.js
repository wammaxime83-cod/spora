'use strict';
// Base de données : libSQL (compatible SQLite).
//  - en production : Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN) → les données survivent aux redémarrages ;
//  - en local / tests : simple fichier SQLite (DATA_DIR/spora.db).
const { createClient } = require('@libsql/client');
const config = require('./config');

const client = createClient({ url: config.dbUrl, authToken: config.dbToken || undefined });

const toObj = (rs, row) => Object.fromEntries(rs.columns.map((c, i) => [c, row[i]]));
function api(exec) {
  return {
    async all(sql, args = []) { const rs = await exec.execute({ sql, args }); return rs.rows.map(r => toObj(rs, r)); },
    async get(sql, args = []) { const rs = await exec.execute({ sql, args }); return rs.rows[0] ? toObj(rs, rs.rows[0]) : undefined; },
    async run(sql, args = []) { const rs = await exec.execute({ sql, args }); return { changes: rs.rowsAffected, lastInsertRowid: rs.lastInsertRowid }; },
    // Même écriture que better-sqlite3 : db.prepare(sql).get(...args) → promesse
    prepare(sql) {
      const self = this;
      return { get: (...a) => self.get(sql, a), all: (...a) => self.all(sql, a), run: (...a) => self.run(sql, a) };
    },
  };
}
const db = api(client);

// Transaction : db.tx(async t => { await t.prepare(...).run(...); return x; })
db.tx = async fn => {
  const t = await client.transaction('write');
  try { const out = await fn(api(t)); await t.commit(); return out; }
  catch (e) { try { await t.rollback(); } catch { /* déjà annulée */ } throw e; }
  finally { t.close(); }
};

const SCHEMA = [
`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('joueur','agent','club')),
  name TEXT NOT NULL,
  tel TEXT,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente','verifie','refuse')),
  status_note TEXT,
  plan TEXT NOT NULL DEFAULT 'gratuit' CHECK (plan IN ('gratuit','standard','premium','elite')),
  plan_until TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT)`,
`CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL DEFAULT '{}',
  dob TEXT, nat TEXT, city TEXT, pos TEXT, lvl TEXT,
  has_photo INTEGER NOT NULL DEFAULT 0,
  photo_mime TEXT,
  minor INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS photos (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mime TEXT NOT NULL,
  data BLOB NOT NULL)`,
`CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT,
  duration REAL,
  bytes INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS video_likes (
  video_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (video_id, user_id))`,
`CREATE TABLE IF NOT EXISTS video_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
`CREATE INDEX IF NOT EXISTS idx_vcom_video ON video_comments(video_id)`,
`CREATE INDEX IF NOT EXISTS idx_profiles_pos ON profiles(pos)`,
`CREATE INDEX IF NOT EXISTS idx_profiles_nat ON profiles(nat)`,
`CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ua TEXT)`,
`CREATE TABLE IF NOT EXISTS email_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('verify','reset')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'envoye' CHECK (status IN ('envoye','accepte','refuse')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  answered_at TEXT,
  UNIQUE (from_user, to_user))`,
`CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  country TEXT NOT NULL, who TEXT, interests TEXT,
  email TEXT COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  actor INTEGER, action TEXT NOT NULL, target INTEGER, detail TEXT)`,
];

async function purge() {
  await db.run("DELETE FROM sessions WHERE expires_at < datetime('now')");
  await db.run("DELETE FROM email_tokens WHERE expires_at < datetime('now')");
}

// Supprime un compte et tout ce qui lui est lié (sans dépendre des clés étrangères).
db.deleteUser = id => db.tx(async t => {
  for (const sql of ['DELETE FROM video_likes WHERE video_id IN (SELECT id FROM videos WHERE user_id=?)', 'DELETE FROM video_comments WHERE video_id IN (SELECT id FROM videos WHERE user_id=?)', 'DELETE FROM video_likes WHERE user_id=?', 'DELETE FROM video_comments WHERE user_id=?', 'DELETE FROM videos WHERE user_id=?', 'DELETE FROM photos WHERE user_id=?', 'DELETE FROM sessions WHERE user_id=?', 'DELETE FROM email_tokens WHERE user_id=?',
    'DELETE FROM contacts WHERE from_user=? OR to_user=?', 'DELETE FROM profiles WHERE user_id=?']) {
    await t.run(sql, sql.includes('OR') ? [id, id] : [id]);
  }
  return t.run('DELETE FROM users WHERE id=?', [id]);
});

// Prête quand les tables existent. Le serveur attend cette promesse avant de répondre.
db.ready = (async () => {
  await client.execute('PRAGMA foreign_keys = ON').catch(() => {});
  for (const sql of SCHEMA) await client.execute(sql);
  await purge();
  setInterval(() => purge().catch(() => {}), 6 * 3600 * 1000).unref();
})();
db.close = () => client.close();

module.exports = db;
