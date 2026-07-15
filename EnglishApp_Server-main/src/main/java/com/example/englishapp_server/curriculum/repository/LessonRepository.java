package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByLearningUnitIdOrderByOrderIndex(Long learningUnitId);

    @Query("select count(l) from Lesson l where l.learningUnit.curriculumVersion.id = :versionId")
    long countByCurriculumVersionId(@Param("versionId") Long versionId);
}
