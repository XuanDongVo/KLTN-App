package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.ActivityAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActivityAttemptRepository extends JpaRepository<ActivityAttempt, Long> {
    boolean existsBySessionIdAndActivityId(java.util.UUID sessionId, Long activityId);

    @Query("select count(a) from ActivityAttempt a where a.activity.lesson.learningUnit.curriculumVersion.id = :versionId")
    long countByCurriculumVersionId(@Param("versionId") Long versionId);
}
