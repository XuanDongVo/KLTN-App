package com.example.englishapp_server.job;

import com.example.englishapp_server.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class ChallengeEvaluationJob {

    private final ChallengeService challengeService;

    // Run every night at midnight to check expired challenges
    @Scheduled(cron = "0 0 0 * * ?")
    public void executeChallengeEvaluation() {
        log.info("Cron job triggered: evaluating expired challenges...");
        challengeService.evaluateExpiredChallenges();
        log.info("Cron job finished: evaluated expired challenges.");
    }
}
