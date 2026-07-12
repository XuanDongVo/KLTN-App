package com.example.englishapp_server.dto.request.unit;

import lombok.Data;

@Data
public class VocabRequest {
    private String word;
    private String type;
    private String example;
}
