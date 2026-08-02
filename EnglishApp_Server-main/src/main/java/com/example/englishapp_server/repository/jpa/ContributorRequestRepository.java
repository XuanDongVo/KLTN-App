package com.example.englishapp_server.repository.jpa;

import com.example.englishapp_server.entity.ContributorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContributorRequestRepository extends JpaRepository<ContributorRequest, Long> {
    List<ContributorRequest> findByUserId(UUID userId);
    List<ContributorRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<ContributorRequest> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);
}
