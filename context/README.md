# Scentpocket: Context and progress tracker

**This file is the single source of truth for where the project is.** Humans and AI agents read it first and update it after every step. See [AGENTS.md](../AGENTS.md) for the rules.

| | |
|---|---|
| Deadline | **Fri 2 Oct 2026, 11:59 PM WAT** (target submit: 10:00 PM) |
| Current phase | **Phase 4: Email and admin** (next: 4.5 products, 4.6 team; 4.2, 4.3 deferred; 2.6 half done; 0.9 skipped) |
| Last updated | Thu 1 Oct 2026, by Claude Code |
| Live URL | https://scentpocket.netlify.app  |
| Repo | https://github.com/Emmanuel-Xs/scentpocket (public) |

Status legend: ⬜ not started · 🟨 in progress · ✅ done · ⛔ blocked · ✂️ cut

---

## Features

| Feature | File | FRD | Status |
|---|---|---|---|
| Catalog (home, listing, filters) | [features/catalog.md](./features/catalog.md) | F1 | ⬜ |
| Product page | [features/product-page.md](./features/product-page.md) | F2 | ⬜ |
| Cart | [features/cart.md](./features/cart.md) | F3 | ⬜ |
| Auth (Google) | [features/auth.md](./features/auth.md) | F4 | ⬜ |
| Checkout | [features/checkout.md](./features/checkout.md) | F5 | ⬜ |
| Orders and history | [features/orders.md](./features/orders.md) | F6 | ⬜ |
| Confirmation email | [features/email.md](./features/email.md) | F7 | ⬜ |
| Images | [features/images.md](./features/images.md) | F8 | ⬜ |
| Admin | [features/admin.md](./features/admin.md) | F9 | ⬜ |
| Legal pages | [features/legal.md](./features/legal.md) | F10 | ⬜ |
| Design system and app shell | [features/design-system.md](./features/design-system.md) | NFR | ⬜ |
| SEO and PWA | [features/seo-pwa.md](./features/seo-pwa.md) | NFR-5 | ⬜ |

---

## Phases and steps

### Phase 0: Setup (Thu morning)
- [x] 0.1 Scaffold TanStack Start (npm, TypeScript strict, Tailwind v4, shadcn/ui, ESLint, Prettier)
- [x] 0.2 `lib/env.ts` with Zod, `.env.example` copied
- [x] 0.3 GitHub repo `Emmanuel-Xs/scentpocket`, first push
- [x] 0.4 Netlify site connected, first deploy green (deployed via CLI; GitHub auto deploy not linked, deploy with `netlify deploy --prod --build`)
- [x] 0.5 `/privacy` and `/terms` routes live (content from `docs/legal/`)
- [x] 0.6 Supabase project, keys in `.env` and Netlify (project `scentpocket` ref `xogxpyzydlnmvweerjwj`, eu-west-2; bucket `products` public)
- [x] 0.7 Drizzle schema (TRD §4), enums, RLS enabled, first migration applied
- [x] 0.8 Verify anon key can't read `orders`
- [ ] 0.9 (skipped for now by user, no domain yet; Mailgun sandbox + netlify.app until bought) Buy `scentpocket.shop`, auto renew off, start Mailgun domain verification (`mg.`)
- [x] 0.10 Install agent skills from [docs/SKILLS.md](../docs/SKILLS.md) and run `npx @tanstack/intent install`
- [x] 0.11 Design tokens: port [docs/design/tokens.css](../docs/design/tokens.css) into `src/styles/app.css`, Fontsource fonts, mobile native meta tags (viewport-fit, theme-color)

### Phase 1: Catalog (Thu afternoon)
- [x] 1.1 `features/images/process.ts` (sharp → WebP + blur) and `<Image>` wrapper
- [x] 1.2 `seed-data.ts` from [docs/CATALOG.md](../docs/CATALOG.md); `pnpm db:seed` uploads images, idempotent
- [x] 1.3 Netlify Image CDN check on the live deploy (fallback decided if it fails)
- [x] 1.4 Layout shell: demo banner, sticky header, footer, phone tab bar (safe areas), route progress bar, Sonner toaster, error + 404 components (cart pill comes with 2.2, search dialog with 1.8; /shop, /dupes, /sign-in are stubs until 1.6, 1.8, 2.4)
- [x] 1.5 Home: hero (preloaded), tier cards, dupes strip, trust strip
- [x] 1.6 `/shop`: search params schema, filters, sort, search, grid, empty state
- [x] 1.7 `/p/$slug`: size buttons, notes, meters, chips, dupes, same tier row, sticky buy bar (phone), sold out + dupe states, 404
- [x] 1.8 Skeletons for shop and product (`pendingMs: 300`, `pendingMinMs: 500`); search dialog (`/` shortcut, no animation on keys); `/dupes` page

### Phase 2: Cart and auth (Thu evening)
- [x] 2.1 Zustand cart store with persist, `getCartLines` server function, reconciliation
- [x] 2.2 Cart drawer (Vaul: right on desk, bottom sheet on phone), header count, free delivery progress, NumberFlow subtotal, empty + changed states
- [x] 2.3 (consent screen + web client made by the user in the console; Supabase provider and URLs pushed with `supabase config push`, see supabase/config.toml) Google Cloud OAuth client + Supabase Google provider + URL config (docs/SETUP.md §4 to §5)
- [x] 2.4 Supabase server client, `/sign-in`, `/auth/callback`, profile upsert, owner from `ADMIN_EMAILS`
- [x] 2.5 Root `beforeLoad` user, `_authed` and `_admin` layouts, avatar menu, sign out
- [~] 2.6 (Google sign in works live with geeznut0@gmail.com as customer; owner promotion for ADMIN_EMAILS not yet verified: sign in with emmanuelxs101@gmail.com; test with a non-test-user Gmail confirms the app is In production) **Publish Google app to production**; test sign in with a Gmail that isn't yours on the live URL

### Phase 3: Checkout and orders (Fri morning)
- [x] 3.1 `lib/money.ts`, `lib/config.ts`, `lib/order-ref.ts`, phone schema + unit tests
- [x] 3.2 Checkout page: form, zones, live totals, summary, pay on delivery
- [x] 3.3 `placeOrder` server function with transaction, idempotency, stock errors
- [x] 3.4 Receipt page `/account/orders/$ref` (with `?placed=1` state)
- [x] 3.5 Order history `/account/orders`
- [x] 3.6 Integration tests: race, rollback, idempotency, cancel restock

### Phase 4: Email and admin (Fri afternoon)
- [x] 4.1 (built and tested with mocks; real sending needs MAILGUN_* / SMTP_* in .env and Netlify) React Email template, `sendOrderEmail` (Mailgun → SMTP), provider recorded on order
- [ ] 4.2 (deferred by user: emails later) Email preview iframe on receipt page
- [ ] 4.3 (deferred by user: no domain) Switch Mailgun to `mg.scentpocket.shop` if verified
- [x] 4.4 Admin layout + orders list + order detail (status actions, cancel restock, resend email)
- [ ] 4.5 Admin products list + form with variants + image upload
- [ ] 4.6 Admin team page (owner only)

### Phase 5: Polish and submit (Fri evening)
- [ ] 5.1 Loading skeletons, error and empty states, 404
- [ ] 5.2 SEO: route `head()`, Product + Breadcrumb JSON-LD, sitemap.xml, robots.txt, noindex private routes, OG image, favicons
- [ ] 5.2b PWA: manifest + icons + theme color (minimum); service worker + offline page + install sheet if time allows
- [ ] 5.3 Review skills pass: `review-animations`, `web-design-guidelines`, `fixing-accessibility`, `web-quality-audit`; Lighthouse (home ≥ 90 desktop); real phone test over LAN
- [ ] 5.4 Full manual click through on live URL with a fresh Gmail (sign in → checkout → email → history → admin)
- [ ] 5.5 README (features, stack, setup, env, test notes, Mailgun note), screenshots
- [ ] 5.6 Demo video
- [ ] 5.7 Submit (format TBD)

### Stretch (only after 5.7, or if far ahead)
- [ ] S1 Paystack test mode
- [ ] S2 Browse by persona
- [ ] S3 Status change emails
- [ ] S4 Admin stats
- [ ] S5 Admin invites for users who haven't signed in

**Cut order if behind:** Phase 4.5 and 4.6 → dupes strip and scent family filter → admin entirely. Never cut checkout, email, auth or order history.

---

## Parked / open
* HNG submission format and rubric: not posted yet.
* Show authorized email list to graders? Decide after the domain (leaning no).
* Choco Musk price is an estimate (seeded at ₦3,000); it also has NO image yet (not stocked by the reference store). Needs a source image or a placeholder.
* Seed images are 500x500 (source originals); fine for cards, soft on a large product page. Look for larger sources if time allows.

## Progress log
Newest first. One line per finished step: date, step, note.

- 2026-10-01 · 4.4 · Admin: `_admin` layout with dark sidebar (`AdminShell`; Team link for owner only; storefront header/footer/tab bar hidden under /admin), `/admin` redirects to orders, `/admin/orders` (stat cards, status tabs with counts, search by ref or email in URL params, empty state), `/admin/orders/$ref` (timeline, items table, customer/delivery/email status, next-step button, cancel with confirm dialog, resend email). Server: `listAdminOrders`, `getAdminOrder`, `setOrderStatus`, `resendOrderEmail`, all `requireAdmin()` first; `transitionOrder` (row lock, legal moves only, stamps confirmed/shipped/delivered; cancel goes through `cancelOrder` and restocks). 17 integration tests pass (4 new for transitions). Verified in a browser with a throwaway owner session: list, filter, search, confirm, cancel + stock restored in the DB. Fixed: Drizzle dropped the table qualifier in a correlated subquery (items column showed 0). Test users and orders deleted, stock restored. `/admin/products` and `/admin/team` are stubs until 4.5 and 4.6
- 2026-10-01 · 4.1 · `features/email`: React Email `OrderConfirmation` (design Email board, absolute links, thumbnails as 128px JPEGs via the Netlify image CDN, plain text version), `renderOrderEmail`, `createMailgunProvider` (HTTP API, basic auth, 8 s timeout, non 2xx throws), `createSmtpProvider` (Gmail 465 + app password via Nodemailer), `deliverEmail` (ordered providers, first success wins, collects every failure, truncates to 500 chars, never throws), `sendOrderEmail(orderId)` (records `email_provider` + `email_sent_at` or `email_error` on the order; never throws). `placeOrder` awaits it after the commit and skips it for idempotent repeats. Shared `buildOrderDetail` now serves receipt and email. Tests: 65 pass. NOT yet sent for real: `MAILGUN_*` and `SMTP_*` are empty in .env
- 2026-10-01 · 2.3 · Supabase Auth configured from the CLI: `supabase init` + `link` + `config push` (auth only; storage prompt declined). Site URL `https://scentpocket.netlify.app`, redirect URLs (localhost:3000, netlify.app, deploy previews), Google provider enabled with `env(GOOGLE_CLIENT_ID/SECRET)`. config.toml was aligned to the live values first (email confirmations, OTP length, MFA, storage analytics) so only intended settings changed. Verified: `/auth/v1/settings` shows google true, `/authorize` 302s to Google with the right client id and callback, Google returns its sign in page (no redirect_uri_mismatch). Remaining: 2.6 real sign in by the user, and confirm the Google app is In production
- 2026-10-01 · 3.2, 3.4, 3.5 · `/checkout` (`_authed`; slim header, no footer; TanStack Form + shared Zod schema, error summary with anchors and focus, state and zone kept consistent, zone cards, live totals from server data, sticky phone Place order bar, stock conflict updates the cart and explains, idempotency key per attempt), `/account/orders/$ref` (receipt, `?placed=1` thank-you header, timeline, items, delivery/payment cards, owner or admin only else 404), `/account/orders` (tabs, rows, empty, skeleton). Verified end to end in a browser with a throwaway Supabase test user (real session cookie): validation, stock conflict, real order (₦87,000 with ₦3,000 fee, phone +234…, stock decremented), receipt, history, 404 for unknown ref, and a SECOND user got 404 for the first user's order. All test users and orders deleted afterwards, stock restored. Bugs found and fixed: empty cart redirect fired during hydration (new `useHydrated`), and again when the cart was cleared after success. Added dep @tanstack/react-form. Receipt copy says "we email it" until 4.1 lands. Email preview iframe is 4.2
- 2026-10-01 · 3.3, 3.6 · `createOrder(db, user, input)` (`features/checkout/server/create-order.ts`): merges duplicate lines, conditional `UPDATE stock = stock - qty WHERE stock >= qty` per line in sorted order, `StockError` rolls everything back, totals from DB prices + config, snapshots on order and items, ref retry via ON CONFLICT DO NOTHING, idempotency key + 10 s identical-cart window (ignores cancelled orders). `placeOrder` server fn wraps it (`requireUser`, Zod, typed stock result; email hook comes in 4.1). `cancelOrder` (restock in one transaction, only placed/confirmed, row lock), `features/orders/status.ts` transition map (tested). 13 integration tests (`npm run test:int`, real DB, own fixture rows, cleanup verified): happy path, free delivery, race on the last bottle, 4 buyers on separate connections for 2 bottles, rollback, unknown variant, idempotency, concurrent same-key double submit, merge, DB price wins, cancel restock, double cancel, shipped not cancellable. DB client now `max: 1` per TRD §8. Found and fixed while testing: the duplicate window used to match cancelled orders
- 2026-10-01 · 3.1 · `lib/config.ts` (zones, fees, ETAs, threshold, 37 states, duplicate window), `lib/money.ts` (`deliveryFeeKobo`, `orderTotals`, free at exactly ₦300,000), `lib/order-ref.ts` (`SP-` + 6 chars, no 0/O/1/I/L, crypto), `features/checkout/schemas.ts` (Nigerian phone normalised to +234XXXXXXXXXX, delivery + placeOrder Zod schemas). Tests: 48 pass
- 2026-10-01 · 2.4, 2.5 · Auth code: `features/auth` (`@supabase/ssr` server client that passes cookie options through, `readSessionUser` via `getUser()` + profiles role, `requireUser`/`requireAdmin`, `startGoogleSignIn`/`signOut`/`getSessionUser` server fns), `/auth/callback` server route (exchange code, upsert profile, owner from ADMIN_EMAILS, `safeNext` open-redirect guard, tested), `/sign-in` (design, loading state, error alert, redirects if already signed in), root `beforeLoad` puts `user` in context, `_authed` and `_admin` layouts, avatar `AccountMenu` (My orders, Admin for admins, Sign out), stubs `/account/orders` and `/admin`. Verified without Google: guards 307 to `/sign-in?next=`, callback without a valid code goes to `/sign-in?error=auth`, the button reaches Supabase `/auth/v1/authorize` with PKCE + callback redirect. NOT verified: a real sign in (needs 2.3). Added dep @radix-ui/react-dropdown-menu. Tests: 26 pass
- 2026-10-01 · 2.3 (partly) · gcloud project `scentpocket-hng` (number 835505533302) created. gcloud cannot create a web OAuth client or the consent screen; Supabase token on disk is read only (403 on auth config)
- 2026-10-01 · 2.1, 2.2 · Cart: `getCartLines` server fn (Zod uuid array, max 50; absent = gone or inactive), pure `reconcileCart` + `cartSubtotalKobo` (tested), `CartSync` fixes the persisted cart when the server disagrees (drops sold out, clamps to stock and 10) and says why via toast + a notice in the drawer. `CartDrawer` (Vaul: right on desktop, bottom sheet on phone) with lines, steppers, remove, free delivery progress, NumberFlow subtotal, empty and loading states; header `CartButton` with count; Add to cart now opens the drawer. Checked at 1440 and 390. Added dep @number-flow/react. Drawer's Checkout button links to /sign-in until /checkout exists (3.2). Tests: 23 pass
- 2026-10-01 · 1.8 · Search dialog (`features/search`: Radix Dialog, `/` opens instantly with no animation, arrow keys + Enter + Esc, scents and notes with highlight, popular when empty, Enter with no match browses `/shop?q=`), header buttons open it, search now also matches notes (card `allNotes`). `/dupes` page with all 3 pairs (`DupeCard` shared with home, `getDupePairs`). Fixed missing `--color-info` and `--color-overlay` tokens (drawer overlay and inspired-by alert were unstyled). Skeletons for shop/product were done in 1.6/1.7. Added dep @radix-ui/react-dialog. Tests: 18 pass
- 2026-10-01 · 1.7 · `/p/$slug`: `getProduct` server fn (Zod slug, 404 via notFound for unknown or inactive), gallery, size radiogroup (sold out dashed + struck, per-ml in whole naira), stepper capped by stock and 10, Add to cart wired to a first Zustand cart store (`features/cart/store.ts`, persisted, ids + qty only; drawer, server lookup and reconciliation come in 2.1/2.2), toast, notes pyramid, meters, chips, inspired-by alert, dupe callout, sold-out alert with dupe CTA, More {tier} row, phone sticky buy bar (tab bar hidden), skeleton. `lib/config.ts` has the free delivery threshold. Product has no `<link>` JSON-LD yet (5.2). Only one photo per product so thumbs render only when there are 2+. Tests: 15 pass. Added dep zustand
- 2026-10-01 · 1.6 · `/shop`: `getShopProducts` server fn returns all 16 cards; `filter.ts` (pure, unit tested) does tier/gender/family/occasion/q/sort; all state in Zod-validated URL params (invalid values fall back, 307 to a clean URL). Desktop sidebar, phone tier scroller + Vaul bottom sheet (`components/ui/drawer.tsx`, reused by the cart in 2.2), tier banner, empty state with Clear filters + suggestions, skeleton as `pendingComponent` (`.sk` shimmer in app.css). Added dep `vaul`. Single select per filter (tier is one at a time). Tests: 12 pass
- 2026-10-01 · 1.5 · Home from the seeded catalog: `getHomeData` server fn (`features/catalog/server`), TanStack Query + SSR integration in router context, `lib/money.ts` formatKobo (+ tests), shared `ProductCard`/`TierChip`/`tiers.ts`, home sections in `features/home/components` (hero price ladder, tier cards, dupes strip, Lagos is wearing, trust strip). Photos use mix-blend-multiply on tier tints so white backgrounds disappear. No entrance stagger on SSR paint (rule 8). Hero LCP image has fetchpriority high but no `<link rel=preload>` yet (add in 5.2). `/p/$slug` is a stub until 1.7. Added deps @tanstack/react-query and @tanstack/react-router-ssr-query
- 2026-10-01 · 1.4 · `components/layout/*` (Logo, DemoBanner, SiteHeader, TabBar, SiteFooter, RouteProgress, Toaster via Sonner, NotFound, ErrorPage, AppShell), router defaults (pendingMs 300, pendingMinMs 500, error + 404), `features/catalog/schemas.ts` shop search schema, `lib/utils.ts` cn(), stub routes shop/dupes/sign-in. Checked at 390 and 1440 against the export. Dev server now skips the Netlify plugin (it crashes without Deno). shadcn init NOT run yet (it would rewrite app.css tokens); run `npx shadcn add` by hand when the drawer is needed (2.2)
- 2026-10-01 · 1.3 · Netlify Image CDN works on the live deploy: `/.netlify/images?url=<supabase public url>&w=200&fm=webp` returns 200 image/webp, cache-control max-age=31536000. No fallback needed
- 2026-10-01 · 1.2 · `src/db/seed-data.ts` (16 products, 23 variants, 3 dupe links) + `seed.ts` (`npm run db:seed`, idempotent by slug/sku, stock only set on insert, images from thescentsstore.com product JSON to WebP in the bucket, 15 of 16 have one). Storage rejects the new sb_secret key, so `SUPABASE_SECRET_KEY` is now the legacy service_role JWT (local + Netlify). Anon REST read of products returns []. Added dev dep `tsx` (runs the seed). Public object cache-control verified max-age=31536000
- 2026-10-01 · 1.1 · `features/images/{process.ts,url.ts,Image.tsx}`: sharp to WebP (1600 max, q80) + 16px blur; `<Image>` via unpic netlify CDN (raw img in dev), blur bg, fade in, priority/eager props. `netlify.toml` remote_images for the Supabase bucket. Vitest added (`npm test`), 3 unit tests pass
- 2026-10-01 · 0.10, 0.11 · Skills installed to `.claude/skills` (react-best-practices and composition-patterns not found by that name; global vercel-* versions cover them; `@tanstack/intent install` needs an interactive terminal, run it by hand). Tokens ported to `src/styles/app.css`, Fontsource fonts, clsx, cva, lucide-react added, viewport-fit + theme-color in `__root.tsx`. Prettier run over src
- 2026-10-01 · 0.9 · Skipped by user (no domain yet)
- 2026-10-01 · 0.7, 0.8 · Drizzle schema (`src/db/schema.ts`, 11 enums, 6 tables, RLS on all, no policies), `src/db/client.ts` (lazy, `prepare:false`), migration `drizzle/0000` applied. Anon key: select returns nothing, insert into orders rejected (42501). Re-check with data after seeding. Scripts `db:generate|migrate|studio` load `.env` via `node --env-file`
- 2026-10-01 · 0.6 · Netlify env vars set (incl. SITE_URL); step complete
- 2026-10-01 · 0.6 (partly) · Supabase project created via CLI, `.env` written (gitignored), public bucket `products` (8 MB, webp/png/jpeg). Pooler host is `aws-0-eu-west-2` (aws-1 fails). Netlify env vars NOT set: write was blocked, user to run `netlify env:import .env` then set `SITE_URL=https://scentpocket.netlify.app`. Also installed postgres, drizzle-orm, drizzle-kit, @supabase/ssr, @supabase/supabase-js
- 2026-10-01 · 0.5 · `/privacy` and `/terms` live (TSX copies of docs/legal in `features/legal`, brackets filled: operator Emmanuel Nwaohiri, contact emmanuelxs101@gmail.com, dated 1 Oct 2026). Unstyled until 0.11
- 2026-10-01 · 0.4 · Netlify site `scentpocket` created, first prod deploy green via CLI
- 2026-10-01 · 0.3 · Git repo initialised, public GitHub repo `Emmanuel-Xs/scentpocket`, first push
- 2026-10-01 · 0.2 · `src/lib/env.ts` (lazy Zod `getPublicEnv` / `getServerEnv`, browser guard), `vite-env.d.ts`; `.env.example` already in repo. Needs a real `.env` copy once Supabase exists (0.6)
- 2026-10-01 · 0.1 · TanStack Start scaffold (Netlify adapter, ESLint, Tailwind v4) via npm, not pnpm (D43); typecheck, lint, build pass. shadcn and Prettier config still to add with 0.11
- 2026-10-01 · Design done · Every screen and state on the canvas; reference.css, tokens.css, SCREENS, MOTION-AND-LOADING, SEO-PWA-MOBILE, SKILLS added
- 2026-10-01 · Planning done · Docs written (PRD, FRD, TRD, design, catalog, decisions, setup, legal drafts)
