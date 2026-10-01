# Auth (Google)

| | |
|---|---|
| Status | 🟨 code done (2.4, 2.5); Google + Supabase dashboard setup (2.3) and live test (2.6) pending |
| FRD | [F4](../../docs/FRD.md) |
| Steps | 2.3 to 2.6 in [context/README.md](../README.md) |
| Decisions | D4, D10, D26, D28, D29 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* Supabase Auth Google provider, OAuth client in Google Cloud Console
* `/sign-in?next=`, `/auth/callback` server route, profile upsert, owner from env
* `_authed` and `_admin` layouts plus checks inside server functions

## Notes and gotchas
* Start from TanStack `start-supabase-basic`; pass cookie options in `setAll`
* Publish the Google app to production before testing with other Gmails
* Popup shows the supabase.co domain: known, ignored

## Files
* `src/features/auth/*`, `src/routes/{sign-in,auth.callback,_authed,_admin}.tsx`, `src/routes/_authed/account.orders.tsx`, `src/routes/_admin/admin.index.tsx`

## Progress
_Newest first: date · what changed · what's next._
