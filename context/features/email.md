# Confirmation email

| | |
|---|---|
| Status | 🟨 4.1 built and tested with mocks; real send pending credentials; preview iframe (4.2) next |
| FRD | [F7](../../docs/FRD.md) |
| Steps | 4.1 to 4.3 in [context/README.md](../README.md) |
| Decisions | D16, D17 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* React Email template shared by send and preview
* Mailgun first, Gmail SMTP fallback, provider and errors stored on order
* Admin resend

## Notes and gotchas
* Sandbox only reaches authorized recipients until `mg.scentpocket.shop` is verified

## Files
* `src/features/email/{templates/OrderConfirmation.tsx,render,mailgun,smtp,deliver,send,types}.ts`, `tests/unit/email.test.ts`, `src/features/orders/server/order-detail.ts`

## Progress
_Newest first: date · what changed · what's next._
