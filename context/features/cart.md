# Cart

| | |
|---|---|
| Status | ✅ 2.1 and 2.2 done (Checkout button target switches to /checkout in 3.2; clear cart after order in 3.3) |
| FRD | [F3](../../docs/FRD.md) |
| Steps | 2.1, 2.2 in [context/README.md](../README.md) |
| Decisions | D5, D13 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* Zustand + persist, items are `{ variantId, qty }` only
* Drawer with steppers and free delivery progress bar
* Reconcile against server on load (removed or short items)

## Notes and gotchas
* Clear only after a successful order

## Files
* `src/features/cart/{store,ui-store,reconcile,queries,types}.ts`, `server/lines.ts`, `components/{CartDrawer,CartLineRow,CartButton,CartSync,FreeDeliveryProgress}.tsx`, `src/lib/use-is-phone.ts`

## Progress
2026-10-01 · 2.1 and 2.2 built and checked at 1440 and 390. Reconcile runs whenever the server data changes, not only on load.
