package com.example.englishapp_server.dto.response.unit;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VocabResponse {
    private Long id;
    private String word;
    private String type;
    private String example;
}