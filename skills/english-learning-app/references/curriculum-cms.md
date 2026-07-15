# Curriculum CMS Handoff

Updated: 2026-07-15

## Product Boundary

- There is one admin role; the admin area includes curriculum, learner visibility, account lock/unlock, and a media library.
- Learner accounts cannot call `/api/v1/admin/**`.
- Published and archived versions are read-only.
- Editing starts by cloning the current published version into one draft per level.
- Publishing validates the whole tree, archives the previous published version, and atomically promotes the draft.

## Main Files

- Expo shell and safe area: `MyEnglishApp/app/admin/_layout.tsx`.
- Dashboard: `MyEnglishApp/app/admin/index.tsx`.
- CMS route: `MyEnglishApp/app/admin/curriculum/index.tsx`.
- CMS workspace: `MyEnglishApp/components/admin/AdminCurriculumWorkspace.tsx`.
- Client API/types: `MyEnglishApp/services/adminCurriculumService.ts` and `MyEnglishApp/types/adminCurriculum.ts`.
- Admin operations client: `MyEnglishApp/services/adminOperationsService.ts`, `adminMediaUpload.ts`, and `types/adminOperations.ts`.
- Learner/media screens: `MyEnglishApp/app/admin/users/` and `MyEnglishApp/app/admin/media/`.
- Spring API/service/models: `EnglishApp_Server-main/src/main/java/com/example/englishapp_server/curriculum/admin/`.
- Spring user/media/audit operations: `EnglishApp_Server-main/src/main/java/com/example/englishapp_server/admin/`.
- Main regression test: `EnglishApp_Server-main/src/test/java/com/example/englishapp_server/curriculum/AdminCurriculumServiceTests.java`.

## Admin Workflow

1. Open Starters, Movers, or Flyers and inspect the current published tree.
2. Choose `Tạo bản nháp`; the server deep-clones units, lessons, activities, answer keys, media metadata, and source references.
3. Edit version metadata or add/edit/delete/reorder units, lessons, and activities.
4. Preview an activity with the learner renderer.
5. Run `Kiểm tra`. Each lesson must contain 8-12 activities and all media/content/answers/order indexes must be valid.
6. Choose `Xuất bản`; the server archives the previous published version and the learner path immediately resolves to the new version.

## Validation And Deletion Rules

- Unit, lesson, and activity codes must use uppercase letters, numbers, `_` or `-`; `NEW_*` is never stored as real data.
- Version codes use uppercase letters, numbers, `.`, `_` or `-`. A draft must be renamed from its generated `*_DRAFT_*` code before publish.
- The client validates the entire tree before showing publish confirmation and keeps all validation issues visible.
- A draft can be permanently discarded after typing its exact version code.
- An archived version can be permanently deleted only when dependency counts are all zero for lesson sessions, learner progress, and activity attempts.
- A published version cannot be deleted. Publish a replacement first so the previous version becomes archived.

## API Map

- `GET /api/v1/admin/curriculum/levels`
- `GET /api/v1/admin/curriculum/versions/{id}`
- `POST /api/v1/admin/curriculum/levels/{level}/drafts`
- `PUT /api/v1/admin/curriculum/versions/{id}`
- Unit, lesson, and activity create/update/delete/reorder endpoints under the same base path.
- `POST /api/v1/admin/curriculum/versions/{id}/validate`
- `GET /api/v1/admin/curriculum/versions/{id}/preview`
- `POST /api/v1/admin/curriculum/versions/{id}/publish`
- `GET /api/v1/admin/curriculum/versions/{id}/delete-check`
- `DELETE /api/v1/admin/curriculum/versions/{id}`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/users` and `GET /api/v1/admin/users/{id}`
- `PUT /api/v1/admin/users/{id}/status`
- `POST /api/v1/admin/media/signature`, `POST /api/v1/admin/media`, and `GET /api/v1/admin/media`

## Media Workflow

1. Admin may paste an HTTPS URL or `/curriculum/...` path as before.
2. `Tải ảnh lên` opens Expo Image Picker and accepts JPEG, PNG, or WebP up to 5 MB.
3. Spring signs a Cloudinary upload without exposing the secret.
4. Expo uploads directly to Cloudinary, then registers the secure URL, dimensions, bytes, and public id in MySQL.
5. Assets are not automatically deleted because published or archived versions may still reference them.

## Single Admin Setup

1. Register the intended account through the app.
2. Edit only `@admin_email` in `EnglishApp_Server-main/scripts/set-single-admin.sql`.
3. Run the script against the `englishapp` MySQL database.
4. Log out and log in again so the JWT contains role `ADMIN`.

The script changes nothing when the target email does not exist. When it exists, every other account is set to `USER` and the target becomes the only `ADMIN`.

## Remaining QA

- Verify the drawer, compact action rows, editor keyboard behavior, and modal safe area on the actual Expo Go Android device.
- Verify user search/detail/lock and image picking on the actual Expo Go Android device.
- Real MySQL publish and real Cloudinary upload both passed on 2026-07-15.
