package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.ActivityAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityAttemptRepository extends JpaRepository<ActivityAttempt, Long> {
    boolean existsBySessionIdAndActivityId(java.util.UUID sessionId, Long activityId);
}
