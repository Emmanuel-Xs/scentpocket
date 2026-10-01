# Motion and loading

Sources: Emil Kowalski's skills (`emilkowalski/skills`: `animate`, `emil-design-eng`, `review-animations`, `mobile-native`), his articles "7 practical animation tips" and "Great animations", and NN/g "Skeleton Screens 101". Canvas board: **Foundations → Motion and loading**.

> Project override: `ibelick/ui-skills` `baseline-ui` says "never introduce custom easing curves". This project **does** use Emil's three curves below, on purpose. Everything else in baseline-ui applies.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Anything entering or exiting: toasts, popovers, dialogs, cards |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Things moving on screen |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Cart drawer, bottom sheets |
| `ease` | built in | Hover colour changes |
| `linear` | built in | Spinners, skeleton shimmer only |

| Thing | Duration |
|---|---|
| Press feedback (`scale(0.97)`) | 140ms |
| Tooltip, popover, search dialog | 180ms |
| Hover colour | 180ms |
| Card / toast / content enter | 240ms, stagger 50ms (max 8 items) |
| Drawer / sheet | 400ms enter, ~250ms exit |

## Rules

1. Animate `transform` and `opacity` only.
2. Never start from `scale(0)`. Start at `0.94` to `0.96` with `opacity: 0`.
3. No `ease-in` on UI.
4. Popovers scale from their trigger (`transform-origin` from Radix's `--radix-popover-content-transform-origin`). Dialogs scale from centre.
5. Keyboard actions never animate: `/` opens search instantly, Esc closes instantly, arrow keys move instantly.
6. Every pressable element gets `active:scale-[0.97]` and `transition-transform duration-150 ease-[var(--ease-out)]`.
7. Hover styles only under `(hover: hover) and (pointer: fine)` (Tailwind v4's `hover:` does this).
8. **Entrance stagger only on client inserted content** (filtered grid, new toast, opened drawer). Never on the server rendered first paint: it delays content and hurts LCP.
9. `prefers-reduced-motion`: keep opacity and colour, drop movement and the shimmer.
10. Use CSS transitions for interruptible state; keyframes for one shot entrances. Use `motion` (motion.dev) only for springs, layout or exit animations CSS can't do (e.g. cart line removal).
11. Changing numbers (cart subtotal, checkout total) use **NumberFlow**.
12. Toasts use **Sonner**: bottom right on desktop, top centre on phone (so they never cover the tab bar, sticky buy bar or an open sheet).
13. Drawers and sheets use **Vaul** (via shadcn's Drawer): right on desktop, bottom on phone, drag to dismiss.

## Loading strategy

Decide per interaction, not per page:

| Situation | Show | Implementation |
|---|---|---|
| PWA cold start from the home screen | Splash | OS draws it from the manifest. Optional in app logo (max 600ms) only when `display-mode: standalone` and first load of the session. Never in a browser tab. |
| First page load (any route) | Nothing | SSR sends complete HTML. Images show their blur placeholder. |
| Client navigation under 300ms | Nothing | Loaders that flash are worse than none. |
| Client navigation 300ms to 1s | Top progress bar | 3px terracotta bar, driven by `router.state.status === 'pending'` (or `useRouterState`), shown after 300ms. Page stays interactive. |
| Data heavy route that can take over 1s (shop grid, product, orders, admin tables) | Skeleton | Route `pendingComponent`, `pendingMs: 300`, `pendingMinMs: 500` so it never flashes. Skeleton matches the real layout so nothing jumps. |
| User action (place order, save product, make admin, sign in) | Button spinner | Disable the button, spinner + verb ("Placing your order…"). Never a full page overlay. |
| Cart add / remove / quantity | Optimistic | Update Zustand immediately, toast confirms. Server checks at checkout. |
| Image loading | Blur placeholder | 16px base64 WebP as background, fade in on load. |

Skeleton boards on the canvas: `Shop-Skeleton`, `Product-Skeleton`, `Orders-Skeleton`. Admin tables reuse the orders row skeleton.
