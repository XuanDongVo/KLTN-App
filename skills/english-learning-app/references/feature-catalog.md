# Feature Catalog

> Long-term inventory only. Do not implement secondary or extended features during the current rebuild. The active scope is defined in `rebuild-blueprint.md`.

This file lists the full product scope for the children's English learning app. It is intentionally broader than MVP so future sessions can choose what to build without rethinking the whole product.

## Core Use Cases

These are required for the main learning product.

1. Account and role routing
   - Register, login, logout.
   - Route learner/admin/parent by role.
   - Store JWT and basic profile.

2. Learner home path
   - Duolingo-like vertical learning path.
   - Units, lessons, locked/unlocked states.
   - Highlight next recommended lesson.
   - Show XP, streak, hearts, stars, level, and daily goal.

3. Lesson intro
   - Show lesson title, objective, vocabulary preview, estimated time.
   - Show reward preview: XP and stars.

4. Lesson player
   - One activity per screen.
   - Progress bar.
   - Large prompt/image area.
   - Bottom answer/check area.
   - Immediate feedback after each answer.
   - Explanation shown after wrong answer or lesson end.

5. Activity types
   - Image choice: choose image or word from a picture.
   - Multiple choice: choose the correct answer.
   - Fill in blank: type missing word.
   - Matching: connect word/picture/sentence pairs.
   - True/false: check whether caption matches image.
   - Listen and choose: play audio, choose word/image.
   - Speak repeat: record or placeholder for pronunciation practice.
   - Sentence builder: arrange words into a sentence.
   - Word card: learn vocabulary with image/audio/example.
   - Story comprehension: read/listen to short story and answer.
   - Image Caption: child captures/uploads image, external AI returns English caption.

6. Lesson completion
   - Calculate XP, stars, accuracy, and time.
   - Unlock next lesson.
   - Record mistakes.
   - Celebration screen.
   - CTA: next lesson, review mistakes, back home.

7. Review and spaced repetition
   - Collect wrong answers.
   - Build short review sessions.
   - Increase/decrease review strength.
   - Schedule review later.

8. Motivation system
   - XP.
   - Stars per lesson.
   - Streak.
   - Hearts/lives.
   - Daily quests.
   - Badges/achievements.
   - Level progress.

9. Curriculum management
   - Courses.
   - Units.
   - Lessons.
   - Activities.
   - Vocabulary.
   - Grammar focus.
   - Media.
   - Publish/unpublish.
   - Preview as learner.

10. Progress tracking
   - Learner progress by unit/lesson/activity.
   - Attempts, accuracy, time spent.
   - Weak vocabulary and grammar.
   - Admin dashboard.
   - Parent/teacher dashboard later.

## Secondary Use Cases

These are important but can come after the first learner loop works.

1. Parent/teacher observer
   - Link child account.
   - View progress summary.
   - View streak, completed lessons, weak areas.
   - Suggest next practice.

2. Placement and personalization
   - Short placement test.
   - Recommend starting unit.
   - Adaptive review frequency.
   - Adjust difficulty.

3. Notifications
   - Daily reminder.
   - Streak reminder.
   - Parent summary.

4. Offline support
   - Cache lesson content and images.
   - Sync attempts later.

5. Accessibility and child safety
   - Large touch targets.
   - Simple language.
   - No dark patterns.
   - Safe camera permission flow.
   - No public sharing of child photos.
   - Avoid storing raw child images unless explicitly required.

6. Audio and pronunciation
   - Word audio.
   - Sentence audio.
   - Record-and-compare later.
   - Speaking confidence score later.

7. AI assisted admin (not need now)
   - Generate draft questions from lesson objective.
   - Generate distractors.
   - Generate hints/explanations.
   - Suggest vocabulary from textbook excerpt.
   - Must require admin review before publishing.

## Image Caption Feature

Goal:

- Let the child take or upload a photo.
- Send image to backend.
- Backend stores or temporarily forwards the image to an external AI caption service.
- External AI returns an English caption.
- App uses the caption for learning feedback and optional follow-up activities.

What this app owns:

- Camera/image picker UI.
- Permission handling.
- Upload image to backend or Cloudinary.
- Caption request API call.
- Loading, success, error states.
- Display returned caption.
- Save caption result if needed.
- Convert caption into activities: repeat sentence, choose vocabulary, true/false, fill blank.

What external AI service owns:

- Computer vision model.
- Image understanding.
- Caption generation.
- Optional confidence score.
- Optional detected objects/vocabulary.

Child-safe requirements:

- Ask permission clearly.
- Do not expose image publicly.
- Prefer temporary signed upload URLs.
- Store only caption and metadata by default.
- If raw image retention is needed, add retention policy and admin/parent consent.
- Add content moderation hook before showing caption.

Suggested flow:

1. Learner opens "Photo Mission".
2. Learner takes/selects image.
3. App previews image and asks to continue.
4. App uploads image.
5. Backend creates `ImageCaptionJob`.
6. Backend calls external AI caption service.
7. App polls or waits for response.
8. App displays caption: "This is a small dog."
9. App asks follow-up: repeat, choose key word, or fill blank.

MVP version:

- Use image picker/upload only.
- Synchronous API request if AI service is fast.
- Display caption as text.
- Store result in learner history.

Later version:

- Async job status.
- Moderation.
- Object vocabulary extraction.
- Voice playback of caption.
- Speaking practice from generated caption.
