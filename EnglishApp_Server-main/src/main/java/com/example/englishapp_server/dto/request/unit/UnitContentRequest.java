package com.example.englishapp_server.dto.request.unit;

import lombok.Data;
import java.util.List;

@Data
public class UnitContentRequest {
    private String imageUrl;
    private String finalCaption;
    private String grammarStructure;
    private List<VocabRequest> vocabularies; // Danh sách từ vựng đi kèm trong caption này
}
