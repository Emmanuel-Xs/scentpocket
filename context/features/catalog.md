# Catalog (home, listing, filters)

| | |
|---|---|
| Status | 🟨 home (1.5) and shop (1.6) done; product page next (1.7) |
| FRD | [F1](../../docs/FRD.md) |
| Steps | 1.4, 1.5, 1.6 in [context/README.md](../README.md) |
| Decisions | D6, D7, D21, D23 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* Home: hero, 4 tier cards, dupes strip, trust strip, demo banner
* `/shop` with tier, gender, occasion, scent family filters, sort, search, all in URL search params
* Cards show "from ₦X" and Sold out when every variant is out

## Notes and gotchas
* Tier accents from docs/DESIGN.md
* Search params schema in `features/catalog/schemas.ts`
* Inactive products never public

## Files
* `src/features/catalog/{schemas,types,tiers,queries}.ts`, `server/{cards,home}.ts`, `components/{ProductCard,TierChip}.tsx`
* `src/features/home/components/*`, `src/routes/index.tsx`

## Progress
2026-10-01 · 1.6 shop built: filters, sort, search, sheet, skeleton, empty. Dev gotcha: first dev load after adding deps shows an invalid hook error until reload.
2026-10-01 · 1.5 home built and checked at 390 and 1440. Next: /shop (1.6) reusing ProductCard and loadActiveCards.
