# Design system and app shell

| | |
|---|---|
| Status | 🟨 in progress |
| Spec | [docs/design/](../../docs/design/) |
| Steps | 0.11, 1.4, 1.8 in [context/README.md](../README.md) |
| Decisions | D33 to D40 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* Tokens from docs/design/tokens.css, components ported from reference.css as shadcn + cva variants
* Header, demo banner, footer, phone tab bar, route progress bar, toaster, error and 404
* Mobile native baseline (viewport-fit, 16px inputs, tap highlight, safe areas)

## Notes and gotchas
* Hover only under (hover: hover); press scale 0.97; focus ring 2px ink
* Stagger entrance only on client inserted content
* Check every board's states in docs/design/SCREENS.md

## Files
* `src/styles/app.css` (tokens), `src/components/layout/*`, `src/lib/utils.ts`

## Progress
2026-10-01 · 0.11 and 1.4 done. Next: cart pill (2.2), search dialog + skeletons (1.8), shadcn components when first needed.
