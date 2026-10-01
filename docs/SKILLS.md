# Agent skills for this project

Claude Code builds Scentpocket. Install these skills into the repo (project scope) before Phase 1. They come from skills.sh / GitHub; versions are whatever is current when you run the command.

## Install

```bash
# Design engineering, motion, mobile feel (Emil Kowalski)
npx skills add emilkowalski/skills --skill emil-design-eng --skill animate --skill review-animations --skill improve-animations --skill mobile-native --skill pick-ui-library -a claude-code

# React + UI review (Vercel)
npx skills add vercel-labs/agent-skills --skill react-best-practices --skill composition-patterns --skill web-design-guidelines -a claude-code

# Web quality: SEO, accessibility, performance, Core Web Vitals (Addy Osmani)
npx skills add addyosmani/web-quality-skills --skill seo --skill accessibility --skill core-web-vitals --skill performance --skill web-quality-audit -a claude-code

# UI polish and fixes (ibelick)
npx skills add ibelick/ui-skills --skill baseline-ui --skill fixing-accessibility --skill fixing-metadata --skill fixing-motion-performance -a claude-code

# Supabase + Postgres
npx skills add supabase/agent-skills --skill supabase --skill supabase-postgres-best-practices -a claude-code

# Frontend design (Anthropic)
npx skills add anthropics/skills --skill frontend-design -a claude-code

# Planning
npx skills add mattpocock/skills --skill grill-me -a claude-code

# TanStack: version pinned skills shipped inside installed TanStack packages (where available)
npx @tanstack/intent install
```

## When to use which

| Situation | Skill |
|---|---|
| Building any animation, drawer, toast, transition | `animate` (tokens and rules), `emil-design-eng` |
| After building a screen with motion | `review-animations`, then `fixing-motion-performance` |
| Anything touch, sheets, sticky bars, PWA | `mobile-native` |
| Choosing a library (toasts, numbers, drawers) | `pick-ui-library` (answers: Sonner, NumberFlow, motion, Vaul via shadcn) |
| Writing React components and data fetching | `react-best-practices`, `composition-patterns` |
| Before calling a screen done | `web-design-guidelines` review, `fixing-accessibility`, `baseline-ui` |
| Route `head()`, JSON-LD, sitemap, OG | `seo`, `fixing-metadata` |
| Lighthouse pass (Phase 5) | `web-quality-audit`, `core-web-vitals`, `performance` |
| Schema, RLS, queries, indexes, transactions | `supabase`, `supabase-postgres-best-practices` |
| New UI not on the canvas | `frontend-design`, then match docs/design |

## Project overrides (these win over any skill)

* Custom easing curves from `docs/design/MOTION-AND-LOADING.md` are allowed (baseline-ui says otherwise).
* Primitive system is **shadcn/ui (Radix)**. Don't mix in Base UI or React Aria on the same surface, even though some skills prefer them.
* Money is integer kobo, RLS stays on, Drizzle for app data: see AGENTS.md hard rules.
* Letter spacing on eyebrows and the wordmark is part of the brand (baseline-ui says not to change tracking: our tokens already set it).
