# Scentpocket: Functional Requirements Document (FRD)

Each requirement has an ID used in commits, the [context tracker](../context/README.md) and tests. "AC" means acceptance criteria. Money is always stored and computed in **kobo** (integer), displayed as naira.

Related: [PRD](./PRD.md) · [TRD](./TRD.md) · [Design](./DESIGN.md)

---

## F1. Catalog

**FR-1.1 Home page**
* Hero with the line "A scent for every pocket", one primary CTA (Shop all) and a preloaded hero image.
* Four tier cards (Pocket, Arabian Gems, Designer, Niche), each with its accent colour, price band and product count; each links to `/shop?tier=<tier>`.
* A "Dupes" strip: up to 3 pairs showing expensive product and its cheaper match with both prices.
* Trust strip: "100% authentic", delivery times per zone, free delivery over ₦300,000.
* Persistent demo banner: "Demo store. Nothing here is for sale."
* AC: all tier cards link to the right filtered list; banner shows on every page.

**FR-1.2 Listing page `/shop`**
* Filters: tier, gender (Men, Women, Unisex), occasion (Office, Owambe, Date Night, Everyday), scent family (Fresh, Woody, Amber, Floral, Gourmand).
* Sort: Featured (default), Price low to high, Price high to low, Newest.
* Text search on name and brand.
* All filter, sort and search state lives in URL search params (validated with Zod), so links are shareable and back/forward works.
* Product card: image, brand, name, tier chip, "from ₦X" (lowest active variant price), "Sold out" badge if every variant has zero stock.
* Empty state with a "Clear filters" action.
* AC: refreshing the page keeps filters; an invalid search param falls back to defaults without crashing.

**FR-1.3 Inactive products** (`isActive = false`) never appear on public pages or in search.

## F2. Product page `/p/$slug`

**FR-2.1 Size picker**
* Variants shown as **buttons**, not a dropdown, ordered by size.
* Each button shows size and price per ml.
* Sold out variants stay visible, struck through and disabled.
* The first in stock variant is preselected. If all are sold out, the add button reads "Sold out" and is disabled.
* Price updates when the size changes.

**FR-2.2 Add to cart**
* Quantity stepper, min 1, max = variant stock (and max 10).
* Adding opens the cart drawer.

**FR-2.3 Scent information**
* Notes pyramid: top, heart, base.
* Scent family, gender and occasion chips.
* Longevity meter (Short, Moderate, Long, Very long) and projection meter (Soft, Moderate, Strong).
* Description written as "what it smells like and when to wear it".

**FR-2.4 Dupes**
* If this product has an `inspiredBy` product: "Inspired by <name>" with link.
* If other products are inspired by this one: "Same vibe, smaller pocket" listing them with prices.

**FR-2.5 Suggestions**: up to 4 other active products in the same tier.

**FR-2.6** Unknown or inactive slug renders the 404 page.

## F3. Cart

**FR-3.1** Cart stored in Zustand with `persist` (localStorage key `scentpocket-cart`). Items are `{ variantId, qty }` only. Display data (name, image, price, stock) is fetched from the server.

**FR-3.2 Cart drawer**: line items with image, name, size, unit price, qty stepper, remove; subtotal; free delivery progress bar ("₦X away from free delivery" or "You've unlocked free delivery"); Checkout button.

**FR-3.3 Reconciliation**: on load, drop items whose variant no longer exists or is inactive, and clamp qty to current stock, with a toast explaining what changed.

**FR-3.4** Header cart icon shows the total item count.

**FR-3.5** Cart is cleared only after an order is placed successfully.

## F4. Authentication

**FR-4.1** Sign in with Google only (Supabase Auth, Google provider, OAuth client created in Google Cloud Console).

**FR-4.2** Browsing and cart do not require sign in. `/checkout`, `/account/*` and `/admin/*` do. Visiting them signed out redirects to `/sign-in?next=<path>`, and after sign in the user lands back on `next`.

**FR-4.3** The sign in screen shows "By continuing you agree to our Terms and Privacy Policy" with links.

**FR-4.4** On every successful sign in, a `profiles` row is upserted with Google name, email and avatar. If the email is in `ADMIN_EMAILS`, role is set to `owner`.

**FR-4.5** Header shows the Google avatar with a menu: My orders, Admin (admins only), Sign out.

**FR-4.6** Sign out clears the session and returns to the home page. The cart is kept.

## F5. Checkout `/checkout`

**FR-5.1 Fields**: full name (prefilled from Google), email (from Google, read only), phone, address line, city, state, delivery zone. Validation with Zod on client and server. Phone accepts Nigerian formats (`080...`, `+234...`, `234...`), normalised to `+234XXXXXXXXXX`.

**FR-5.2 Delivery zones** (fees in config, not hardcoded in components):

| Zone | Fee |
|---|---|
| Lagos Mainland | ₦3,000 |
| Lagos Island | ₦4,500 |
| Outside Lagos | ₦7,000 |

Delivery is **free when the subtotal is ₦300,000 or more**. The fee and total update live when the zone changes.

**FR-5.3 Payment**: one option, "Pay on delivery (cash or transfer)". UI and schema allow a second method later.

**FR-5.4 Order summary** always visible (side column on desktop, collapsible on mobile).

**FR-5.5 Place order** (server function):
* Re-reads every variant from the database. Prices from the client are ignored.
* In one transaction: decrement stock for each line only if enough stock remains; create the order and its items; if any line fails, nothing is written.
* Order gets a ref like `SP-24F7K2` (6 chars, no ambiguous letters).
* Snapshots on the order: subtotal, delivery fee, total, zone, contact and address. Snapshots on each item: product name, variant label, unit price, line total, image path.
* On success: clear cart, send email (F7), redirect to `/account/orders/<ref>?placed=1`.
* On stock failure: show which items are short, update the cart to what's available, place nothing.
* AC: double clicking Place order creates one order (button disabled while pending; server rejects an identical request from the same user within 10 seconds).

**FR-5.6** An empty cart visiting `/checkout` is redirected to `/shop`.

## F6. Orders

**FR-6.1 Receipt page `/account/orders/$ref`**: status badge and timeline, items, totals, delivery details, payment method. With `?placed=1` it also shows a success header. Only the owner of the order (or an admin) can see it, others get 404.

**FR-6.2 Email preview**: the receipt page shows "This is the email we sent you" with the exact HTML of the confirmation email in a sandboxed iframe, plus where it was sent and which provider sent it (or that sending failed).

**FR-6.3 Order history `/account/orders`**: newest first; ref, date, item count, total, status badge; links to the receipt. Empty state links to the shop.

**FR-6.4 Statuses**: `placed → confirmed → shipped → delivered`, and `cancelled` from `placed` or `confirmed` only. Each transition stores a timestamp.

## F7. Confirmation email

**FR-7.1** Sent right after the order transaction commits. A failed email never fails or rolls back the order.

**FR-7.2** Provider order: Mailgun first. If Mailgun returns an error (for example, an unauthorized recipient on the sandbox), fall back to Gmail SMTP. Store `emailProvider`, `emailSentAt` or `emailError` on the order.

**FR-7.3** Content: logo, "Thanks, <first name>", order ref, items with size, qty and line totals, subtotal, delivery, total, delivery address and zone, pay on delivery note, link to the receipt page, demo disclaimer, contact link.

**FR-7.4** The same React Email template is used for sending and for the preview (FR-6.2).

**FR-7.5** Admin can resend the email from the order page.

## F8. Images

**FR-8.1** On upload (seed and admin): resize to max 1600px wide, convert to WebP (quality 80), generate a 16px WebP blur placeholder as a base64 data URL, store width and height.

**FR-8.2** Images are served through Netlify Image CDN with responsive `srcset`/`sizes` (AVIF or WebP by browser).

**FR-8.3** Loading rules: the hero image is eager, `fetchpriority="high"` and preloaded; the first row of product cards and the main product image are eager; everything else is lazy with `decoding="async"`. Only one high priority image per page.

**FR-8.4** Every image reserves its space with width and height, shows the blur placeholder as a background, and fades in when loaded. Every image has alt text.

## F9. Admin `/admin`

**FR-9.1 Access**: `admin` and `owner` roles only. Enforced in the `_admin` layout **and** inside every admin server function.

**FR-9.2 Products list**: image, name, tier, variant count, total stock, active toggle, search.

**FR-9.3 Product form** (create and edit): name, slug (auto from name, editable), brand, description, tier, gender, scent family, occasions (multi), notes (three tag inputs), longevity, projection, inspired by (product select), active; image upload (FR-8.1); **variants** as repeating rows (label, size ml, price ₦, stock), 1 to 3 rows, at least one required. Deleting a product that has orders is blocked: deactivate instead.

**FR-9.4 Orders list**: ref, date, customer, total, status; filter by status; search by ref or email.

**FR-9.5 Order detail**: full order, status actions allowed by FR-6.4, resend email. **Cancel restores stock** for every item in the same transaction as the status change.

**FR-9.6 Team** (owner only): list admins; promote an existing user to admin by email; demote an admin. The owner can't be demoted or edited in the UI.

## F10. Legal

**FR-10.1** `/privacy` and `/terms` are public static pages, linked in the footer and on the sign in screen.

**FR-10.2** Content follows [legal/privacy-policy.md](./legal/privacy-policy.md) and [legal/terms-of-service.md](./legal/terms-of-service.md), including the returns section.

**FR-10.3** Both pages must be live before the Google OAuth app is published (their URLs go on the consent screen).

## Cross cutting

* **NFR-1** Mobile first; works from 360px wide.
* **NFR-2** Accessible: keyboard reachable, visible focus, labels on all inputs, colour contrast AA, size buttons as a radio group.
* **NFR-3** All server inputs validated with Zod. No `any`.
* **NFR-4** Errors shown with a toast or inline message, never a blank screen. Route level error and 404 components.
* **NFR-5** SEO basics: title and description per route, Open Graph image for home and product pages.
