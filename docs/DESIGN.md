# Scentpocket: Design and UX

Status: **locked.** Every screen and state is designed on the Scentpocket Design canvas. Build from [design/SCREENS.md](./design/SCREENS.md) and [design/reference.css](./design/reference.css); motion and loading in [design/MOTION-AND-LOADING.md](./design/MOTION-AND-LOADING.md); SEO, PWA and mobile in [design/SEO-PWA-MOBILE.md](./design/SEO-PWA-MOBILE.md).

## Direction: warm editorial (light only)

A magazine feel that holds both ends of the price range: cream background, refined serif headings, clean sans for UI, generous whitespace, real bottle photography. Each tier has its own accent so the main idea (budget tiers) becomes the visual system.

### Logo
**Pocket Bottle**: a perfume bottle whose body is a jeans back pocket with a dashed stitch inside, flat rounded base so it stands. Wordmark `scentpocket`, always lowercase, Instrument Serif. Minimum mark size 16px. The dashed stitch is the brand detail reused for dividers, badge outlines and the receipt.

### Tokens

| Token | Value | Use |
|---|---|---|
| `--ink` | `#1C1915` | text, primary buttons, Niche tier |
| `--cream` | `#FAF6EF` | page background |
| `--surface` | `#FFFFFF` | cards, drawer |
| `--blush` | `#F3EADD` | soft panels, progress track |
| `--border` | `#E7DFD2` | lines, stitches |
| `--muted` | `#5E564C` | secondary text (6.7:1 on cream) |
| `--text-2` | `#4A433B` | body secondary |
| `--tier-pocket` | `#B4532F` terracotta | 4.98:1 with white |
| `--pocket-text` | `#A1462A` | terracotta for small text on cream or blush (5.15:1 on blush) |
| `--tier-arabian` | `#9A6510` amber | 4.95:1 with white |
| `--tier-designer` | `#1F2F52` navy | 13.2:1 with white |
| `--tier-niche` | `#1C1915` ink + `#C9A45C` gold (gold only on ink, 7.5:1) | |
| `--success` | `#2F6B4F` | Delivered |
| `--danger` | `#9B2C2C` | Cancelled, errors |

Radii: pills 999px, cards 22 to 24px, inputs 14px. Buttons and inputs min height 48px, filter pills 44px, icon buttons 44×44.

### Icons
Lucide (`lucide-react`) at stroke width 1.5. Sizes 16 / 18 to 20 / 22 / 24+. Only non Lucide marks: the logo and the Google G.

### Type
* **Instrument Serif** (400 + italic) for display, headings, product names, wordmark. Hierarchy by size: 112 / 56 / 26 to 32.
* **Instrument Sans** (400 to 700) for UI and body: 18 / 15 to 16 / 12 tracked caps for eyebrows.
* Prices in Instrument Sans 600 with tabular numbers.
* Both SIL OFL (free for commercial use and logos). Install via `@fontsource/instrument-serif` and `@fontsource/instrument-sans`.

## UX rules (from research, see [CATALOG.md](./CATALOG.md) sources)

1. **Size picker = buttons**, never a dropdown (Baymard: dropdowns get overlooked and hide stock; 71% of leading sites use buttons). Sold out sizes stay visible, struck through, disabled. Show price per ml under each.
2. **Help people "smell through the screen"**: notes pyramid, scent family, longevity and projection meters, and copy about how it smells and when to wear it. Fragrance buyers research across many visits and read notes closely.
3. **Shop by scent family** alongside gender and occasion.
4. **Dupes across tiers**: "Same vibe, smaller pocket" on expensive products, "Inspired by" on cheap ones. This is the signature feature.
5. **Cart drawer** with a free delivery progress bar.
6. **Single page checkout**, summary always visible, fee updates live with the zone.
7. **Trust**: authenticity line, delivery times per zone, clear demo banner.
8. **Prices** always formatted `₦42,000` (no kobo shown), "from ₦X" on cards.

## Page inventory

| Page | Key elements |
|---|---|
| Home | Hero (preloaded image), 4 tier cards, dupes strip, featured products, trust strip |
| Shop | Filter bar (chips on mobile, sidebar on desktop), sort, grid, empty state |
| Product | Gallery, brand, name, tier chip, size buttons, qty, add to cart, notes pyramid, meters, chips, dupes, same tier row |
| Cart drawer | Lines, steppers, subtotal, free delivery progress, Checkout |
| Sign in | Google button, terms/privacy line |
| Checkout | Contact, delivery, zone, payment (pay on delivery), summary, Place order |
| Receipt | Success header (when just placed), status timeline, items, totals, address, email preview |
| Order history | List with status badges, empty state |
| Admin | Sidebar: Products, Orders, Team. Tables, forms, status actions |
| Privacy, Terms | Long form text, table of contents |
| 404 / error | Friendly copy, link home |

## States to design

Loading skeletons (grid, product, receipt), empty states (no results, empty cart, no orders), sold out (variant, whole product), errors (stock conflict at checkout, email failed note on receipt), success (order placed).

## Copy voice

Warm, short, a little Lagos. Examples: "A scent for every pocket." "Same vibe, smaller pocket." "₦12,000 away from free delivery." Avoid em dashes in UI copy.
