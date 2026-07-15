package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.CurriculumVersion;
import com.example.englishapp_server.curriculum.domain.LevelCode;
import com.example.englishapp_server.curriculum.domain.LifecycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CurriculumVersionRepository extends JpaRepository<CurriculumVersion, Long> {
    Optional<CurriculumVersion> findByVersionCode(String versionCode);
    List<CurriculumVersion> findByLevelCodeAndLifecycleStatus(LevelCode levelCode, LifecycleStatus status);
    List<CurriculumVersion> findByLevelCodeOrderByImportedAtDesc(LevelCode levelCode);
    Optional<CurriculumVersion> findFirstByLevelCodeAndLifecycleStatusOrderByImportedAtDesc(
            LevelCode levelCode, LifecycleStatus status);
}
