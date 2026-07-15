package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.LearningActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningActivityRepository extends JpaRepository<LearningActivity, Long> {
    List<LearningActivity> findByLessonIdOrderByOrderIndex(Long lessonId);
    long countByLessonId(Long lessonId);
}
