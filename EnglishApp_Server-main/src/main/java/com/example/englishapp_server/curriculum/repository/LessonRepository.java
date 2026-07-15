package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByLearningUnitIdOrderByOrderIndex(Long learningUnitId);
}
