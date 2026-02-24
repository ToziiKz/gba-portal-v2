# GBA Portal — Refondation

Plateforme Next.js + Tailwind visant à combiner une vitrine cinématique haut de gamme et un futur SaaS tactique pour le Groupement Bruche Ackerland.

## Stack

- Next.js 16 (App Router, TypeScript strict)
- Tailwind CSS v4
- Framer Motion / GSAP / Lottie (futurs effets)
- Supabase (auth, storage, Postgres) en backend
- Lucide React + Google Fonts (Teko, Cinzel, Inter)

## Démarrage

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variables d’environnement

- `NEXT_PUBLIC_SITE_URL` : URL publique (sert pour `metadataBase`, `sitemap.xml`, `robots.txt`).
- `NEXT_PUBLIC_CONTACT_EMAIL` : email de contact affiché sur la landing page.
- `NEXT_PUBLIC_GIT_SHA` (optionnel) : version affichée dans `/health`.

## Structure

- `src/app/layout.tsx` : layout global, imports fonts et styles.
- `src/app/page.tsx` : sections Hero video, Manifeste, Planification, effectif, news.
- `public/hero.mp4`, `public/gba-logo.png` : assets médias.
- `CAHIER_DES_CHARGES.md` : business requirements.

## Vision

Effet "waouw" avec textures, glow et storytelling pour impressionner sponsors/parents, et architecture future pour l’intranet tactique.
