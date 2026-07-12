package com.example.englishapp_server.dto.request;

import com.example.englishapp_server.common.enums.QuestionType;
import org.antlr.v4.runtime.misc.NotNull;

public class CreateQuestionRequest {
    @NotNull
    private Long unitId;

    @NotNull
    private QuestionType questionType;

    @NotNull
    private Object questionData;

    private String explanation;
}
