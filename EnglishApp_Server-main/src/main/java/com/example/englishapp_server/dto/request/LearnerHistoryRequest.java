package com.example.englishapp_server.dto.request;

import com.example.englishapp_server.common.enums.ActivityType;
import lombok.Data;

import java.util.List;

public class LearnerHistoryRequest {
    private ActivityType activityType;
    private Long unitId;

    private QuizStats stats;
    private List<QuizDetail> details;


    @Data
    public static class QuizStats {
        private int totalQuestions;
        private int correctCount;
        private int scoreEarned;
        private int timeSpentSeconds;
    }

    @Data
    public static class QuizDetail {
        private Long questionId;
        private String wordTested;
        private String userAnswer;
        private boolean isCorrect;
    }
}
