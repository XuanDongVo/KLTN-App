package com.example.englishapp_server.curriculum.importer;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class CurriculumPackageValidator {

    public void validate(CurriculumPackage curriculumPackage) {
        require(curriculumPackage.schemaVersion() == 1, "Unsupported curriculum schema version");
        requireText(curriculumPackage.programCode(), "programCode");
        requireText(curriculumPackage.versionCode(), "versionCode");
        require(curriculumPackage.levelCode() != null, "levelCode is required");
        require(curriculumPackage.status() != null, "status is required");
        require(!safe(curriculumPackage.sources()).isEmpty(), "At least one source is required");
        require(!safe(curriculumPackage.units()).isEmpty(), "At least one unit is required");

        Set<String> sourceRefs = uniqueCodes(
                safe(curriculumPackage.sources()).stream().map(CurriculumPackage.Source::ref).toList(), "source");
        Set<String> unitCodes = new HashSet<>();
        for (CurriculumPackage.UnitData unit : safe(curriculumPackage.units())) {
            requireText(unit.code(), "unit.code");
            require(unitCodes.add(unit.code()), "Duplicate unit code: " + unit.code());
            validateMedia(unit.coverImage(), "unit " + unit.code());
            require(!safe(unit.lessons()).isEmpty(), "Unit " + unit.code() + " has no lessons");

            Set<String> lessonCodes = new HashSet<>();
            for (CurriculumPackage.LessonData lesson : safe(unit.lessons())) {
                requireText(lesson.code(), "lesson.code");
                require(lessonCodes.add(lesson.code()), "Duplicate lesson code: " + lesson.code());
                validateMedia(lesson.coverImage(), "lesson " + lesson.code());
                int activityCount = safe(lesson.activities()).size();
                require(activityCount >= 8 && activityCount <= 12,
                        "Lesson " + lesson.code() + " must contain 8-12 activities, found " + activityCount);

                Set<String> activityCodes = new HashSet<>();
                for (CurriculumPackage.ActivityData activity : safe(lesson.activities())) {
                    requireText(activity.code(), "activity.code");
                    require(activityCodes.add(activity.code()), "Duplicate activity code: " + activity.code());
                    require(activity.type() != null, "Activity type is required: " + activity.code());
                    require(activity.stage() != null, "Activity stage is required: " + activity.code());
                    requireText(activity.prompt(), "activity.prompt");
                    require(activity.content() != null,
                            "Activity content must be an object: " + activity.code());
                    require(activity.answer() != null,
                            "Activity answer must be an object: " + activity.code());
                    validateActivityContent(activity);
                    require(!safe(activity.sourceRefs()).isEmpty(), "Activity needs sourceRefs: " + activity.code());
                    for (String sourceRef : safe(activity.sourceRefs())) {
                        require(sourceRefs.contains(sourceRef),
                                "Unknown sourceRef " + sourceRef + " in activity " + activity.code());
                    }
                }
            }
        }
    }

    private void validateActivityContent(CurriculumPackage.ActivityData activity) {
        if (activity.type() == com.example.englishapp_server.curriculum.domain.LearningActivityType.INTRO) {
            Object rawItems = activity.content().get("items");
            require(rawItems instanceof List<?> items && !items.isEmpty(),
                    "INTRO activity needs bilingual items: " + activity.code());
            for (Object rawItem : (List<?>) rawItems) {
                require(rawItem instanceof Map<?, ?>, "INTRO item must be an object: " + activity.code());
                Map<?, ?> item = (Map<?, ?>) rawItem;
                requireTextValue(item.get("word"), "INTRO item.word in " + activity.code());
                requireTextValue(item.get("meaning"), "INTRO item.meaning in " + activity.code());
            }
        }

        if (activity.type() == com.example.englishapp_server.curriculum.domain.LearningActivityType.MATCH_PAIRS) {
            List<String> left = stringList(activity.content().get("left"), "MATCH_PAIRS left", activity.code());
            List<String> right = stringList(activity.content().get("right"), "MATCH_PAIRS right", activity.code());
            require(left.size() == right.size() && !left.isEmpty(),
                    "MATCH_PAIRS columns must have equal non-zero sizes: " + activity.code());
            require(new HashSet<>(left).size() == left.size() && new HashSet<>(right).size() == right.size(),
                    "MATCH_PAIRS values must be unique: " + activity.code());

            Object rawPairs = activity.answer().get("pairs");
            require(rawPairs instanceof Map<?, ?>, "MATCH_PAIRS answer.pairs is required: " + activity.code());
            Map<?, ?> pairs = (Map<?, ?>) rawPairs;
            require(new HashSet<>(pairs.keySet()).equals(new HashSet<>(left)),
                    "MATCH_PAIRS answer keys must match the left column: " + activity.code());
            require(new HashSet<>(pairs.values()).equals(new HashSet<>(right)),
                    "MATCH_PAIRS answer values must match the right column: " + activity.code());
        }
    }

    private List<String> stringList(Object value, String field, String code) {
        require(value instanceof List<?>, field + " must be an array: " + code);
        List<?> values = (List<?>) value;
        require(values.stream().allMatch(item -> item instanceof String text && !text.isBlank()),
                field + " must contain text values: " + code);
        return values.stream().map(String.class::cast).toList();
    }

    private void requireTextValue(Object value, String field) {
        require(value instanceof String text && !text.isBlank(), field + " is required");
    }

    private Set<String> uniqueCodes(List<String> values, String label) {
        Set<String> result = new HashSet<>();
        for (String value : values) {
            requireText(value, label + ".ref");
            require(result.add(value), "Duplicate " + label + " ref: " + value);
        }
        return result;
    }

    private void validateMedia(CurriculumPackage.MediaData media, String owner) {
        require(media != null, "Cover image is required for " + owner);
        requireText(media.path(), owner + ".coverImage.path");
        require(media.path().startsWith("/curriculum/"), "Cover image must use a curriculum path for " + owner);
        require(media.width() > 0 && media.height() > 0, "Cover image dimensions are invalid for " + owner);
        requireText(media.alt(), owner + ".coverImage.alt");
    }

    private <T> List<T> safe(List<T> value) {
        return value == null ? List.of() : value;
    }

    private void requireText(String value, String field) {
        require(value != null && !value.isBlank(), field + " is required");
    }

    private void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalArgumentException(message);
        }
    }
}
