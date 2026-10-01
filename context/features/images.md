# Images

| | |
|---|---|
| Status | 🟨 1.1, 1.2 done; CDN check (1.3) pending |
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
* `src/features/images/{process.ts,url.ts,Image.tsx}`, `tests/unit/images.test.ts`, `netlify.toml` `[images]`

## Progress
2026-10-01 · 1.1 built. `<Image>` uses raw `<img>` in dev (no /.netlify/images locally). Next: seed script uploads WebP (1.2), then verify CDN on live (1.3).

## Gotcha: egress (user note, 2026-10-01)
* Everything stored must be WebP (`contentType: image/webp`, `cacheControl: 31536000`) to keep Supabase cached egress low. Never upload PNG/JPEG masters; the bucket still allows them only as safety.
* Always serve through the Netlify Image CDN so Supabase is hit once per variant.
* Storage API rejects `sb_secret_...` keys ("Invalid Compact JWS"); use the legacy `service_role` JWT as SUPABASE_SECRET_KEY.
* Seed uploads: 15 images, all 500x500 WebP, 5 to 32 kB.
