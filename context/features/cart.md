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

## Phase 6 (Lesson 3): server cart
Status: ✅ 6.1 and 6.2 done. Decisions D49 to D51, D56.
* Signed in: server cart (`cart_items`) is the truth; Zustand mirrors it. `ownerId` in the store (null = this device's own lines) decides whether the one-time `mergeCart` runs.
* UI never calls the store actions directly: use `cartActions` from `sync.ts` (optimistic + saved per variant, rollback with toast). `CartSync` merges, mirrors, refetches on focus and polls every 3s while the drawer or /checkout is open.
* Server rules in `rules.ts` (clamp = `min(stock, 10)`, merge adds then caps), reconciliation reuses `reconcile.ts`.
* Gotcha: a stale in-flight poll would put the old quantity back, so `save()` cancels the cart query first and the mutation response is written into the query cache.
* Gotcha: mobile users never pass through `/auth/callback`, so `readSessionUser` creates the profile on first sight (cart and order rows have a foreign key to it).
* Files: `rules.ts`, `schemas.ts`, `sync.ts`, `server/{cart-core,cart,cart-data}.ts`; tests `tests/unit/{cart-rules,cart-sync}.test.ts`, `tests/integration/{cart,api}.int.test.ts`.
* While the sign in merge runs, `useCartUi.merging` is true and the cart controls (Add to cart, steppers, Remove, drawer Checkout) are disabled, so no edit can be overwritten by the merge result.
