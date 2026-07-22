package com.example.englishapp_server.curriculum.service;

import com.example.englishapp_server.curriculum.api.LearnerApiModels.*;
import com.example.englishapp_server.curriculum.domain.*;
import com.example.englishapp_server.curriculum.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class LearnerCurriculumService {
    private final CurriculumVersionRepository versionRepository;
    private final LearningUnitRepository unitRepository;
    private final LessonRepository lessonRepository;
    private final LearningActivityRepository activityRepository;
    private final LearnerLessonProgressRepository progressRepository;

    public LearnerCurriculumService(CurriculumVersionRepository versionRepository,
                                    LearningUnitRepository unitRepository,
                                    LessonRepository lessonRepository,
                                    LearningActivityRepository activityRepository,
                                    LearnerLessonProgressRepository progressRepository) {
        this.versionRepository = versionRepository;
        this.unitRepository = unitRepository;
        this.lessonRepository = lessonRepository;
        this.activityRepository = activityRepository;
        this.progressRepository = progressRepository;
    }

    @Transactional(readOnly = true)
    public List<LevelSummary> getLevels(UUID userId) {
        Map<String, LearnerLessonProgress> progressByLesson = progressByLesson(userId);
        List<LevelSummary> summaries = new ArrayList<>();
        for (LevelCode levelCode : LevelCode.values()) {
            Optional<CurriculumVersion> optionalVersion = publishedVersion(levelCode);
            if (optionalVersion.isEmpty()) continue;

            CurriculumVersion version = optionalVersion.get();
            List<LearningUnit> units = units(version);
            List<Lesson> lessons = orderedLessons(version);
            int completed = (int) lessons.stream()
                    .filter(lesson -> isCompleted(progressByLesson.get(lesson.getCode())))
                    .count();
            summaries.add(new LevelSummary(levelCode, version.getTitle(), version.getVersionCode(),
                    units.size(), lessons.size(), completed, isLevelUnlocked(levelCode, progressByLesson)));
        }
        return summaries;
    }

    @Transactional(readOnly = true)
    public LearningPath getPath(UUID userId, LevelCode levelCode) {
        CurriculumVersion version = publishedVersion(levelCode)
                .orElseThrow(() -> new NoSuchElementException("No published curriculum for " + levelCode));
        Map<String, LearnerLessonProgress> progressByLesson = progressByLesson(userId);
        List<Lesson> orderedLessons = orderedLessons(version);
        List<LearningUnit> units = units(version);
        boolean levelUnlocked = isLevelUnlocked(levelCode, progressByLesson);

        Set<Long> unlockedLessonIds = new HashSet<>();
        for (int index = 0; index < orderedLessons.size(); index++) {
            if (levelUnlocked && index == 0) {
                unlockedLessonIds.add(orderedLessons.get(index).getId());
            } else if (levelUnlocked) {
                LearnerLessonProgress previous = progressByLesson.get(orderedLessons.get(index - 1).getCode());
                if (isCompleted(previous)) {
                    unlockedLessonIds.add(orderedLessons.get(index).getId());
                }
            }
        }

        List<UnitSummary> unitViews = units.stream().map(unit -> {
            List<LessonSummary> lessons = lessonRepository.findByLearningUnitIdOrderByOrderIndex(unit.getId())
                    .stream().map(lesson -> {
                        LearnerLessonProgress progress = progressByLesson.get(lesson.getCode());
                        ProgressStatus status = progress == null ? ProgressStatus.AVAILABLE : progress.getProgressStatus();
                        return new LessonSummary(
                                lesson.getId(), lesson.getCode(), lesson.getTitle(), lesson.getObjective(),
                                lesson.getEstimatedMinutes(), lesson.getXpReward(),
                                media(lesson.getCoverImagePath(), lesson.getCoverImageWidth(),
                                        lesson.getCoverImageHeight(), lesson.getCoverImageAlt()),
                                activityRepository.countByLessonId(lesson.getId()), unlockedLessonIds.contains(lesson.getId()),
                                status, progress == null ? 0 : progress.getStars(),
                                progress == null ? 0 : progress.getBestScore());
                    }).toList();
            return new UnitSummary(unit.getId(), unit.getCode(), unit.getTitle(), unit.getDescription(),
                    media(unit.getCoverImagePath(), unit.getCoverImageWidth(),
                            unit.getCoverImageHeight(), unit.getCoverImageAlt()), lessons);
        }).toList();

        return new LearningPath(levelCode, version.getTitle(), version.getVersionCode(), unitViews);
    }

    @Transactional(readOnly = true)
    public void requireUnlocked(UUID userId, Lesson targetLesson) {
        CurriculumVersion targetVersion = targetLesson.getLearningUnit().getCurriculumVersion();
        CurriculumVersion activeVersion = publishedVersion(targetVersion.getLevelCode())
                .orElseThrow(() -> new NoSuchElementException("No published curriculum for " + targetVersion.getLevelCode()));
        if (!activeVersion.getId().equals(targetVersion.getId())) {
            throw new SecurityException("Bài học không thuộc phiên bản chương trình đang hoạt động");
        }

        Map<String, LearnerLessonProgress> progressByLesson = progressByLesson(userId);
        if (!isLevelUnlocked(targetVersion.getLevelCode(), progressByLesson)) {
            throw new SecurityException("Hãy hoàn thành cấp độ trước để mở khóa cấp độ này");
        }

        List<Lesson> lessons = orderedLessons(targetVersion);
        int targetIndex = -1;
        for (int index = 0; index < lessons.size(); index++) {
            if (lessons.get(index).getId().equals(targetLesson.getId())) {
                targetIndex = index;
                break;
            }
        }
        if (targetIndex < 0) {
            throw new NoSuchElementException("Lesson is not part of the active learning path");
        }
        if (targetIndex == 0) return;

        Lesson previousLesson = lessons.get(targetIndex - 1);
        if (!isCompleted(progressByLesson.get(previousLesson.getCode()))) {
            throw new SecurityException("Hãy hoàn thành bài trước để mở khóa bài học này");
        }
    }

    private Optional<CurriculumVersion> publishedVersion(LevelCode levelCode) {
        return versionRepository.findFirstByLevelCodeAndLifecycleStatusOrderByImportedAtDesc(
                levelCode, LifecycleStatus.PUBLISHED);
    }

    private List<LearningUnit> units(CurriculumVersion version) {
        return unitRepository.findByCurriculumVersionIdOrderByOrderIndex(version.getId());
    }

    private List<Lesson> orderedLessons(CurriculumVersion version) {
        List<Lesson> lessons = new ArrayList<>();
        for (LearningUnit unit : units(version)) {
            lessons.addAll(lessonRepository.findByLearningUnitIdOrderByOrderIndex(unit.getId()));
        }
        return lessons;
    }

    private Map<String, LearnerLessonProgress> progressByLesson(UUID userId) {
        Map<String, LearnerLessonProgress> result = new HashMap<>();
        for (LearnerLessonProgress progress : progressRepository.findByUserId(userId)) {
            result.put(progress.getLessonCode(), progress);
        }
        return result;
    }

    private boolean isLevelUnlocked(LevelCode levelCode, Map<String, LearnerLessonProgress> progressByLesson) {
        int levelIndex = levelCode.ordinal();
        if (levelIndex == 0) return true;

        LevelCode previousLevel = LevelCode.values()[levelIndex - 1];
        Optional<CurriculumVersion> previousVersion = publishedVersion(previousLevel);
        if (previousVersion.isEmpty()) return false;
        List<Lesson> previousLessons = orderedLessons(previousVersion.get());
        return !previousLessons.isEmpty() && previousLessons.stream()
                .allMatch(lesson -> isCompleted(progressByLesson.get(lesson.getCode())));
    }

    private boolean isCompleted(LearnerLessonProgress progress) {
        return progress != null && progress.getProgressStatus() == ProgressStatus.COMPLETED;
    }

    private MediaView media(String path, Integer width, Integer height, String alt) {
        if (path == null || width == null || height == null) return null;
        return new MediaView(path, width, height, alt);
    }
}
