package com.example.englishapp_server.curriculum.service;

import com.example.englishapp_server.curriculum.domain.ActivityStage;
import com.example.englishapp_server.curriculum.api.LearnerApiModels.SessionView;
import com.example.englishapp_server.curriculum.domain.LearningActivity;
import com.example.englishapp_server.curriculum.domain.LearningActivityType;
import com.example.englishapp_server.curriculum.repository.LearnerLessonProgressRepository;
import com.example.englishapp_server.curriculum.repository.LearningActivityRepository;
import com.example.englishapp_server.curriculum.repository.LessonRepository;
import com.example.englishapp_server.document.PhotoMissionLog;
import com.example.englishapp_server.repository.mongo.PhotoMissionLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ReviewSessionService {
    private final LessonSessionService sessionService;
    private final LearnerLessonProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final LearningActivityRepository activityRepository;
    private final PhotoMissionLogRepository photoMissionLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public ReviewSessionService(LessonSessionService sessionService,
                                LearnerLessonProgressRepository progressRepository,
                                LessonRepository lessonRepository,
                                LearningActivityRepository activityRepository,
                                PhotoMissionLogRepository photoMissionLogRepository) {
        this.sessionService = sessionService;
        this.progressRepository = progressRepository;
        this.lessonRepository = lessonRepository;
        this.activityRepository = activityRepository;
        this.photoMissionLogRepository = photoMissionLogRepository;
    }

    @Transactional
    public SessionView startReview(UUID userId) {
        List<LearningActivity> activities = new ArrayList<>();

        // 1. Get random activities from completed lessons
        var completed = progressRepository.findByUserId(userId).stream()
                .filter(p -> p.getProgressStatus() != null && p.getProgressStatus().name().equals("COMPLETED"))
                .toList();

        List<Long> completedLessonIds = new ArrayList<>();
        for (var p : completed) {
            lessonRepository.findByCode(p.getLessonCode()).ifPresent(l -> completedLessonIds.add(l.getId()));
        }

        if (!completedLessonIds.isEmpty()) {
            List<LearningActivity> pastActivities = new ArrayList<>();
            for (Long lid : completedLessonIds) {
                pastActivities.addAll(activityRepository.findByLessonIdOrderByOrderIndex(lid));
            }
            Collections.shuffle(pastActivities);
            for (int i = 0; i < Math.min(5, pastActivities.size()); i++) {
                activities.add(pastActivities.get(i));
            }
        }

        // 2. Get PhotoMissionLogs and create flashcards
        List<PhotoMissionLog> logs = photoMissionLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Collections.shuffle(logs);
        int addedLogs = 0;
        long dummyId = -1L;
        for (PhotoMissionLog log : logs) {
            if (addedLogs >= 5) break;

            if (log.getDiscoveredVocabularies() != null && !log.getDiscoveredVocabularies().isEmpty()) {
                List<String> vocabs = new ArrayList<>(log.getDiscoveredVocabularies());
                Collections.shuffle(vocabs);
                
                for (String wordToLearn : vocabs) {
                    if (addedLogs >= 5) break;
                    // Translate using MyMemory (mocked or simple call)
                    String translated = translate(wordToLearn);

                    LearningActivity flashcard = new LearningActivity();
                    flashcard.setId(dummyId--); // dummy ID
                    flashcard.setActivityType(LearningActivityType.FLASHCARD);
                    flashcard.setActivityStage(ActivityStage.LEARN);
                    flashcard.setPromptText("Học từ vựng từ bộ sưu tập của bạn!");
                    flashcard.setInstructionText("Ghi nhớ từ này nhé.");
                    flashcard.setXpReward(10);
                    flashcard.setAnswerJson("{\"mode\":\"completion\"}");
                    
                    // Build content json
                    String contentJson = String.format("{\"term\":\"%s\",\"meaning\":\"%s\",\"imagePath\":\"%s\"}",
                            wordToLearn, translated, log.getImageUrl());
                    flashcard.setContentJson(contentJson);
                    
                    activities.add(flashcard);
                    addedLogs++;
                }
            }
        }

        if (activities.isEmpty()) {
            throw new IllegalStateException("Bạn chưa có dữ liệu để ôn tập. Hãy hoàn thành các bài học hoặc thu thập thẻ bài từ vựng!");
        }

        Collections.shuffle(activities);
        // re-assign order index
        for (int i = 0; i < activities.size(); i++) {
            activities.get(i).setOrderIndex(i);
        }

        return sessionService.startDynamicSession(userId, activities);
    }

    private String translate(String text) {
        try {
            String url = "https://api.mymemory.translated.net/get?q=" + text + "&langpair=en|vi";
            var response = restTemplate.getForObject(url, Map.class);
            Map<String, Object> responseData = (Map<String, Object>) response.get("responseData");
            return (String) responseData.get("translatedText");
        } catch (Exception e) {
            return "Bản dịch (từ thẻ bài)";
        }
    }
}
