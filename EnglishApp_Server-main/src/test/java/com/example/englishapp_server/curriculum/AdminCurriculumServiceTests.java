package com.example.englishapp_server.curriculum;

import com.example.englishapp_server.curriculum.admin.AdminCurriculumModels.DraftRequest;
import com.example.englishapp_server.curriculum.admin.AdminCurriculumModels.UnitRequest;
import com.example.englishapp_server.curriculum.admin.AdminCurriculumService;
import com.example.englishapp_server.curriculum.domain.LevelCode;
import com.example.englishapp_server.curriculum.domain.LifecycleStatus;
import com.example.englishapp_server.curriculum.importer.CurriculumImportService;
import com.example.englishapp_server.curriculum.repository.CurriculumVersionRepository;
import com.example.englishapp_server.curriculum.service.LearnerCurriculumService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AdminCurriculumServiceTests {
    @Autowired CurriculumImportService importService;
    @Autowired AdminCurriculumService adminService;
    @Autowired CurriculumVersionRepository versionRepository;
    @Autowired LearnerCurriculumService learnerService;

    @Test
    void editsIndependentDraftAndPublishesItWithoutMutatingOldVersion() throws Exception {
        importStarters();
        var oldPublished = versionRepository.findByVersionCode("STARTERS_2026.4").orElseThrow();

        var draft = adminService.createDraft(LevelCode.PRE_A1_STARTERS,
                new DraftRequest("STARTERS_2026.5", "Starters CMS", "Bản chỉnh sửa trong CMS"));
        assertThat(draft.status()).isEqualTo(LifecycleStatus.DRAFT);
        assertThat(draft.units()).hasSize(5);
        assertThat(draft.units()).allSatisfy(unit -> assertThat(unit.lessons()).hasSize(5));

        var firstUnit = draft.units().getFirst();
        var updated = adminService.updateUnit(firstUnit.id(), new UnitRequest(
                firstUnit.code(), "Unit đã chỉnh trong CMS", firstUnit.description(), firstUnit.coverImage()));
        assertThat(updated.units().getFirst().title()).isEqualTo("Unit đã chỉnh trong CMS");
        assertThat(adminService.getTree(oldPublished.getId()).units().getFirst().title())
                .isNotEqualTo("Unit đã chỉnh trong CMS");

        assertThat(adminService.validate(draft.id()).valid()).isTrue();
        var published = adminService.publish(draft.id());
        assertThat(published.status()).isEqualTo(LifecycleStatus.PUBLISHED);
        assertThat(versionRepository.findById(oldPublished.getId()).orElseThrow().getLifecycleStatus())
                .isEqualTo(LifecycleStatus.ARCHIVED);

        var learnerPath = learnerService.getPath(UUID.randomUUID(), LevelCode.PRE_A1_STARTERS);
        assertThat(learnerPath.versionCode()).isEqualTo("STARTERS_2026.5");
        assertThat(learnerPath.units().getFirst().title()).isEqualTo("Unit đã chỉnh trong CMS");
        assertThatThrownBy(() -> adminService.updateUnit(published.units().getFirst().id(), new UnitRequest(
                firstUnit.code(), "Không được sửa", firstUnit.description(), firstUnit.coverImage())))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("bản nháp");
    }

    @Test
    void allowsOnlyOneDraftPerLevel() throws Exception {
        importStarters();
        adminService.createDraft(LevelCode.PRE_A1_STARTERS, new DraftRequest("STARTERS_DRAFT_A", null, null));
        assertThatThrownBy(() -> adminService.createDraft(
                LevelCode.PRE_A1_STARTERS, new DraftRequest("STARTERS_DRAFT_B", null, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("đã có một bản nháp");
    }

    @Test
    void rejectsPlaceholderCodesAndDeletesNestedDraftContent() throws Exception {
        importStarters();
        var draft = adminService.createDraft(LevelCode.PRE_A1_STARTERS,
                new DraftRequest("STARTERS_2026.5", null, null));
        var firstUnit = draft.units().getFirst();

        assertThatThrownBy(() -> adminService.createUnit(draft.id(), new UnitRequest(
                "NEW_UNIT", "Unit không hợp lệ", "Kiểm tra mã placeholder", firstUnit.coverImage())))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("NEW_");

        var firstLesson = firstUnit.lessons().getFirst();
        var afterActivityDelete = adminService.deleteActivity(firstLesson.activities().getFirst().id());
        assertThat(afterActivityDelete.units().getFirst().lessons().getFirst().activities())
                .hasSize(firstLesson.activities().size() - 1);

        var afterLessonDelete = adminService.deleteLesson(firstLesson.id());
        assertThat(afterLessonDelete.units().getFirst().lessons())
                .hasSize(firstUnit.lessons().size() - 1);

        var afterUnitDelete = adminService.deleteUnit(firstUnit.id());
        assertThat(afterUnitDelete.units()).hasSize(draft.units().size() - 1);
    }

    @Test
    void deletesDraftVersionWhenItHasNoLearnerDependencies() throws Exception {
        importStarters();
        var draft = adminService.createDraft(LevelCode.PRE_A1_STARTERS,
                new DraftRequest("STARTERS_2026.5", null, null));

        var check = adminService.checkVersionDelete(draft.id());
        assertThat(check.canDelete()).isTrue();

        var result = adminService.deleteVersion(draft.id());
        assertThat(result.deleted()).isTrue();
        assertThat(versionRepository.findById(draft.id())).isEmpty();
    }

    private void importStarters() throws Exception {
        try (var input = new ClassPathResource("curriculum/starters-v4/manifest.json").getInputStream()) {
            importService.importPackage(input);
        }
    }
}
