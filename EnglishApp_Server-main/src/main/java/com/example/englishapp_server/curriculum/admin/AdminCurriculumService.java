package com.example.englishapp_server.curriculum.admin;

import com.example.englishapp_server.curriculum.admin.AdminCurriculumModels.*;
import com.example.englishapp_server.curriculum.domain.*;
import com.example.englishapp_server.curriculum.repository.*;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AdminCurriculumService {
    private static final String ADMIN_SOURCE_REF = "ADMIN_AUTHORED";
    private static final String CODE_PATTERN = "[A-Z0-9][A-Z0-9_-]{2,99}";
    private static final String VERSION_CODE_PATTERN = "[A-Z0-9][A-Z0-9._-]{2,79}";

    private final CurriculumVersionRepository versionRepository;
    private final LearningUnitRepository unitRepository;
    private final LessonRepository lessonRepository;
    private final LearningActivityRepository activityRepository;
    private final LessonSessionRepository sessionRepository;
    private final LearnerLessonProgressRepository progressRepository;
    private final ActivityAttemptRepository attemptRepository;
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    public AdminCurriculumService(CurriculumVersionRepository versionRepository,
                                  LearningUnitRepository unitRepository,
                                  LessonRepository lessonRepository,
                                  LearningActivityRepository activityRepository,
                                  LessonSessionRepository sessionRepository,
                                  LearnerLessonProgressRepository progressRepository,
                                  ActivityAttemptRepository attemptRepository,
                                  EntityManager entityManager,
                                  ObjectMapper objectMapper) {
        this.versionRepository = versionRepository;
        this.unitRepository = unitRepository;
        this.lessonRepository = lessonRepository;
        this.activityRepository = activityRepository;
        this.sessionRepository = sessionRepository;
        this.progressRepository = progressRepository;
        this.attemptRepository = attemptRepository;
        this.entityManager = entityManager;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<LevelOverview> getLevels() {
        List<LevelOverview> result = new ArrayList<>();
        for (LevelCode levelCode : LevelCode.values()) {
            List<VersionCard> versions = versionRepository.findByLevelCodeOrderByImportedAtDesc(levelCode)
                    .stream().map(this::versionCard).toList();
            result.add(new LevelOverview(levelCode, displayName(levelCode), versions));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public CurriculumTree getTree(Long versionId) {
        return tree(requireVersion(versionId));
    }

    @Transactional
    public CurriculumTree createDraft(LevelCode levelCode, DraftRequest request) {
        boolean hasDraft = versionRepository.findByLevelCodeAndLifecycleStatus(levelCode, LifecycleStatus.DRAFT)
                .stream().findAny().isPresent();
        if (hasDraft) throw new IllegalStateException("Cấp độ này đã có một bản nháp");

        CurriculumVersion published = versionRepository
                .findFirstByLevelCodeAndLifecycleStatusOrderByImportedAtDesc(levelCode, LifecycleStatus.PUBLISHED)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy chương trình đã xuất bản để tạo bản nháp"));

        String publishedCode = published.getVersionCode();
        String newCode = publishedCode;
        if (publishedCode.matches(".*\\.\\d+")) {
            int lastDot = publishedCode.lastIndexOf('.');
            try {
                int rev = Integer.parseInt(publishedCode.substring(lastDot + 1));
                newCode = publishedCode.substring(0, lastDot + 1) + (rev + 1);
            } catch (NumberFormatException ignored) {}
        } else {
            newCode = publishedCode + ".2";
        }
        
        String versionCode = textOrDefault(request == null ? null : request.versionCode(), newCode + "_DRAFT");
        requireUniqueVersionCode(versionCode, null);

        String defaultTitle = published.getTitle();
        if (!defaultTitle.endsWith(" - Bản nháp")) {
            defaultTitle += " - Bản nháp";
        }
        CurriculumVersion draft = versionRepository.save(CurriculumVersion.builder()
                .levelCode(levelCode)
                .versionCode(versionCode)
                .title(textOrDefault(request == null ? null : request.title(), defaultTitle))
                .description(textOrDefault(request == null ? null : request.description(), published.getDescription()))
                .lifecycleStatus(LifecycleStatus.DRAFT)
                .checksum(sha256("draft:" + versionCode))
                .sourceManifestJson(ensureAdminSource(published.getSourceManifestJson()))
                .importedAt(LocalDateTime.now())
                .build());

        cloneUnits(published, draft);
        return tree(draft);
    }

    @Transactional
    public CurriculumTree updateVersion(Long versionId, VersionUpdateRequest request) {
        CurriculumVersion version = requireDraft(versionId);
        requireVersionCode(request.versionCode());
        requireText(request.title(), "Tên chương trình");
        requireUniqueVersionCode(request.versionCode(), versionId);
        version.setVersionCode(request.versionCode().trim());
        version.setTitle(request.title().trim());
        version.setDescription(trimToNull(request.description()));
        version.setChecksum(sha256("draft:" + version.getVersionCode() + ":" + System.nanoTime()));
        return tree(versionRepository.save(version));
    }

    @Transactional
    public CurriculumTree createUnit(Long versionId, UnitRequest request) {
        CurriculumVersion version = requireDraft(versionId);
        validateUnitRequest(request);
        int order = unitRepository.findByCurriculumVersionIdOrderByOrderIndex(versionId).size() + 1;
        LearningUnit unit = LearningUnit.builder()
                .curriculumVersion(version)
                .orderIndex(order)
                .build();
        applyUnit(unit, request);
        unitRepository.save(unit);
        return tree(version);
    }

    @Transactional
    public CurriculumTree updateUnit(Long unitId, UnitRequest request) {
        LearningUnit unit = requireUnit(unitId);
        requireDraft(unit.getCurriculumVersion().getId());
        validateUnitRequest(request);
        applyUnit(unit, request);
        unitRepository.save(unit);
        return tree(unit.getCurriculumVersion());
    }

    @Transactional
    public CurriculumTree deleteUnit(Long unitId) {
        LearningUnit unit = requireUnit(unitId);
        CurriculumVersion version = requireDraft(unit.getCurriculumVersion().getId());
        List<Lesson> lessons = lessonRepository.findByLearningUnitIdOrderByOrderIndex(unitId);
        List<LearningActivity> activities = lessons.stream()
                .flatMap(lesson -> activityRepository.findByLessonIdOrderByOrderIndex(lesson.getId()).stream())
                .toList();
        if (!activities.isEmpty()) activityRepository.deleteAllInBatch(activities);
        if (!lessons.isEmpty()) lessonRepository.deleteAllInBatch(lessons);
        unitRepository.deleteAllInBatch(List.of(unit));
        reindexUnits(version.getId());
        return tree(version);
    }

    @Transactional
    public CurriculumTree reorderUnits(Long versionId, ReorderRequest request) {
        CurriculumVersion version = requireDraft(versionId);
        List<LearningUnit> units = unitRepository.findByCurriculumVersionIdOrderByOrderIndex(versionId);
        requireSameIds(units.stream().map(LearningUnit::getId).toList(), request.orderedIds(), "unit");
        Map<Long, LearningUnit> byId = new HashMap<>();
        units.forEach(unit -> byId.put(unit.getId(), unit));
        for (int index = 0; index < request.orderedIds().size(); index++) {
            byId.get(request.orderedIds().get(index)).setOrderIndex(index + 1);
        }
        unitRepository.saveAll(units);
        return tree(version);
    }

    @Transactional
    public CurriculumTree createLesson(Long unitId, LessonRequest request) {
        LearningUnit unit = requireUnit(unitId);
        CurriculumVersion version = requireDraft(unit.getCurriculumVersion().getId());
        validateLessonRequest(request);
        int order = lessonRepository.findByLearningUnitIdOrderByOrderIndex(unitId).size() + 1;
        Lesson lesson = Lesson.builder().learningUnit(unit).orderIndex(order).build();
        applyLesson(lesson, request);
        lessonRepository.save(lesson);
        return tree(version);
    }

    @Transactional
    public CurriculumTree updateLesson(Long lessonId, LessonRequest request) {
        Lesson lesson = requireLesson(lessonId);
        CurriculumVersion version = requireDraft(lesson.getLearningUnit().getCurriculumVersion().getId());
        validateLessonRequest(request);
        applyLesson(lesson, request);
        lessonRepository.save(lesson);
        return tree(version);
    }

    @Transactional
    public CurriculumTree deleteLesson(Long lessonId) {
        Lesson lesson = requireLesson(lessonId);
        LearningUnit unit = lesson.getLearningUnit();
        CurriculumVersion version = requireDraft(unit.getCurriculumVersion().getId());
        List<LearningActivity> activities = activityRepository.findByLessonIdOrderByOrderIndex(lessonId);
        if (!activities.isEmpty()) activityRepository.deleteAllInBatch(activities);
        lessonRepository.deleteAllInBatch(List.of(lesson));
        reindexLessons(unit.getId());
        return tree(version);
    }

    @Transactional
    public CurriculumTree reorderLessons(Long unitId, ReorderRequest request) {
        LearningUnit unit = requireUnit(unitId);
        CurriculumVersion version = requireDraft(unit.getCurriculumVersion().getId());
        List<Lesson> lessons = lessonRepository.findByLearningUnitIdOrderByOrderIndex(unitId);
        requireSameIds(lessons.stream().map(Lesson::getId).toList(), request.orderedIds(), "lesson");
        Map<Long, Lesson> byId = new HashMap<>();
        lessons.forEach(lesson -> byId.put(lesson.getId(), lesson));
        for (int index = 0; index < request.orderedIds().size(); index++) {
            byId.get(request.orderedIds().get(index)).setOrderIndex(index + 1);
        }
        lessonRepository.saveAll(lessons);
        return tree(version);
    }

    @Transactional
    public CurriculumTree createActivity(Long lessonId, ActivityRequest request) {
        Lesson lesson = requireLesson(lessonId);
        CurriculumVersion version = requireDraft(lesson.getLearningUnit().getCurriculumVersion().getId());
        validateActivityRequest(request);
        int order = activityRepository.findByLessonIdOrderByOrderIndex(lessonId).size() + 1;
        LearningActivity activity = LearningActivity.builder().lesson(lesson).orderIndex(order).build();
        applyActivity(activity, request);
        activityRepository.save(activity);
        return tree(version);
    }

    @Transactional
    public CurriculumTree updateActivity(Long activityId, ActivityRequest request) {
        LearningActivity activity = requireActivity(activityId);
        CurriculumVersion version = requireDraft(activity.getLesson().getLearningUnit().getCurriculumVersion().getId());
        validateActivityRequest(request);
        applyActivity(activity, request);
        activityRepository.save(activity);
        return tree(version);
    }

    @Transactional
    public CurriculumTree deleteActivity(Long activityId) {
        LearningActivity activity = requireActivity(activityId);
        Lesson lesson = activity.getLesson();
        CurriculumVersion version = requireDraft(lesson.getLearningUnit().getCurriculumVersion().getId());
        activityRepository.deleteAllInBatch(List.of(activity));
        reindexActivities(lesson.getId());
        return tree(version);
    }

    @Transactional
    public CurriculumTree reorderActivities(Long lessonId, ReorderRequest request) {
        Lesson lesson = requireLesson(lessonId);
        CurriculumVersion version = requireDraft(lesson.getLearningUnit().getCurriculumVersion().getId());
        List<LearningActivity> activities = activityRepository.findByLessonIdOrderByOrderIndex(lessonId);
        requireSameIds(activities.stream().map(LearningActivity::getId).toList(), request.orderedIds(), "activity");
        Map<Long, LearningActivity> byId = new HashMap<>();
        activities.forEach(activity -> byId.put(activity.getId(), activity));
        for (int index = 0; index < request.orderedIds().size(); index++) {
            byId.get(request.orderedIds().get(index)).setOrderIndex(index + 1);
        }
        activityRepository.saveAll(activities);
        return tree(version);
    }

    @Transactional(readOnly = true)
    public ValidationReport validate(Long versionId) {
        CurriculumVersion version = requireVersion(versionId);
        List<ValidationIssue> issues = new ArrayList<>();
        if (!version.getVersionCode().matches(VERSION_CODE_PATTERN) || version.getVersionCode().toUpperCase().contains("DRAFT")) {
            issues.add(issue("version.versionCode", "Hãy đổi mã bản nháp thành mã phát hành, ví dụ STARTERS_2026.6"));
        }
        List<LearningUnit> units = unitRepository.findByCurriculumVersionIdOrderByOrderIndex(versionId);
        if (units.isEmpty()) issues.add(issue("version", "Chương trình phải có ít nhất một unit"));
        validateOrder(units.stream().map(LearningUnit::getOrderIndex).toList(), "units", issues);

        for (LearningUnit unit : units) {
            String unitPath = "unit[" + unit.getCode() + "]";
            validateStoredCode(unit.getCode(), unitPath, "unit", issues);
            validateMedia(unit.getCoverImagePath(), unit.getCoverImageWidth(), unit.getCoverImageHeight(), unit.getCoverImageAlt(), unitPath, issues);
            List<Lesson> lessons = lessonRepository.findByLearningUnitIdOrderByOrderIndex(unit.getId());
            if (lessons.isEmpty()) issues.add(issue(unitPath, "Unit phải có ít nhất một lesson"));
            validateOrder(lessons.stream().map(Lesson::getOrderIndex).toList(), unitPath + ".lessons", issues);

            for (Lesson lesson : lessons) {
                String lessonPath = unitPath + ".lesson[" + lesson.getCode() + "]";
                validateStoredCode(lesson.getCode(), lessonPath, "lesson", issues);
                validateMedia(lesson.getCoverImagePath(), lesson.getCoverImageWidth(), lesson.getCoverImageHeight(), lesson.getCoverImageAlt(), lessonPath, issues);
                List<LearningActivity> activities = activityRepository.findByLessonIdOrderByOrderIndex(lesson.getId());
                if (activities.size() < 1) {
                    issues.add(issue(lessonPath, "Lesson phải có ít nhất một hoạt động; hiện có " + activities.size()));
                }
                validateOrder(activities.stream().map(LearningActivity::getOrderIndex).toList(), lessonPath + ".activities", issues);
                for (LearningActivity activity : activities) {
                    String activityPath = lessonPath + ".activity[" + activity.getCode() + "]";
                    validateStoredCode(activity.getCode(), activityPath, "activity", issues);
                    if (isBlank(activity.getPromptText())) issues.add(issue(activityPath, "Thiếu câu hỏi hoặc nội dung hướng dẫn"));
                    if (isBlank(activity.getContentJson()) || "{}".equals(activity.getContentJson())) issues.add(issue(activityPath, "Thiếu dữ liệu hoạt động"));
                    if (isBlank(activity.getAnswerJson()) || "{}".equals(activity.getAnswerJson())) issues.add(issue(activityPath, "Thiếu đáp án"));
                }
            }
        }
        return new ValidationReport(issues.isEmpty(), List.copyOf(issues));
    }

    @Transactional(readOnly = true)
    public VersionDeleteCheck checkVersionDelete(Long versionId) {
        CurriculumVersion version = requireVersion(versionId);
        boolean isDraft = version.getLifecycleStatus() == LifecycleStatus.DRAFT;
        
        long sessions = isDraft ? 0 : sessionRepository.countByCurriculumVersionId(versionId);
        long progressRows = isDraft ? 0 : progressRepository.countByCurriculumVersionId(versionId);
        long attempts = isDraft ? 0 : attemptRepository.countByCurriculumVersionId(versionId);
        
        boolean canDelete;
        String message;
        
        if (version.getLifecycleStatus() == LifecycleStatus.PUBLISHED) {
            canDelete = false;
            message = "Không thể xóa phiên bản đang xuất bản";
        } else if (isDraft) {
            canDelete = true;
            message = "Bản nháp có thể được hủy vĩnh viễn";
        } else {
            canDelete = sessions == 0 && progressRows == 0 && attempts == 0;
            if (!canDelete) {
                message = "Phiên bản còn dữ liệu học tập tham chiếu: " + sessions + " session, "
                        + progressRows + " tiến độ, " + attempts + " lượt trả lời";
            } else {
                message = "Bản lưu trữ không còn dữ liệu học tập tham chiếu và có thể xóa";
            }
        }
        return new VersionDeleteCheck(versionId, version.getVersionCode(), version.getLifecycleStatus(), canDelete,
                sessions, progressRows, attempts, message);
    }

    @Transactional
    public VersionDeleteResult deleteVersion(Long versionId) {
        CurriculumVersion version = requireVersion(versionId);
        VersionDeleteCheck check = checkVersionDelete(versionId);
        if (!check.canDelete()) throw new IllegalStateException(check.message());
        List<LearningUnit> units = unitRepository.findByCurriculumVersionIdOrderByOrderIndex(versionId);
        List<Lesson> lessons = units.stream()
                .flatMap(unit -> lessonRepository.findByLearningUnitIdOrderByOrderIndex(unit.getId()).stream())
                .toList();
        List<LearningActivity> activities = lessons.stream()
                .flatMap(lesson -> activityRepository.findByLessonIdOrderByOrderIndex(lesson.getId()).stream())
                .toList();
        if (!activities.isEmpty()) activityRepository.deleteAllInBatch(activities);
        if (!lessons.isEmpty()) lessonRepository.deleteAllInBatch(lessons);
        if (!units.isEmpty()) unitRepository.deleteAllInBatch(units);
        String versionCode = version.getVersionCode();
        entityManager.clear();
        versionRepository.deleteById(versionId);
        versionRepository.flush();
        return new VersionDeleteResult(versionId, versionCode, true);
    }

    @Transactional
    public CurriculumTree publish(Long versionId) {
        CurriculumVersion draft = requireDraft(versionId);
        ValidationReport report = validate(versionId);
        if (!report.valid()) {
            throw new IllegalStateException("Bản nháp còn " + report.issues().size() + " lỗi, chưa thể xuất bản");
        }

        for (CurriculumVersion published : versionRepository.findByLevelCodeAndLifecycleStatus(
                draft.getLevelCode(), LifecycleStatus.PUBLISHED)) {
            published.setLifecycleStatus(LifecycleStatus.ARCHIVED);
            versionRepository.save(published);
        }
        
        String finalCode = draft.getVersionCode().replaceFirst("_DRAFT.*", "");
        if (!finalCode.equals(draft.getVersionCode())) {
            requireUniqueVersionCode(finalCode, versionId);
            draft.setVersionCode(finalCode);
        }
        
        draft.setLifecycleStatus(LifecycleStatus.PUBLISHED);
        draft.setImportedAt(LocalDateTime.now());
        draft.setChecksum(sha256(writeJson(tree(draft))));
        return tree(versionRepository.save(draft));
    }

    private void cloneUnits(CurriculumVersion source, CurriculumVersion target) {
        for (LearningUnit sourceUnit : unitRepository.findByCurriculumVersionIdOrderByOrderIndex(source.getId())) {
            LearningUnit targetUnit = unitRepository.save(LearningUnit.builder()
                    .curriculumVersion(target)
                    .code(sourceUnit.getCode())
                    .title(sourceUnit.getTitle())
                    .description(sourceUnit.getDescription())
                    .coverImagePath(sourceUnit.getCoverImagePath())
                    .coverImageWidth(sourceUnit.getCoverImageWidth())
                    .coverImageHeight(sourceUnit.getCoverImageHeight())
                    .coverImageAlt(sourceUnit.getCoverImageAlt())
                    .orderIndex(sourceUnit.getOrderIndex())
                    .build());
            for (Lesson sourceLesson : lessonRepository.findByLearningUnitIdOrderByOrderIndex(sourceUnit.getId())) {
                Lesson targetLesson = lessonRepository.save(Lesson.builder()
                        .learningUnit(targetUnit)
                        .code(sourceLesson.getCode())
                        .title(sourceLesson.getTitle())
                        .objective(sourceLesson.getObjective())
                        .coverImagePath(sourceLesson.getCoverImagePath())
                        .coverImageWidth(sourceLesson.getCoverImageWidth())
                        .coverImageHeight(sourceLesson.getCoverImageHeight())
                        .coverImageAlt(sourceLesson.getCoverImageAlt())
                        .orderIndex(sourceLesson.getOrderIndex())
                        .estimatedMinutes(sourceLesson.getEstimatedMinutes())
                        .xpReward(sourceLesson.getXpReward())
                        .build());
                for (LearningActivity sourceActivity : activityRepository.findByLessonIdOrderByOrderIndex(sourceLesson.getId())) {
                    activityRepository.save(LearningActivity.builder()
                            .lesson(targetLesson)
                            .code(sourceActivity.getCode())
                            .activityType(sourceActivity.getActivityType())
                            .activityStage(sourceActivity.getActivityStage())
                            .orderIndex(sourceActivity.getOrderIndex())
                            .promptText(sourceActivity.getPromptText())
                            .instructionText(sourceActivity.getInstructionText())
                            .contentJson(sourceActivity.getContentJson())
                            .answerJson(sourceActivity.getAnswerJson())
                            .sourceRefsJson(sourceActivity.getSourceRefsJson())
                            .xpReward(sourceActivity.getXpReward())
                            .build());
                }
            }
        }
    }

    private VersionCard versionCard(CurriculumVersion version) {
        List<LearningUnit> units = unitRepository.findByCurriculumVersionIdOrderByOrderIndex(version.getId());
        int lessonCount = 0;
        int activityCount = 0;
        for (LearningUnit unit : units) {
            List<Lesson> lessons = lessonRepository.findByLearningUnitIdOrderByOrderIndex(unit.getId());
            lessonCount += lessons.size();
            for (Lesson lesson : lessons) activityCount += activityRepository.countByLessonId(lesson.getId());
        }
        return new VersionCard(version.getId(), version.getVersionCode(), version.getTitle(), version.getDescription(),
                version.getLifecycleStatus(), units.size(), lessonCount, activityCount);
    }

    private CurriculumTree tree(CurriculumVersion version) {
        List<UnitView> units = unitRepository.findByCurriculumVersionIdOrderByOrderIndex(version.getId()).stream()
                .map(unit -> new UnitView(unit.getId(), unit.getCode(), unit.getTitle(), unit.getDescription(),
                        unit.getOrderIndex(), media(unit),
                        lessonRepository.findByLearningUnitIdOrderByOrderIndex(unit.getId()).stream()
                                .map(lesson -> new LessonView(lesson.getId(), lesson.getCode(), lesson.getTitle(),
                                        lesson.getObjective(), lesson.getOrderIndex(), lesson.getEstimatedMinutes(),
                                        lesson.getXpReward(), media(lesson),
                                        activityRepository.findByLessonIdOrderByOrderIndex(lesson.getId()).stream()
                                                .map(activity -> new ActivityView(activity.getId(), activity.getCode(),
                                                        activity.getActivityType(), activity.getActivityStage(),
                                                        activity.getOrderIndex(), activity.getPromptText(),
                                                        activity.getInstructionText(), activity.getXpReward(),
                                                        readMap(activity.getContentJson()), readMap(activity.getAnswerJson()),
                                                        readStringList(activity.getSourceRefsJson())))
                                                .toList()))
                                .toList()))
                .toList();
        return new CurriculumTree(version.getId(), version.getLevelCode(), version.getVersionCode(), version.getTitle(),
                version.getDescription(), version.getLifecycleStatus(), units);
    }

    private void applyUnit(LearningUnit unit, UnitRequest request) {
        unit.setCode(request.code().trim());
        unit.setTitle(request.title().trim());
        unit.setDescription(trimToNull(request.description()));
        applyMedia(unit, request.coverImage());
    }

    private void applyLesson(Lesson lesson, LessonRequest request) {
        lesson.setCode(request.code().trim());
        lesson.setTitle(request.title().trim());
        lesson.setObjective(request.objective().trim());
        lesson.setEstimatedMinutes(request.estimatedMinutes());
        lesson.setXpReward(request.xpReward());
        applyMedia(lesson, request.coverImage());
    }

    private void applyActivity(LearningActivity activity, ActivityRequest request) {
        activity.setCode(request.code().trim());
        activity.setActivityType(request.type());
        activity.setActivityStage(request.stage());
        activity.setPromptText(request.prompt().trim());
        activity.setInstructionText(trimToNull(request.instruction()));
        activity.setXpReward(request.xpReward());
        activity.setContentJson(writeJson(request.content()));
        activity.setAnswerJson(writeJson(request.answer()));
        activity.setSourceRefsJson(writeJson(List.of(ADMIN_SOURCE_REF)));
    }

    private void applyMedia(LearningUnit unit, MediaData media) {
        unit.setCoverImagePath(media.path().trim());
        unit.setCoverImageWidth(media.width());
        unit.setCoverImageHeight(media.height());
        unit.setCoverImageAlt(media.alt().trim());
    }

    private void applyMedia(Lesson lesson, MediaData media) {
        lesson.setCoverImagePath(media.path().trim());
        lesson.setCoverImageWidth(media.width());
        lesson.setCoverImageHeight(media.height());
        lesson.setCoverImageAlt(media.alt().trim());
    }

    private MediaData media(LearningUnit unit) {
        return new MediaData(unit.getCoverImagePath(), value(unit.getCoverImageWidth()), value(unit.getCoverImageHeight()), unit.getCoverImageAlt());
    }

    private MediaData media(Lesson lesson) {
        return new MediaData(lesson.getCoverImagePath(), value(lesson.getCoverImageWidth()), value(lesson.getCoverImageHeight()), lesson.getCoverImageAlt());
    }

    private void validateUnitRequest(UnitRequest request) {
        if (request == null) throw new IllegalArgumentException("Thiếu dữ liệu unit");
        requireCode(request.code(), "Mã unit");
        requireText(request.title(), "Tên unit");
        validateMediaRequest(request.coverImage());
    }

    private void validateLessonRequest(LessonRequest request) {
        if (request == null) throw new IllegalArgumentException("Thiếu dữ liệu lesson");
        requireCode(request.code(), "Mã lesson");
        requireText(request.title(), "Tên lesson");
        requireText(request.objective(), "Mục tiêu lesson");
        if (request.estimatedMinutes() <= 0) throw new IllegalArgumentException("Thời lượng phải lớn hơn 0");
        if (request.xpReward() < 0) throw new IllegalArgumentException("XP không được âm");
        validateMediaRequest(request.coverImage());
    }

    private void validateActivityRequest(ActivityRequest request) {
        if (request == null) throw new IllegalArgumentException("Thiếu dữ liệu activity");
        requireCode(request.code(), "Mã activity");
        requireText(request.prompt(), "Nội dung activity");
        if (request.type() == null || request.stage() == null) throw new IllegalArgumentException("Thiếu loại hoặc giai đoạn activity");
        if (request.content() == null || request.content().isEmpty()) throw new IllegalArgumentException("Thiếu dữ liệu activity");
        if (request.answer() == null || request.answer().isEmpty()) throw new IllegalArgumentException("Thiếu đáp án activity");
        if (request.xpReward() < 0) throw new IllegalArgumentException("XP không được âm");
    }

    private void validateMediaRequest(MediaData media) {
        if (media == null) throw new IllegalArgumentException("Thiếu ảnh bìa");
        requireText(media.path(), "Đường dẫn ảnh");
        requireText(media.alt(), "Mô tả ảnh");
        if (media.width() <= 0 || media.height() <= 0) throw new IllegalArgumentException("Kích thước ảnh không hợp lệ");
        if (!media.path().startsWith("/curriculum/") && !media.path().startsWith("https://")) {
            throw new IllegalArgumentException("Ảnh phải là đường dẫn /curriculum/ hoặc URL HTTPS");
        }
    }

    private void validateMedia(String path, Integer width, Integer height, String alt, String owner, List<ValidationIssue> issues) {
        if (isBlank(path)) issues.add(issue(owner, "Thiếu ảnh bìa"));
        else if (!path.startsWith("/curriculum/") && !path.startsWith("https://")) issues.add(issue(owner, "Đường dẫn ảnh phải dùng /curriculum/ hoặc HTTPS"));
        if (width == null || width <= 0 || height == null || height <= 0) issues.add(issue(owner, "Kích thước ảnh không hợp lệ"));
        if (isBlank(alt)) issues.add(issue(owner, "Thiếu mô tả ảnh dành cho trợ năng"));
    }

    private void validateOrder(List<Integer> orders, String path, List<ValidationIssue> issues) {
        for (int index = 0; index < orders.size(); index++) {
            if (orders.get(index) != index + 1) {
                issues.add(issue(path, "Thứ tự phải liên tục từ 1"));
                return;
            }
        }
    }

    private void reindexUnits(Long versionId) {
        List<LearningUnit> units = unitRepository.findByCurriculumVersionIdOrderByOrderIndex(versionId);
        for (int index = 0; index < units.size(); index++) units.get(index).setOrderIndex(index + 1);
        unitRepository.saveAll(units);
    }

    private void reindexLessons(Long unitId) {
        List<Lesson> lessons = lessonRepository.findByLearningUnitIdOrderByOrderIndex(unitId);
        for (int index = 0; index < lessons.size(); index++) lessons.get(index).setOrderIndex(index + 1);
        lessonRepository.saveAll(lessons);
    }

    private void reindexActivities(Long lessonId) {
        List<LearningActivity> activities = activityRepository.findByLessonIdOrderByOrderIndex(lessonId);
        for (int index = 0; index < activities.size(); index++) activities.get(index).setOrderIndex(index + 1);
        activityRepository.saveAll(activities);
    }

    private CurriculumVersion requireVersion(Long id) {
        return versionRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiên bản curriculum"));
    }

    private CurriculumVersion requireDraft(Long id) {
        CurriculumVersion version = requireVersion(id);
        if (version.getLifecycleStatus() != LifecycleStatus.DRAFT) {
            throw new SecurityException("Chỉ được chỉnh sửa bản nháp");
        }
        return version;
    }

    private LearningUnit requireUnit(Long id) {
        return unitRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy unit"));
    }

    private Lesson requireLesson(Long id) {
        return lessonRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy lesson"));
    }

    private LearningActivity requireActivity(Long id) {
        return activityRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Không tìm thấy activity"));
    }

    private void requireUniqueVersionCode(String code, Long currentId) {
        versionRepository.findByVersionCode(code.trim()).ifPresent(existing -> {
            if (!existing.getId().equals(currentId)) throw new IllegalArgumentException("Mã phiên bản đã tồn tại");
        });
    }

    private void requireSameIds(List<Long> existing, List<Long> requested, String owner) {
        if (requested == null || requested.size() != existing.size() || !new HashSet<>(existing).equals(new HashSet<>(requested))) {
            throw new IllegalArgumentException("Danh sách sắp xếp " + owner + " không hợp lệ");
        }
    }

    private String ensureAdminSource(String sourceJson) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> sources = new ArrayList<>(objectMapper.readValue(sourceJson, List.class));
            boolean exists = sources.stream().anyMatch(source -> ADMIN_SOURCE_REF.equals(source.get("ref")));
            if (!exists) {
                sources.add(Map.of(
                        "ref", ADMIN_SOURCE_REF,
                        "title", "Curriculum CMS authored content",
                        "url", "https://localhost/admin/curriculum",
                        "locator", "Trusted administrator edit",
                        "checkedAt", LocalDateTime.now().toLocalDate().toString()));
            }
            return objectMapper.writeValueAsString(sources);
        } catch (Exception exception) {
            throw new IllegalStateException("Nguồn curriculum không hợp lệ", exception);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readMap(String json) {
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception exception) {
            throw new IllegalStateException("Dữ liệu JSON curriculum không hợp lệ", exception);
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> readStringList(String json) {
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception exception) {
            throw new IllegalStateException("Danh sách nguồn curriculum không hợp lệ", exception);
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Không thể lưu dữ liệu JSON", exception);
        }
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("SHA-256 không khả dụng", exception);
        }
    }

    private ValidationIssue issue(String path, String message) {
        return new ValidationIssue(path, message);
    }

    private String displayName(LevelCode levelCode) {
        return switch (levelCode) {
            case PRE_A1_STARTERS -> "Pre A1 Starters";
            case A1_MOVERS -> "A1 Movers";
            case A2_FLYERS -> "A2 Flyers";
        };
    }

    private String levelPrefix(LevelCode levelCode) {
        return switch (levelCode) {
            case PRE_A1_STARTERS -> "STARTERS";
            case A1_MOVERS -> "MOVERS";
            case A2_FLYERS -> "FLYERS";
        };
    }

    private String textOrDefault(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void requireText(String value, String label) {
        if (isBlank(value)) throw new IllegalArgumentException(label + " là bắt buộc");
    }

    private void requireCode(String value, String label) {
        requireText(value, label);
        String normalized = value.trim();
        if (normalized.startsWith("NEW_") || !normalized.matches(CODE_PATTERN)) {
            throw new IllegalArgumentException(label + " phải dùng chữ in hoa, số, dấu gạch ngang/gạch dưới và không được bắt đầu bằng NEW_");
        }
    }

    private void requireVersionCode(String value) {
        requireText(value, "Mã phiên bản");
        if (!value.trim().matches(VERSION_CODE_PATTERN)) {
            throw new IllegalArgumentException("Mã phiên bản chỉ được dùng chữ in hoa, số, dấu chấm, gạch ngang hoặc gạch dưới");
        }
    }

    private void validateStoredCode(String code, String path, String label, List<ValidationIssue> issues) {
        if (isBlank(code) || code.startsWith("NEW_") || !code.matches(CODE_PATTERN)) {
            issues.add(issue(path + ".code", "Mã " + label + " không hợp lệ; không dùng giá trị NEW_*"));
        }
    }

    private int value(Integer number) {
        return number == null ? 0 : number;
    }
}
