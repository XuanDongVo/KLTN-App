package com.example.englishapp_server.dto.response.contributor;

import com.example.englishapp_server.common.enums.ContributorRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ContributorRequestResponse {
    private Long id;
    private UUID userId;
    private String username;
    private String email;
    private String certificateUrl;
    private String note;
    private ContributorRequestStatus status;
    private String adminFeedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
