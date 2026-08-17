package com.example.englishapp_server.curriculum.service;

import com.example.englishapp_server.common.enums.ActivityType;
import com.example.englishapp_server.curriculum.api.LearnerApiModels.AttemptRequest;
import com.example.englishapp_server.curriculum.domain.*;
import com.example.englishapp_server.curriculum.repository.*;
import com.example.englishapp_server.document.LearnerHistory;
import com.example.englishapp_server.repository.jpa.UserRepository;
import com.example.englishapp_server.repository.mongo.LearnerHistoryRepository;
import com.example.englishapp_server.service.LearnerProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LessonSessionServiceTests {
    private LessonSessionService service;
    private LessonSessionRepository sessionRepository;
    private ActivityAttemptRepository attemptRepository;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        LessonRepository lessonRepository = mock(LessonRepository.class);
        LearningActivityRepository activityRepository = mock(LearningActivityRepository.class);
        sessionRepository = mock(LessonSessionRepository.class);
        attemptRepository = mock(ActivityAttemptRepository.class);
        LearnerLessonProgressRepository progressRepository = mock(LearnerLessonProgressRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        objectMapper = new ObjectMapper();
        LearnerCurriculumService curriculumService = mock(LearnerCurriculumService.class);
        LearnerHistoryRepository historyRepository = mock(LearnerHistoryRepository.class);
        LearnerProfileService profileService = mock(LearnerProfileService.class);
        SpeechTranscriptionService speechTranscriptionService = mock(SpeechTranscriptionService.class);

        service = new LessonSessionService(
                lessonRepository,
                activityRepository,
                sessionRepository,
                attemptRepository,
                progressRepository,
                userRepository,
                objectMapper,
                curriculumService,
                historyRepository,
                profileService,
                speechTranscriptionService
        );
    }

    @Test
    void allowsSkippingSpeakingActivityWithoutAudio() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        LessonSession session = LessonSession.builder()
                .id(sessionId)
                .userId(userId)
                .sessionStatus(SessionStatus.IN_PROGRESS)
                .currentActivityIndex(0)
                .totalAttempts(0)
                .correctAttempts(0)
                .heartsStarted(5)
                .heartsRemaining(5)
                .xpEarned(0)
                .startedAt(LocalDateTime.now())
                .dynamicActivitiesJson(objectMapper.writeValueAsString(List.of(buildSpeakingActivity())))
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(java.util.Optional.of(session));
        when(sessionRepository.save(any(LessonSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(attemptRepository.existsBySessionIdAndActivityId(eq(sessionId), anyLong())).thenReturn(false);
        when(attemptRepository.save(any(ActivityAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.submitAttempt(userId, sessionId, new AttemptRequest(1L, Map.of("skipped", true)));

        assertFalse(result.correct());
        assertEquals(1, session.getTotalAttempts());
        assertEquals(1, session.getCurrentActivityIndex());
        assertEquals(0, session.getXpEarned());
        verify(attemptRepository).save(any(ActivityAttempt.class));
    }

    private LearningActivity buildSpeakingActivity() {
        return LearningActivity.builder()
                .id(1L)
                .code("speak-1")
                .activityType(LearningActivityType.SPEAK)
                .activityStage(ActivityStage.CHECK)
                .orderIndex(1)
                .promptText("Say hello")
                .instructionText("Say hello")
                .contentJson("{}")
                .answerJson("{}")
                .sourceRefsJson("[]")
                .xpReward(10)
                .build();
    }
}
