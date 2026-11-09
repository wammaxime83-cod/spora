'use strict';
const Database = require('better-sqlite3');
const config = require('./config');

const db = new Database(config.dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass_hash     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('joueur','agent','club')),
  name          TEXT NOT NULL,
  tel           TEXT,
  status        TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente','verifie','refuse')),
  status_note   TEXT,
  plan          TEXT NOT NULL DEFAULT 'gratuit' CHECK (plan IN ('gratuit','standard','premium','elite')),
  plan_until    TEXT,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login    TEXT
);
CREATE TABLE IF NOT EXISTS profiles (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data       TEXT NOT NULL DEFAULT '{}',
  dob        TEXT,
  nat        TEXT,
  city       TEXT,
  pos        TEXT,
  lvl        TEXT,
  has_photo  INTEGER NOT NULL DEFAULT 0,
  photo_mime TEXT,
  minor      INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_profiles_pos ON profiles(pos);
CREATE INDEX IF NOT EXISTS idx_profiles_nat ON profiles(nat);
CREATE TABLE IF NOT EXISTS sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ua         TEXT
);
CREATE TABLE IF NOT EXISTS email_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('verify','reset')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'envoye' CHECK (status IN ('envoye','accepte','refuse')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  answered_at TEXT,
  UNIQUE (from_user, to_user)
);
CREATE TABLE IF NOT EXISTS guests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  country    TEXT NOT NULL,
  who        TEXT,
  interests  TEXT,
  email      TEXT COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS audit (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  at         TEXT NOT NULL DEFAULT (datetime('now')),
  actor      INTEGER,
  action     TEXT NOT NULL,
  target     INTEGER,
  detail     TEXT
);
`);

// Nettoyage périodique des sessions et jetons expirés.
function purge() {
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  db.prepare("DELETE FROM email_tokens WHERE expires_at < datetime('now')").run();
}
purge();
setInterval(purge, 6 * 3600 * 1000).unref();

module.exports = db;
