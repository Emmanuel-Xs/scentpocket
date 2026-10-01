# Catalog (home, listing, filters)

| | |
|---|---|
| Status | ⬜ not started |
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
_List key files here as they're created._

## Progress
_Newest first: date · what changed · what's next._
