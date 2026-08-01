package com.example.englishapp_server.entity;

import com.example.englishapp_server.common.enums.ContributorRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contributor_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributorRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID userId;

    @Column(name = "certificate_url", nullable = false)
    private String certificateUrl;

    @Column(length = 500)
    private String note; // Optional note from user

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContributorRequestStatus status;

    @Column(length = 500)
    private String adminFeedback; // Reason if rejected

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        if (this.status == null) this.status = ContributorRequestStatus.PENDING;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
