# Images

| | |
|---|---|
| Status | ⬜ not started |
| FRD | [F8](../../docs/FRD.md) |
| Steps | 1.1 to 1.3 in [context/README.md](../README.md) |
| Decisions | D8, D30 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* sharp: WebP master (max 1600px, q80) and 16px base64 blur, width and height stored
* Netlify Image CDN via `@unpic/react` (`cdn="netlify"`)
* Hero preload + high priority; above the fold eager; rest lazy

## Notes and gotchas
* Netlify docs don't list TanStack Start for Image CDN: verify on first deploy, fallback is direct WebP

## Files
_List key files here as they're created._

## Progress
_Newest first: date · what changed · what's next._
