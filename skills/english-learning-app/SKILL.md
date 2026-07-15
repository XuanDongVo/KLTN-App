---
name: english-learning-app
description: "Workspace guidance for rebuilding the KLTN children's English app in MyEnglishApp and EnglishApp_Server-main. Use for backend-first Cambridge YLE curriculum work, Starters/Movers/Flyers sequencing, lesson-session APIs, curriculum import/publish, learner path UI, or migration away from frontend seed data."
---

# English Learning App Rebuild

## Required Reading

Read in this order before planning or changing code:

1. `references/rebuild-blueprint.md` - current scope, architecture, domain model, reuse/retire decisions, and target curriculum size.
2. `references/implementation-plan.md` - approved execution order, gates, and verification requirements.
3. `references/project-context.md` - current repository shape and known risks.
4. `references/implementation-status.md` - existing reusable behavior and latest verification.

Read only when relevant:

- `references/curriculum-seed.md` for the active Starters package, source policy, and review checklist.
- `references/learner-improvement-roadmap.md` for learner issues discovered before the rebuild decision.
- `references/product-plan.md`, `references/use-cases.md`, `references/architecture.md`, and `references/feature-catalog.md` as historical context. Where they conflict, `rebuild-blueprint.md` wins.

## Current Scope

- Build one backend-owned curriculum platform for `PRE_A1_STARTERS`, `A1_MOVERS`, and `A2_FLYERS`.
- Deliver levels sequentially: Starters first, then Movers, then Flyers.
- Target 10 lessons per level; each lesson contains 8-15 ordered activities grouped by stage.
- Keep the mobile app free of canonical curriculum and answer keys. It renders DTOs returned by Spring.
- Build only the core learner loop and admin curriculum import/publish flow now.
- Freeze parent/teacher dashboards, placement, notifications, offline sync, advanced analytics, daily quests, AI-assisted authoring, pronunciation scoring, and new Image Caption work until the core loop is accepted.

## Working Rules

- Rebuild domain and data flow without deleting reusable code blindly.
- Preserve auth/user compatibility, Cloudinary/media upload, Expo Router shell, theme, activity UI, audio recording/TTS, and Image Caption adapter where they remain useful.
- Replace `Unit + QuestionBank + UnitProgress` with versioned curriculum and session/attempt models.
- Keep curriculum out of the client. `data/curriculum.ts` has been removed; `LearningContext` is only for device-local concerns.
- Validate answers, XP, unlocks, and completion on the server.
- Use versioned `/api/v1` endpoints and Flyway migrations.
- Keep published curriculum immutable; edit by creating a new curriculum version.
- Never commit secrets from `.env.local` or `application.properties`.
- Preserve unrelated user changes in the dirty worktree.
- Implement vertical slices and pass each gate before moving to the next phase.

## Immediate Next Slice

The backend-only YLE path now includes `STARTERS_2026.4`, `MOVERS_2026.1`, and `FLYERS_2026.1`. Each level has 5 units, 25 lessons, and 200 activities. Continue from here:

1. Read `references/implementation-status.md` and the Starters source audit it links.
2. Retry the local Mongo service and gated reset described in the status file.
3. Run Spring on port 8080 and Expo on the LAN; confirm `EXPO_PUBLIC_API_URL` uses the computer's LAN IP.
4. Complete the 10-lesson path on a physical device, including images, wrong answers, hearts, microphone record/replay, completion, and sequential unlock.
5. Record teacher/content corrections as a new immutable curriculum version.
6. Add resume/idempotency hardening, then proceed to admin ZIP import. Do not begin Movers before the Starters acceptance gates pass.
