# Curriculum Packages

Updated: 2026-07-15

## Published Bundled Packages

| Level | Version | Shape | Manifest |
| --- | --- | --- | --- |
| Pre A1 Starters | `STARTERS_2026.4` | 5 units, 25 lessons, 200 activities | `curriculum/starters-v4/manifest.json` |
| A1 Movers | `MOVERS_2026.1` | 5 units, 25 lessons, 200 activities | `curriculum/movers-v1/manifest.json` |
| A2 Flyers | `FLYERS_2026.1` | 5 units, 25 lessons, 200 activities | `curriculum/flyers-v1/manifest.json` |

Paths above are relative to `EnglishApp_Server-main/src/main/resources/`.

Each lesson has 8 activities: bilingual vocabulary, flashcard, listening choice, picture-supported choice, matching, sentence ordering, writing, and speaking.

## Source Policy

- Vocabulary scope follows the official Cambridge wordlist picture book for the matching level.
- Activity families follow the official Cambridge paper exam format.
- The sequence, Vietnamese meanings, prompts, examples and answer keys are original app content.
- Content is not copied from *Fun for Starters, Movers and Flyers*.
- Every package has `CONTENT_SOURCES.md`; every activity has `sourceRefs`.
- A qualified English teacher must still perform the final pedagogical review before production publishing.

## Generation

Run from the workspace root when Node is available:

```powershell
node EnglishApp_Server-main/scripts/build-curriculum-packages.mjs
```

The script is the maintainable source for all 75 lessons. Do not hand-edit a manifest that has already been imported; create a new immutable `versionCode` instead.

## One-Time Bootstrap

- Owner: `CurriculumBootstrapService` and `CurriculumBootstrapRunner`.
- Configuration: `app.curriculum.bootstrap.*` in `application.properties`.
- If `curriculum_versions` is empty, all three bundled packages are imported in one transaction.
- If any curriculum version already exists, bootstrap skips everything. This prevents duplicate imports on every restart.
- Existing installations need an explicit reset or an administrator-driven package import to adopt a newer package; bootstrap deliberately does not upgrade a non-empty database.

## Unlock Rules

1. Starters lesson 1 is initially open.
2. Completing a lesson opens the next lesson across unit boundaries.
3. Movers opens only after all 25 active Starters lessons are complete.
4. Flyers opens only after all 25 active Movers lessons are complete.
5. Locked levels and lessons remain visible for curriculum preview.
6. Spring enforces every lock when a lesson session starts; the client is not trusted.

## Legacy Cleanup

The old `starters-v1`, `starters-v2`, `starters-v3`, and `build-starters-v3.mjs` artifacts were deleted after the local database reset. Do not restore or reference them.
