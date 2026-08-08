package com.example.englishapp_server.repository.jpa;

import com.example.englishapp_server.common.enums.ChallengeStatus;
import com.example.englishapp_server.entity.UserChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserChallengeRepository extends JpaRepository<UserChallenge, UUID> {
    Optional<UserChallenge> findFirstByUserIdAndStatusOrderByStartDateDesc(UUID userId, ChallengeStatus status);
    List<UserChallenge> findByStatusAndEndDateBefore(ChallengeStatus status, LocalDateTime now);
}
