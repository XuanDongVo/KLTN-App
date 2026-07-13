# Use Cases

## Roles

- Learner: child using the app to learn English.
- Admin/teacher: creates curriculum, lessons, and questions.
- Parent/teacher observer: checks progress later.

## Learner Use Cases

### Core Use Cases

Register and login:

- Learner creates account or logs in.
- App routes by role.

Continue learning:

- Learner opens home.
- App shows current unit path.
- Next unlocked lesson is highlighted.

Play lesson:

- Learner starts lesson.
- App presents activity cards one by one.
- Learner answers.
- App gives immediate feedback.
- Mistakes are recorded.

Complete lesson:

- App calculates XP/stars.
- Lesson is marked complete.
- Next lesson unlocks.
- Learner sees celebration and next action.

Review mistakes:

- App builds short review from incorrect answers.
- Learner repeats weak vocabulary/grammar.

Track motivation:

- Learner sees streak, XP, hearts, badges.
- App optionally gives daily quest.

Use Image Caption mission:

- Learner opens a photo mission.
- App asks for camera/gallery permission.
- Learner captures or selects an image.
- App previews image and asks for confirmation.
- App uploads image or sends it to backend.
- Backend calls an external AI caption service.
- App displays the returned English caption.
- Learner practices with the caption through repeat, fill blank, choose word, or true/false.
- App records caption result and learning attempt.

### Other Learner Use Cases

Practice vocabulary cards:

- Learner sees word, picture, audio, meaning, and example sentence.
- Learner can mark word as learned or needs review.

Practice listening:

- Learner plays word/sentence audio.
- Learner chooses the matching picture or phrase.

Practice speaking:

- Learner repeats a word/sentence.
- MVP can record only or show placeholder.
- Later version can use pronunciation scoring.

Read short story:

- Learner reads/listens to a short illustrated story.
- Learner answers simple comprehension questions.

Manage profile:

- Learner changes avatar.
- Learner views XP, badges, streak, completed units.

Recover from no hearts:

- Learner can do review practice to regain hearts.

Use offline lesson:

- Learner opens cached lessons.
- Attempts sync when network returns.

## Admin Use Cases

### Core Use Cases

Create curriculum:

- Admin creates course, units, lessons.
- Admin adds topic, vocabulary, grammar focus, target skill.

Build lesson:

- Admin adds activities to lesson.
- Admin chooses activity type.
- Admin attaches image/audio.
- Admin previews activity as learner.

Import from textbook:

- Admin enters/saves lesson notes from the PDF.
- App drafts vocabulary, grammar, and activity suggestions.
- Admin reviews and publishes.

Manage media:

- Admin uploads images/audio.
- Server signs Cloudinary uploads.
- Media is linked to activities.

Monitor:

- Admin sees total learners, completed lessons, common mistakes.

Create Image Caption mission:

- Admin creates an activity with type `IMAGE_CAPTION`.
- Admin configures prompt, expected theme, follow-up practice type, and safety flags.
- Admin previews the mission using a sample image.
- Admin publishes only after reviewing the learner flow.

### Other Admin Use Cases

Generate draft lesson:

- Admin enters textbook unit notes.
- App drafts vocabulary, grammar, and activities.
- Admin reviews and edits before publishing.

Manage AI settings:

- Admin configures external caption service endpoint later.
- Admin can enable/disable image retention.
- Admin can review failed/suspicious caption jobs.

Manage users:

- Admin views learners.
- Admin resets progress only with confirmation.
- Admin assigns course/unit later.

Manage rewards:

- Admin sets XP per lesson.
- Admin configures badges and daily quests.

Preview and publish:

- Admin previews course path.
- Admin publishes/unpublishes lessons.
- App warns if a lesson has no activities or missing media.

## Parent/Teacher Observer Use Cases

View progress:

- Parent/teacher sees child progress by course, unit, lesson.
- Parent/teacher sees streak, time spent, accuracy, and weak words.

Receive recommendation:

- App suggests next lesson or review area.

View safety summary:

- Parent/teacher can see whether image-caption missions were used.
- Raw child images should not be exposed unless retention and consent are explicitly enabled.

## Backend Use Cases

Serve learner path:

- API returns units, lessons, lock states, progress, rewards.

Start lesson session:

- API returns ordered activities and session id.

Submit answer:

- API validates answer or receives client result for simple MVP.
- API records answer event.
- API updates progress, XP, hearts, mistakes.

Finish lesson:

- API computes completion result.
- API unlocks next lesson.

Handle image caption:

- API accepts image upload metadata.
- API creates caption job.
- API calls external AI caption service.
- API stores caption, confidence, status, and moderation result.
- API returns caption result to learner app.
