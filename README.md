# Spora — site complet (front + serveur + base de données)

Réseau des talents du football africain. Lancement : Cameroun.

- **Front** : Next.js 15 + React + TypeScript (`web/`), architecture **MVC**, exporté en site statique servi par le serveur Express
- **Serveur** : Node.js 20.12+ / Express (`server/`)
- **Base de données** : libSQL / SQLite — un simple fichier en local, **Turso** (gratuit) en production
- **Fonctions** : comptes (joueur, agent, club), connexion sécurisée, profils + photo, annuaire des joueurs vérifiés, demandes de contact (accord du joueur), mode invité, mot de passe oublié, export/suppression des données, panneau d'administration (`/admin`).

## Lancer en local

```bash
cd web && npm install && npm run build     # construit le site (dossier web/out)
cd ../server
npm install
cp .env.example .env      # puis édite ADMIN_EMAILS (ton e-mail)
npm start                 # http://localhost:3000
npm test                  # tests automatiques (refaire « npm run build » dans web/ après chaque changement du front)
```
Pendant que tu modifies le front : `cd web && npm run dev` (http://localhost:3001) ; les appels `/api` doivent alors viser le serveur : lance aussi `npm start` et ouvre plutôt http://localhost:3000 après un `npm run build`.
Crée ton compte sur le site avec l'e-mail mis dans `ADMIN_EMAILS` : il devient administrateur (page `/admin`).

## Mettre en ligne gratuitement (Render + Turso)

Les comptes sont stockés dans **Turso** (base hébergée, offre gratuite), séparée du serveur. Le serveur peut donc s'endormir ou redémarrer sans rien perdre.

1. **Turso** — crée un compte sur turso.tech, puis une base de données (nom : `spora`, région la plus proche).
   Récupère deux valeurs : l'**URL** (`libsql://spora-xxxx.turso.io`) et un **jeton d'accès** (« Create token »).
   (Avec leur outil en ligne de commande : `turso db create spora`, `turso db show spora --url`, `turso db tokens create spora`.)
2. **GitHub** — mets ce dossier dans un dépôt privé (le `Dockerfile` à la racine).
3. **Render** — « New + » → « Web Service » → ton dépôt → formule **Free**. Variables d'environnement :
   - `SITE_URL` = `https://spora.cm` (ou l'adresse `…onrender.com` en attendant)
   - `TURSO_DATABASE_URL` = l'URL Turso
   - `TURSO_AUTH_TOKEN` = le jeton Turso
   - `ADMIN_EMAILS` = ton e-mail
   - `TRUST_PROXY` = `1`
   - (e-mails) `SMTP_URL` et `MAIL_FROM`
4. Déploie, ouvre le site, crée ton compte avec l'e-mail de `ADMIN_EMAILS` : tu es administrateur (`/admin`).

Le serveur gratuit de Render s'endort après ~15 min sans visite (réveil d'environ 1 minute) : c'est normal. Les données, elles, restent dans Turso.
Les photos sont stockées dans la base (réduites à ~50 Ko).

### Autres hébergeurs
Tout hébergeur Node.js ou Docker convient (Railway, Fly.io, VPS…) : il suffit de définir les mêmes variables. Sans `TURSO_DATABASE_URL`, le serveur utilise un fichier local (`DATA_DIR`) : dans ce cas il faut un disque persistant.

### Docker
```bash
docker build -t spora . && docker run -d -p 3000:3000 -e SITE_URL=https://spora.cm -e TURSO_DATABASE_URL=libsql://… -e TURSO_AUTH_TOKEN=… -e ADMIN_EMAILS=toi@exemple.com -e TRUST_PROXY=1 spora
```

## Vidéos (highlights)
Tous les membres inscrits peuvent publier jusqu'à 3 vidéos (`MAX_VIDEOS`) depuis « Mon espace ». Elles apparaissent sur la page Highlights (fil vertical façon TikTok, profils vérifiés uniquement) et sur la fiche du joueur dans l'annuaire. L'admin peut en retirer (`/admin`, API `DELETE /api/admin/videos/:id`).

- **Mode test (par défaut)** : sans réglage, les vidéos (30 Mo max) sont enregistrées sur le serveur. Sur un hébergement gratuit, elles peuvent être effacées à chaque mise à jour. Idéal pour tester.
- **Production : Cloudinary** (gratuit pour démarrer : 25 crédits/mois ≈ 25 Go de stockage ou de lecture, 100 Mo par vidéo). Crée un compte sur cloudinary.com, copie la variable « API Environment variable » (`cloudinary://clé:secret@nom`) dans `CLOUDINARY_URL`. L'envoi se fait alors directement du téléphone vers Cloudinary (3 min max, MP4/MOV/WebM).

## Relier ton nom de domaine
1. Chez ton registrar (là où tu as acheté le domaine), ouvre la zone DNS.
2. Hébergeur type Render/Railway : ajoute un enregistrement **CNAME** `www` → l'adresse donnée par l'hébergeur ; pour le domaine nu, un `A`/`ALIAS` selon ses instructions.
3. VPS : enregistrement **A** `@` et `www` → l'adresse IP du serveur.
4. Attends la propagation (de quelques minutes à 24 h). Le HTTPS est automatique chez Render/Railway/Caddy.
5. Mets `SITE_URL` à la nouvelle adresse (https://…) et redéploie.

## Sauvegardes
Turso garde des sauvegardes (voir son tableau de bord). En mode fichier local, sauvegarde `DATA_DIR/spora.db`. Export complet possible avec `turso db shell spora .dump`.

## Points juridiques à traiter avant l'ouverture publique
- **Données personnelles** : l'export et la suppression sont déjà en place (`Mon espace`). Rédige les mentions légales, CGU et la politique de confidentialité, et déclare le traitement auprès de l'autorité camerounaise compétente.
- **Agents** : la vérification des licences est manuelle (statut « Vérifié » donné par l'admin).
- **Photos** : stockées dans la base ; limite de 600 Ko après réduction côté navigateur.
- **Paiements** : non intégrés. L'admin active l'offre d'un membre (`/admin`) après réception du règlement (Mobile Money, etc.). Pour automatiser : CinetPay, Flutterwave, etc.
- **Offre Élite** : donne un *accès* aux professionnels, jamais une promesse de contrat ou d'essai.

## Structure (MVC)
```
web/src/models/        MODEL : données et accès au serveur (api.ts, services.ts, types, formulaires, profils d'exemple)
web/src/controllers/   CONTROLLER : logique et état (connexion, annuaires + filtres, inscription, mon espace, chat, highlights, admin, effets du site)
web/src/views/         VIEW : affichage seul (layout/, pages/, components/) ; aucune requête réseau
web/src/app/           routes Next.js (une page = un fichier qui appelle une vue)
web/src/styles/        feuilles de style (site.css, admin.css)
web/public/            images, manifest, robots.txt
server/src/            serveur : routes/, db.js, validators.js, middleware.js, site.js (sert web/out)
server/test/           tests automatiques
Dockerfile             construit le site puis l'image du serveur
```
Les anciens liens du type `/#joueurs` sont redirigés vers `/joueurs/`. Le serveur applique une CSP stricte page par page (empreintes sha256 des scripts de Next, pas de `unsafe-inline` pour les scripts).

Sécurité intégrée : mots de passe bcrypt, session par cookie httpOnly, protection CSRF (contrôle de l'origine), CSP stricte, limitation de débit, validation de toutes les entrées, photos contrôlées (type réel et taille).
