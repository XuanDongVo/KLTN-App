# Rebuild Implementation Plan

Updated: 2026-07-15

## Current Progress

- Approved: all five architecture questions.
- Completed: Phases 0-2, core Phase 3, backend-only Phase 4 cutover, and Starters content expansion to 10 lessons / 80 activities.
- Real MySQL reset, Flyway migration, bundled import, TypeScript check, Expo web export, and backend tests passed.
- Still required: physical Expo Go acceptance, Mongo startup/reset, resume/idempotency hardening, and teacher content review.
- Content audit: `curriculum-seed.md` and each bundled package's `CONTENT_SOURCES.md`.

## Execution Rule

Implement one vertical slice at a time. Do not build all entities, all admin screens, or all 30 lessons before proving the first Starters slice.

## Phase 0 - Approval And Baseline

Goal: prevent accidental loss and lock architectural choices.

Tasks:

1. Confirm the decisions listed under `Approval Questions` below.
2. Capture current `git status`, frontend typecheck, backend tests, and schema snapshot.
3. Identify user-owned dirty changes and preserve them.
4. Add a rebuild feature flag; keep the current learner path available until cutover.
5. Define package names, API response envelope, error codes, and naming conventions.

Gate:

- User approves architecture decisions.
- Existing client and server baseline checks are recorded.
- No existing data or unrelated changes are deleted.

## Phase 1 - Curriculum Foundation

Goal: persist a versioned Starters curriculum in Spring.

Build first:

1. Add Flyway and the first migration.
2. Add enums: level, curriculum status, lesson status, activity type, activity stage, media type.
3. Add curriculum entities and repositories.
4. Add DTOs with public `content` separated from private `answer`.
5. Add indexes and uniqueness constraints for version/code/order.
6. Add repository and mapping tests.

Gate:

- Spring context and migration tests pass on H2/test profile and target MySQL semantics are reviewed.
- A published version cannot be modified through normal services.
- Public DTO serialization contains no private answer field.

## Phase 2 - Shared Curriculum Importer

Goal: import backend-owned lesson packages safely and repeatably.

Tasks:

1. Define JSON Schema-compatible package contracts.
2. Implement package parser and activity-type validators.
3. Implement staging report with errors and warnings.
4. Implement checksum/idempotency handling.
5. Implement publish and archive transactions.
6. Add one bundled Starters package with one unit and ten lessons.
7. Add import tests for success, duplicate, malformed order, missing answer, missing media, and unsupported type.

Gate:

- Re-importing the same package creates no duplicates.
- Invalid content cannot be published.
- Published data returns in deterministic order.

## Phase 3 - Learning Session Core

Goal: make Spring authoritative for learning behavior.

Tasks:

1. Add enrollment, session, attempt, progress, review, and reward entities.
2. Implement start-or-resume lesson service.
3. Implement activity answer validators by type.
4. Implement retry, hearts, XP, stars, mistake, and unlock policies.
5. Add idempotency to attempt and finish commands.
6. Add learner level/path/session/attempt/finish APIs.
7. Add transaction and concurrency tests.

Initial policy proposal:

- One heart is consumed on a final wrong graded attempt, not while matching is still in progress.
- Maximum two attempts for ordinary graded activities.
- XP is awarded once per activity; retry gives reduced or zero bonus.
- Three stars: 90%+, two stars: 70-89%, one star: completed below 70%.
- Next lesson unlocks after completion; level checkpoint requires all lessons in that level.

Gate:

- Duplicate requests cannot duplicate XP or attempts.
- Resume returns the correct next activity.
- Answer keys remain server-only.
- Progress survives restart and a second authenticated client.

## Phase 4 - First Mobile Cutover

Goal: run the first Starters unit completely from backend data.

Tasks:

1. Add shared `apiClient` with JWT, timeout, and normalized errors.
2. Add backend DTO types and curriculum/session services.
3. Make activity renderers consume server DTOs.
4. Replace path, lesson intro, player, feedback, completion, and basic review for the migrated level.
5. Add loading, retry, session-expired, server-unavailable, and empty states.
6. Verify Android Expo Go on the same LAN as Spring.

Gate:

- No import from `data/curriculum.ts` is used by the migrated path.
- The complete Starters path works end to end on a physical device.
- Refresh/restart resumes correctly.
- TypeScript, Expo export, and backend tests pass.

## Phase 5 - Admin Import UI

Goal: allow a trusted admin to import, inspect, and publish curriculum.

Tasks:

1. Add import upload screen.
2. Show validation errors grouped by file/unit/lesson/activity.
3. Add draft curriculum tree and learner preview.
4. Add publish/archive confirmation.
5. Protect all endpoints with admin authorization.

Gate:

- An admin can publish a valid new version without DB access.
- A learner never sees draft or invalid content.

## Phase 6 - Content Expansion

Goal: grow content only after the engine is stable.

Sequence:

1. Complete Starters to at least 10 lessons. Current seed has 1 themed path unit / 10 lessons / 80 activities.
2. Pilot and correct content/UX defects.
3. Add Movers to 5 units / 10 lessons.
4. Pilot Movers-specific activities.
5. Add Flyers to 5 units / 10 lessons.
6. Add Flyers picture-difference, information-gap, and storytelling activities only when required by approved lesson content.

Gate per level:

- Minimum 10 reviewed lessons.
- Every lesson has objective, target language, 8-15 activities, explanations, and valid media references.
- Curriculum passes importer validation and teacher/content review.

## Phase 7 - Legacy Removal

Remove only after all three levels use backend curriculum:

- Frontend seed and client answer keys.
- Legacy quiz route and random quiz APIs.
- Legacy Unit/QuestionBank admin screens.
- Old progress calculation and migrated Mongo learner history.
- Temporary feature flag and fallback branches.

Run full regression tests and retain a database backup before destructive migration.

## Approval Questions

Recommended defaults are included so implementation can begin immediately after approval:

1. Database: keep MySQL and add Flyway. Recommended: approve.
2. Security: preserve current login response, but move endpoint authorization into Spring Security `SecurityFilterChain` during the rebuild. Recommended: approve.
3. First content: create original Starters sample content from YLE objectives because the workspace currently contains only a Flyers PDF. Recommended: approve, pending later teacher review.
4. Import: support backend-bundled JSON packages first, then reuse the same importer for admin ZIP upload. Recommended: approve.
5. Migration: keep the current app behind a feature flag until the first two Starters lessons pass end to end. Recommended: approve.

Status: all five approved on 2026-07-15. Backend-only cutover and the 10-lesson Starters seed are implemented; device acceptance remains open.
