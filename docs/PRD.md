# Scentpocket: Product Requirements Document (PRD)

| | |
|---|---|
| Product | Scentpocket, a demo fragrance shop |
| Owner | Emmanuel Nwaohiri (Emmanuel-Xs) |
| Context | HNG Internship 15, Lesson 2, individual task |
| Deadline | Friday 2 October 2026, 11:59 PM WAT |
| Status | Planned, not started |
| Related | [FRD](./FRD.md) · [TRD](./TRD.md) · [Design](./DESIGN.md) · [Catalog](./CATALOG.md) · [Decisions](./DECISIONS.md) |

## 1. The brief

HNG15 Lesson 2, Task 1:

* Build a website for a shop.
* Add a checkout page.
* Persist everything in a database using Supabase or Neon.
* Send confirmation emails using Mailgun.
* Do Google auth using Google Cloud Console.

Also stated on the call: customers must be able to see their past orders.

## 2. Product summary

**Scentpocket** is a Lagos fragrance shop with one idea: **a scent for every pocket.** The same store sells a ₦3,500 body spray and a ₦1,000,000 Baccarat Rouge 540, organised into four budget tiers, and links cheap dupes to the expensive scents they resemble. It is a demo store: nothing is for sale, and a banner says so. Payment is pay on delivery, so checkout is complete and honest without a payment gateway.

## 3. Goals

1. Meet every line of the brief, visibly, so a grader can click through each one.
2. Feel like a real Lagos shop: real perfumes, real prices, real sold out sizes, delivery zones, naira.
3. Make the "every pocket" story the core of the experience (tiers and dupes), not a tagline.
4. Ship by Friday 10 PM WAT with a buffer.

## 4. Non goals

* Taking real money (Paystack is a stretch goal, test mode only).
* Reviews, ratings, scent quiz, samples, gift wrap, wishlists.
* Dark mode.
* Guest checkout.
* Saved addresses, address autocomplete.
* Multi currency, multi language.

## 5. Users

| User | Who | What they need |
|---|---|---|
| **Pocket shopper** | Student, corper, trader. Budget under ₦15k | Find something good that's affordable, see what it smells like, order fast |
| **Rising professional** | Young 9 to 5er. ₦25k to ₦70k | Arabian favourites, long lasting, "smells expensive" |
| **Established buyer** | Manager, frequent owambe guest. ₦75k to ₦400k | Designer names, the right size, free delivery |
| **Luxury buyer / gifter** | Executive, gifting. ₦350k and up | Niche houses, trust, delivery to the Island |
| **Admin (owner)** | Emmanuel | Manage products, stock, images, orders, other admins |
| **Grader** | HNG mentor | Verify each requirement quickly with their own Google account |

## 6. Core user journeys

1. **Browse by pocket**: Home → pick a tier card → filtered listing → product page.
2. **Find a dupe**: Product page of an expensive scent → "Same vibe, smaller pocket" → cheaper product.
3. **Buy**: Pick a size → add to cart → cart drawer shows the free delivery progress → Checkout → Google sign in → delivery details → Place order → confirmation with email preview → email arrives.
4. **Track**: Avatar menu → My orders → order receipt with status.
5. **Admin**: Sign in as owner → Admin → update stock, add a product with an image, move an order to shipped, cancel an order (stock returns), promote a teammate to admin.

## 7. Feature scope (MVP)

| # | Feature | Priority | Brief line |
|---|---|---|---|
| F1 | Catalog: tiers, filters (gender, occasion, scent family), sort, search | Must | Shop website |
| F2 | Product page: size buttons, notes pyramid, longevity/projection, dupes, same tier suggestions | Must | Shop website |
| F3 | Cart drawer (local), free delivery progress | Must | Shop website |
| F4 | Google sign in (Supabase Auth + Google Cloud OAuth client) | Must | Google auth |
| F5 | Checkout: delivery zones, pay on delivery, stock safe transaction | Must | Checkout, persistence |
| F6 | Orders: confirmation/receipt page, order history, statuses | Must | Persistence, past orders |
| F7 | Confirmation email via Mailgun with SMTP fallback, preview on receipt | Must | Mailgun |
| F8 | Image pipeline: WebP, blur placeholders, CDN, priority loading | Should | Quality |
| F9 | Admin: products + variants + images, orders, team | Should | Persistence (visible) |
| F10 | Legal pages: privacy (NDPA 2023), terms with returns | Must | Needed for Google OAuth publishing |

Cut order if time runs short: F9 first, then dupes and scent family filters inside F1/F2. Never cut F4, F5, F6, F7.

## 8. Stretch goals

* Paystack test mode as a second payment method (webhook marks paid).
* Browse by persona ("For the corper", "For the boardroom").
* Status change emails (shipped, delivered).
* Admin stats (revenue, orders per day, tier mix).
* Admin invites for people who haven't signed in yet.
* Custom domain for Supabase so the Google popup shows Scentpocket.

## 9. Success criteria

* A grader with any Gmail can sign in, check out and see the order in history.
* Every order and its items are in the database with snapshotted prices and fees.
* A confirmation email is sent through Mailgun when allowed, otherwise through the SMTP fallback, and the provider used is recorded on the order.
* Two simultaneous orders for the last bottle: exactly one succeeds (covered by an integration test).
* Lighthouse performance on the home page is 90 or more on desktop.
* Live URL, public repo, README and a short demo video by Friday 10 PM.

## 10. Assumptions and risks

| Risk | Mitigation |
|---|---|
| Mailgun sandbox only delivers to 5 authorized recipients | SMTP fallback; buy `scentpocket.com.ng` and verify `mg.scentpocket.com.ng` on Thursday |
| Google OAuth in Testing mode blocks graders | Publish the app to production right after setup (basic scopes need no review) |
| Supabase SSR auth in TanStack Start is new | Start from TanStack's official `start-supabase-basic` example |
| Netlify Image CDN not listed for TanStack Start | Verify on first deploy; fallback is serving WebP straight from Supabase |
| Serverless connection exhaustion | Transaction pooler, `prepare: false`, `max: 1` |
| Running out of time | Strict phase order in [context/README.md](../context/README.md); cut order above |

## 11. Open questions

* HNG submission format and grading rubric (not posted yet).
* Domain purchase (planned today, Thursday).
* Whether to show authorized email addresses to graders if the domain is not verified (leaning no).
