# Architecture Plan

> Historical design reference. The backend-owned curriculum architecture is now active. For the exact implementation state, read `implementation-status.md` first.

## Target Domain Model

Recommended new entities:

- `Course`
  - id, title, description, level, coverImageUrl
- `LearningUnit`
  - id, courseId, title, description, orderIndex, theme, imageUrl
- `Lesson`
  - id, unitId, title, objective, orderIndex, estimatedMinutes, status
- `Activity`
  - id, lessonId, type, prompt, mediaUrl, dataJson, explanation, orderIndex
- `ImageCaptionJob`
  - id, userId, activityId, imageUrl, caption, confidence, status, moderationStatus, errorMessage, createdAt, completedAt
- `VocabularyItem`
  - id, unitId or lessonId, word, meaning, phonetic, partOfSpeech, example, imageUrl, audioUrl
- `LearnerLessonProgress`
  - userId, lessonId, status, score, stars, xp, completedAt
- `LearnerActivityAttempt`
  - userId, activityId, selectedAnswer, correct, durationMs, createdAt
- `MistakeReviewItem`
  - userId, activityId, dueAt, strength, lastResult
- `RewardLedger`
  - userId, xpDelta, reason, createdAt

Keep or migrate:

- Existing `Unit` can become `LearningUnit`.
- Existing `QuestionBank` can become `Activity`.
- Existing `UnitImage`/`UnitVocabulary` can feed lesson content and vocabulary.

## API Shape

Learner:

- `GET /api/v1/learner/path`
- `GET /learner/lessons/{lessonId}`
- `POST /learner/lessons/{lessonId}/start`
- `POST /learner/activities/{activityId}/answer`
- `POST /learner/image-caption/jobs`
- `GET /learner/image-caption/jobs/{jobId}`
- `POST /learner/lessons/{lessonId}/finish`
- `GET /learner/review`
- `GET /learner/profile`

Admin:

- `GET/POST/PUT /admin/courses`
- `GET/POST/PUT /admin/units`
- `GET/POST/PUT /admin/lessons`
- `GET/POST/PUT /admin/activities`
- `GET /admin/image-caption/jobs`
- `POST /admin/import/curriculum-draft`
- `POST /admin/lessons/{lessonId}/publish`

AI integration boundary:

- `POST /internal/ai/image-caption` is not owned by this app if the AI model is built elsewhere.
- This app should call an external URL such as `AI_CAPTION_SERVICE_URL`.
- The backend should hide external AI details from the mobile app.
- Use a mock adapter until the AI service exists.

## Frontend Structure

Recommended folders:

- `app/(auth)/`
- `app/(learner)/home.tsx`
- `app/(learner)/lesson/[lessonId].tsx`
- `app/(learner)/lesson-complete.tsx`
- `app/(learner)/photo-mission.tsx`
- `app/(learner)/review.tsx`
- `app/(admin)/curriculum/`
- `components/learner/`
- `components/activities/`
- `components/admin/`
- `services/apiClient.ts`
- `services/learnerApi.ts`
- `services/adminApi.ts`
- `services/imageCaptionApi.ts`
- `types/curriculum.ts`
- `types/activity.ts`

## Activity Renderer Contract

Use one common contract so lesson player stays simple:

```ts
type ActivityType =
  | 'IMAGE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'FILL_IN_BLANK'
  | 'MATCHING'
  | 'TRUE_FALSE'
  | 'LISTEN_CHOOSE'
  | 'SPEAK_REPEAT'
  | 'SENTENCE_BUILDER'
  | 'STORY_COMPREHENSION'
  | 'IMAGE_CAPTION';

type Activity = {
  id: number;
  type: ActivityType;
  prompt: string;
  mediaUrl?: string;
  data: Record<string, unknown>;
  explanation?: string;
};
```

Each renderer returns an answer result:

```ts
type AnswerResult = {
  correct: boolean;
  selectedAnswer: unknown;
  correctAnswer?: unknown;
};
```

## Image Caption Contract

Frontend request:

```ts
type ImageCaptionRequest = {
  activityId?: number;
  localImageUri: string;
  source: 'camera' | 'gallery';
};
```

Backend job:

```ts
type ImageCaptionJob = {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  imageUrl?: string;
  caption?: string;
  confidence?: number;
  moderationStatus?: 'PENDING' | 'SAFE' | 'UNSAFE';
  errorMessage?: string;
};
```

External AI response:

```ts
type ExternalCaptionResponse = {
  caption: string;
  confidence?: number;
  objects?: string[];
  language?: 'en';
};
```

MVP can return a mocked caption from backend while the AI model service is being built elsewhere.

## Child Safety Architecture

- Store raw uploaded images only when needed.
- Prefer signed URLs and short retention.
- Keep caption result and derived vocabulary for learning history.
- Add moderation status before displaying generated caption.
- Log AI failures without exposing internal errors to children.
- Add parent/admin visibility for usage metadata, not raw private images by default.

## Implementation Strategy

- The learner path now uses only the versioned `/api/v1` curriculum/session APIs.
- The frontend seed and cutover feature flag have been removed.
- Keep old admin screens until new curriculum administration is ready.
- Add future levels as immutable backend-imported packages. Starters, Movers and Flyers packages now exist.
- Build Image Caption with a mock adapter first: camera/gallery -> upload -> mock caption -> follow-up activity.

## Implementation Checkpoint

Completed on 2026-07-13:

- Client curriculum/activity contracts, local seed, persistent learner state, path, lesson player, rewards, review, profile, and admin curriculum preview.
- Camera/gallery Image Caption activity with backend-first and local-mock fallback.
- Backend transition path endpoint and synchronous multipart caption endpoint.

Current checkpoint (2026-07-15):

- Persistent curriculum, lesson, activity, session, attempt, and progress entities are active.
- Server-authoritative sessions, answer validation, rewards, and sequential unlock are active.
- Starters, Movers and Flyers each contain 5 units / 25 lessons / 200 activities.
- Fresh databases bootstrap all three packages once; non-empty databases are not automatically upgraded.
- Async ImageCaptionJob persistence, signed temporary storage, moderation, and retention remain pending.
