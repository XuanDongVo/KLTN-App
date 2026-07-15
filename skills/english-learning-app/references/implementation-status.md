# Implementation Status

Updated: 2026-07-15

## Current Release Candidate

- Bundled bootstrap curricula: `STARTERS_2026.4`, `MOVERS_2026.1`, `FLYERS_2026.1`.
- Live MySQL curricula: `STARTERS_2026.5`, `MOVERS_2026.1`, `FLYERS_2026.1`; `STARTERS_2026.4` is archived.
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
- Added protected Curriculum CMS APIs under `/api/v1/admin/curriculum`.
- Added draft cloning, version/unit/lesson/activity CRUD, ordered reordering, preview, validation, and transactional publish.
- Publishing archives the previous published version for the same level; published and archived content cannot be edited.
- Added `scripts/set-single-admin.sql` so one registered account can be promoted while all other accounts remain learners.
- Removed the old Unit/QuestionBank admin controller, service, repository, and interceptor.
- Added Flyway V2 for account status/timestamps, Cloudinary media registry, and admin audit logs.
- Added admin dashboard/user/media APIs with search, pagination, learner detail, level progress, recent sessions, and lock/unlock.
- Locked users are rejected both at login and by the JWT filter; admin accounts cannot be locked through these APIs.
- Added signed Cloudinary upload and server-side asset registration with JPEG/PNG/WebP and 5 MB validation.
- Added guarded curriculum-version deletion: drafts can be discarded; archived versions can be deleted only when no session, progress, or attempt references remain; published versions cannot be deleted.
- Added strict content-code validation that rejects blank, malformed, and `NEW_*` unit/lesson/activity codes.

## Client Completed

- Home now loads all three backend levels.
- Added compact Starters/Movers/Flyers controls with lock and progress state.
- A locked level can be selected to preview its 5 units and 25 lesson names.
- Unit accordions still display all lessons while limiting the expanded section to one unit.
- Lesson navigation carries the selected level, so Movers/Flyers lesson lookup does not fall back to Starters.
- Review, profile and admin summaries use the most recently selected level.
- The selected level is persisted in AsyncStorage.
- Rebuilt the admin area around one focused Curriculum CMS for Starters, Movers, and Flyers.
- Added level/version selectors, unit and lesson accordions, typed activity editors, preview, validation feedback, publish confirmation, and reorder/delete controls.
- Added safe-area handling for the admin shell, drawer, header, and editor modal; compact controls wrap on narrow phones.
- Replaced the legacy admin dashboard and removed all old Unit/QuestionBank screens and client services.
- Added dashboard learner/session statistics and recent audit activity.
- Added responsive `Người học` list/detail UI with search, filters, pagination, progress, sessions, and lock/unlock.
- Added `Thư viện ảnh` and Cloudinary upload directly inside unit/lesson image editors while preserving manual URL input.
- New CMS forms now start empty, show examples only as placeholders, and require valid codes, content, numbers, and media before enabling create.
- Publish now preserves the validation report and refuses to continue until the complete draft passes preflight validation.
- Draft/archive deletion now uses a dependency check and exact version-code confirmation dialog.
- Replaced critical `Alert.alert` confirmations with a cross-platform modal because `react-native-web` implements `Alert.alert()` as a no-op; create draft, publish, content delete, dependency errors, and API errors now work visibly on Web and Expo Go.
- Existing invalid `DRAFT` and `NEW_*` codes now show inline correction messages instead of silently leaving the save button disabled.

## Verification Completed

- Targeted `CurriculumVerticalSliceTests`: passed.
- Verified bootstrap imports exactly 3 versions, 15 units, 75 lessons and 600 activities.
- Verified a second bootstrap call skips with no duplicate rows.
- Verified all levels expose 5 units and 25 lessons.
- Verified Movers and Flyers lock state and server-side denial.
- Verified answer keys remain absent from public session DTOs.
- Verified completing lesson 1 unlocks lesson 2.
- Backend main and test Java compilation passed under JDK 21.
- `AdminCurriculumServiceTests` passed for draft cloning, isolation, validation, publish/archive, learner-path cutover, immutable published versions, one-draft-per-level, nested content deletion, placeholder-code rejection, and draft-version deletion.
- TypeScript `tsc --noEmit` passed after the admin rebuild.
- `AdminOperationsServiceTests` and Flyway V2 migration tests passed.
- Expo web export passed with the new admin routes and image picker.
- Local MySQL `englishapp` was dropped and recreated on 2026-07-15; all legacy users, progress and curriculum rows were removed.
- Flyway V1 rebuilt the schema successfully.
- The first real startup imported `STARTERS_2026.4`, `MOVERS_2026.1`, and `FLYERS_2026.1`.
- Real MySQL now has one admin and one learner; the existing session and progress row survived migration/publish.
- A second real startup logged `Skipped curriculum bootstrap because 3 version(s) already exist`; counts remained unchanged.
- A database dump exists at `EnglishApp_Server-main/backups/englishapp-before-admin-20260715-183425.sql` and is gitignored.
- Flyway V2 applied successfully to real MySQL.
- Real admin API validated and published `STARTERS_2026.5`; `STARTERS_2026.4` was archived and learner levels now resolve to `STARTERS_2026.5`.
- Cloudinary smoke upload succeeded and media asset id 1 is registered with an audit record.
- Spring is running on port 8080 after deployment verification.
- Spring was restarted on port 8080 with the guarded deletion and publish validation fixes on 2026-07-15.
- Real MySQL API verification created and deleted a temporary draft unit successfully (`6 -> 7 -> 6`) and verified draft version-code update/restore.
- Real delete checks show `STARTERS_DRAFT_20260715215827` is deletable; archived `STARTERS_2026.4` is intentionally blocked by 1 session, 1 progress row, and 8 attempts.
- Legacy Starters v1/v2/v3 source and build artifacts were deleted; only `starters-v4`, `movers-v1`, and `flyers-v1` remain.

## Not Verified In This Change

- Physical Android checks for the admin drawer, CMS editor, microphone, camera and image rendering remain required.
- The 75-lesson content still needs a teacher review for vocabulary scope, ambiguity and age progression.

## Next Work

1. Log out and log in again on Expo Go so the admin JWT and `lastLoginAt` refresh.
2. QA user search/detail/lock flow, Cloudinary picker, drawer, keyboard and modal safe area on Android.
3. QA all three learner paths and lesson activities on Expo Go Android.
4. Conduct teacher review, create a new draft, then publish corrections under the next immutable version code.
5. Add reference-aware media cleanup only after archived/published URL usage can be proven safe.

## Important Boundaries

- Bootstrap is for a fresh clone/database, not for upgrading existing installations.
- Legacy Unit/QuestionBank APIs do not feed the learner path.
- Speaking records/replays audio; pronunciation scoring belongs to a separate AI service.
- Image Caption remains Expo capture/upload -> Spring orchestration -> external AI caption service.
