# Checkout

| | |
|---|---|
| Status | ⬜ not started |
| FRD | [F5](../../docs/FRD.md) |
| Steps | 3.1 to 3.3 in [context/README.md](../README.md) |
| Decisions | D3, D14, D15, D24 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* Form with Nigerian phone validation, zones, live totals, pay on delivery
* `placeOrder`: server side prices, atomic stock decrement, snapshots, idempotency key
* Stock error UX updates the cart

## Notes and gotchas
* TRD §7 for the transaction
* Email is sent after commit and never fails the order

## Files
_List key files here as they're created._

## Progress
_Newest first: date · what changed · what's next._
