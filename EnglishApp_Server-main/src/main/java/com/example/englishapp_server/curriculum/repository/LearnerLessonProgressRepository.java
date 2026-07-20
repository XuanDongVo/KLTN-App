package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.LearnerLessonProgress;
import com.example.englishapp_server.curriculum.domain.ProgressStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearnerLessonProgressRepository extends JpaRepository<LearnerLessonProgress, Long> {
    Optional<LearnerLessonProgress> findByUserIdAndLessonCode(UUID userId, String lessonCode);
    List<LearnerLessonProgress> findByUserId(UUID userId);

    @Query("select count(p) from LearnerLessonProgress p where p.progressStatus = com.example.englishapp_server.curriculum.domain.ProgressStatus.COMPLETED")
    long countCompleted();

    @Query("select coalesce(sum(p.stars), 0) from LearnerLessonProgress p where p.userId = :userId")
    long sumStarsByUserId(@Param("userId") UUID userId);

    long countByUserIdAndProgressStatus(UUID userId, ProgressStatus progressStatus);

    @Query("select count(p) from LearnerLessonProgress p join Lesson l on p.lessonCode = l.code where l.learningUnit.curriculumVersion.id = :versionId")
    long countByCurriculumVersionId(@Param("versionId") Long versionId);
}
