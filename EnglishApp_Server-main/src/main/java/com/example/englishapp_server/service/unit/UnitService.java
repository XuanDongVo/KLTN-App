package com.example.englishapp_server.service.unit;

import com.example.englishapp_server.dto.request.unit.QuestionRequest;
import com.example.englishapp_server.dto.request.unit.UnitContentRequest;
import com.example.englishapp_server.dto.request.unit.UnitRequest;
import com.example.englishapp_server.dto.response.unit.QuestionResponse;
import com.example.englishapp_server.dto.response.unit.UnitContentResponse;
import com.example.englishapp_server.dto.response.unit.UnitResponse;
import com.example.englishapp_server.entity.QuestionBank;
import com.example.englishapp_server.entity.Unit;
import com.example.englishapp_server.entity.UnitImage;

import java.util.List;

public interface UnitService {
    List<UnitResponse> getAllActiveUnits();
    UnitResponse createUnit(UnitRequest request);
    UnitResponse updateUnit(Long id, UnitRequest request);
    UnitContentResponse addUnitContent(Long unitId, UnitContentRequest request);
    List<UnitContentResponse> getUnitContents(Long unitId);
    UnitContentResponse getUnitContentById(Long contentId);
    UnitContentResponse updateUnitContent(Long contentId, UnitContentRequest request);
    List<QuestionResponse> getQuestionsByUnit(Long unitId);
    QuestionResponse addQuestion(Long unitId, QuestionRequest request);
    QuestionResponse getQuestionById(Long questionId);
    QuestionResponse updateQuestion(Long questionId, QuestionRequest request);
}
