# NomadShield

Self-serve **US tax-domicile playbooks** and a **183-day audit vault** for digital nomads, expats, and remote workers leaving high-tax states (especially CA, NY, NJ, IL, MN, MA).

Software first. Services second. Keep the mailbox you already pay for.

Florida is the primary playbook, Texas is secondary, South Dakota ships with explicit 2026 risk warnings. South Dakota is **not** the default.

## Legal disclaimer

NomadShield is a **compliance workflow tool**, not a CPA, law firm, or tax-advice product.

- Domicile is a **facts-and-circumstances** test. Completing a checklist does not guarantee a state will accept the change.
- We **do not auto-file** government forms. The app generates packets, instructions, county/DMV links, and a ready-to-sign summary. **You or your CPA file.**
- Savings figures are **estimates** from an approximate 2025/2026 rate table, not advice.
- **183 days** is a common rule of thumb, not the only domicile test, and not a safe harbor.
- A persistent disclaimer appears in the footer and on every calculator / report results view.

## What this MVP is (and is not)

**Ships**

- Public landing + live domicile savings & audit-risk calculator (no auth)
- Email + password and magic-link auth (Supabase when configured; otherwise a local demo store)
- Dynamic 6-step engine with FL / TX / SD content packs
- BYO mailbox connect **preview** (no live provider OAuth)
- Audit Shield calendar, evidence vault, 1-click defense PDF
- Letter generator, settings, JSON export, account delete
- Mock checkout (plan flags only — no Stripe)

**Does not ship**

- Live government e-filing
- Live mailbox provider OAuth
- Real Stripe charges
- Live CPA chat / AI legal advice
- Multi-tenant agency portal
- South Dakota as the recommended default

## Deploy on Render

This is a **Node web service**, not a static site (middleware, auth, and API routes).

1. Push this repo to GitHub (already the intended path).
2. In Render: **New → Web Service → connect this repo**.
3. Render should pick up `render.yaml`. If you configure the dashboard yourself:

| Setting | Value |
|---|---|
| Runtime | Node |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Node version | `22` (see `.node-version`) |

4. Environment variables:

```
NEXT_PUBLIC_APP_URL=https://<your-service>.onrender.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Set `NEXT_PUBLIC_APP_URL` to the Render URL. Stripe Checkout Sessions work with **only** `STRIPE_SECRET_KEY` (products are created inline at $49 / $19/mo / $190/yr). Optional: Dashboard Payment Links (`NEXT_PUBLIC_STRIPE_LINK_*`) or existing Price IDs.

Webhook endpoint: `https://<your-service>.onrender.com/api/stripe/webhook`  
Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`.

### Google Search Console (sitemap)

Canonical URLs are hardcoded to `https://nomadshield.io` (sitemap, robots, Open Graph). Localhost is never listed.

1. After deploy, open `https://nomadshield.io/sitemap.xml`.
2. In [Google Search Console](https://search.google.com/search-console) add the `nomadshield.io` property → Sitemaps → submit `https://nomadshield.io/sitemap.xml`.
3. `robots.txt` already points crawlers at that sitemap.

The sitemap includes the homepage, SavvyNomad alternative page, pricing/compare/FAQ, the blog index, and every post.

### GoatCounter (traffic)

Privacy-friendly pageviews, no cookie banner required.

1. Create a site at [goatcounter.com](https://www.goatcounter.com/) (free).
2. Set the site code in Render:

```
NEXT_PUBLIC_GOATCOUNTER_SITE=nomadshield
```

That loads `https://nomadshield.goatcounter.com`. If you picked a different code (or a custom domain), put that value instead. Redeploy — `NEXT_PUBLIC_*` is baked in at build time.

Stats: `https://<your-code>.goatcounter.com`

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The marketing site and calculator work with **zero env vars**. Auth and the dashboard use an in-browser store until you add Supabase (then accounts, playbooks, and the vault persist in your project).

### Demo account

| | |
|---|---|
| Email | `demo@nomadshield.app` |
| Password | `Demo1234!` |
| Profile | Leaving CA → Florida, $180k W-2, 41 days already in CA |
| Plan | Audit Shield (includes the kit) |
| Checklist | ~40% complete |
| Presence | 60 mixed FL / CA / other nights |
| Vault | 6 stub exhibit records |
| Letters | One voter-cancellation letter marked sent |

## Environment

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Leave the Supabase keys empty for a local-only demo (data stays in the browser). When they are set:

1. Run `node scripts/provision-supabase.mjs` (schema, RLS, evidence bucket, Auth URLs, demo user).
2. Restart `npm run dev` so `NEXT_PUBLIC_*` is picked up.
3. Email/password and magic links go through Supabase Auth. Site URL is `https://nomadshield.io`; localhost is also allowed for redirects.
4. Playbook, letters, presence, and vault metadata persist in Postgres. Vault files go to the private `evidence` bucket (IndexedDB is the fallback).

On Render, set the same three Supabase keys **before** a new deploy (`NEXT_PUBLIC_*` is baked at build time).

## Pricing

| Plan | Price | Includes |
|---|---|---|
| Free | $0 | Calculator, risk score, Tax Blueprint capture |
| Migration Kit | **$49 one-time** | 6-step engine for one state, packets, letters, BYO mailbox |
| Audit Shield | **$19/mo or $190/yr** | Day logger, 5 GB vault, defense PDF, reminders |
| Concierge | Waitlist | “Book a CPA partner” — no fake live chat |

Buy buttons send customers to **Stripe Checkout** (or a Dashboard Payment Link if you set those env vars). After payment they return to `/checkout/success`, which verifies the session and unlocks the plan.

NomadShield is owned by [SwiftAppLab LLC](https://swiftapplab.com).

## App routes

- `/` landing + calculator
- `/pricing` `/compare` `/faq`
- `/login` `/signup`
- `/app` overview
- `/app/checklist` `/app/checklist/[step]`
- `/app/shield` `/app/vault` `/app/letters` `/app/report`
- `/app/settings` `/app/onboarding`

## Stack

Next.js 15 App Router · TypeScript · Tailwind CSS v4 · Geist · Lucide · Supabase (Auth / Postgres / Storage) · jsPDF for client-side packets and the defense report.

## What is mocked

| Integration | What you see |
|---|---|
| Stripe | Live Checkout Sessions when `STRIPE_SECRET_KEY` is set; Payment Links if `NEXT_PUBLIC_STRIPE_LINK_*` are set |
| Mailbox OAuth | Provider picker + address fields labeled **Connect (preview)** |
| Inbound mail | Webhook URL + “waiting for first webhook” + simulate button |
| Magic link (no Supabase) | On-page continue button |
| Reminder emails | In-app banner; `POST /api/reminders` is a no-op |
| CPA chat | Waitlist CTA only |

## Scripts

```bash
npm run dev      # turbopack
npm run build
npm run start
npm run lint
```
