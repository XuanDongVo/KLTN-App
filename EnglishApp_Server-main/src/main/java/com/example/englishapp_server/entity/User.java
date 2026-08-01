package com.example.englishapp_server.entity;
import com.example.englishapp_server.common.enums.UserRole;
import com.example.englishapp_server.common.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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
    @Column(name = "daily_goal")
    private Integer dailyGoal = 20;

    @Builder.Default
    @Column(name = "daily_xp")
    private Integer dailyXp = 0;

    @Builder.Default
    @Column(name = "streak")
    private Integer streak = 0;

    @Builder.Default
    @Column(name = "hearts")
    private Integer hearts = 5;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    @Column(name = "last_streak_date")
    private LocalDate lastStreakDate;

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

    @Column(name = "expo_push_token")
    private String expoPushToken;

    @PrePersist
    void initializeAccountMetadata() {
        if (accountStatus == null) accountStatus = AccountStatus.ACTIVE;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
