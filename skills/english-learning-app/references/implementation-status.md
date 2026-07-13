# Implementation Status

Updated: 2026-07-13

## Implemented

Client:

- New visual system in `constants/Theme.ts` and reusable action/status/path components.
- Curriculum types and a 3-unit, 5-lesson, 25-activity seed in `data/curriculum.ts`.
- Persistent local learner state for XP, streak, hearts, daily goal, completion, mistakes, and caption count.
- Duolingo-like learning path with locked, unlocked, current, completed, and star states.
- Lesson intro, activity progress, immediate feedback, and lesson completion rewards.
- Activity renderers for word cards, choices, fill blank, matching, true/false, sentence builder, speaking placeholder, and Image Caption.
- Review queue and learner profile/achievement views.
- Photo Mission with camera/gallery, preview, caption loading/result, privacy copy, backend adapter, and local mock fallback.
- New onboarding/login/register flow with demo access and corrected auth response handling.
- New admin shell, curriculum dashboard, curriculum tree, and learner preview while retaining legacy Unit CRUD.
- Expo Image Picker permission config and direct vector icon dependency.
- Real speaking recorder using `expo-audio`: permission request, recording duration, stop, replay, re-record, and submit.
- Listening activities and caption playback using `expo-speech`.
- Three generated local lesson illustration sets in `assets/images/lessons/`.
- Expanded local curriculum: 3 units, 6 lessons, and 42 activities.
- Accented Vietnamese copy across the primary learner, review, profile, Photo Mission, welcome, and auth flows.
- Unit and lesson intro artwork, state-backed heart display, and answer-based XP awards.

Backend:

- `GET /learner/path` transition endpoint built from existing Unit and UnitProgress data.
- `POST /learner/image-caption` multipart endpoint with image type/8 MB checks.
- External caption model boundary through `AI_CAPTION_SERVICE_URL`; mock response when unset.
- Database, MongoDB, Cloudinary, JWT, CORS, and caption settings moved to environment-backed properties.
- `/verify/**` excluded from JWT interception.
- H2 test profile so Spring context tests do not need a real MySQL database.

## Verification

- TypeScript: `tsc --noEmit` passes.
- Expo config: Android includes `RECORD_AUDIO` and `MODIFY_AUDIO_SETTINGS`.
- Expo Web: export bundle completes with 1,156 modules and local lesson assets; dev server returns HTTP 200.
- Backend: `gradlew.bat test` passes with JDK 21 and H2.
- Dev server: `http://localhost:8083` and Expo Go LAN URL `exp://192.168.1.163:8083` during the implementation session.
- Visual screenshots were not captured because the in-app browser reported no available browser backend.
- Physical-device microphone behavior is not yet verified in this environment.

## Important Boundaries

- Mobile learning content and progress currently use the local seed so the complete learner loop works without backend data.
- Existing backend Unit/QuestionBank CRUD remains in place. The new Course/Lesson/Activity persistence migration is the next backend slice.
- Image Caption does not own the AI model. The server forwards to the configured external service or returns a development mock.
- Do not expose or restore the credentials previously stored in `application.properties`.

## Next Work

1. Add Course, Lesson, LearningActivity, lesson progress, attempt, and review persistence.
2. Make client learner APIs prefer server data and use the local seed only as offline fallback.
3. Build admin forms for Lesson and type-specific Activity editing/publishing.
4. Add moderation, signed temporary upload, retention policy, and async caption jobs.
5. Complete P0 reliability from `learner-improvement-roadmap.md`: recorder cleanup, permission recovery, real hearts/retries, and resumable lesson sessions.
6. Connect pronunciation scoring through a backend adapter; current speaking verifies and replays a real recording but does not score it.
7. Verify responsive screenshots and microphone flows on Android, iOS, and web when a browser/device is available.
