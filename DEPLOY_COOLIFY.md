# Fiche de déploiement — Cavalo.app (PWA Next.js)

**Repo GitHub :** https://github.com/dmv05/cavalo-app (public)
**Cible :** Coolify sur VPS2 (147.93.94.187)
**Type :** Application Next.js 15 (PWA) + base PostgreSQL

---

## Contexte / Blocage actuel

Le serveur `localhost` dans Coolify est rattaché à la team « vem.p.demarest's Team »
(team_id = 1). Le compte de Didier est sur « Root Team » (team_id = 0), donc la page
Servers affiche « No servers found » pour lui → il ne peut pas créer de ressource.

**À faire par Paul (au choix) :**
- Ajouter Didier à la team qui possède le serveur, OU
- Rattacher/partager le serveur localhost à Root Team, OU
- Déployer l'app lui-même (procédure ci-dessous).

---

## Étape 1 — Base de données PostgreSQL

Dans Coolify : + New → Database → PostgreSQL (v16 ou 17).
- Name : `cavalo-db`
- Récupérer l'**Internal Connection URL** générée, du type :
  `postgresql://postgres:<password>@cavalo-db:5432/postgres`

## Étape 2 — Application

+ New → Application → **Public Repository** (ou GitHub source dmv05) :
- Repository : `https://github.com/dmv05/cavalo-app`
- Branch : `main`
- Build Pack : **Dockerfile** (le repo contient un Dockerfile multi-stage prêt)
- Port exposé : **3000**

## Étape 3 — Variables d'environnement

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | l'Internal URL de l'étape 1 (postgresql://...@cavalo-db:5432/postgres) |
| `JWT_SECRET` | générer : `openssl rand -hex 32` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `COOKIE_SECURE` | `true` (oblige le cookie d'auth en HTTPS — requis en prod) |

## Étape 4 — Volume persistant (photos des annonces)

Storage / Volumes → ajouter un volume :
- Destination (dans le conteneur) : `/app/public/uploads`
- Source : volume nommé persistant (ex. `cavalo-uploads`)

⚠️ Sans ce volume, les photos uploadées seront perdues à chaque redéploiement.

## Étape 5 — Domaine

- Sous-domaine suggéré : `app.cavalo.app` (ou `cavalo.app` directement)
- Coolify/Traefik gère le SSL Let's Encrypt automatiquement.
- DNS : ajouter un A record vers 147.93.94.187 chez le registrar (Dynadot pour cavalo.app).

## Étape 6 — Migration de la base (après 1er déploiement)

Une fois l'app déployée, créer le schéma. Via le terminal Coolify du conteneur app :
```
npx prisma db push
```
(optionnel) données de démo :
```
npm run db:seed
```

---

## Récapitulatif technique

- **Stack :** Next.js 15 (App Router) + Prisma + PostgreSQL
- **Build :** Dockerfile multi-stage (node:22-alpine, sortie `standalone`)
- **Auth :** JWT + cookies httpOnly + bcrypt
- **Upload :** compression WebP via sharp → /app/public/uploads
- **PWA :** manifest + service worker (offline, installable iOS/Android)
- **Build Docker déjà validé** localement (image construite sans erreur)

Schéma DB (tables) : User, Listing, Photo, Favorite.
