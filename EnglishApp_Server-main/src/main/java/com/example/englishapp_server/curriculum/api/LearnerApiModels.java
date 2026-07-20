package com.example.englishapp_server.curriculum.api;

import com.example.englishapp_server.curriculum.domain.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class LearnerApiModels {
    private LearnerApiModels() {}

    public record LevelSummary(
            LevelCode code,
            String title,
            String versionCode,
            int unitCount,
            int lessonCount,
            int completedLessons,
            boolean unlocked
    ) {}

    public record LearningPath(
            LevelCode level,
            String title,
            String versionCode,
            List<UnitSummary> units
    ) {}

    public record MediaView(String path, int width, int height, String alt) {}

    public record UnitSummary(
            Long id, String code, String title, String description, MediaView coverImage,
            List<LessonSummary> lessons
    ) {}

    public record LessonSummary(
            Long id,
            String code,
            String title,
            String objective,
            int estimatedMinutes,
            int xpReward,
            MediaView coverImage,
            long activityCount,
            boolean unlocked,
            ProgressStatus progressStatus,
            int stars,
            int bestScore
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
            Map<String, Object> content
    ) {}

    public record SessionView(
            UUID id,
            Long lessonId,
            SessionStatus status,
            int currentActivityIndex,
            int heartsRemaining,
            int correctAttempts,
            int totalAttempts,
            int xpEarned,
            List<ActivityView> activities
    ) {}

    public record AttemptRequest(Long activityId, Map<String, Object> answer) {}

    public record AttemptResult(
            boolean correct,
            String feedback,
            int heartsRemaining,
            int currentActivityIndex,
            int xpEarned,
            boolean canFinish
    ) {}

    public record FinishResult(
            UUID sessionId,
            int correct,
            int total,
            int score,
            int stars,
            int xpEarned,
            int heartsRemaining
    ) {}

    public record PhotoMissionSaveRequest(
            String caption,
            List<String> vocabularies,
            String imageUrl,
            Double confidenceScore
    ) {}
}
