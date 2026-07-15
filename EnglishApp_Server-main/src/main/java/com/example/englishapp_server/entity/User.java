package com.example.englishapp_server.entity;
import com.example.englishapp_server.common.enums.UserRole;
import com.example.englishapp_server.common.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String avatarUrl;

    private Long totalScore;

    @Builder.Default
    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.ORDINAL)
    private UserRole role = UserRole.USER;

    @Column(name = "verified", nullable = false)
    private boolean isVerified;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 20)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @PrePersist
    void initializeAccountMetadata() {
        if (accountStatus == null) accountStatus = AccountStatus.ACTIVE;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
