# Project Context

Updated: 2026-07-15

## Workspace

- Root: `E:\Workspace-Nlu\KLTN-APP`
- Expo client: `MyEnglishApp/`
- Spring server: `EnglishApp_Server-main/`
- Durable handoff: `skills/english-learning-app/`
- Local reference PDF: `document/Fun for Flyers Student_s Book 4th edition - Flip PDF _ FlipBuilder.pdf`

## Product Direction

- Build a child-friendly English learning app with a Duolingo-like path and short interactive activities.
- Deliver levels in order: Pre A1 Starters, A1 Movers, A2 Flyers.
- Keep curriculum, answers, progress, rewards, and unlock rules authoritative in Spring/MySQL.
- Show every lesson in a level, but unlock them sequentially.
- Keep Image Caption split across systems: Expo captures/uploads, Spring orchestrates, and another AI service produces the caption.

## Current Source Of Truth

- Product and use cases: `product-plan.md`, `feature-catalog.md`, `use-cases.md`.
- Architecture: `rebuild-blueprint.md` and `architecture.md`.
- Execution order: `implementation-plan.md`.
- Exact current state and run blockers: `implementation-status.md`.
- Curriculum map and source policy: `curriculum-seed.md` plus each package's `CONTENT_SOURCES.md`.

## Client Architecture

- Expo Router / React Native.
- Learner path: `app/(tabs)/index.tsx`.
- Backend lesson route: `app/(learner)/lesson/[lessonId].tsx`.
- Activity player: `components/learner/BackendLessonScreen.tsx`.
- Activity renderers: `components/activities/BackendActivityRenderer.tsx` plus audio/speaking components.
- API adapter: `services/curriculumService.ts`.
- Backend types: `types/backendCurriculum.ts`.
- Local `LearningContext` is limited to device concerns such as daily XP and Photo Mission count.
- There is no frontend curriculum seed or curriculum feature flag.

## Server Architecture

- Spring Boot 4, Java 21, MySQL, Flyway, and MongoDB for legacy/history features.
- Versioned curriculum domain: `src/main/java/com/example/englishapp_server/curriculum/`.
- Learner API: `curriculum/api/LearnerCurriculumController.java`.
- Importer: `curriculum/importer/`.
- Migration: `src/main/resources/db/migration/V1__create_learning_core.sql`.
- Bundled packages: `starters-v4`, `movers-v1`, and `flyers-v1` under `src/main/resources/curriculum/`.
- Fresh-database bootstrap: `CurriculumBootstrapService` imports all three once; a non-empty curriculum database is skipped.
- Static media: `src/main/resources/static/curriculum/starters-2026.2/`.
- Local services: `compose.local.yml`.

## Local Runtime

- Spring: `http://localhost:8080` and `http://<LAN-IP>:8080`.
- Expo Go must use the same LAN and an `EXPO_PUBLIC_API_URL` that points to the computer's LAN IP, not `localhost`.
- MySQL Docker container: `englishapp-mysql` on port 3306.
- Mongo is currently unavailable; see `implementation-status.md`.
- JDK 21: `C:\Users\voxua\.jdks\ms-21.0.10`.
- Node is available through `C:\nvm4w\nodejs` in this environment but may not be on every shell's PATH.

## Current Caveats

- Local MySQL was reset on 2026-07-15 and now contains only the three current curriculum versions; old users and progress were removed.
- Spring was left running on port 8080 after verifying that the second startup skips curriculum import.
- Physical Expo Go microphone and camera QA is still required.
- Curriculum has automated structural/source checks but still needs a human English-teacher review.
- Legacy admin Unit/QuestionBank screens remain and should only be removed after the new curriculum admin flow is complete.
