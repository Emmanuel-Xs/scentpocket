# Scentpocket: Decision log

Decisions made in the planning session on Thursday 1 October 2026. Each one says what was chosen, what was rejected, and why. Add new entries at the bottom; never edit an old one, supersede it.

| # | Decision | Chosen | Rejected | Why |
|---|---|---|---|---|
| D1 | Framework | TanStack Start | Next.js, Vite SPA + Edge Functions | Main stack; server functions keep Mailgun keys server side; one deploy target |
| D2 | Database and auth (first pass) | Neon + Better Auth | | Superseded by D10 |
| D3 | Payments | Mock first (pay on delivery), Paystack test mode as stretch | Paystack from day one | Brief asks for a checkout page, not payments; a gateway can eat half a day |
| D4 | Sign in gate | Browse freely, sign in required at checkout | Sign in for everything, guest checkout | Orders tie to a real user and email; shop stays open to graders |
| D5 | Cart storage | Zustand + localStorage | Cart table in DB | "Persist everything" is met by products and orders |
| D6 | Shop concept | Fragrances for every budget, "Scentpocket" | Generic shop | Clear story; real price spread from ₦3,500 to ₦1,000,000 |
| D7 | Catalog structure | Budget tiers as main category; gender, occasion, scent family as filters; personas later | Occasion or persona first | Tiers are the story |
| D8 | Product photos | Real bottle shots, stored in our own storage, demo banner | Generic stock photos | Demo should look real; hotlinks break |
| D9 | Admin | Lean admin, built last | Full admin with stats, no admin | Not in the brief; makes persistence visible |
| D10 | Database, auth, storage | Supabase for DB, Auth (Google) and Storage | Neon + Better Auth + UploadThing; Supabase + Better Auth | One provider; official TanStack Start Supabase example lowers SSR auth risk |
| D11 | Data access | Drizzle on Supabase Postgres for app tables; supabase-js only for auth and storage | supabase-js + RPC | Checkout needs a transaction; typed schema and migrations |
| D12 | RLS | Enabled on all tables, no policies | RLS off | Tables in `public` are exposed via the REST API with the public key |
| D13 | Variants | Yes, 1 to 3 per product, price only on variant, cart keyed by variantId | One size per product | Feels real; guardrails limit cost |
| D14 | Stock | Tracked per variant, atomic conditional decrement in a transaction | No stock | Sold out states, real admin purpose |
| D15 | Checkout fields and delivery | Zones (Mainland ₦3,000, Island ₦4,500, Outside Lagos ₦7,000), free over ₦300,000, totals snapshotted | Flat fee | Lagos realism; ties into tiers |
| D16 | Email | Mailgun first, Gmail SMTP fallback, provider recorded; domain `scentpocket.shop` to verify later | Sandbox only | Sandbox only delivers to 5 authorized recipients |
| D17 | Receipt preview | Same React Email template rendered on the receipt page | | Graders see the email even if it never arrives |
| D18 | Order history | `/account/orders` + receipt pages | | Required (stated on the call) |
| D19 | Hosting | Netlify | Vercel, Cloudflare | Official TanStack Start partner |
| D20 | Brand | Scentpocket, `scentpocket.shop` (to buy, auto renew off) | Every Pocket, Oud & Okada, Lagos Scent Co. | Says the idea in one word |
| D21 | Visual direction | Warm editorial, tier accent colours, light only | Dark luxury, bold Lagos pop | Works for ₦3k and ₦1M products alike |
| D22 | Product page | Notes pyramid, chips, longevity/projection, same tier suggestions; no reviews | Reviews | Reviews are a whole feature and not graded |
| D23 | Scent family and dupes | Both: `family` enum filter, `inspired_by_id` self link | | Dupes make "every pocket" real |
| D24 | Payment framing and statuses | Pay on delivery; `placed → confirmed → shipped → delivered`, `cancelled` restocks; refs `SP-XXXXXX` | Fake pay button | Honest mock; proves stock logic |
| D25 | Legal | `/privacy` (NDPA 2023) and `/terms` with returns section; live before OAuth publish | Standalone refunds policy | Needed for Google consent screen; returns section is cheap realism |
| D26 | Google OAuth status | Publish to production right away (basic scopes, no review) | Stay in Testing | Testing mode blocks anyone not on the test user list |
| D27 | Testing | Vitest unit tests on money logic + one checkout integration test (race, rollback, restock) | Full suite, Playwright | Time; tests where bugs cost money |
| D28 | Admins | `profiles.role` (`customer`, `admin`, `owner`); owner from `ADMIN_EMAILS`; Team page promotes existing users | Separate admin table | A role column already supports many admins; no granular permissions needed |
| D29 | Admin checks | Layout guard and a check inside every admin server function | Layout guard only | Server functions are callable directly |
| D30 | Images | sharp → WebP + 16px base64 blur on upload; Netlify Image CDN + `@unpic/react`; eager/priority for hero and above the fold; width/height always | Supabase transformations (Pro only), BlurHash/ThumbHash (need JS) | Fast, no layout shift, free |
| D31 | Build order | Setup → catalog → cart + auth → checkout + orders → email + admin → polish | | Everything graded works by Friday noon |
| D32 | Submission | Parked until HNG posts the format | | Default: live URL, repo, README, demo video |
| D33 | Logo | Pocket Bottle mark (pocket shaped bottle, dashed stitch, flat standing base) + lowercase serif wordmark | Stitched Label, Wisp, Atomizer S, Tier Bottles, Coin Cap | Says perfume and pocket at once; sharp at 16px |
| D34 | Fonts | Instrument Serif + Instrument Sans (Google Fonts, OFL, self hosted via Fontsource) | Cormorant + Manrope, Bodoni Moda + Jost, Italiana + Tenor Sans, Fontshare fonts | Premium without snobbery; narrow serif fits long names; one family |
| D35 | Palette adjustments | Pocket `#B4532F`, Arabian Gems `#9A6510` | Draft `#C2603D`, `#C98A1B` | White text on the drafts failed WCAG AA |
| D36 | Icons | Lucide, stroke 1.5 | Phosphor, Tabler | shadcn default, matches the thin serif and stitched logo |
| D37 | Loading strategy | Nothing on SSR and fast navs; top bar 300ms to 1s; skeletons on data heavy routes (pendingMs 300, pendingMinMs 500); button spinners for actions; optimistic cart; splash only on PWA standalone cold start | Spinners everywhere, splash on every load | NN/g thresholds; avoids flashing loaders |
| D38 | Motion | Emil Kowalski curves and durations; press scale 0.97; stagger only on client inserted content; reduced motion keeps fades only | Default CSS easings | Feels fast and native |
| D39 | Libraries for feel | Sonner, Vaul (shadcn Drawer), NumberFlow, motion only where CSS can't | Hand built toasts and drawers | Emil's pick-ui-library list |
| D40 | Phone navigation | Bottom tab bar (Home, Shop, Dupes, Account); hidden on product (sticky buy bar) and checkout (sticky Place order) | Hamburger menu | Native feel, thumb reach |
| D41 | SEO and PWA | Per route head, Product JSON-LD without ratings, sitemap + robots, noindex private pages; PWA manifest + offline page + install sheet in Phase 5 | Skipping | Polish that graders notice; cut to manifest only if late |
| D42 | Agent skills | emilkowalski/skills, vercel-labs/agent-skills, addyosmani/web-quality-skills, ibelick/ui-skills, supabase/agent-skills, anthropics frontend-design, TanStack Intent; project overrides win | No skills | Consistent quality from Claude Code |
| D43 | Package manager | npm (supersedes pnpm in TRD §1 and AGENTS.md) | pnpm | pnpm install kept failing (corrupt installs) on the dev machine; user asked for npm |
| D44 | Seed tooling | `tsx` as a dev dependency to run `src/db/seed.ts`; legacy service_role JWT as `SUPABASE_SECRET_KEY` | Node type stripping, new sb_secret key | Node cannot resolve the `#/` alias without a loader; Storage rejects sb_secret keys |
