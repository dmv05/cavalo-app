# 🐴 Cavalo.app

Marketplace de chevaux en Europe — **PWA** (Progressive Web App), 100% gratuite.

Achat et vente de chevaux entre particuliers et professionnels. Installable sur l'écran d'accueil iPhone et Android sans passer par les stores.

## Stack

- **Next.js 15** (App Router) — frontend + API
- **PostgreSQL** + **Prisma** — base de données
- **PWA** — manifest + service worker (offline, installable)
- **Auth** — JWT + cookies httpOnly, bcrypt
- **Upload photos** — compression WebP via sharp

## Fonctionnalités (MVP)

- 🏠 Accueil avec dernières annonces
- 🔍 Recherche + filtres (race, discipline, sexe, prix)
- 🐴 Fiche cheval détaillée (photos, specs, contact vendeur)
- 📝 Publication d'annonce avec upload de photos
- 👤 Inscription / connexion
- 📱 Installable comme une app native

## Démarrage local

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer DATABASE_URL et JWT_SECRET

# 3. Créer le schéma de base de données
npm run db:push

# 4. (Optionnel) Données de démo
npm run db:seed

# 5. Lancer en dev
npm run dev
```

L'app tourne sur http://localhost:3000

## Déploiement (Coolify / VPS)

```bash
npm run build && npm start
```

Variables d'environnement requises : `DATABASE_URL`, `JWT_SECRET`.
Prévoir un volume persistant pour `public/uploads/` (photos).

## Roadmap

- [ ] Messagerie acheteur ↔ vendeur
- [ ] Favoris
- [ ] Notifications push (PWA)
- [ ] Modération des annonces
- [ ] App native (Capacitor) sur les stores
