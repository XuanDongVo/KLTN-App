package com.example.englishapp_server.curriculum.admin;

import com.example.englishapp_server.curriculum.domain.*;

import java.util.List;
import java.util.Map;

public final class AdminCurriculumModels {
    private AdminCurriculumModels() {}

    public record LevelOverview(LevelCode code, String displayName, List<VersionCard> versions) {}

    public record VersionCard(
            Long id,
            String versionCode,
            String title,
            String description,
            LifecycleStatus status,
            int unitCount,
            int lessonCount,
            int activityCount
    ) {}

    public record CurriculumTree(
            Long id,
            LevelCode levelCode,
            String versionCode,
            String title,
            String description,
            LifecycleStatus status,
            List<UnitView> units
    ) {}

    public record MediaData(String path, int width, int height, String alt) {}

    public record UnitView(
            Long id,
            String code,
            String title,
            String description,
            int order,
            MediaData coverImage,
            List<LessonView> lessons
    ) {}

    public record LessonView(
            Long id,
            String code,
            String title,
            String objective,
            int order,
            int estimatedMinutes,
            int xpReward,
            MediaData coverImage,
            List<ActivityView> activities
    ) {}

    public record ActivityView(
            Long id,
            String code,
            LearningActivityType type,
            ActivityStage stage,
            int order,
            String prompt,
            String instruction,
            int xpReward,
            Map<String, Object> content,
            Map<String, Object> answer,
            List<String> sourceRefs
    ) {}

    public record DraftRequest(String versionCode, String title, String description) {}
    public record VersionUpdateRequest(String versionCode, String title, String description) {}
    public record UnitRequest(String code, String title, String description, MediaData coverImage) {}
    public record LessonRequest(
            String code,
            String title,
            String objective,
            int estimatedMinutes,
            int xpReward,
            MediaData coverImage
    ) {}
    public record ActivityRequest(
            String code,
            LearningActivityType type,
            ActivityStage stage,
            String prompt,
            String instruction,
            int xpReward,
            Map<String, Object> content,
            Map<String, Object> answer
    ) {}
    public record ReorderRequest(List<Long> orderedIds) {}
    public record ValidationIssue(String path, String message) {}
    public record ValidationReport(boolean valid, List<ValidationIssue> issues) {}
    public record VersionDeleteCheck(
            Long versionId,
            String versionCode,
            LifecycleStatus status,
            boolean canDelete,
            long sessions,
            long progressRows,
            long attempts,
            String message
    ) {}
    public record VersionDeleteResult(Long versionId, String versionCode, boolean deleted) {}
}
