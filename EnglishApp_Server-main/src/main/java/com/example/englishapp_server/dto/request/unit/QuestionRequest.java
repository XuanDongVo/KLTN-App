package com.example.englishapp_server.dto.request.unit;

import com.example.englishapp_server.common.enums.QuestionType;
import lombok.Data;
import java.util.Map;

@Data
public class QuestionRequest {
    private QuestionType questionType;
    private String explanation;
    private Map<String, Object> questionData;
}
