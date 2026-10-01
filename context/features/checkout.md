# Checkout

| | |
|---|---|
| Status | ✅ 3.1 to 3.6 done; email after commit is 4.1 |
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
* `src/lib/{config,money,order-ref}.ts`, `src/features/checkout/{schemas.ts,server/{create-order,place-order}.ts}`, `src/features/orders/{status.ts,server/cancel-order.ts}`, `tests/unit/{money,order-ref,phone,status}.test.ts`, `tests/integration/checkout.int.test.ts`

## Progress
2026-10-01 · integration tests run against the real Supabase DB with uniquely named fixture rows (the fixture product is briefly active). Use a branch DB via TEST_DATABASE_URL if that ever matters.
