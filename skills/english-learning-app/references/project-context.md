# Project Context

## Workspace

- Root: `E:\Workspace-Nlu\KLTN-APP`
- Client: `MyEnglishApp/`
- Server: `EnglishApp_Server-main/`
- Curriculum source: `document/Fun for Flyers Student_s Book 4th edition - Flip PDF _ FlipBuilder.pdf`

## Current Client

- Expo Router / React Native app.
- Main learner screens now use the redesigned flow:
  - `app/(tabs)/index.tsx`: vertical learning path and daily goal.
  - `app/(learner)/lesson/[lessonId].tsx`: reusable lesson player.
  - `app/(learner)/lesson-complete.tsx`: rewards and next action.
  - `app/(tabs)/review.tsx`: mistake review queue.
  - `app/(tabs)/profile.tsx`: profile, achievements, and Photo Mission entry.
  - `app/(learner)/photo-mission.tsx`: standalone Image Caption flow.
- The legacy `app/(learner)/quiz.tsx` remains for compatibility but is no longer the primary learner route.
- Admin screens:
  - create units
  - manage unit contents
  - manage questions
- Services:
  - `services/authService.ts`
  - `services/learnerService.ts`
  - `services/unitService.ts`
  - `services/imageCaptionService.ts`
- Local-first MVP state and content:
  - `context/LearningContext.tsx`
  - `data/curriculum.ts`
  - `types/learning.ts`
- Learner media and audio:
  - `assets/images/lessons/`: local Greetings, Classroom, and Animals illustration sets.
  - `components/activities/ListenChoiceActivity.tsx`: English TTS listening activity.
  - `components/activities/SpeakingActivity.tsx`: real microphone recording and replay.
  - `references/learner-improvement-roadmap.md`: current P0-P3 learner roadmap.

## Current Server

- Spring Boot backend.
- Main entities:
  - `Unit`
  - `UnitImage`
  - `UnitVocabulary`
  - `QuestionBank`
  - `UnitProgress`
  - `LearnerHistory`
  - `User`
- Main controllers:
  - `/auth`
  - `/admin`
  - `/learner`
  - `/upload`
  - `/verify`
- New transition endpoints:
  - `GET /learner/path`
  - `POST /learner/image-caption`

## Known Risks

- `EnglishApp_Client-main/` appears deleted while `MyEnglishApp/` is untracked. Confirm whether this is an intended rename before committing.
- Node is not installed on PATH. A temporary official Node 22 portable binary was used to run checks.
- JDK 21 exists at `C:\Users\voxua\.jdks\ms-21.0.10` but is not on PATH.
- Backend runtime now requires environment variables for real database/Cloudinary/JWT credentials.
- Several frontend Vietnamese strings are mojibake and need UTF-8 restoration.
- Legacy admin Unit screens still contain the older visual style and should be migrated incrementally.
