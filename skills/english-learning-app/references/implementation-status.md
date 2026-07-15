# Implementation Status

Updated: 2026-07-15

## Current Release Candidate

- Bundled curricula: `STARTERS_2026.4`, `MOVERS_2026.1`, `FLYERS_2026.1`.
- Total bundled content: 15 units, 75 lessons, 600 activities.
- Every level contains 5 units; every unit contains 5 lessons; every lesson contains 8 activities.
- Curriculum, answer keys, sessions, progress, XP, hearts, stars and unlock rules are backend-owned.

## Backend Completed

- Added `CurriculumBootstrapService`, which imports all bundled packages only when `curriculum_versions` is empty.
- Replaced the old every-start Starters seed runner with `CurriculumBootstrapRunner`.
- Bootstrap is transactional and skips a non-empty curriculum database.
- Added learner-aware `GET /api/v1/learner/levels` summaries with counts, completion and lock state.
- Added cross-level locking: Starters -> Movers -> Flyers.
- Rejects attempts to start a locked level, locked lesson or lesson from an archived curriculum version.
- Kept checksum-idempotent immutable package import and server-only answer keys.
- Added reproducible curriculum generation in `scripts/build-curriculum-packages.mjs`.

## Client Completed

- Home now loads all three backend levels.
- Added compact Starters/Movers/Flyers controls with lock and progress state.
- A locked level can be selected to preview its 5 units and 25 lesson names.
- Unit accordions still display all lessons while limiting the expanded section to one unit.
- Lesson navigation carries the selected level, so Movers/Flyers lesson lookup does not fall back to Starters.
- Review, profile and admin summaries use the most recently selected level.
- The selected level is persisted in AsyncStorage.

## Verification Completed

- Targeted `CurriculumVerticalSliceTests`: passed.
- Verified bootstrap imports exactly 3 versions, 15 units, 75 lessons and 600 activities.
- Verified a second bootstrap call skips with no duplicate rows.
- Verified all levels expose 5 units and 25 lessons.
- Verified Movers and Flyers lock state and server-side denial.
- Verified answer keys remain absent from public session DTOs.
- Verified completing lesson 1 unlocks lesson 2.
- Backend main and test Java compilation passed under JDK 21.
- Local MySQL `englishapp` was dropped and recreated on 2026-07-15; all legacy users, progress and curriculum rows were removed.
- Flyway V1 rebuilt the schema successfully.
- The first real startup imported `STARTERS_2026.4`, `MOVERS_2026.1`, and `FLYERS_2026.1`.
- Real MySQL counts: 3 curriculum versions, 15 units, 75 lessons, 600 activities and 0 users.
- A second real startup logged `Skipped curriculum bootstrap because 3 version(s) already exist`; counts remained unchanged.
- Spring is running on port 8080 after the verification restart.
- Legacy Starters v1/v2/v3 source and build artifacts were deleted; only `starters-v4`, `movers-v1`, and `flyers-v1` remain.

## Not Verified In This Change

- TypeScript/Expo checks were not run because `node` is not available in the current shell PATH.
- Physical Android checks for layout, microphone, camera and image rendering remain required.
- The 75-lesson content still needs a teacher review for vocabulary scope, ambiguity and age progression.

## Next Work

1. Register a fresh learner account because the MySQL reset removed all previous users.
2. Run `npm exec tsc -- --noEmit` and Expo export when Node is available.
3. QA all three paths and lesson activities on Expo Go Android.
4. Conduct teacher review, then publish corrections under new immutable version codes.
5. Add a protected admin package-import workflow for upgrades to non-empty databases.

## Important Boundaries

- Bootstrap is for a fresh clone/database, not for upgrading existing installations.
- Legacy Unit/QuestionBank APIs do not feed the learner path.
- Speaking records/replays audio; pronunciation scoring belongs to a separate AI service.
- Image Caption remains Expo capture/upload -> Spring orchestration -> external AI caption service.
