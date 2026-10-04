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
| D16 | Email | Mailgun first, Gmail SMTP fallback, provider recorded; domain `scentpocket.com.ng` to verify later | Sandbox only | Sandbox only delivers to 5 authorized recipients |
| D17 | Receipt preview | Same React Email template rendered on the receipt page | | Graders see the email even if it never arrives |
| D18 | Order history | `/account/orders` + receipt pages | | Required (stated on the call) |
| D19 | Hosting | Netlify | Vercel, Cloudflare | Official TanStack Start partner |
| D20 | Brand | Scentpocket, `scentpocket.com.ng` (to buy, auto renew off) | Every Pocket, Oud & Okada, Lagos Scent Co. | Says the idea in one word |
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
| D45 | DB pool | postgres.js `max: 3` with idle_timeout 20, max_lifetime 300 (supersedes TRD §8 `max: 1`) | `max: 1` | Parallel queries pipelined on one pooled connection stalled intermittently behind Supavisor; reproduced outside the app |
| D46 | Domain | `scentpocket.com.ng` bought at Whogohost, DNS hosted on Netlify (nameservers dns1-4.p04.nsone.net), `www` redirects to the apex; Mailgun on `mg.scentpocket.com.ng` (supersedes the `.shop` plan in D16 and D20) | `scentpocket.shop`, registrar DNS | Netlify DNS gives automatic HTTPS and lets us add the Mailgun records from the CLI |
| D47 | OG image | One static brand OG image (1200x630) for every page; products use their own photo as `og:image` | Satori per product image | No time; the photo is already a good preview |
| D48 | Catalog | Al Rehab Choco Musk stays; its photo is taken from another retailer (Riwaya, 1500px) because the reference store does not stock it. The seed accepts a direct image URL | Drop the product | User chose to use third-party images for this one demo item |
| D49 | Server cart | New table `cart_items` (user_id, variant_id, quantity > 0, unique per user + variant, RLS on, no policies). Only ids and quantities are stored; price and stock are read live | Storing prices or a JSON blob on the profile | One cart for web and mobile; the same "never trust stored prices" rule as the local cart. Approved by the user (new table, no data migration) |
| D50 | Cart rules | The server clamps every quantity to `min(stock, 10)`, drops sold out or inactive variants, and reports what it changed (messages + per line `changed`). Merge adds quantities for the same variant, then caps at stock | Rejecting an over-stock request with an error | Same reconciliation as FR-3.3 on the web; a cart never blocks, it explains |
| D51 | Web cart source of truth | Signed out: Zustand + localStorage as before. Signed in: server cart is the truth and Zustand mirrors it. Zustand remembers `ownerId` (null = anonymous lines) so the one-time merge never runs on a mirror. Mutations are optimistic, persisted per variant with `setCartItem` (serialised, latest value wins), rolled back with a toast on error. Refetch on focus and every 3s while the drawer or /checkout is open. Sign out clears the local cart | Merge on every load, WebSockets / Realtime | Simple and predictable; polling is how mobile edits show up on the web without new infrastructure |
| D52 | REST API | `/api/v1/*` as TanStack Start server routes, JSON only, thin handlers over the same core functions the server functions use (no duplicated business logic). Documented in `docs/API.md` | Supabase PostgREST from the mobile app, a separate API service | The browser and the phone must never query tables directly (RLS stays on with no policies); one backend, one set of rules |
| D53 | Bearer auth | `Authorization: Bearer <supabase access token>`, verified with `supabase.auth.getUser(token)`, then mapped to our profile and role. `requireUser`/`requireAdmin`/`requireOwner` accept the cookie session or a bearer token; every protected route calls them itself | Custom API keys, trusting the JWT without a Supabase call | Same identity as the web, instant revocation, no new secrets |
| D54 | API errors | `{ "error": { "code", "message", "details"? } }` with 400 bad JSON, 401 unauthenticated, 404 not found, 409 stock conflict, 422 validation; unknown `/api/v1/*` returns a JSON 404 | HTML error pages, always 200 | Mobile clients can branch on `code` and status |
| D55 | Orders over REST | `POST /api/v1/orders` takes contact + zone only. Items come from the server cart, read as stored (no silent clamping), so a shortfall is a 409 and not a smaller order. Optional `Idempotency-Key` header; a repeat returns the first order (200) even though the cart is already cleared | Items in the body | The client can never send prices or items the server did not already hold; retries on bad mobile networks are safe |
| D56 | Cart cleared on order | `createOrder` deletes the user's `cart_items` inside the checkout transaction | Clearing after the commit | A paid-for cart can never survive an order, and a failed order keeps the cart |
| D57 | Mobile auth redirects | `scentpocket://auth/callback` and `exp+scentpocket://**` added to Supabase additional redirect URLs (config.toml and the live project) | Reusing the web redirect, a universal link | Custom scheme for the production app, `exp+` for Expo Go / dev builds. Approved by the user |
| D58 | API images | Image objects are `{ src, width, height, blurDataUrl, alt }` where `src` is the absolute public Supabase WebP URL (up to 1600px), not the Netlify resizing URL | Netlify CDN URLs with a width | The CDN URL needs a width chosen per device; the mobile app can request its own size later if needed |
| D59 | No free delivery | Removed the ₦300,000 free delivery threshold and progress bar; delivery is always the flat zone fee. Supersedes the free delivery rule in earlier rows | Keeping the threshold | Requested by the user |
