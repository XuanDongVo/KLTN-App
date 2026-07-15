# Backend-First Rebuild Blueprint

Updated: 2026-07-15

## Table Of Contents

1. Decision and scope
2. Target product hierarchy
3. Core use cases
4. Curriculum scale and lesson template
5. Reuse, rebuild, and retire decisions
6. Backend domain model
7. Curriculum import and publishing
8. API boundary
9. Client architecture
10. Deferred scope
11. Definition of done

## 1. Decision And Scope

Rebuild the curriculum and learning core. Do not delete the repository or rewrite reusable integrations without evidence.

The canonical curriculum must live in Spring/MySQL. React Native must not own course structure, published content, answer keys, XP rules, unlock rules, or completion decisions.

Develop levels in this order:

1. `PRE_A1_STARTERS`
2. `A1_MOVERS`
3. `A2_FLYERS`

The current delivery scope contains only:

- Authentication compatibility.
- Learner level/path/lesson flow.
- Ordered activities and immediate feedback.
- Server-owned attempts, XP, stars, hearts, progress, unlocks, and basic mistake review.
- Admin curriculum package import, validation, preview, publish, and archive.
- Image/audio media references needed by lessons.

## 2. Target Product Hierarchy

```text
Program: Cambridge Young Learners
  -> CourseLevel: Starters | Movers | Flyers
    -> CurriculumVersion
      -> LearningUnit
        -> Lesson
          -> LearningActivity (ordered and grouped by stage)
```

Activity stages:

- `WARM_UP`
- `LEARN`
- `LISTEN`
- `PRACTICE`
- `SPEAK`
- `REVIEW`
- `EXIT`

## 3. Core Use Cases

Learner:

1. Log in and open the current level.
2. View the published learning path and next unlocked lesson.
3. Start or resume a server-created lesson session.
4. Complete ordered activities one at a time.
5. Receive server-validated feedback and a retry when allowed.
6. Finish the session and receive server-calculated XP, stars, hearts, mistakes, and unlock state.
7. Open a basic review session generated from mistakes.
8. Complete a level checkpoint and unlock the next level when eligibility rules pass.

Admin:

1. Upload a curriculum JSON/ZIP package.
2. View structural, content, answer, media, and ordering validation errors.
3. Preview the imported draft as a learner path and lesson.
4. Publish a ready curriculum version.
5. Archive or roll back to an earlier published version.

Backend:

1. Serve only published curriculum to learners.
2. Keep private answer data out of learner DTOs.
3. Create resumable lesson sessions.
4. validate attempts idempotently.
5. Calculate rewards and unlocks transactionally.

## 4. Curriculum Scale And Lesson Template

Initial target:

| Level | Units | Lessons | Activities per lesson | Total activities |
|---|---:|---:|---:|---:|
| Starters | 5 | 10 | 8-12 | 80-120 |
| Movers | 5 | 10 | 9-13 | 90-130 |
| Flyers | 5 | 10 | 10-15 | 100-150 |

Each level is a separate delivery milestone. Do not author 30 lessons before the engine and first two Starters lessons work end to end.

Default lesson sequence:

1. One warm-up.
2. Two or three vocabulary discoveries.
3. One or two listening activities.
4. Two or three controlled practice activities.
5. One speaking activity where appropriate.
6. One review or contextual activity.
7. One exit check.

Initial lesson topics:

- Starters: Hello and Me; Family; Colors and Toys; Numbers and Age; School; Classroom Actions; Animals; Body; Food; Home and Review.
- Movers: Daily Routine; Time; Town; Directions; Weather; Clothes; Hobbies; Sports; Past Events; Holiday Story.
- Flyers: Friends and Personality; School Projects; Technology; Health; Environment; Travel; Picture Differences; Information Gap; Storytelling; Final Challenge.

## 5. Reuse, Rebuild, And Retire

Reuse:

- `User`, registration/login contract where compatible.
- Cloudinary/media upload boundary.
- Image Caption adapter, without expanding it now.
- Expo Router route shell and learner visual system.
- Existing activity components that can consume server DTOs.
- `expo-audio` recording and `expo-speech` playback.

Rebuild:

- Curriculum entities and repositories.
- Learner path API.
- Lesson session, attempts, progress, rewards, unlocks, and review.
- Admin curriculum import/publish.
- Mobile API client, server DTO types, loading/error states, and progress state.

Retired at backend-only cutover:

- Canonical `MyEnglishApp/data/curriculum.ts` seed (deleted).
- Client-owned XP and unlock calculation in `LearningContext`.

Retire after the remaining compatibility work is complete:

- Random unit quiz flow and legacy learner quiz screen.
- `UnitProgress` as the sole progress representation.
- `QuestionBank.questionData` as the only curriculum contract.
- Mongo learner history once equivalent relational attempts exist.

## 6. Backend Domain Model

Curriculum:

- `Program(id, code, title)`
- `CourseLevel(id, programId, code, title, orderIndex, status)`
- `CurriculumVersion(id, levelId, version, status, checksum, publishedAt)`
- `LearningUnit(id, versionId, code, title, objective, orderIndex, theme, coverMediaId)`
- `Lesson(id, unitId, code, title, objective, orderIndex, estimatedMinutes, status)`
- `LearningActivity(id, lessonId, code, type, stage, prompt, instruction, contentJson, answerJson, explanation, xp, orderIndex)`
- `VocabularyItem(id, lessonId, word, meaning, phonetic, partOfSpeech, example, imageMediaId, audioMediaId)`
- `MediaAsset(id, type, storageKey, publicUrl, mimeType, checksum, status)`

Learning:

- `LearnerEnrollment(id, userId, levelId, status, startedAt, completedAt)`
- `LessonSession(id, userId, lessonId, curriculumVersionId, status, currentActivityIndex, startedAt, finishedAt)`
- `ActivityAttempt(id, sessionId, activityId, attemptNo, answerJson, correct, xpAwarded, durationMs, idempotencyKey, createdAt)`
- `LessonProgress(id, userId, lessonId, status, bestScore, stars, attempts, completedAt)`
- `ReviewItem(id, userId, activityId, status, strength, dueAt, lastResult)`
- `RewardTransaction(id, userId, sessionId, type, amount, idempotencyKey, createdAt)`

Use enums and constrained columns for lifecycle state. Keep activity-specific payloads in JSON, but keep identity, ordering, status, relationships, rewards, and attempts relational.

## 7. Curriculum Import And Publishing

Package shape:

```text
curriculum-package.zip
  manifest.json
  levels/starters/units/*.json
  levels/movers/units/*.json
  levels/flyers/units/*.json
  media/images/*
  media/audio/*
```

Pipeline:

```text
Upload -> staging import -> schema validation -> semantic validation
       -> media validation -> preview -> publish immutable version
```

Required validation:

- Unique codes and contiguous ordering.
- Valid level/unit/lesson/activity relationships.
- Supported activity type and stage.
- Required fields for each activity type.
- Private answer present for graded activities.
- Referenced media exists and has an allowed MIME type.
- Minimum and maximum lesson activity counts.
- Checksum and idempotency prevent duplicate imports.

Statuses: `DRAFT`, `VALIDATING`, `INVALID`, `READY`, `PUBLISHED`, `ARCHIVED`.

Use one importer service for both bundled backend seed packages and admin uploads. Never maintain two import rules.

## 8. API Boundary

Learner endpoints:

- `GET /api/v1/learner/levels`
- `GET /api/v1/learner/path?level=PRE_A1_STARTERS`
- `POST /api/v1/lessons/{lessonId}/sessions`
- `GET /api/v1/sessions/{sessionId}`
- `POST /api/v1/sessions/{sessionId}/attempts`
- `POST /api/v1/sessions/{sessionId}/finish`
- `GET /api/v1/learner/review`
- `POST /api/v1/review/sessions`

Admin endpoints:

- `POST /api/v1/admin/curriculum-imports`
- `GET /api/v1/admin/curriculum-imports/{id}`
- `GET /api/v1/admin/curriculum-imports/{id}/report`
- `POST /api/v1/admin/curriculum-versions/{id}/publish`
- `POST /api/v1/admin/curriculum-versions/{id}/archive`

Attempt responses include `correct`, stable feedback code, explanation/hint when allowed, XP awarded, hearts remaining, and next action. They do not return the complete private answer object.

## 9. Client Architecture

Keep route components thin:

- `services/apiClient.ts`: base URL, JWT, timeout, normalized errors.
- `services/curriculumApi.ts`: levels and path.
- `services/lessonSessionApi.ts`: start/resume, attempt, finish.
- `types/api/`: DTOs matching backend contracts.
- `components/activities/`: pure server-driven renderers.
- `context/` or query cache: authenticated profile and active session only, not canonical curriculum rules.

During migration, use a single explicit feature flag such as `EXPO_PUBLIC_BACKEND_CURRICULUM=true`. Remove the flag and frontend seed after acceptance; do not keep dual behavior indefinitely.

## 10. Deferred Scope

Do not implement now:

- Parent or teacher dashboards.
- Placement test and adaptive level selection.
- Notifications.
- Offline attempt synchronization.
- Advanced analytics.
- Daily quests, badge systems, avatar economy, or monetization.
- AI-assisted curriculum authoring.
- Pronunciation scoring.
- New Image Caption capabilities, moderation workflow, or async jobs.

Existing reusable code for audio and Image Caption may remain, but it must not block the core rebuild.

## 11. Definition Of Done

The first rebuild milestone is complete when:

- One Starters unit with two lessons is imported through the shared importer.
- The mobile app loads that unit and its lessons only from Spring.
- Each lesson has 8-12 ordered activities and no answer key in learner DTOs.
- Start, attempt, retry, finish, XP, stars, hearts, mistakes, resume, and unlock are server-owned and tested.
- Reloading or logging in on another device restores progress.
- Existing frontend seed is not used for the migrated path.
