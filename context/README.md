# Scentpocket: Context and progress tracker

**This file is the single source of truth for where the project is.** Humans and AI agents read it first and update it after every step. See [AGENTS.md](../AGENTS.md) for the rules.

| | |
|---|---|
| Deadline | **Fri 2 Oct 2026, 11:59 PM WAT** (target submit: 10:00 PM) |
| Current phase | **Phase 1: Catalog** → **Phase 1** (next: 1.2; 0.9 skipped) |
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
- [ ] 1.2 `seed-data.ts` from [docs/CATALOG.md](../docs/CATALOG.md); `pnpm db:seed` uploads images, idempotent
- [ ] 1.3 Netlify Image CDN check on the live deploy (fallback decided if it fails)
- [ ] 1.4 Layout shell: demo banner, sticky header, footer, phone tab bar (safe areas), route progress bar, Sonner toaster, error + 404 components
- [ ] 1.5 Home: hero (preloaded), tier cards, dupes strip, trust strip
- [ ] 1.6 `/shop`: search params schema, filters, sort, search, grid, empty state
- [ ] 1.7 `/p/$slug`: size buttons, notes, meters, chips, dupes, same tier row, sticky buy bar (phone), sold out + dupe states, 404
- [ ] 1.8 Skeletons for shop and product (`pendingMs: 300`, `pendingMinMs: 500`); search dialog (`/` shortcut, no animation on keys); `/dupes` page

### Phase 2: Cart and auth (Thu evening)
- [ ] 2.1 Zustand cart store with persist, `getCartLines` server function, reconciliation
- [ ] 2.2 Cart drawer (Vaul: right on desk, bottom sheet on phone), header count, free delivery progress, NumberFlow subtotal, empty + changed states
- [ ] 2.3 Google Cloud OAuth client + Supabase Google provider + URL config (docs/SETUP.md §4 to §5)
- [ ] 2.4 Supabase server client, `/sign-in`, `/auth/callback`, profile upsert, owner from `ADMIN_EMAILS`
- [ ] 2.5 Root `beforeLoad` user, `_authed` and `_admin` layouts, avatar menu, sign out
- [ ] 2.6 **Publish Google app to production**; test sign in with a Gmail that isn't yours on the live URL

### Phase 3: Checkout and orders (Fri morning)
- [ ] 3.1 `lib/money.ts`, `lib/config.ts`, `lib/order-ref.ts`, phone schema + unit tests
- [ ] 3.2 Checkout page: form, zones, live totals, summary, pay on delivery
- [ ] 3.3 `placeOrder` server function with transaction, idempotency, stock errors
- [ ] 3.4 Receipt page `/account/orders/$ref` (with `?placed=1` state)
- [ ] 3.5 Order history `/account/orders`
- [ ] 3.6 Integration tests: race, rollback, idempotency, cancel restock

### Phase 4: Email and admin (Fri afternoon)
- [ ] 4.1 React Email template, `sendOrderEmail` (Mailgun → SMTP), provider recorded on order
- [ ] 4.2 Email preview iframe on receipt page
- [ ] 4.3 Switch Mailgun to `mg.scentpocket.shop` if verified
- [ ] 4.4 Admin layout + orders list + order detail (status actions, cancel restock, resend email)
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
* Choco Musk price is an estimate; confirm before seeding.

## Progress log
Newest first. One line per finished step: date, step, note.

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
