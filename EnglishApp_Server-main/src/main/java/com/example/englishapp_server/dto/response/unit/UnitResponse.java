package com.example.englishapp_server.dto.response.unit;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UnitResponse {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private boolean isDeleted;
    private LocalDateTime deletedAt;
}