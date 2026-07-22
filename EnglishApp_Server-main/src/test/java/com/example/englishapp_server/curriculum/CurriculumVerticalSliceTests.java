package com.example.englishapp_server.curriculum;

import com.example.englishapp_server.curriculum.api.LearnerApiModels.AttemptRequest;
import com.example.englishapp_server.curriculum.domain.LevelCode;
import com.example.englishapp_server.curriculum.importer.CurriculumBootstrapService;
import com.example.englishapp_server.curriculum.importer.CurriculumImportService;
import com.example.englishapp_server.curriculum.repository.*;
import com.example.englishapp_server.curriculum.service.LearnerCurriculumService;
import com.example.englishapp_server.curriculum.service.LessonSessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;


@SpringBootTest(properties = "spring.data.mongodb.uuid-representation=standard")
@Transactional
class CurriculumVerticalSliceTests {
    private static final List<String> MANIFESTS = List.of(
            "curriculum/starters-v4/manifest.json",
            "curriculum/movers-v1/manifest.json",
            "curriculum/flyers-v1/manifest.json");

    @Autowired CurriculumImportService importService;
    @Autowired CurriculumBootstrapService bootstrapService;
    @Autowired CurriculumVersionRepository versionRepository;
    @Autowired LearningUnitRepository unitRepository;
    @Autowired LessonRepository lessonRepository;
    @Autowired LearningActivityRepository activityRepository;
    @Autowired LessonSessionService sessionService;
    @Autowired LearnerCurriculumService curriculumService;
    @Autowired ObjectMapper objectMapper;

    @Test
    void bootstrapsAllPackagesOnceWhenDatabaseIsEmpty() {
        List<Resource> resources = MANIFESTS.stream()
                .map(path -> (Resource) new ClassPathResource(path))
                .toList();
        var first = bootstrapService.importIfDatabaseIsEmpty(resources);
        var second = bootstrapService.importIfDatabaseIsEmpty(resources);

        assertThat(first.imported()).isTrue();
        assertThat(first.versionCodes()).containsExactly("STARTERS_2026.4", "MOVERS_2026.1", "FLYERS_2026.1");
        assertThat(second.imported()).isFalse();
        assertThat(second.existingVersionCount()).isEqualTo(3);
        assertThat(versionRepository.count()).isEqualTo(3);
        assertThat(unitRepository.count()).isEqualTo(15);
        assertThat(lessonRepository.count()).isEqualTo(75);
        assertThat(activityRepository.count()).isEqualTo(600);
        lessonRepository.findAll().forEach(lesson ->
                assertThat(activityRepository.countByLessonId(lesson.getId())).isEqualTo(8));
    }

    @Test
    void showsAllLevelsAndLocksMoversUntilStartersIsComplete() throws Exception {
        importAll();
        UUID userId = UUID.randomUUID();

        var levels = curriculumService.getLevels(userId);
        assertThat(levels).extracting(level -> level.code()).containsExactly(
                LevelCode.PRE_A1_STARTERS, LevelCode.A1_MOVERS, LevelCode.A2_FLYERS);
        assertThat(levels).allSatisfy(level -> {
            assertThat(level.unitCount()).isEqualTo(5);
            assertThat(level.lessonCount()).isEqualTo(25);
        });
        assertThat(levels.get(0).unlocked()).isTrue();
        assertThat(levels.get(1).unlocked()).isFalse();
        assertThat(levels.get(2).unlocked()).isFalse();

        var starters = curriculumService.getPath(userId, LevelCode.PRE_A1_STARTERS);
        assertThat(starters.units()).hasSize(5).allSatisfy(unit -> assertThat(unit.lessons()).hasSize(5));
        assertThat(starters.units().getFirst().lessons().getFirst().unlocked()).isTrue();
        assertThat(starters.units().getFirst().lessons().get(1).unlocked()).isFalse();

        var movers = curriculumService.getPath(userId, LevelCode.A1_MOVERS);
        assertThat(movers.units()).hasSize(5);
        assertThat(movers.units()).allSatisfy(unit ->
                assertThat(unit.lessons()).allSatisfy(lesson -> assertThat(lesson.unlocked()).isFalse()));
        assertThatThrownBy(() -> sessionService.start(userId, movers.units().getFirst().lessons().getFirst().id()))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("hoàn thành cấp độ trước");
    }

    @Test
    void completesFirstLessonWithoutExposingAnswerKeysAndUnlocksSecondLesson() throws Exception {
        importAll();
        UUID userId = UUID.randomUUID();
        var path = curriculumService.getPath(userId, LevelCode.PRE_A1_STARTERS);
        var firstLesson = path.units().getFirst().lessons().getFirst();
        var session = sessionService.start(userId, firstLesson.id());

        assertThat(objectMapper.writeValueAsString(session))
                .doesNotContain("answerJson", "accepted", "\"answer\"");

        Map<String, Map<String, Object>> answers = Map.of(
                "STARTERS_L01_A01", Map.of("completed", true),
                "STARTERS_L01_A02", Map.of("completed", true),
                "STARTERS_L01_A03", Map.of("value", "hello"),
                "STARTERS_L01_A04", Map.of("value", "hello"),
                "STARTERS_L01_A05", Map.of("pairs", Map.of(
                        "hello", "xin chào", "goodbye", "tạm biệt", "name", "tên")),
                "STARTERS_L01_A06", Map.of("order", List.of("Hello,", "my", "name", "is", "Ben.")),
                "STARTERS_L01_A07", Map.of("value", "Hello, my name is Ben."),
                "STARTERS_L01_A08", Map.of("completed", true)
        );

        for (var activity : session.activities()) {
            var result = sessionService.submitAttempt(userId, session.id(),
                    new AttemptRequest(activity.id(), answers.get(activity.code())));
            assertThat(result.correct()).as(activity.code()).isTrue();
        }
        assertThat(sessionService.finish(userId, session.id()).score()).isEqualTo(100);

        var updatedPath = curriculumService.getPath(userId, LevelCode.PRE_A1_STARTERS);
        assertThat(updatedPath.units().getFirst().lessons().get(1).unlocked()).isTrue();
    }

    private void importAll() throws Exception {
        for (String manifest : MANIFESTS) {
            try (var input = new ClassPathResource(manifest).getInputStream()) {
                importService.importPackage(input);
            }
        }
    }
}
