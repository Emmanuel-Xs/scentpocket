# Product page

| | |
|---|---|
| Status | ✅ 1.7 done (JSON-LD in 5.2, drawer opens on add in 2.2) |
| FRD | [F2](../../docs/FRD.md) |
| Steps | 1.7 in [context/README.md](../README.md) |
| Decisions | D13, D22, D23 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* Size buttons (not dropdown), sold out struck through, price per ml
* Notes pyramid, longevity and projection meters, chips
* Dupes both ways, same tier suggestions, 404 for unknown slug

## Notes and gotchas
* Baymard size button research in docs/CATALOG.md
* First in stock variant preselected

## Files
* `src/features/product/components/*`, `src/features/catalog/server/product.ts`, `src/routes/p.$slug.tsx`, `src/features/cart/store.ts`, `src/components/ui/QuantityStepper.tsx`

## Progress
2026-10-01 · 1.7 built and checked at 1440 (in stock + dupe callout) and 390 (sold out + sticky bar).
