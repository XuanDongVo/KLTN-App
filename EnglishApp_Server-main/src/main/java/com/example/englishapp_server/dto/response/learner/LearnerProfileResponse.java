package com.example.englishapp_server.dto.response.learner;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LearnerProfileResponse {
    private Long totalScore;
    private Integer dailyGoal;
    private Integer dailyXp;
    private Integer streak;
    private Integer hearts;
    private String username;
    private String avatarUrl;
}
