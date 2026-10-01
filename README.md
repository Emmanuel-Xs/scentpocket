# Scentpocket

**A scent for every pocket.** A demo Lagos fragrance shop where a ₦3,500 body spray and a ₦1,000,000 Baccarat Rouge 540 live side by side, organised by budget tier, with cheap dupes linked to the expensive scents they resemble.

> Demo store built for HNG Internship 15 (Lesson 2). Nothing is for sale.

## Brief checklist

| Requirement | How |
|---|---|
| Website for a shop | TanStack Start storefront: tiers, filters, product pages, cart |
| Checkout page | `/checkout` with delivery zones and pay on delivery |
| Persist everything (Supabase/Neon) | Supabase Postgres via Drizzle: products, variants, images, orders, profiles |
| Confirmation emails (Mailgun) | Mailgun API, Gmail SMTP fallback, preview on the receipt page |
| Google auth (Google Cloud Console) | Supabase Auth with a Google OAuth client |
| Past orders | `/account/orders` |

## Stack

TanStack Start · TypeScript · Tailwind v4 · shadcn/ui · Zustand · Supabase · Drizzle · React Email · Mailgun · Netlify

## Docs

* [Product requirements](./docs/PRD.md) · [Functional requirements](./docs/FRD.md) · [Technical design](./docs/TRD.md)
* [Design and UX](./docs/DESIGN.md) · [Catalog](./docs/CATALOG.md) · [Decisions](./docs/DECISIONS.md) · [Setup](./docs/SETUP.md)
* Progress: [context/README.md](./context/README.md)

## Run locally

```bash
pnpm install
cp .env.example .env   # fill in (see docs/SETUP.md)
pnpm db:migrate
pnpm db:seed
pnpm dev
```

_Live URL, screenshots and demo video: added at submission._
