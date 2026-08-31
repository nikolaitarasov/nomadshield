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

4. Environment variables (optional — the app runs in demo mode without them):

```
NEXT_PUBLIC_APP_URL=https://<your-service>.onrender.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Set `NEXT_PUBLIC_APP_URL` to the Render URL after the first deploy.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The marketing site and calculator work with **zero env vars**. Auth and the dashboard use an in-browser store until you add Supabase.

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

Leave the Supabase keys empty for demo mode. When they are set:

1. Run `supabase/migrations/001_init.sql` (tables, RLS, `evidence` storage bucket).
2. Optionally run `supabase/seed.sql` to create the demo user in Auth.
3. Email/password and magic links go through Supabase Auth.
4. Vault uploads try Storage first, then fall back to IndexedDB.

## Pricing (mocked)

| Plan | Price | Includes |
|---|---|---|
| Free | $0 | Calculator, risk score, Tax Blueprint capture |
| Migration Kit | **$49 one-time** | 6-step engine for one state, packets, letters, BYO mailbox |
| Audit Shield | **$19/mo or $190/yr** | Day logger, 5 GB vault, defense PDF, reminders |
| Concierge | Waitlist | “Book a CPA partner” — no fake live chat |

Stripe is not connected. Checkout toggles a plan flag so you can click through the product.

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
| Stripe | “Demo checkout — no charge” modal |
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
