package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.LessonSession;
import com.example.englishapp_server.curriculum.domain.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LessonSessionRepository extends JpaRepository<LessonSession, UUID> {
    List<LessonSession> findTop20ByUserIdOrderByStartedAtDesc(UUID userId);
    long countBySessionStatus(SessionStatus status);
    long countByStartedAtAfter(LocalDateTime threshold);

    @Query("select count(s) from LessonSession s where s.lesson.learningUnit.curriculumVersion.id = :versionId")
    long countByCurriculumVersionId(@Param("versionId") Long versionId);
}
