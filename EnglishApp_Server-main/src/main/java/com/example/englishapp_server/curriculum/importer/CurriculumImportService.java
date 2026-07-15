package com.example.englishapp_server.curriculum.importer;

import com.example.englishapp_server.curriculum.domain.*;
import com.example.englishapp_server.curriculum.repository.*;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class CurriculumImportService {
    private final ObjectMapper objectMapper;
    private final CurriculumPackageValidator validator;
    private final CurriculumVersionRepository versionRepository;
    private final LearningUnitRepository unitRepository;
    private final LessonRepository lessonRepository;
    private final LearningActivityRepository activityRepository;

    public CurriculumImportService(ObjectMapper objectMapper,
                                   CurriculumPackageValidator validator,
                                   CurriculumVersionRepository versionRepository,
                                   LearningUnitRepository unitRepository,
                                   LessonRepository lessonRepository,
                                   LearningActivityRepository activityRepository) {
        this.objectMapper = objectMapper;
        this.validator = validator;
        this.versionRepository = versionRepository;
        this.unitRepository = unitRepository;
        this.lessonRepository = lessonRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public ImportResult importPackage(InputStream inputStream) {
        try {
            byte[] bytes = inputStream.readAllBytes();
            String checksum = sha256(bytes);
            CurriculumPackage curriculumPackage = objectMapper.readValue(bytes, CurriculumPackage.class);
            validator.validate(curriculumPackage);

            var existing = versionRepository.findByVersionCode(curriculumPackage.versionCode());
            if (existing.isPresent()) {
                if (existing.get().getChecksum().equals(checksum)) {
                    return new ImportResult(existing.get().getId(), curriculumPackage.versionCode(), false);
                }
                throw new IllegalStateException(
                        "Published curriculum version is immutable; use a new versionCode: " + curriculumPackage.versionCode());
            }

            CurriculumVersion version = versionRepository.save(CurriculumVersion.builder()
                    .levelCode(curriculumPackage.levelCode())
                    .versionCode(curriculumPackage.versionCode())
                    .title(curriculumPackage.title())
                    .description(curriculumPackage.description())
                    .lifecycleStatus(curriculumPackage.status())
                    .checksum(checksum)
                    .sourceManifestJson(objectMapper.writeValueAsString(curriculumPackage.sources()))
                    .importedAt(LocalDateTime.now())
                    .build());

            for (CurriculumPackage.UnitData unitData : curriculumPackage.units()) {
                LearningUnit unit = unitRepository.save(LearningUnit.builder()
                        .curriculumVersion(version)
                        .code(unitData.code())
                        .title(unitData.title())
                        .description(unitData.description())
                        .coverImagePath(unitData.coverImage().path())
                        .coverImageWidth(unitData.coverImage().width())
                        .coverImageHeight(unitData.coverImage().height())
                        .coverImageAlt(unitData.coverImage().alt())
                        .orderIndex(unitData.order())
                        .build());

                for (CurriculumPackage.LessonData lessonData : unitData.lessons()) {
                    Lesson lesson = lessonRepository.save(Lesson.builder()
                            .learningUnit(unit)
                            .code(lessonData.code())
                            .title(lessonData.title())
                            .objective(lessonData.objective())
                            .coverImagePath(lessonData.coverImage().path())
                            .coverImageWidth(lessonData.coverImage().width())
                            .coverImageHeight(lessonData.coverImage().height())
                            .coverImageAlt(lessonData.coverImage().alt())
                            .orderIndex(lessonData.order())
                            .estimatedMinutes(lessonData.estimatedMinutes())
                            .xpReward(lessonData.xpReward())
                            .build());

                    for (CurriculumPackage.ActivityData activityData : lessonData.activities()) {
                        activityRepository.save(LearningActivity.builder()
                                .lesson(lesson)
                                .code(activityData.code())
                                .activityType(activityData.type())
                                .activityStage(activityData.stage())
                                .orderIndex(activityData.order())
                                .promptText(activityData.prompt())
                                .instructionText(activityData.instruction())
                                .contentJson(objectMapper.writeValueAsString(activityData.content()))
                                .answerJson(objectMapper.writeValueAsString(activityData.answer()))
                                .sourceRefsJson(objectMapper.writeValueAsString(activityData.sourceRefs()))
                                .xpReward(activityData.xpReward())
                                .build());
                    }
                }
            }
            return new ImportResult(version.getId(), curriculumPackage.versionCode(), true);
        } catch (IOException exception) {
            throw new IllegalArgumentException("Cannot read curriculum package", exception);
        }
    }

    private String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (Exception exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public record ImportResult(Long curriculumVersionId, String versionCode, boolean imported) {}
}
