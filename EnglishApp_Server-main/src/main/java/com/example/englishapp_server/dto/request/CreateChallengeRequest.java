package com.example.englishapp_server.dto.request;

import lombok.Data;

@Data
public class CreateChallengeRequest {
    private Integer targetXp;
    private Integer targetDays;
}
