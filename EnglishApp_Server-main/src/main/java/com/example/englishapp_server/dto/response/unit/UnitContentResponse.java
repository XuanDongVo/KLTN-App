package com.example.englishapp_server.dto.response.unit;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UnitContentResponse {
    private Long id;
    private String imageUrl;
    private String finalCaption;
    private String grammarStructure;
    private List<VocabResponse> vocabularies;
}
