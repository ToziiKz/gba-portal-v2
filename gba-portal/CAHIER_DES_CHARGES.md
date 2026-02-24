# Cahier des charges — GBA Portal (nouveau)

## 1. Contexte & enjeux

- Produit : plateforme hybride “Monumentale” (vitrine) + “Élite” (SaaS/CRM).
- Pourquoi : ambition sportive élevée vs outils Excel/WhatsApp ; besoin de crédibilité et d’organisation.
- Bénéficiaires : comité directeur, éducateurs U10-U18, joueurs, parents, sponsors, futurs licenciés.

## 2. Objectifs métier

| Objectif             | Indicateur                                                                        |
| -------------------- | --------------------------------------------------------------------------------- |
| Image de marque      | Perception “académie pro” → plus de visibilité, sponsors + talents.               |
| Performance sportive | Cycles tactiques standardisés, réduction du temps de préparation.                 |
| Gain de temps        | Supprimer Excel/WhatsApp pour convocations ; adoption > 90% des fiches digitales. |

## 3. Cibles & utilisateurs

- Externe (vitrine) : parents, sponsors, recruteurs, futurs licenciés → besoin de sérieux, effet wow.
- Interne (SaaS) : directeur technique, éducateurs → accès mobile terrain, focus hebdo, fiches joueurs, planning annuel.
- Pain points : perte d’infos, pas de vue globale, Excel dispersés.

## 4. Périmètre fonctionnel

### Module public

1. Cinematic Intro (Impact Reveal avec son/lumière/brouillard + logo shimmering) + sessionStorage pour ne pas répéter.
2. Hero vidéo immersive avec parallaxe et titre monumental.
3. Manifeste (Union, Rigueur, Famille).
4. Stadium vibe (textures fumées, halo, bords noirs).
5. Flux d’actu (cartes 3D interactives avec effet hover).
6. CTA sponsor (parcours partenariats, chiffres clés).

### Module intranet (SaaS)

1. Authentification (Supabase Email + future SSO).
2. Planification tactique (semaines S6-S23+) avec cycles colorés + Smart Focus (semaine courante).
3. Gestion d’effectif (CRUD joueurs, filtres, modals).
4. Notifications (convocations, alertes tactiques).

## 5. Périmètre technique

- Front : Next.js (App Router) + TypeScript strict.
- Styling : Tailwind v4, Framer Motion + GSAP + Lottie.
- Icônes/Fonts : Lucide React, Google Fonts (Teko/Cinzel/Inter).
- Backend/Data : Supabase (auth/storage/RLS).
- Rendu : SSR pour vitrine, Client Components pour dashboard.

## 6. Design & ambiance

- Ton : cinematic, dark matter, high tech.
- Palette : noir #020202, bleu GBA #0065BD, glow cyan.
- Textures : grain/noise, glassmorphism, fumée.
- Typo : Teko (titres), Cinzel (prestige), Inter (corps).
- Inspiré des académies Nike Pro, dashboards F1.

## 7. Exigences non-fonctionnelles

- Performances : lazy-load vidéo, next/image, code splitting.
- Sécurité : RLS Supabase (admin vs coach), HTTPS, CSP.
- Responsive : mobile-first pour SaaS.
- SEO : metas dynamiques, canonical, OG.
- Accessibilité : contrastes, focus, ARIA.
- Mode “low-polish” : désactiver effets lourds sur mobiles (cookie).

## 8. Déploiement & opérations

- Front : Vercel (edge) avec environnements dev/preview/prod.
- Data : Supabase (backups + PITR).
- Versioning : GitHub (main protégé).
- CI/CD : GitHub Actions (lint/test/build).
- Secrets : gestion Vercel/Supabase.
- Sauvegardes : Supabase snapshots + git tags.
- Monitoring : Sentry, Supabase logs, uptime.

## 9. Organisation & planning

1. Phase 1 (MVP) : stack Next/Tailwind/Supabase, intro cinématique + home + planification U10/U11 & U14-U18.
2. Phase 2 : extension U12/U13, dashboard complet, auth/roles.
3. Phase 3 : gestion matchs (scraping FFF), “War Room”.

Chaque phase = design validé + tests + déploiement + doc utilisateur.

## 10. Risques & contraintes

- Animations lourdes : fallback mode perf.
- Adoption : UI intuitive + Smart Focus + formation.
- Connectivité terrain : caching client, préfetch.
- Contenu tactique : dépend du club pour les textes.
