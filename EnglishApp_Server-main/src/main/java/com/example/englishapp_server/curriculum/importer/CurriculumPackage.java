package com.example.englishapp_server.curriculum.importer;

import com.example.englishapp_server.curriculum.domain.*;
import java.util.List;
import java.util.Map;

public record CurriculumPackage(
        int schemaVersion,
        String programCode,
        String versionCode,
        LevelCode levelCode,
        String title,
        String description,
        LifecycleStatus status,
        List<Source> sources,
        List<UnitData> units
) {
    public record Source(String ref, String title, String url, String locator, String checkedAt) {}

    public record MediaData(String path, int width, int height, String alt) {}

    public record UnitData(
            String code,
            String title,
            String description,
            int order,
            MediaData coverImage,
            List<LessonData> lessons
    ) {}

    public record LessonData(
            String code,
            String title,
            String objective,
            int order,
            int estimatedMinutes,
            int xpReward,
            MediaData coverImage,
            List<ActivityData> activities
    ) {}

    public record ActivityData(
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
}
