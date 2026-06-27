# ---- Étape 1 : dépendances + build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Outils requis par Prisma/sharp sur Alpine
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
# DATABASE_URL factice juste pour que `prisma generate` au build passe
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npm run build

# ---- Étape 2 : image de production minimale ----
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Sortie standalone de Next.js (légère)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Prisma : schéma + client généré (pour migrations au runtime si besoin)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Dossier d'upload (sera monté sur un volume persistant)
RUN mkdir -p /app/public/uploads

EXPOSE 3000
CMD ["node", "server.js"]
