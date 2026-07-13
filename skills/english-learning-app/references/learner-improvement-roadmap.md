# Learner Experience Improvement Roadmap

Updated: 2026-07-13

## Goal

Turn the current learner MVP into a reliable, image-first English course for children. The core loop must work on a real phone in Expo Go before expanding admin CRUD or adding more AI features.

## Review Findings

### Resolved in the current slice

- Speaking was only a visual placeholder. It now requests microphone permission, records real audio, shows duration, stops safely, supports replay/re-record, and submits the recording URI.
- `app.json` did not enable a real audio module. The app now uses `expo-audio` with Android recording permissions and a Vietnamese iOS permission message.
- There was no working listening activity despite `LISTEN_CHOOSE` existing in the type contract. Listening now uses English text-to-speech through `expo-speech`.
- The seed was only 25 short activities across 5 lessons. It now contains 42 activities across 6 lessons with a more deliberate see-listen-practice-speak sequence.
- Lesson media depended on unrelated remote stock photos. Three consistent local illustration sets now cover greetings, classroom objects, and animals.
- Lesson completion awarded the full lesson XP even after wrong answers. XP now comes from correct activities.
- The lesson header displayed a hard-coded heart count. It now reads learner state.
- Main learner, review, profile, Photo Mission, welcome, and auth copy has been restored to accented Vietnamese.
- Photo Mission captions can now be read aloud in English.

### Remaining product gaps

- Speaking verifies that a recording exists; it does not yet score pronunciation or transcribe speech.
- Hearts are displayed but are not consumed, refilled, or connected to retry rules.
- Wrong matching pairs currently finish the activity too quickly instead of giving an in-activity retry.
- Review is answer reveal/removal, not a true spaced-repetition lesson session.
- Progress and curriculum remain local-first; server-authoritative lesson sessions are not implemented.
- TTS voice quality depends on voices installed on the device. Curated human audio files are still needed for production lessons.
- Generated PNG illustrations are 1.7-2.4 MB each and should be resized/compressed before a production release.
- No automated screenshot or physical-device test suite exists yet.

## Next Delivery Plan

## P0 - Real Device Reliability

Target: the complete first unit works repeatedly on Android Expo Go and at least one iOS device.

1. Microphone device QA
   - Test first permission request, denial, permanent denial, and permission recovery.
   - Test start/stop/re-record/replay on Android and iOS.
   - Stop recorder/player/TTS on route exit and app background.
   - Add a visible route to system settings after permanent denial.

2. Lesson session correctness
   - Introduce per-activity attempt state rather than only final lesson totals.
   - Consume one heart only after a confirmed wrong answer.
   - Allow a retry inside matching and speaking activities without freezing the lesson.
   - Persist current lesson/index so an interrupted child can resume.
   - Award XP exactly once per completed activity and prevent replay farming.

3. Expo Go and API reliability
   - Keep `EXPO_PUBLIC_API_URL` on the LAN address, never `localhost`, for a physical phone.
   - Add an API health check and a child-friendly offline state.
   - Verify phone and server are on the same network and Windows Firewall allows port 8080.
   - Add request timeout, retry, and offline fallback rules to a shared API client.

Acceptance criteria:

- A child can finish `u1-l1` twice without a crash or stuck recorder.
- Denying microphone permission never blocks the rest of the lesson.
- Leaving a speaking activity releases microphone use immediately.
- XP, mistakes, hearts, and resume position remain correct after restarting the app.

## P1 - Curriculum Depth And Learning Quality

Target: a meaningful 4-week starter course instead of a feature demo.

1. Expand the course to 12 units
   - Greetings and introductions.
   - School objects and classroom actions.
   - Family and friends.
   - Numbers, colors, and shapes.
   - Animals and abilities.
   - Food and preferences.
   - Body and health habits.
   - Home and rooms.
   - Clothes and weather.
   - Daily routines and time.
   - Places and directions.
   - Review story and final mission.

2. Give each unit a learning pattern
   - Lesson A: 6-8 target vocabulary items.
   - Lesson B: one sentence pattern and guided listening.
   - Lesson C: mixed practice and speaking.
   - Unit review: adaptive mistakes plus a short story.
   - Unit mission: image caption, scavenger hunt, or voice challenge.

3. Improve activity quality
   - Add picture-to-word cards with separate object crops.
   - Add minimal-pair listening and phonics activities.
   - Add story comprehension with 3-4 illustrated panels.
   - Add partial hints after the first wrong attempt.
   - Add positive sound/haptic feedback with a parent mute setting.
   - Replace device TTS with curated native-speaker audio for published lessons.

Acceptance criteria:

- Every lesson has a stated objective, 5-8 target items, 7-10 activities, explanations, and at least two media interactions.
- Every unit includes listening, speaking, reading, vocabulary, review, and one playful mission.
- Content is checked against the selected textbook pages and reviewed by an English teacher.

## P1 - Pronunciation Service Boundary

Target: connect the future AI model without coupling it to lesson UI.

Recommended contract:

```ts
type PronunciationAttempt = {
  activityId: string;
  expectedText: string;
  recordingUri: string;
};

type PronunciationResult = {
  transcript?: string;
  overallScore: number;
  wordScores?: Array<{ word: string; score: number }>;
  feedbackCode: 'GREAT' | 'TRY_SLOWER' | 'SPEAK_LOUDER' | 'TRY_AGAIN';
};
```

- Mobile uploads multipart audio to the Spring backend.
- Spring validates type/size and forwards to the separately owned AI service.
- Mobile renders only stable feedback codes and scores, never raw model errors.
- Keep a development adapter that accepts recordings without inventing a fake score.

## P2 - Server-Authoritative Learning

Target: progress follows the child across devices and admin content can be published safely.

- Add `Course`, `Lesson`, `LearningActivity`, `VocabularyItem`, `LessonSession`, `ActivityAttempt`, `MistakeReviewItem`, and `RewardLedger` persistence.
- Add lesson start, answer, finish, resume, review, and profile endpoints.
- Validate answers and XP on the server.
- Version published curriculum so active sessions are stable during edits.
- Cache downloaded lesson JSON and media for offline play, then sync attempts later.
- Add analytics events for start, answer, abandon, retry, finish, and media failure.

Acceptance criteria:

- Reinstalling or changing devices restores path progress after login.
- Tampering with client XP or answers cannot change server totals.
- Published lesson edits do not corrupt sessions already in progress.

## P2 - Motivation Without Pressure

- Daily goals based on minutes and completed activities, not only XP.
- Gentle streak repair controlled by a parent; no fear-based copy.
- Badges for effort, review, speaking, and curiosity.
- Weekly quests with one learning goal and one creative mission.
- Avatar accessories earned by learning, with no real-money store for children.
- Celebration animation and sound that can be reduced or muted.

## P3 - Parent, Teacher, Safety, And Accessibility

- Parent dashboard: time learned, skills practiced, weak areas, and weekly summary.
- Parent controls: daily time limit, audio toggle, camera/microphone consent, data deletion.
- Teacher groups: assign units, view completion, export aggregate results.
- Image Caption: moderation, short retention, signed uploads, parent consent, and deletion policy.
- Accessibility: large tap targets, screen-reader labels, high contrast, reduced motion, dyslexia-friendly font option.
- Never show public chat, public profiles, targeted ads, or child-to-child image sharing.

## Recommended Next Slice

Implement P0 as one vertical slice:

1. Add `LessonSession` state with resume and exact XP accounting.
2. Make hearts and retries real for multiple choice and matching.
3. Add recorder cleanup and microphone-denial recovery.
4. Test Unit 1 on Android Expo Go with a written device checklist.
5. Only after that, connect pronunciation scoring or expand to Unit 4.

