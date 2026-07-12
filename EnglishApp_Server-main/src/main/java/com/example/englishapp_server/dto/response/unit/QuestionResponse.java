package com.example.englishapp_server.dto.response.unit;

import com.example.englishapp_server.common.enums.QuestionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionResponse {
    private Long id;
    private QuestionType questionType;
    private String explanation;
    private Object questionData;
    private Long unitId;
    private String unitTitle;
}
