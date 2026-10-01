# Auth (Google)

| | |
|---|---|
| Status | ⬜ not started |
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
_List key files here as they're created._

## Progress
_Newest first: date · what changed · what's next._
