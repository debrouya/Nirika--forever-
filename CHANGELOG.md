# NIRIKA FOR EVER — Historique des modifications

## Stack technique
- **Frontend** : React + Vite + TailwindCSS
- **Backend** : Supabase (auth, PostgreSQL, RLS, Edge Functions)
- **Paiements** : Stripe (en attente activation)
- **Déploiement** : Cloudflare Pages → https://nirika-forever.pages.dev
- **PWA** : manifest.json + service worker (offline)

---

## Comptes & Accès

| Service | URL | Identifiant |
|---------|-----|-------------|
| Supabase | https://supabase.com/dashboard | Jacques.frederic@icloud.com (projet: cautlsqinbhrkdqgiiom) |
| Cloudflare | https://dash.cloudflare.com | Jacques.frederic@icloud.com |
| Cloudflare Pages | https://nirika-forever.pages.dev | — |
| Stripe | https://dashboard.stripe.com | En attente vérification identité |

- **Admin UUID Supabase** : `2dd4315a-ac99-4660-9e72-5bc3a33e5b5e`
- **Admin email (hardcodé dans App.jsx)** : `jacques.frederic@icloud.com`
- **Cloudflare API Token** : `cfat_CgBGaMOxzhbpRpvmgF1Lpsl8kb1hfv3zZzWkwUl8b8e42651`

---

## Design & UX

- **Palette** : dark charcoal-teal gradient (#0F1A1E → #1A2B34)
- **Glassmorphism** : classes `glass`, `glass-heavy`, `glass-dark`, `glass-nav`
- **Police** : blanc #FFFFFF partout, violet/blue/banished remplacé par blanc
- **Logo** : `/logo.svg` (lettre "N" blanche) + `/favicon.svg` (arrondi dark) + `/icon-maskable.svg` (PWA maskable)
- **Titre** : "NIRIKA FOR EVER" (espace entre FOR et EVER)
- **Coach** : "NIRIKA Coach" (pas "NIRIKA Coach IA", pas "IA" visible)
- **Navigation** : flottante glassmorphism en bas, 7 onglets + Premium + Admin + Quitter

---

## Onglets Navigation

| Tab ID | Label | Composant |
|--------|-------|-----------|
| `dashboard` | Board | Dashboard.jsx |
| `programme` | Programme | Programme.jsx |
| `calisthenics` | Exercices | Calisthenics.jsx |
| `cardio` | Cardio | Cardio.jsx |
| `ai` | Coach | AICoach.jsx |
| `calendar` | Calendrier | Calendar.jsx |
| `stats` | Stats | Stats.jsx |

---

## Monétisation

- **Modèle** : Premium subscription (pas de pub)
- **Prix** : Mensuel 4,99€/mois, Annuel 39,99€/an (-33%)
- **Contenu gratuit** : 3 programmes, 20 exercices, pas de Coach
- **Contenu Premium** : Tous les 15+ programmes, 69+ exercices, NIRIKA Coach, Stats avancées
- **Admin** : accès à TOUT, aucun paywall
- **Stripe** : Edge Functions créées (stripe-checkout, stripe-webhook), pas encore activées

---

## Fichiers clés

### Composants React
- `src/App.jsx` — Routing, auth, admin check (hardcoded email), paywall
- `src/components/Dashboard.jsx` — Quick Start, streak, skeleton loading, animations
- `src/components/Navigation.jsx` — Nav flottante, pill animé, admin/premium/logout
- `src/components/Programme.jsx` — Liste programmes avec expansion jours/exercices
- `src/components/Calisthenics.jsx` — 69 exercices, gated >20 pour free
- `src/components/Cardio.jsx` — 9 activités cardio avec MET values
- `src/components/AICoach.jsx` — Coach IA (premium)
- `src/components/Stats.jsx` — Graphiques recharts (premium)
- `src/components/Calendar.jsx` — Vue calendrier
- `src/components/Profile.jsx` — Settings + notifications push
- `src/components/AdminPanel.jsx` — 6 tabs: Dashboard, Users, Subscriptions, Exercises, Programs, Activity
- `src/components/Auth.jsx` — Login, Signup, ForgotPassword
- `src/components/Paywall.jsx` — Modal glassmorphism → Stripe checkout
- `src/components/Pricing.jsx` — Page pricing mensuel/annuel
- `src/components/SplashScreen.jsx` — Animé 3 phases (logo → titre → progress)
- `src/components/Layout.jsx` — Header avec logo.svg
- `src/components/FitMatrix.jsx` — Matrice fitness

### Données
- `src/data/exercises.js` — 69 exercices avec YouTube IDs
- `src/data/programs.js` — 15+ programmes (PPL, Upper/Lower, PHAT, GVT, 5/3/1, etc.)
- `src/data/cardio.js` — 9 activités avec MET values

### State & Services
- `src/store/useStore.js` — Zustand store (profile, workouts, sessions, streak, subscription)
- `src/services/supabaseService.js` — CRUD auth, profile, sessions, admin, checkout
- `src/hooks/useSubscription.js` — Tier check, realtime subscription
- `src/hooks/useNotifications.js` — Push notifications, permission, local scheduling
- `src/lib/supabase.js` — Client Supabase init

### Backend (Supabase)
- `supabase/schema.sql` — 8 tables, RLS, SECURITY DEFINER `is_admin()`, triggers, RPC admin functions
- `supabase/functions/stripe-checkout/index.ts` — Edge Function checkout Stripe
- `supabase/functions/stripe-webhook/index.ts` — Edge Function webhook Stripe

### PWA
- `public/manifest.json` — Manifest PWA (icons, display standalone, dark theme)
- `public/sw.js` — Service worker v3 (cache-first static, network-first API, offline fallback)
- `public/logo.svg` — Logo N blanc
- `public/favicon.svg` — Favicon arrondi
- `public/icon-maskable.svg` — Icon maskable PWA

### Config
- `.env` — Supabase + Stripe placeholder + admin emails
- `index.html` — Manifest link, SW registration, apple-mobile-web-app
- `src/index.css` — Glassmorphism utilities, animations (fade-in, shimmer, pulse-glow, streak-fire)

---

## Ce qu'il reste à faire

### Immédiat
- [ ] Activer Stripe (vérification identité) → configurer clés API + produits
- [ ] Déployer Edge Functions Stripe : `supabase functions deploy stripe-checkout stripe-webhook`
- [ ] Configurer webhook Stripe → URL Cloudflare Pages
- [ ] Exécuter `supabase/schema.sql` dans Supabase SQL Editor si pas encore fait

### Améliorations
- [ ] Notifications push serveur (VAPID keys — actuellement seulement local Notification API)
- [ ] Code-splitting / lazy loading (chunk > 500kB warning)
- [ ] Tests unitaires
- [ ] Analytics (Plausible ou Umami — GDPR-friendly)

---

## Commandes utiles

```bash
# Build
cd ~/Documents/nirika-forever && npm run build

# Deploy Cloudflare Pages
CLOUDFLARE_API_TOKEN=cfat_CgBGaMOxzhbpRpvmgF1Lpsl8kb1hfv3zZzWkwUl8b8e42651 npx wrangler pages deploy dist --project-name=nirika-forever

# Preview local
npm run preview
```
