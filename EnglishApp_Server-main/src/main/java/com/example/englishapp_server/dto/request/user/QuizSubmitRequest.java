package com.example.englishapp_server.dto.request.user;

import lombok.Data;

@Data
public class QuizSubmitRequest {
    private Long unitId;
    private int correctCount;
    private int wrongCount;
}