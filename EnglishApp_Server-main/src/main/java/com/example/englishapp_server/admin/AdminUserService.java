package com.example.englishapp_server.admin;

import com.example.englishapp_server.common.enums.AccountStatus;
import com.example.englishapp_server.common.enums.UserRole;
import com.example.englishapp_server.curriculum.domain.*;
import com.example.englishapp_server.curriculum.repository.*;
import com.example.englishapp_server.entity.User;
import com.example.englishapp_server.repository.jpa.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

import static com.example.englishapp_server.admin.AdminOperationsModels.*;

@Service
public class AdminUserService {
    private final UserRepository userRepository;
    private final LessonSessionRepository sessionRepository;
    private final LearnerLessonProgressRepository progressRepository;
    private final CurriculumVersionRepository versionRepository;
    private final LessonRepository lessonRepository;
    private final AdminAuditService auditService;

    public AdminUserService(UserRepository userRepository, LessonSessionRepository sessionRepository,
                            LearnerLessonProgressRepository progressRepository,
                            CurriculumVersionRepository versionRepository, LessonRepository lessonRepository,
                            AdminAuditService auditService) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.progressRepository = progressRepository;
        this.versionRepository = versionRepository;
        this.lessonRepository = lessonRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Dashboard dashboard() {
        long total = userRepository.countByRole(UserRole.USER);
        return new Dashboard(
                total,
                userRepository.countByRoleAndAccountStatus(UserRole.USER, AccountStatus.ACTIVE),
                userRepository.countByRoleAndAccountStatus(UserRole.USER, AccountStatus.LOCKED),
                userRepository.countByRoleAndLastLoginAtAfter(UserRole.USER, LocalDateTime.now().minusDays(7)),
                sessionRepository.count(),
                progressRepository.countCompleted(),
                auditService.recent()
        );
    }

    @Transactional(readOnly = true)
    public UserPage users(String search, AccountStatus status, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(5, Math.min(size, 50));
        var result = userRepository.searchLearners(UserRole.USER, status,
                search == null ? "" : search.trim(), PageRequest.of(safePage, safeSize));
        List<UserSummary> items = result.getContent().stream().map(this::summary).toList();
        return new UserPage(items, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public UserDetail user(UUID userId) {
        User user = requireLearner(userId);
        List<LearnerLessonProgress> allProgress = progressRepository.findByUserId(userId);
        List<LevelProgress> levelProgress = new ArrayList<>();

        for (LevelCode level : LevelCode.values()) {
            var published = versionRepository
                    .findFirstByLevelCodeAndLifecycleStatusOrderByImportedAtDesc(level, LifecycleStatus.PUBLISHED);
            if (published.isEmpty()) continue;
            long versionId = published.get().getId();
            List<LearnerLessonProgress> current = allProgress.stream()
                    .filter(progress -> progress.getLesson().getLearningUnit().getCurriculumVersion().getId().equals(versionId))
                    .toList();
            int completed = (int) current.stream().filter(progress -> progress.getProgressStatus() == ProgressStatus.COMPLETED).count();
            int stars = current.stream().mapToInt(LearnerLessonProgress::getStars).sum();
            levelProgress.add(new LevelProgress(level, levelTitle(level), completed,
                    lessonRepository.countByCurriculumVersionId(versionId), stars));
        }

        List<SessionView> sessions = sessionRepository.findTop20ByUserIdOrderByStartedAtDesc(userId).stream()
                .map(session -> new SessionView(session.getId(), session.getLesson().getTitle(), session.getSessionStatus(),
                        session.getCorrectAttempts(), session.getTotalAttempts(), session.getXpEarned(),
                        session.getStartedAt(), session.getFinishedAt()))
                .toList();
        return new UserDetail(summary(user), progressRepository.sumStarsByUserId(userId), levelProgress, sessions);
    }

    @Transactional
    public UserDetail updateStatus(UUID adminUserId, UUID userId, StatusRequest request) {
        User user = requireLearner(userId);
        if (request == null || request.status() == null) throw new IllegalArgumentException("Thiếu trạng thái tài khoản");
        user.setAccountStatus(request.status());
        userRepository.save(user);
        auditService.record(adminUserId, "USER_STATUS_CHANGED", "USER", userId.toString(), request.status().name());
        return user(userId);
    }

    private User requireLearner(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("Không tìm thấy người học"));
        if (user.getRole() != UserRole.USER) throw new SecurityException("Không thể thay đổi tài khoản quản trị");
        return user;
    }

    private UserSummary summary(User user) {
        return new UserSummary(user.getId(), user.getUsername(), user.getEmail(), user.getAvatarUrl(),
                user.getAccountStatus(), user.getTotalScore() == null ? 0 : user.getTotalScore(),
                progressRepository.countByUserIdAndProgressStatus(user.getId(), ProgressStatus.COMPLETED),
                user.getCreatedAt(), user.getLastLoginAt());
    }

    private String levelTitle(LevelCode level) {
        return switch (level) {
            case PRE_A1_STARTERS -> "Pre A1 Starters";
            case A1_MOVERS -> "A1 Movers";
            case A2_FLYERS -> "A2 Flyers";
        };
    }
}
