package com.example.englishapp_server.dto.response;

import com.example.englishapp_server.common.enums.ChallengeStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ChallengeResponse {
    private UUID id;
    private Integer targetXp;
    private Integer targetDays;
    private Integer currentXp;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ChallengeStatus status;
}
