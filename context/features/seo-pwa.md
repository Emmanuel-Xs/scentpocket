# SEO and PWA

| | |
|---|---|
| Status | ⬜ not started |
| Spec | [docs/design/](../../docs/design/) |
| Steps | 5.2, 5.2b in [context/README.md](../README.md) |
| Decisions | D41 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* Route head(), JSON-LD, sitemap, robots, noindex, OG image
* Manifest, icons, theme color; service worker + offline + install sheet if time

## Notes and gotchas
* No fake ratings in JSON-LD
* Never cache server functions, checkout, account, admin or auth
* Cut to manifest + icons if late

## Files
_List key files here as they're created._

## Progress
_Newest first: date · what changed · what's next._
