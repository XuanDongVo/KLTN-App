package com.example.englishapp_server.admin;

import com.example.englishapp_server.common.enums.AccountStatus;
import com.example.englishapp_server.curriculum.domain.LevelCode;
import com.example.englishapp_server.curriculum.domain.SessionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class AdminOperationsModels {
    private AdminOperationsModels() {}

    public record Dashboard(
            long totalLearners,
            long activeLearners,
            long lockedLearners,
            long activeLastSevenDays,
            long totalSessions,
            long completedLessons,
            List<AuditView> recentActions
    ) {}

    public record UserSummary(
            UUID id,
            String username,
            String email,
            String avatarUrl,
            AccountStatus status,
            long totalScore,
            long completedLessons,
            LocalDateTime createdAt,
            LocalDateTime lastLoginAt
    ) {}

    public record UserPage(
            List<UserSummary> items,
            int page,
            int size,
            long totalItems,
            int totalPages
    ) {}

    public record LevelProgress(
            LevelCode level,
            String title,
            int completedLessons,
            long totalLessons,
            int stars
    ) {}

    public record SessionView(
            UUID id,
            String lessonTitle,
            SessionStatus status,
            int correctAttempts,
            int totalAttempts,
            int xpEarned,
            LocalDateTime startedAt,
            LocalDateTime finishedAt
    ) {}

    public record UserDetail(
            UserSummary user,
            long totalStars,
            List<LevelProgress> levels,
            List<SessionView> recentSessions
    ) {}

    public record StatusRequest(AccountStatus status) {}

    public record MediaSignatureRequest(String fileName, String contentType) {}
    public record MediaSignature(Map<String, Object> fields) {}

    public record MediaAssetRequest(
            String publicId,
            String secureUrl,
            String originalFileName,
            String contentType,
            int width,
            int height,
            long bytes
    ) {}

    public record MediaAssetView(
            Long id,
            String publicId,
            String secureUrl,
            String originalFileName,
            String contentType,
            int width,
            int height,
            long bytes,
            LocalDateTime createdAt
    ) {}

    public record AuditView(
            Long id,
            UUID adminUserId,
            String action,
            String targetType,
            String targetId,
            String details,
            LocalDateTime createdAt
    ) {}
}
