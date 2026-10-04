# Scentpocket: Technical Requirements Document (TRD)

Related: [PRD](./PRD.md) · [FRD](./FRD.md) · [Setup runbook](./SETUP.md) · [Decisions](./DECISIONS.md)

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | TanStack Start (React, TypeScript, Vite) | SSR, file routes, server functions, server routes |
| Routing / data | TanStack Router + TanStack Query | Search params validated with Zod |
| Forms | TanStack Form + Zod (Standard Schema) | Array fields for variants |
| Client state | Zustand + `persist` | Cart only |
| UI | Tailwind CSS v4 + shadcn/ui (Radix) + lucide-react (stroke 1.5) | Light theme only; tokens in docs/design/tokens.css |
| Fonts | Fontsource: Instrument Serif, Instrument Sans | Self hosted, OFL |
| Feedback and motion | Sonner (toasts), Vaul via shadcn Drawer (drawer/sheets), NumberFlow (prices), motion (springs only), clsx + cva | Rules in docs/design/MOTION-AND-LOADING.md |
| PWA | manifest + small service worker (Serwist or hand written) | Phase 5; see docs/design/SEO-PWA-MOBILE.md |
| Database | Supabase Postgres | Accessed only through Drizzle on the server |
| ORM | Drizzle ORM + drizzle-kit + postgres.js | Migrations in `drizzle/` |
| Auth | Supabase Auth, Google provider | `@supabase/ssr` cookie sessions |
| Storage | Supabase Storage, public bucket `products` | Uploads via service role on the server |
| Images | `sharp` (processing), Netlify Image CDN (delivery), `@unpic/react` | WebP masters + base64 blur |
| Email | React Email + Mailgun HTTP API, Nodemailer (Gmail SMTP) fallback | |
| Tests | Vitest | Unit + one DB integration suite |
| Hosting | Netlify | Official TanStack Start partner |
| Package manager | npm (D43) | |

Starting point for auth wiring: TanStack's official `examples/react/start-supabase-basic`. Fix from that example: its `setAll` drops cookie options; ours must pass `cookie.options` to `setCookie`.

## 2. Architecture

```
Browser
  ├─ Routes (SSR + client nav)
  ├─ Zustand cart (localStorage)
  └─ calls server functions (RPC over HTTP)

Netlify Functions (TanStack Start server)
  ├─ Server functions: catalog, cart lookup, checkout, orders, admin
  ├─ Server route: /auth/callback (OAuth code exchange)
  ├─ Drizzle → Supabase Postgres (transaction pooler :6543)
  ├─ supabase-js (server client) → Auth, Storage
  └─ Email: Mailgun API → fallback Gmail SMTP

Netlify Image CDN  ← /.netlify/images?url=<supabase public url>&w=...
Supabase Storage   (bucket: products)
```

Rule: **the browser never talks to the database.** The anon (publishable) key is only used for auth. All reads and writes of app tables go through server functions using Drizzle.

## 3. Folder structure (feature slices)

```
src/
  routes/                     # file routes only, thin
    __root.tsx
    index.tsx                 # home
    shop.tsx                  # listing, search params
    p.$slug.tsx               # product page
    sign-in.tsx
    auth.callback.ts          # server route
    privacy.tsx  terms.tsx
    _authed.tsx               # requires user
    _authed/checkout.tsx
    _authed/account.orders.tsx
    _authed/account.orders.$ref.tsx
    _admin.tsx                # requires admin/owner
    _admin/admin.index.tsx
    _admin/admin.products.tsx
    _admin/admin.products.new.tsx
    _admin/admin.products.$id.tsx
    _admin/admin.orders.tsx
    _admin/admin.orders.$ref.tsx
    _admin/admin.team.tsx
  features/
    catalog/   { components/, server/, schemas.ts, queries.ts }
    cart/      { store.ts, components/, server/ }
    auth/      { server/, components/ }
    checkout/  { components/, server/, schemas.ts }
    orders/    { components/, server/, status.ts }
    email/     { templates/OrderConfirmation.tsx, send.ts, mailgun.ts, smtp.ts }
    admin/     { products/, orders/, team/ }
    images/    { process.ts, Image.tsx }
    legal/     { content/ }
  db/
    schema.ts  client.ts  seed.ts  seed-data.ts
  lib/
    money.ts      # kobo helpers, formatting, totals, delivery fee
    config.ts     # delivery zones, threshold, limits
    env.ts        # Zod validated env
    supabase.ts   # server client factory
    order-ref.ts
  components/ui/  # shadcn
tests/
  unit/        money.test.ts  phone.test.ts  order-ref.test.ts  status.test.ts
  integration/ checkout.int.test.ts
docs/  context/
```

## 4. Data model (Drizzle, schema `public`)

Conventions: `id uuid default gen_random_uuid()`, `created_at`/`updated_at timestamptz default now()`, money as `integer` kobo, **RLS enabled on every table with no policies** (`.enableRLS()`).

### Enums
| Enum | Values |
|---|---|
| `tier` | `pocket`, `arabian_gems`, `designer`, `niche` |
| `gender` | `men`, `women`, `unisex` |
| `occasion` | `office`, `owambe`, `date_night`, `everyday` |
| `scent_family` | `fresh`, `woody`, `amber`, `floral`, `gourmand` |
| `longevity` | `short`, `moderate`, `long`, `very_long` |
| `projection` | `soft`, `moderate`, `strong` |
| `role` | `customer`, `admin`, `owner` |
| `order_status` | `placed`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `delivery_zone` | `lagos_mainland`, `lagos_island`, `outside_lagos` |
| `payment_method` | `pay_on_delivery`, `paystack` |
| `email_provider` | `mailgun`, `smtp` |

### Tables

**profiles**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | equals `auth.users.id` (no FK across schemas needed) |
| email | text unique not null | |
| full_name | text | |
| avatar_url | text | |
| role | role default `customer` | |

**products**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | |
| name, brand | text not null | |
| description | text not null | |
| tier | tier | indexed |
| gender | gender | |
| family | scent_family | |
| occasions | occasion[] | |
| top_notes, heart_notes, base_notes | text[] | |
| longevity | longevity | |
| projection | projection | |
| inspired_by_id | uuid null FK products(id) on delete set null | dupes |
| is_active | boolean default true | |
| featured_rank | integer null | for "Featured" sort |

**product_images**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK products on delete cascade | |
| path | text | storage path in `products` bucket |
| width, height | integer | of the WebP master |
| blur_data_url | text | ~200 bytes base64 WebP |
| alt | text | |
| position | integer default 0 | 0 is the main image |

**product_variants**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK products on delete cascade | |
| label | text | e.g. `100ml`, `250ml Body Spray` |
| size_ml | integer | price per ml = price / size |
| price_kobo | integer check > 0 | |
| stock | integer check >= 0 | |
| sku | text unique | |
| position | integer | |
| is_active | boolean default true | |

Guardrails: 1 to 3 variants per product, enforced in the admin server function and Zod schema.

**orders**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| ref | text unique | `SP-XXXXXX` |
| user_id | uuid FK profiles | indexed |
| status | order_status default `placed` | |
| payment_method | payment_method default `pay_on_delivery` | |
| payment_ref | text null | for Paystack later |
| customer_name, email, phone | text | snapshot |
| address_line, city, state | text | snapshot |
| delivery_zone | delivery_zone | |
| subtotal_kobo, delivery_fee_kobo, total_kobo | integer | snapshot |
| email_provider | email_provider null | |
| email_sent_at | timestamptz null | |
| email_error | text null | |
| idempotency_key | text unique null | from client, prevents double submit |
| confirmed_at, shipped_at, delivered_at, cancelled_at | timestamptz null | |

**order_items**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK orders on delete cascade | |
| variant_id | uuid FK product_variants on delete restrict | |
| product_name, variant_label | text | snapshot |
| image_path | text | snapshot |
| unit_price_kobo, qty, line_total_kobo | integer | snapshot |

Indexes: `products(tier, is_active)`, `product_variants(product_id)`, `orders(user_id, created_at desc)`, `orders(status)`.

## 5. Config (`lib/config.ts`)

```ts
export const DELIVERY_FEES_KOBO = {
  lagos_mainland: 300_000,   // ₦3,000
  lagos_island: 450_000,     // ₦4,500
  outside_lagos: 700_000,    // ₦7,000
} as const
export const FREE_DELIVERY_THRESHOLD_KOBO = 30_000_000 // ₦300,000
export const MAX_QTY_PER_LINE = 10
export const MAX_VARIANTS_PER_PRODUCT = 3
```

## 6. Auth flow

1. `/sign-in?next=/checkout` → button calls a server function that runs `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${SITE_URL}/auth/callback?next=...` } })` and redirects to the returned URL (PKCE, verifier stored in cookie).
2. Google → Supabase (`https://<project>.supabase.co/auth/v1/callback`) → our `/auth/callback?code=...&next=...`.
3. `/auth/callback` server route: `exchangeCodeForSession(code)`, upsert `profiles` (role `owner` if email in `ADMIN_EMAILS`, else keep existing role, default `customer`), validate `next` is a relative path, redirect.
4. `__root.tsx` `beforeLoad` calls `getSessionUser()` server function → `{ id, email, name, avatarUrl, role } | null` in router context.
5. `_authed` layout: redirect to `/sign-in?next=<location>` if no user. `_admin` layout: 404 unless role is `admin` or `owner`.
6. **Every** protected server function calls `requireUser()` or `requireAdmin()` itself. Layout guards are UX, not security.
7. Use `supabase.auth.getUser()` (verifies with Supabase) on the server, never trust `getSession()` alone.

## 7. Checkout transaction

`placeOrder({ items: [{ variantId, qty }], delivery, idempotencyKey })`:

```
requireUser()
validate input (Zod), merge duplicate variantIds, qty 1..10
if order with idempotencyKey exists for user → return its ref
db.transaction(async tx => {
  rows = select variants + products where id in ids and both active
  for each line:
    updated = UPDATE product_variants
              SET stock = stock - qty
              WHERE id = $id AND stock >= qty
              RETURNING id
    if not updated → collect { variantId, available }
  if any short → throw StockError(short)            // rolls back everything
  subtotal = Σ price_kobo * qty                     // from DB rows only
  fee = subtotal >= threshold ? 0 : DELIVERY_FEES_KOBO[zone]
  insert order (ref = generateRef(), snapshots), insert items
})
send email (outside the transaction, awaited, errors caught → stored on order)
return { ref }
```

The conditional `UPDATE ... WHERE stock >= qty` is atomic per row, so two buyers of the last bottle can't both succeed. Ref collisions: retry generation up to 3 times on unique violation.

**Cancel** (`admin.cancelOrder(ref)`): one transaction: check status is `placed` or `confirmed`, set `cancelled` + `cancelled_at`, `UPDATE product_variants SET stock = stock + qty` for each item.

Status transitions live in `features/orders/status.ts` as a map and are unit tested.

## 8. Database connection

* `DATABASE_URL`: Supabase **transaction pooler** (port 6543). postgres.js options: `{ prepare: false, max: 1 }` (serverless).
* `DIRECT_URL`: session pooler or direct (port 5432) for `drizzle-kit migrate` and the seed script only.
* Transactions work through the transaction pooler (a transaction stays on one connection).

## 9. Images

**Processing** (`features/images/process.ts`, Node only):
```
sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 })
blur: sharp(input).resize(16).webp({ quality: 40 }) → `data:image/webp;base64,...`
```
Upload master to `products/<productId>/<uuid>.webp` with `contentType: image/webp`, `cacheControl: 31536000`.

**Delivery**: `<Image>` wrapper around `@unpic/react` with `cdn="netlify"`, passing the Supabase public URL. `netlify.toml`:
```toml
[images]
  remote_images = ["https://<project-ref>.supabase.co/storage/v1/object/public/.*"]
```
Props: `priority` (eager + `fetchpriority=high`), `eager`, default lazy. Hero preload added in the home route's `head()` links. Blur as `background-image` with `background-size: cover`, fade in on `onLoad`.

Fallback if Image CDN fails on TanStack Start: plain `<img>` with the WebP URL, same blur and sizing.

## 10. Email

* Template: `features/email/templates/OrderConfirmation.tsx` (React Email components), rendered with `@react-email/render` to HTML + plain text.
* `sendOrderEmail(order)`: try Mailgun (`POST https://api.mailgun.net/v3/<MAILGUN_DOMAIN>/messages`, basic auth `api:<MAILGUN_API_KEY>`; EU accounts use `api.eu.mailgun.net`). On non 2xx, try Nodemailer with Gmail SMTP (`smtp.gmail.com:465`, app password). Record the provider, timestamp or error.
* Preview: `getOrderEmailHtml(ref)` server function (owner of order or admin) returns the same HTML; the receipt page renders it in `<iframe sandbox srcDoc>`.
* Netlify functions stop after the response, so the send is awaited before returning (expect +1 to 2s on Place order; show "Placing your order..." state).

## 11. Security checklist

* RLS on, no policies, on every `public` table. Verify in the Supabase dashboard that the anon key can't select from `orders`.
* Service role / secret key only in server env, never prefixed `VITE_`.
* Prices, fees and totals computed only on the server.
* `requireUser` / `requireAdmin` inside every protected server function; order reads check `order.user_id === user.id` or admin.
* `next` redirect param must start with `/` and not `//`.
* Upload validation: image MIME types only, max 8 MB.
* Email HTML preview in a sandboxed iframe.
* Zod on every server input. Env validated at startup (`lib/env.ts`).

## 12. Environment variables

See [`.env.example`](../.env.example). Names that start with `VITE_` are public.

## 13. Testing

| Suite | Covers |
|---|---|
| `unit/money.test.ts` | subtotal, fee by zone, totals, naira formatting, price per ml |
| `unit/phone.test.ts` | Nigerian phone formats → `+234...`, rejects invalid |
| `unit/order-ref.test.ts` | format, alphabet without ambiguous characters |
| `unit/status.test.ts` | allowed and blocked transitions |
| `integration/checkout.int.test.ts` | happy path; last bottle race (two concurrent orders, one wins); insufficient stock rolls back everything; idempotency key; cancel restocks |

Integration tests run against `TEST_DATABASE_URL` (a separate Supabase project or local Postgres via Docker), migrated fresh before the suite.

## 14. Deployment

* Netlify site connected to GitHub, build `pnpm build`, Netlify's TanStack Start setup.
* Env vars set in Netlify for production and deploy previews.
* Migrations run manually (`pnpm db:migrate`) against `DIRECT_URL` before deploying schema changes.
* Seed once: `pnpm db:seed` (idempotent by slug).

## 15. Scripts

| Script | Does |
|---|---|
| `pnpm dev` | dev server on :3000 |
| `pnpm build` / `pnpm start` | production build / run |
| `pnpm db:generate` | drizzle-kit generate |
| `pnpm db:migrate` | drizzle-kit migrate |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm db:seed` | seed catalog + upload images |
| `pnpm test` / `pnpm test:int` | unit / integration |
| `pnpm typecheck` / `pnpm lint` | tsc / eslint |
