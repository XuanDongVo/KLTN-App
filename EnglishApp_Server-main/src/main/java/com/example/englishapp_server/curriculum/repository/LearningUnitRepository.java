package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.LearningUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningUnitRepository extends JpaRepository<LearningUnit, Long> {
    List<LearningUnit> findByCurriculumVersionIdOrderByOrderIndex(Long curriculumVersionId);
}
