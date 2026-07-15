package com.example.englishapp_server.curriculum.service;

import com.example.englishapp_server.curriculum.api.LearnerApiModels.*;
import com.example.englishapp_server.curriculum.domain.*;
import com.example.englishapp_server.curriculum.repository.*;
import com.example.englishapp_server.repository.jpa.UserRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class LessonSessionService {
    private static final int STARTING_HEARTS = 5;

    private final LessonRepository lessonRepository;
    private final LearningActivityRepository activityRepository;
    private final LessonSessionRepository sessionRepository;
    private final ActivityAttemptRepository attemptRepository;
    private final LearnerLessonProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final LearnerCurriculumService curriculumService;

    public LessonSessionService(LessonRepository lessonRepository,
                                LearningActivityRepository activityRepository,
                                LessonSessionRepository sessionRepository,
                                ActivityAttemptRepository attemptRepository,
                                LearnerLessonProgressRepository progressRepository,
                                UserRepository userRepository,
                                ObjectMapper objectMapper,
                                LearnerCurriculumService curriculumService) {
        this.lessonRepository = lessonRepository;
        this.activityRepository = activityRepository;
        this.sessionRepository = sessionRepository;
        this.attemptRepository = attemptRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.curriculumService = curriculumService;
    }

    @Transactional
    public SessionView start(UUID userId, Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NoSuchElementException("Lesson not found"));
        curriculumService.requireUnlocked(userId, lesson);
        LessonSession session = sessionRepository.save(LessonSession.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .lesson(lesson)
                .sessionStatus(SessionStatus.IN_PROGRESS)
                .currentActivityIndex(0)
                .totalAttempts(0)
                .correctAttempts(0)
                .heartsStarted(STARTING_HEARTS)
                .heartsRemaining(STARTING_HEARTS)
                .xpEarned(0)
                .startedAt(LocalDateTime.now())
                .build());

        progressRepository.findByUserIdAndLessonId(userId, lessonId).orElseGet(() ->
                progressRepository.save(LearnerLessonProgress.builder()
                        .userId(userId)
                        .lesson(lesson)
                        .progressStatus(ProgressStatus.IN_PROGRESS)
                        .bestScore(0)
                        .stars(0)
                        .completionCount(0)
                        .build()));
        return toView(session);
    }

    @Transactional(readOnly = true)
    public SessionView get(UUID userId, UUID sessionId) {
        return toView(ownedSession(userId, sessionId));
    }

    @Transactional
    public AttemptResult submitAttempt(UUID userId, UUID sessionId, AttemptRequest request) {
        LessonSession session = ownedSession(userId, sessionId);
        requireInProgress(session);
        List<LearningActivity> activities = activities(session);
        if (session.getCurrentActivityIndex() >= activities.size()) {
            throw new IllegalStateException("All activities have already been attempted");
        }

        LearningActivity activity = activities.get(session.getCurrentActivityIndex());
        if (!activity.getId().equals(request.activityId())) {
            throw new IllegalArgumentException("Attempt must target the current activity");
        }
        if (attemptRepository.existsBySessionIdAndActivityId(sessionId, activity.getId())) {
            throw new IllegalStateException("Activity has already been attempted in this session");
        }

        Map<String, Object> submitted = request.answer() == null ? Map.of() : request.answer();
        boolean correct = evaluate(activity, submitted);
        int earned = correct ? activity.getXpReward() : 0;
        session.setTotalAttempts(session.getTotalAttempts() + 1);
        session.setCorrectAttempts(session.getCorrectAttempts() + (correct ? 1 : 0));
        session.setXpEarned(session.getXpEarned() + earned);
        session.setCurrentActivityIndex(session.getCurrentActivityIndex() + 1);
        if (!correct && activity.getActivityStage() == ActivityStage.CHECK) {
            session.setHeartsRemaining(Math.max(0, session.getHeartsRemaining() - 1));
        }

        attemptRepository.save(ActivityAttempt.builder()
                .session(session)
                .activity(activity)
                .submittedAnswerJson(writeJson(submitted))
                .correct(correct)
                .score(correct ? 100 : 0)
                .feedback(correct ? "Chính xác!" : "Chưa đúng, mình sẽ ôn lại mục này sau nhé.")
                .attemptedAt(LocalDateTime.now())
                .build());
        sessionRepository.save(session);

        boolean canFinish = session.getCurrentActivityIndex() >= activities.size() || session.getHeartsRemaining() == 0;
        return new AttemptResult(correct,
                correct ? "Chính xác!" : "Chưa đúng, mình sẽ ôn lại mục này sau nhé.",
                session.getHeartsRemaining(), session.getCurrentActivityIndex(), session.getXpEarned(), canFinish);
    }

    @Transactional
    public FinishResult finish(UUID userId, UUID sessionId) {
        LessonSession session = ownedSession(userId, sessionId);
        requireInProgress(session);
        int activityCount = activities(session).size();
        if (session.getCurrentActivityIndex() < activityCount && session.getHeartsRemaining() > 0) {
            throw new IllegalStateException("Lesson still has activities to complete");
        }

        int total = Math.max(1, session.getTotalAttempts());
        int score = (int) Math.round(session.getCorrectAttempts() * 100.0 / total);
        int stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
        session.setSessionStatus(SessionStatus.COMPLETED);
        session.setFinishedAt(LocalDateTime.now());

        LearnerLessonProgress progress = progressRepository.findByUserIdAndLessonId(userId, session.getLesson().getId())
                .orElseThrow();
        boolean firstCompletion = progress.getProgressStatus() != ProgressStatus.COMPLETED;
        progress.setProgressStatus(ProgressStatus.COMPLETED);
        progress.setBestScore(Math.max(progress.getBestScore(), score));
        progress.setStars(Math.max(progress.getStars(), stars));
        progress.setCompletionCount(progress.getCompletionCount() + 1);
        progress.setLastCompletedAt(LocalDateTime.now());
        if (progress.getFirstCompletedAt() == null) {
            progress.setFirstCompletedAt(LocalDateTime.now());
        }

        if (firstCompletion) {
            session.setXpEarned(session.getXpEarned() + session.getLesson().getXpReward());
        }
        userRepository.findById(userId).ifPresent(user -> {
            long current = user.getTotalScore() == null ? 0 : user.getTotalScore();
            user.setTotalScore(current + session.getXpEarned());
            userRepository.save(user);
        });

        return new FinishResult(session.getId(), session.getCorrectAttempts(), session.getTotalAttempts(),
                score, stars, session.getXpEarned(), session.getHeartsRemaining());
    }

    private boolean evaluate(LearningActivity activity, Map<String, Object> submitted) {
        try {
            JsonNode expected = objectMapper.readTree(activity.getAnswerJson());
            JsonNode submittedNode = objectMapper.valueToTree(submitted);
            if (expected.path("mode").asText().equals("completion")) {
                return submittedNode.path("completed").asBoolean(false);
            }
            if (expected.has("accepted")) {
                String actual = normalize(submittedNode.path("value").asText());
                for (JsonNode accepted : expected.path("accepted")) {
                    if (normalize(accepted.asText()).equals(actual)) return true;
                }
                return false;
            }
            if (expected.has("value")) {
                return normalize(expected.path("value").asText())
                        .equals(normalize(submittedNode.path("value").asText()));
            }
            if (expected.has("order")) {
                return expected.path("order").equals(submittedNode.path("order"));
            }
            if (expected.has("pairs")) {
                return expected.path("pairs").equals(submittedNode.path("pairs"));
            }
            return false;
        } catch (Exception exception) {
            throw new IllegalStateException("Invalid answer key for activity " + activity.getCode(), exception);
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private SessionView toView(LessonSession session) {
        List<ActivityView> views = activities(session).stream().map(activity -> new ActivityView(
                activity.getId(), activity.getCode(), activity.getActivityType(), activity.getActivityStage(),
                activity.getOrderIndex(), activity.getPromptText(), activity.getInstructionText(),
                activity.getXpReward(), readJson(activity.getContentJson()))).toList();
        return new SessionView(session.getId(), session.getLesson().getId(), session.getSessionStatus(),
                session.getCurrentActivityIndex(), session.getHeartsRemaining(), session.getCorrectAttempts(),
                session.getTotalAttempts(), session.getXpEarned(), views);
    }

    private LessonSession ownedSession(UUID userId, UUID sessionId) {
        LessonSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NoSuchElementException("Session not found"));
        if (!session.getUserId().equals(userId)) throw new SecurityException("Session belongs to another learner");
        return session;
    }

    private void requireInProgress(LessonSession session) {
        if (session.getSessionStatus() != SessionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Session is not in progress");
        }
    }

    private List<LearningActivity> activities(LessonSession session) {
        return activityRepository.findByLessonIdOrderByOrderIndex(session.getLesson().getId());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readJson(String value) {
        try {
            return objectMapper.readValue(value, Map.class);
        } catch (Exception exception) {
            throw new IllegalStateException("Stored curriculum JSON is invalid", exception);
        }
    }

    private String writeJson(Map<String, Object> value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Submitted answer is invalid", exception);
        }
    }
}
