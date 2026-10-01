# Legal pages

| | |
|---|---|
| Status | 🟨 routes live; footer and sign in links pending (1.4, 2.4) |
| FRD | [F10](../../docs/FRD.md) |
| Steps | 0.5 in [context/README.md](../README.md) |
| Decisions | D25, D26 ([DECISIONS.md](../../docs/DECISIONS.md)) |

## Scope
* `/privacy` from docs/legal/privacy-policy.md (NDPA 2023)
* `/terms` from docs/legal/terms-of-service.md (with returns)
* Linked in footer and on sign in

## Notes and gotchas
* Must be live before Google OAuth branding is filled in
* Fill all [BRACKETED] values

## Files
* `src/features/legal/{constants.ts,components/LegalPage.tsx,content/*.tsx}`, `src/routes/{privacy,terms}.tsx`

## Progress
2026-10-01 · /privacy and /terms built as TSX (no markdown dep). Edit copy in content/*.tsx and the date in constants.ts.
