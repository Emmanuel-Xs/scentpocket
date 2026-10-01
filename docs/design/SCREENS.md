# Scentpocket: Screen inventory

Every screen is designed on the **Scentpocket Design** canvas (https://claude.ai/artifact/3uiWD1QWfkFJVxytvqjT9R, private to Emmanuel; share it from the canvas if a teammate needs it). Each screen exists at desktop (1440, fluid) and phone (390). Press Play on any board to click through the prototype.

**Static exports:** every board is also in [screens/](./screens/index.html) as plain HTML using `reference.css`. Open `docs/design/screens/index.html` in a browser (or serve the folder) to see and click through every screen; resize below 760px for the phone layout. Agents: read the HTML for exact structure and class names, and screenshot it with Playwright when you need to compare your build against the design.

How to build from this file: find the route, build the default state first, then each listed state. Class names on the canvas (`btn btn-primary`, `size-option`, `product-card`...) map to components; their exact styles are in [reference.css](./reference.css).

Loading column: **SSR** = server rendered, no loader. **Bar** = top progress bar on client navigation (300ms to 1s). **Skeleton** = route `pendingComponent` (pendingMs 300, pendingMinMs 500). **Button** = spinner in the button that triggered it. See [MOTION-AND-LOADING.md](./MOTION-AND-LOADING.md).

## Canvas pages

| Canvas page | Boards |
|---|---|
| Foundations | Brand board, Component states, Motion and loading, Icons, SEO and PWA, Flows |
| Storefront | Home, Shop, Shop tier, Shop empty, Shop skeleton, Filters sheet, Product, Product sold out, Product dupe, Product skeleton, Dupes, Search, Search empty, Cart, Cart empty, Cart changed |
| Checkout and account | Sign in, Sign in loading, Checkout, Checkout errors, Checkout stock conflict, Checkout placing, Confirmation, Confirmation email failed, Email, Orders, Orders empty, Orders skeleton, Order detail, Account menu |
| Admin | Admin orders, Admin order, Cancel dialog, Admin products, Product form, Team |
| Legal and system | Privacy, Terms, 404, Error, Offline, Splash |
| Logo and type explorations | Logo concepts, type pairings (history only) |

## Storefront

| Board | Route | States on canvas | Loading | Key components | Notes |
|---|---|---|---|---|---|
| Home | `/` | default | SSR | header, tabbar, hero price ladder, tier cards, dupe cards, product cards, trust strip, footer | Hero ladder image gets `fetchpriority="high"` + preload. Only one high priority image. |
| Shop | `/shop` | default, card hover | Skeleton (`Shop-Skeleton`) | filter sidebar (desk), tier scroller + Filters button (phone), sort select, product grid | All filters in URL search params. |
| Shop tier | `/shop?tier=arabian_gems` | default | Skeleton | tier banner in tier colour, breadcrumb, same grid | Banner colour = tier token. White text on amber (4.95:1). |
| Shop empty | `/shop?q=...` with 0 results | empty | Skeleton | empty state with one primary action, suggestions grid | Empty states always have one clear next action. |
| Filters sheet | `/shop` on phone | open | none | bottom sheet (Vaul), pills, sticky footer "Show N scents" | Sheet: `--ease-drawer`, 400ms. `overscroll-behavior: contain` on its body. |
| Product | `/p/$slug` | in stock, low stock (qty capped), dupe callout | Skeleton (`Product-Skeleton`) | gallery + thumbs, size radio buttons, stepper, add to cart, dupe card, notes pyramid, meters, chips, related grid, sticky buy bar (phone) | Size picker is a radiogroup of buttons, never a select. Sold out sizes visible, dashed, struck through. |
| Product sold out | `/p/creed-aventus` | all sizes sold out | Skeleton | disabled add button, danger alert with dupe CTA | Sold out sends people to the dupe. |
| Product dupe | `/p/cdn-untold-body-spray` | inspired-by alert | Skeleton | info alert linking to the original | |
| Dupes | `/dupes` | default | SSR / Bar | dupe pair cards, explainer panel | |
| Search | dialog over any page | results with highlight, notes group | none (instant, debounced 150ms) | search dialog (desk, top anchored), full width (phone) | Opens with `/`. Keyboard actions never animate. `enterkeyhint="search"`. |
| Search empty | dialog | no results | none | suggestion pills | |
| Cart | drawer over any page | 2 lines, progress to free delivery, "Added" toast | optimistic | drawer (right on desk, bottom sheet on phone), stepper, progress, Checkout | Subtotal uses NumberFlow. |
| Cart empty | drawer | empty | none | empty state | |
| Cart changed | drawer | sold out line removed, qty clamped | none | danger alert, inline line warning | Shown after reconciliation (FR-3.3). |

## Checkout and account

| Board | Route | States | Loading | Key components | Notes |
|---|---|---|---|---|---|
| Sign in | `/sign-in?next=` | default | SSR | brand panel (desk), Google button, terms line | Google button follows Google branding (white, G logo). |
| Sign in loading | same | redirecting | Button | button spinner "Opening Google…" | |
| Checkout | `/checkout` | default | SSR (data from server) | slim checkout header, 3 numbered cards (Contact, Delivery, Payment), zone radio cards, summary aside (sticky), sticky Place order bar (phone) | Email read only from Google. Phone has `+234` prefix, `inputmode="tel"`. |
| Checkout errors | same | 2 field errors + error summary at top | none | alert with anchor links to fields, `aria-invalid`, messages under fields | Focus moves to the summary on submit. |
| Checkout stock conflict | same | last bottle sold out between cart and submit | none | danger alert, removed line struck in summary | From `StockError` (TRD §7). |
| Checkout placing | same | submitting | Button | disabled fields, spinner "Placing your order…" | `aria-busy` on the form. |
| Confirmation | `/account/orders/$ref?placed=1` | success | SSR | success check (pop in), ref chip + copy, timeline, items, info cards, email preview | Email preview mounts the real email template in a sandboxed iframe. |
| Confirmation email failed | same | email failed | SSR | danger alert near the top | Order is never affected by email failure. |
| Email | (template) | default | n/a | table based, inline styles, 600px max | React Email template, same file renders the preview. |
| Orders | `/account/orders` | list with 4 statuses, profile card (phone) | Skeleton (`Orders-Skeleton`) | tabs, order rows with stacked thumbs, badges | Phone "Account" tab lands here; profile card holds Sign out. |
| Orders empty | same | empty | Skeleton | empty state | |
| Order detail | `/account/orders/$ref` | shipped | Skeleton | timeline with dates, rider alert, items, info cards, email log line | |
| Account menu | popover from avatar (desk) | open | none | popover menu: My orders, Admin (role gated), Sign out | `transform-origin: top right` (trigger aware). |

## Admin

| Board | Route | States | Loading | Notes |
|---|---|---|---|---|
| Admin orders | `/admin/orders` | table, row hover, status tabs with counts, stats | Skeleton (table rows) | Sidebar becomes a horizontal scroller on phone; tables scroll horizontally. |
| Admin order | `/admin/orders/$ref` | placed, email log with Mailgun reject + SMTP fallback | Skeleton | Actions shown follow the status machine. |
| Cancel dialog | alert dialog | open | Button | Destructive actions always use an AlertDialog. Restocks in the same transaction. |
| Admin products | `/admin/products` | table, low stock and sold out highlights, active switch | Skeleton | |
| Product form | `/admin/products/$id` and `/new` | edit with 2 sizes, uploaded photo, sticky unsaved bar | Button (Save) | Upload states (idle, drag over, processing) are on the Component states board. |
| Team | `/admin/team` | owner + admin, add admin error | Button | Owner can't be removed in the UI. |

## Legal and system

| Board | Route | Notes |
|---|---|---|
| Privacy, Terms | `/privacy`, `/terms` | Sticky table of contents (desk), content from docs/legal. Public and indexable. |
| 404 | not found component | Search shortcut + home + shop. |
| Error | route error component | Retry + home + error reference. Never a blank screen. |
| Offline | service worker fallback | Cart is local, so nothing is lost. |
| Splash | PWA standalone cold start only | 420ms logo scale in from 0.94, never on navigation or in a browser tab. |

## Global chrome

* Demo banner on every page (ink bar).
* Header: sticky, blurred cream, logo, nav (desk), search trigger with `/` hint (desk) or icon (phone), account, cart pill with count.
* Phone: bottom tab bar (Home, Shop, Dupes, Account) with safe area padding; hidden on checkout and product (product shows the sticky buy bar instead).
* Footer: ink, three link columns, stitched divider.
