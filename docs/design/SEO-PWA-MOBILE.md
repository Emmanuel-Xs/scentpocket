# SEO, PWA and mobile native

Canvas board: **Foundations → SEO and PWA**. Skills: `addyosmani/web-quality-skills` (`seo`, `core-web-vitals`, `accessibility`), `ibelick/ui-skills` (`fixing-metadata`), `emilkowalski/skills` (`mobile-native`).

## SEO

* Every route sets `title`, `description`, canonical, Open Graph and Twitter tags in TanStack Router's `head()`.
* Titles: home `Scentpocket · A scent for every pocket`; product `{Name} by {Brand} · Scentpocket`; tier `{Tier} perfumes in Lagos · Scentpocket`.
* **Product JSON-LD** on `/p/$slug`: `name`, `brand`, `image`, `description`, `sku`, and `offers` (or `AggregateOffer` with `lowPrice`/`highPrice` when there are several sizes) with `priceCurrency: "NGN"` and `availability` `InStock` / `OutOfStock`. No ratings (we have no reviews, never fake them).
* `BreadcrumbList` on product and tier pages; `Organization` + `WebSite` on home.
* `/sitemap.xml` and `/robots.txt` as server routes. Disallow `/checkout`, `/account`, `/admin`, `/auth`, `/sign-in`.
* `noindex` on checkout, account, admin, sign in and confirmation.
* OG image 1200×630 per product (name, price, dupe line). Generate with Satori at build or request time if time allows; otherwise one static brand OG image.
* One `h1` per page. Clean URLs: `/p/<slug>`, `/shop?tier=pocket`.
* Core Web Vitals targets: LCP under 2.5s (hero image preloaded with `fetchpriority="high"`), CLS under 0.1 (width/height on every image, skeletons match layout), INP under 200ms.

## PWA

* `public/manifest.webmanifest`: `name` and `short_name` "Scentpocket", `start_url: "/"`, `display: "standalone"`, `background_color` and `theme_color` `#FAF6EF`, icons 192, 512 and 512 maskable (mark inside the 80% safe zone).
* `apple-touch-icon` 180, favicons 32 and 16 (the Pocket Bottle mark).
* Service worker (hand written or Serwist/Workbox; TanStack Start has no official PWA plugin, so keep it small): precache the app shell and `/offline`, cache product images stale while revalidate. **Never cache** server function responses, `/checkout`, `/account`, `/admin`, auth routes.
* Offline fallback page = the `Offline` board.
* Install sheet (custom, phone): show after the second visit or after a first order, never on first load; "Not now" hides it for 30 days. iOS shows the Share → Add to Home Screen hint instead.
* Scope note: PWA is Phase 5 polish. If time is short, ship manifest + icons + theme color only.

## Mobile native baseline (ship before the first component)

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<meta name="theme-color" content="#FAF6EF">
```

* `-webkit-tap-highlight-color: transparent` on `html`; every tappable has its own `:active` state.
* Inputs 16px minimum (no iOS zoom). Never `user-scalable=no`.
* `100dvh` for app shells and drawers, `100svh` for the hero, never `100vh`.
* `env(safe-area-inset-*)` on the sticky header, tab bar, bottom sheets, sticky buy bar and toasts.
* `overscroll-behavior: contain` on drawer and sheet bodies.
* `touch-action: manipulation` on buttons and links; `user-select: none` on controls only (never on body text: people copy order refs and addresses).
* Tier scroller uses native scroll snap (`scroll-snap-type: x mandatory`).
* Input hints: `inputmode="tel"` + `autocomplete="tel"` on phone, `type="email"`, `enterkeyhint="search"` on search, `autocomplete` on name and address fields.
* Test on a real phone over LAN before calling mobile done (emulation misses sticky hover, safe areas and the keyboard).
