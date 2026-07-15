package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.LearnerLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearnerLessonProgressRepository extends JpaRepository<LearnerLessonProgress, Long> {
    Optional<LearnerLessonProgress> findByUserIdAndLessonId(UUID userId, Long lessonId);
    List<LearnerLessonProgress> findByUserId(UUID userId);
}
