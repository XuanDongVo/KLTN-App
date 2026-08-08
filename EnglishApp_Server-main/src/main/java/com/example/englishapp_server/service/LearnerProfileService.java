package com.example.englishapp_server.service;

import com.example.englishapp_server.common.enums.ActivityType;
import com.example.englishapp_server.document.LearnerHistory;
import com.example.englishapp_server.repository.mongo.LearnerHistoryRepository;
import com.example.englishapp_server.entity.User;
import com.example.englishapp_server.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearnerProfileService {
    private final UserRepository userRepository;
    private final LearnerHistoryRepository historyRepository;

    @Transactional
    public void deductHeart(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            refreshDailyStats(user);
            if (user.getHearts() != null && user.getHearts() > 0) {
                user.setHearts(user.getHearts() - 1);
                userRepository.save(user);
            }
        });
    }

    @Transactional
    public void addXp(UUID userId, int xpEarned) {
        if (xpEarned <= 0) return;
        userRepository.findById(userId).ifPresent(user -> {
            refreshDailyStats(user);
            
            // Add total score
            long currentTotal = user.getTotalScore() == null ? 0 : user.getTotalScore();
            user.setTotalScore(currentTotal + xpEarned);

            // Add daily XP
            int currentDaily = user.getDailyXp() == null ? 0 : user.getDailyXp();
            user.setDailyXp(currentDaily + xpEarned);

            // Check goal
            if (user.getDailyXp() >= user.getDailyGoal()) {
                LocalDate today = LocalDate.now();
                if (user.getLastStreakDate() == null || !user.getLastStreakDate().isEqual(today)) {
                    // Increment streak!
                    int streak = user.getStreak() == null ? 0 : user.getStreak();
                    user.setStreak(streak + 1);
                    user.setLastStreakDate(today);

                    // Log history
                    historyRepository.save(LearnerHistory.builder()
                            .userId(userId.toString())
                            .activityType(ActivityType.DAILY_GOAL_REACHED)
                            .stats(new HashMap<>(Map.of("streak", user.getStreak(), "dailyXp", user.getDailyXp())))
                            .timestamp(LocalDateTime.now())
                            .build());
                }
            }
            
            user.setLastActiveDate(LocalDate.now());
            userRepository.save(user);
        });
    }

    public User getProfileAndRefresh(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        boolean changed = refreshDailyStats(user);
        if (changed) {
            userRepository.save(user);
        }
        return user;
    }

    @Transactional
    public void updateProfile(UUID userId, String username, String avatarUrl) {
        User user = userRepository.findById(userId).orElseThrow();
        boolean changed = false;
        if (username != null && !username.trim().isEmpty()) {
            if (!username.trim().equals(user.getUsername())) {
                user.setUsername(username.trim());
                changed = true;
            }
        }
        if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            if (!avatarUrl.trim().equals(user.getAvatarUrl())) {
                user.setAvatarUrl(avatarUrl.trim());
                changed = true;
            }
        }
        if (changed) {
            userRepository.save(user);
        }
    }

    @Transactional
    public void updatePushToken(UUID userId, String token) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setExpoPushToken(token);
        userRepository.save(user);
    }

    private boolean refreshDailyStats(User user) {
        boolean changed = false;
        LocalDate today = LocalDate.now();
        LocalDate lastActive = user.getLastActiveDate();

        // 1. Reset daily XP and hearts if a new day has started
        if (lastActive == null || lastActive.isBefore(today)) {
            user.setDailyXp(0);
            user.setHearts(5); // Regenerate to 5
            changed = true;
        }

        // 2. Check if streak was lost (didn't meet goal yesterday)
        LocalDate lastStreak = user.getLastStreakDate();
        if (lastStreak != null) {
            LocalDate yesterday = today.minusDays(1);
            if (lastStreak.isBefore(yesterday)) {
                // User missed yesterday
                if (user.getStreak() == null || user.getStreak() > 0) {
                    user.setStreak(0);
                    changed = true;
                }
            }
        }

        // Initialize nulls
        if (user.getDailyGoal() == null) { user.setDailyGoal(20); changed = true; }
        if (user.getStreak() == null) { user.setStreak(0); changed = true; }
        if (user.getHearts() == null) { user.setHearts(5); changed = true; }
        
        return changed;
    }
}
