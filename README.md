# Spora — site complet (front + serveur + base de données)

Réseau des talents du football africain. Lancement : Cameroun.

- **Front** : HTML / CSS / JavaScript (`public/`)
- **Serveur** : Node.js 20.12+ / Express (`server/`)
- **Base de données** : SQLite (un seul fichier, aucune installation)
- **Fonctions** : comptes (joueur, agent, club), connexion sécurisée, profils + photo, annuaire des joueurs vérifiés, demandes de contact (accord du joueur), mode invité, mot de passe oublié, export/suppression des données, panneau d'administration (`/admin`).

## Lancer en local

```bash
cd server
npm install
cp .env.example .env      # puis édite ADMIN_EMAILS (ton e-mail)
npm start                 # http://localhost:3000
npm test                  # tests automatiques
```
Crée ton compte sur le site avec l'e-mail mis dans `ADMIN_EMAILS` : il devient administrateur (page `/admin`).

## Mettre en ligne

Le site a besoin d'un **disque persistant** (la base SQLite et les photos sont dans `DATA_DIR`). Sans disque persistant, les comptes disparaissent à chaque redémarrage.

### Option A — Render / Railway / Fly.io (avec Docker)
1. Mets le dossier sur GitHub.
2. Crée un service web « Docker » pointant sur ce dépôt (le `Dockerfile` est à la racine).
3. Ajoute un **disque persistant** monté sur `/data` (variable `DATA_DIR=/data`, déjà définie dans l'image).
4. Variables : `SITE_URL` (adresse finale, https), `ADMIN_EMAILS`, `TRUST_PROXY=1`, et `SMTP_URL` + `MAIL_FROM` pour les e-mails.
5. Déploie, ouvre l'adresse, crée ton compte admin.

### Option B — Serveur (VPS) avec Node
```bash
git clone … && cd spora/server && npm ci --omit=dev
NODE_ENV=production SITE_URL=https://spora.cm ADMIN_EMAILS=toi@exemple.com TRUST_PROXY=1 node src/server.js
```
Lance-le en continu avec `pm2` ou `systemd`, et place Nginx/Caddy devant pour le HTTPS (Caddy : `spora.cm { reverse_proxy localhost:3000 }` donne le HTTPS automatiquement).

### Option C — Docker simple
```bash
docker build -t spora . && docker run -d -p 3000:3000 -v spora-data:/data -e SITE_URL=https://spora.cm -e ADMIN_EMAILS=toi@exemple.com -e TRUST_PROXY=1 spora
```

## Relier ton nom de domaine
1. Chez ton registrar (là où tu as acheté le domaine), ouvre la zone DNS.
2. Hébergeur type Render/Railway : ajoute un enregistrement **CNAME** `www` → l'adresse donnée par l'hébergeur ; pour le domaine nu, un `A`/`ALIAS` selon ses instructions.
3. VPS : enregistrement **A** `@` et `www` → l'adresse IP du serveur.
4. Attends la propagation (de quelques minutes à 24 h). Le HTTPS est automatique chez Render/Railway/Caddy.
5. Mets `SITE_URL` à la nouvelle adresse (https://…) et redéploie.

## Sauvegardes
Sauvegarde régulièrement le dossier `DATA_DIR` (`spora.db` + `uploads/`).

## Points juridiques à traiter avant l'ouverture publique
- **Données personnelles** : l'export et la suppression sont déjà en place (`Mon espace`). Rédige les mentions légales, CGU et la politique de confidentialité, et déclare le traitement auprès de l'autorité camerounaise compétente.
- **Agents** : la vérification des licences est manuelle (statut « Vérifié » donné par l'admin).
- **Paiements** : non intégrés. L'admin active l'offre d'un membre (`/admin`) après réception du règlement (Mobile Money, etc.). Pour automatiser : CinetPay, Flutterwave, etc.
- **Offre Élite** : donne un *accès* aux professionnels, jamais une promesse de contrat ou d'essai.

## Structure
```
public/            site (index.html, admin.html, css/, js/, assets/)
server/src/        serveur : routes/, db.js, validators.js, middleware.js…
server/test/       tests automatiques
Dockerfile         image prête pour l'hébergement
```
Sécurité intégrée : mots de passe bcrypt, session par cookie httpOnly, protection CSRF (contrôle de l'origine), CSP stricte, limitation de débit, validation de toutes les entrées, photos contrôlées (type réel et taille).
