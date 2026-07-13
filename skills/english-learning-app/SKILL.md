---
name: english-learning-app
description: "Workspace-specific guidance for continuing the KLTN English learning app. Use when working on MyEnglishApp or EnglishApp_Server-main, especially when redesigning it into a Duolingo-like English learning app for children using the PDF curriculum in document/."
---

# English Learning App

## Start Here

Read these references before changing code:

- `references/project-context.md` for current repo shape and known risks.
- `references/implementation-status.md` for what is already built, verified, and still pending.
- `references/feature-catalog.md` for the full feature inventory.
- `references/product-plan.md` for product direction, layout language, and roadmap.
- `references/use-cases.md` for user roles and flows.
- `references/architecture.md` for proposed frontend/backend/data architecture.
- `references/curriculum-seed.md` for the initial curriculum extraction plan and sample lesson data.
- `references/learner-improvement-roadmap.md` for the latest learner audit, resolved issues, priorities, and acceptance criteria.

## Working Rules

- Treat the target product as a child-friendly English learning app inspired by Duolingo, not a generic admin CRUD app.
- Keep the learner experience first: short lessons, playful feedback, progress path, stars/xp, streaks, hearts, and review loops.
- Keep admin tools practical: import curriculum, manage units/lessons/questions/media, preview learner screens.
- Treat Image Caption as a first-class feature: the app captures/uploads a child-safe image, then calls an external AI caption service owned by another module/team.
- Do not commit secrets from `application.properties` or `.env.local`.
- Fix mojibake Vietnamese text before polishing UI copy.
- Prefer small vertical slices: data model -> API -> service -> screen -> verification.

## Current Next Slice

1. Complete P0 device reliability in `references/learner-improvement-roadmap.md`: lesson session state, real hearts/retries, recorder cleanup, and Android Expo Go QA.
2. Replace client-only seed/progress with the new backend curriculum entities and session APIs.
3. Add admin create/edit/publish forms for Lesson and Activity while preserving legacy Unit CRUD.
4. Connect pronunciation and caption AI through stable backend adapters with moderation.
5. Expand and verify the 12-unit starter course against selected textbook pages.
