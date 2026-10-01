# Admin

| | |
|---|---|
| Status | ✅ orders (4.4), products (4.5), team (4.6) done |
| FRD | [F9](../../docs/FRD.md) |
| Steps | 4.4 to 4.6 in [context/README.md](../README.md) |
| Decisions | D9, D28, D29 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* Orders: list, detail, status actions, cancel restock, resend email
* Products: list, form with 1 to 3 variants, image upload, deactivate instead of delete
* Team: owner promotes and demotes admins

## Notes and gotchas
* First to be cut if behind

## Files
* `src/features/admin/{types,queries}.ts`, `server/orders.ts`, `components/{AdminShell,AdminOrdersPage,AdminOrderPage}.tsx`, `src/routes/_admin.tsx`, `src/routes/_admin/*`, `src/features/orders/server/transition-order.ts`, `src/components/ui/{ConfirmDialog,Switch,TagInput}.tsx`, `src/features/admin/{schemas.ts,server/{products,product-core}.ts,components/{AdminProductsPage,ProductForm,VariantRows,PhotoManager,product-form-state}}`, `src/features/images/server/storage.ts`, `src/features/admin/{server/{team,team-core}.ts,components/TeamPage.tsx}`, `src/routes/_admin/admin.team.tsx`

## Progress
_Newest first: date · what changed · what's next._
