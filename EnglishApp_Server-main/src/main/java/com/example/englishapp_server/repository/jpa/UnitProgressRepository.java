package com.example.englishapp_server.repository.jpa;

import com.example.englishapp_server.entity.UnitProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UnitProgressRepository extends JpaRepository<UnitProgress, Long> {
    Optional<UnitProgress> findByUserIdAndUnitId(UUID userId, Long unitId);
}
