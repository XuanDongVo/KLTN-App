# Product Plan

> Historical reference. The active product scope and delivery order are in `rebuild-blueprint.md` and `implementation-plan.md`. Extended use cases in this file are deferred unless the user explicitly reactivates them.

## Product Vision

Build a Duolingo-like English learning app for children using the Flyers-level textbook as curriculum inspiration. The app should feel playful, guided, and rewarding, while still giving admins a structured way to create lessons from textbook content.

## Learner Experience

The first screen after login should be a learning path, not a list of admin-style cards.

Core learner loop:

1. Pick the next unlocked lesson on the path.
2. Complete 5-8 micro activities.
3. Receive immediate feedback after each answer.
4. Finish with XP, stars, streak update, and unlocked next step.
5. Mistakes go into review practice.

Recommended UI language:

- Bright but not chaotic: green primary, yellow rewards, blue info, red error.
- Rounded, friendly lesson nodes on a vertical path.
- Large image-first activities for kids.
- Short copy and clear buttons.
- Celebration animations for lesson complete.
- Progress visible at all times: XP, streak, hearts, unit progress.

## Main Feature Set

MVP:

- Authentication.
- Learner path with units/lessons.
- Lesson player with reusable activity components.
- Activity types:
  - listen and choose
  - image choice
  - multiple choice
  - fill blank
  - matching
  - true/false
  - speaking/read aloud placeholder
- Image Caption activity: learner captures/uploads an image, the app sends it to backend, an external AI service returns an English caption.
- XP, stars, streak, hearts.
- Unit completion and review.
- Admin curriculum editor.
- Media upload for images/audio.
- Basic admin preview for lesson/activity screens.

Next:

- Daily quests.
- Badges.
- Parent/teacher dashboard.
- Placement test.
- Spaced repetition.
- Offline cache for lesson assets.
- Audio playback and pronunciation scoring.
- AI-assisted admin drafting from textbook notes.

Full feature categories:

- Learning path and lesson progression.
- Activity engine.
- Rewards and motivation.
- Review and spaced repetition.
- Image Caption missions.
- Curriculum/admin management.
- Media management.
- Learner profile and personalization.
- Parent/teacher monitoring.
- Analytics and weak-area insights.
- Child safety and privacy.
- Offline/cache and sync.

## Layout Redesign

Learner app:

- `HomePathScreen`: top status bar, vertical lesson path, locked/unlocked states.
- `LessonIntroScreen`: lesson title, target words, estimated time.
- `LessonPlayerScreen`: one activity per screen with progress bar and bottom answer/check area.
- `LessonCompleteScreen`: XP, stars, streak, mistakes, next action.
- `ReviewScreen`: personalized review from wrong answers.
- `PhotoMissionScreen`: image capture/upload, caption result, follow-up practice.
- `ProfileScreen`: avatar, level, streak, achievements.

Admin app:

- `CurriculumDashboard`: overview of courses, units, lessons, unpublished changes.
- `UnitEditor`: unit metadata and lesson list.
- `LessonBuilder`: activity list, drag order later, preview.
- `ActivityEditor`: type-specific form.
- `ImportWizard`: convert PDF/book notes into units and draft activities.

## Roadmap

Phase 1: Stabilize

- Fix env formatting.
- Restore UTF-8 text.
- Move secrets to env variables.
- Configure Node and Java so checks can run.

Phase 2: Model

- Add Course, Lesson, Activity, LearnerLessonProgress, MistakeReview.
- Keep current Unit/QuestionBank temporarily if migration risk is high.
- Build DTOs around learner path and lesson sessions.

Phase 3: Learner UI

- Replace unit grid with path.
- Refactor quiz into `ActivityRenderer`.
- Add completion/reward screen.
- Add `ImageCaptionActivity` as a special activity shell with mocked caption response until AI service is ready.

Phase 4: Curriculum

- Seed 2-3 units manually from textbook sampling.
- Add import/admin workflow.
- Add admin support for image-caption missions and follow-up templates.

Phase 5: Polish

- Animations, sound effects, accessibility, responsive checks.

Phase 6: AI and personalization

- Connect the external image caption model service.
- Add moderation and retention rules for child-uploaded images.
- Add adaptive review and daily quests.
