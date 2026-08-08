package com.example.englishapp_server.service;

import com.example.englishapp_server.common.enums.ChallengeStatus;
import com.example.englishapp_server.document.LearnerHistory;
import com.example.englishapp_server.dto.request.CreateChallengeRequest;
import com.example.englishapp_server.dto.response.ChallengeResponse;
import com.example.englishapp_server.entity.UserChallenge;
import com.example.englishapp_server.entity.User;
import com.example.englishapp_server.repository.jpa.UserChallengeRepository;
import com.example.englishapp_server.repository.jpa.UserRepository;
import com.example.englishapp_server.repository.mongo.LearnerHistoryRepository;
import com.example.englishapp_server.admin.AdminOperationsModels.ChallengeStatsResponse;
import com.example.englishapp_server.admin.AdminOperationsModels.ChallengeOptionStats;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChallengeService {

    private final UserChallengeRepository challengeRepository;
    private final LearnerHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final MailService mailService;

    public ChallengeResponse createChallenge(UUID userId, CreateChallengeRequest request) {
        // Kiểm tra xem đã có thử thách nào đang chạy chưa
        Optional<UserChallenge> activeChallenge = challengeRepository.findFirstByUserIdAndStatusOrderByStartDateDesc(userId, ChallengeStatus.ACTIVE);
        if (activeChallenge.isPresent()) {
            throw new RuntimeException("Bạn đang có một thử thách chưa hoàn thành!");
        }

        UserChallenge challenge = UserChallenge.builder()
                .userId(userId)
                .targetXp(request.getTargetXp())
                .targetDays(request.getTargetDays())
                .status(ChallengeStatus.ACTIVE)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(request.getTargetDays()))
                .build();

        challenge = challengeRepository.save(challenge);
        return toResponse(challenge, 0);
    }

    public ChallengeResponse getCurrentChallenge(UUID userId) {
        Optional<UserChallenge> activeChallengeOpt = challengeRepository.findFirstByUserIdAndStatusOrderByStartDateDesc(userId, ChallengeStatus.ACTIVE);
        if (activeChallengeOpt.isEmpty()) {
            return null; // Không có thử thách
        }
        
        UserChallenge challenge = activeChallengeOpt.get();
        int currentXp = calculateProgressStats(challenge.getUserId().toString(), challenge.getStartDate()).currentXp;
        
        return toResponse(challenge, currentXp);
    }

    public static class ChallengeProgressStats {
        public int currentXp;
        public int completedUnits;
        public int learnedDays;
        
        public ChallengeProgressStats(int currentXp, int completedUnits, int learnedDays) {
            this.currentXp = currentXp;
            this.completedUnits = completedUnits;
            this.learnedDays = learnedDays;
        }
    }

    public ChallengeProgressStats calculateProgressStats(String userId, LocalDateTime startDate) {
        List<LearnerHistory> histories = historyRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                userId, startDate, LocalDateTime.now()
        );

        int totalXp = 0;
        java.util.Set<Long> uniqueUnits = new java.util.HashSet<>();
        java.util.Set<java.time.LocalDate> uniqueDays = new java.util.HashSet<>();

        for (LearnerHistory history : histories) {
            if (history.getStats() != null && history.getStats().get("xpEarned") != null) {
                totalXp += ((Number) history.getStats().get("xpEarned")).intValue();
            }
            if (history.getUnitId() != null) {
                uniqueUnits.add(history.getUnitId());
            }
            if (history.getTimestamp() != null) {
                uniqueDays.add(history.getTimestamp().toLocalDate());
            }
        }
        return new ChallengeProgressStats(totalXp, uniqueUnits.size(), uniqueDays.size());
    }

    private ChallengeResponse toResponse(UserChallenge challenge, int currentXp) {
        return ChallengeResponse.builder()
                .id(challenge.getId())
                .targetXp(challenge.getTargetXp())
                .targetDays(challenge.getTargetDays())
                .currentXp(currentXp)
                .startDate(challenge.getStartDate())
                .endDate(challenge.getEndDate())
                .status(challenge.getStatus())
                .build();
    }

    public void evaluateExpiredChallenges() {
        log.info("Starting to evaluate expired challenges...");
        List<UserChallenge> expiredChallenges = challengeRepository.findByStatusAndEndDateBefore(ChallengeStatus.ACTIVE, LocalDateTime.now());

        for (UserChallenge challenge : expiredChallenges) {
            try {
                ChallengeProgressStats stats = calculateProgressStats(challenge.getUserId().toString(), challenge.getStartDate());
                int currentXp = stats.currentXp;
                
                if (currentXp >= challenge.getTargetXp()) {
                    challenge.setStatus(ChallengeStatus.COMPLETED);
                } else {
                    challenge.setStatus(ChallengeStatus.FAILED);
                }
                challengeRepository.save(challenge);

                Optional<User> userOpt = userRepository.findById(challenge.getUserId());
                if (userOpt.isPresent() && userOpt.get().getEmail() != null) {
                    User user = userOpt.get();
                    if (user.isVerified()) {
                        // Send challenge report
                        mailService.sendChallengeReportEmail(user.getEmail(), user.getUsername(), currentXp, challenge.getTargetXp(), challenge.getTargetDays(), stats.completedUnits, stats.learnedDays);
                    } else {
                        log.info("Skipping email for user {} because email is not verified.", user.getId());
                    }
                }
            } catch (Exception e) {
                log.error("Failed to evaluate challenge {}", challenge.getId(), e);
            }
        }
        log.info("Finished evaluating {} expired challenges.", expiredChallenges.size());
    }

    public ChallengeStatsResponse getChallengeStats() {
        List<UserChallenge> allChallenges = challengeRepository.findAll();
        
        long totalActive = allChallenges.stream().filter(c -> c.getStatus() == ChallengeStatus.ACTIVE).count();
        long totalCompleted = allChallenges.stream().filter(c -> c.getStatus() == ChallengeStatus.COMPLETED).count();
        long totalFailed = allChallenges.stream().filter(c -> c.getStatus() == ChallengeStatus.FAILED).count();
        
        Map<String, Long> optionCounts = allChallenges.stream()
                .collect(Collectors.groupingBy(c -> c.getTargetXp() + "-" + c.getTargetDays(), Collectors.counting()));
                
        List<ChallengeOptionStats> optionsStats = optionCounts.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    return new ChallengeOptionStats(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), entry.getValue());
                })
                .collect(Collectors.toList());
                
        return new ChallengeStatsResponse(totalActive, totalCompleted, totalFailed, optionsStats);
    }
}
