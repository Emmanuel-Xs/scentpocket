# AGENTS.md

Rules for any AI agent (Claude Code, Codex, Cursor, etc.) working in this repo.

## Start of every session

1. Read [`context/README.md`](./context/README.md): current phase, next unchecked step, parked items.
2. Read the feature file in `context/features/` for the step you're on.
3. Check the relevant section of [`docs/FRD.md`](./docs/FRD.md) (what) and [`docs/TRD.md`](./docs/TRD.md) (how).
4. Work on **one step at a time**, in order, unless the human says otherwise.

## End of every step

1. Tick the step in `context/README.md`, add a progress log line, update "Current phase" and "Last updated".
2. Update the feature file: status, files touched, progress line, any gotcha found.
3. If you made a decision not already in [`docs/DECISIONS.md`](./docs/DECISIONS.md), add a new row. Never rewrite old rows; supersede them.
4. Run `npm run typecheck && npm run lint && npm test` before calling a step done.
5. Commit with the step ID: `feat(checkout): 3.3 placeOrder transaction`.

## Project in one paragraph

Scentpocket is a demo Lagos fragrance shop for HNG15 Lesson 2: "a scent for every pocket". Four budget tiers, real perfumes and prices, dupes linking cheap scents to expensive ones, Google sign in, checkout with delivery zones and pay on delivery, orders in Supabase Postgres, confirmation emails via Mailgun with a Gmail SMTP fallback, order history, and a lean admin. Deadline Friday 2 Oct 2026, 11:59 PM WAT.

## Stack (don't add to it without asking)

TanStack Start, Router, Query, Form · React + TypeScript (strict) · Tailwind v4 + shadcn/ui (Radix) + lucide-react (stroke 1.5) · Fontsource (Instrument Serif, Instrument Sans) · Zustand (cart only) · Zod · Supabase (Postgres, Auth, Storage) · Drizzle ORM + postgres.js · sharp · @unpic/react · React Email · Nodemailer · Sonner (toasts) · Vaul via shadcn Drawer (drawers, sheets) · NumberFlow (changing prices) · motion (only where CSS can't) · clsx + cva · Vitest · Netlify · npm.

## Design source of truth

* Screens: the **Scentpocket Design** canvas, indexed route by route in [`docs/design/SCREENS.md`](./docs/design/SCREENS.md), with a static HTML export of every screen in [`docs/design/screens/`](./docs/design/screens/index.html). Build every state listed there, not just the default, and compare your build to the export (Playwright screenshot at 390 and 1440).
* Styles: [`docs/design/reference.css`](./docs/design/reference.css) is the exact CSS behind the canvas (tokens, components, hover/focus/pressed/disabled, skeletons, motion). Port it to Tailwind using [`docs/design/tokens.css`](./docs/design/tokens.css) and `cva` variants. Don't invent new colours, radii, shadows or curves.
* Motion and loading rules: [`docs/design/MOTION-AND-LOADING.md`](./docs/design/MOTION-AND-LOADING.md).
* SEO, PWA, mobile baseline: [`docs/design/SEO-PWA-MOBILE.md`](./docs/design/SEO-PWA-MOBILE.md).

## Skills

Install and use the skills in [`docs/SKILLS.md`](./docs/SKILLS.md). Load the matching skill before the work it covers (for example `animate` before building the cart drawer, `seo` before writing route `head()`), and run the review skills before ticking a UI step. Project overrides listed there win over any skill.

## Hard rules

* **Money is integer kobo** everywhere. Format only at the edge (`lib/money.ts`).
* **Never trust the client** for prices, fees, totals, stock or roles. Recompute on the server.
* **Browser never queries app tables.** All data goes through server functions using Drizzle. supabase-js is for auth and storage only.
* **RLS stays enabled** on every table, with no policies. Never disable it.
* **Secrets never get a `VITE_` prefix.** The secret/service role key is server only.
* **Every protected server function checks auth itself** (`requireUser`, `requireAdmin`). Layout guards don't count as security.
* **Checkout writes happen in one transaction** with the conditional stock decrement from TRD §7.
* **Email never fails an order.** Send after commit, catch errors, store them on the order.
* Validate every server input with Zod. No `any`, no `@ts-ignore` without a comment explaining why.
* Search params validated with Zod in the route.
* Images go through `features/images` (processing) and the shared `<Image>` component (rendering). Always pass width and height.
* Every screen ships with its loading, empty and error states (see SCREENS.md). Every pressable has hover (mouse only), focus visible, pressed and disabled states.
* Mobile native baseline from SEO-PWA-MOBILE.md goes in before the first component.

## Code style

* Feature slices: `src/features/<domain>/{components,server,schemas.ts,...}`. Routes stay thin.
* Server functions named as verbs: `getProduct`, `placeOrder`, `cancelOrder`.
* No IIFEs in JSX. Extract a component or a variable.
* Prefer small components; colocate tests in `tests/` by type.
* UI copy: warm and short; no em dashes.
* Keep files under ~250 lines; split when they grow.

## Commands

| Command | Use |
|---|---|
| `npm run dev` | dev server, :3000 |
| `npm run typecheck` / `npm run lint` | before every commit |
| `npm test` / `npm run test:int` | unit / integration |
| `npm run db:generate` / `npm run db:migrate` | schema changes |
| `npm run db:seed` | catalog + images (idempotent) |
| `npm run db:studio` | inspect data |

## Ask the human before

* Adding a dependency not listed above.
* Changing the schema in a way that needs data migration.
* Changing anything in `docs/DECISIONS.md` scope (new features, cutting features).
* Touching production data or env vars.
* Anything in the "Stretch" list while Phase 5 isn't done.

## Where things are

| Need | Look in |
|---|---|
| What to build | `docs/PRD.md`, `docs/FRD.md` |
| How to build | `docs/TRD.md` |
| Look and UX rules | `docs/DESIGN.md`, `docs/design/` |
| Skills to load | `docs/SKILLS.md` |
| Seed data | `docs/CATALOG.md` |
| Why something is the way it is | `docs/DECISIONS.md` |
| External service setup | `docs/SETUP.md` |
| Legal page copy | `docs/legal/` |
| Where we are | `context/README.md` |
