package com.example.englishapp_server.service;

import com.example.englishapp_server.repository.jpa.unit.QuestionBankRepository;
import com.example.englishapp_server.repository.jpa.unit.UnitRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuestionBankService {
    private final QuestionBankRepository questionBankRepository;
    private final UnitRepository unitRepository;
    private final ObjectMapper objectMapper;
    @Autowired
    public QuestionBankService(QuestionBankRepository qRepo, UnitRepository uRepo, ObjectMapper mapper) {
        this.questionBankRepository = qRepo;
        this.unitRepository = uRepo;
        this.objectMapper = mapper;
    }

//    public void createQuestion(CreateQuestionRequest request) throws Exception {
//        Unit unit = unitRepository.findById(request.getUnitId())
//                .orElseThrow(() -> new RuntimeException("Unit not found"));
//
//        // Chuyển cục Object linh hoạt kia thành chuỗi JSON (String)
//        String jsonStringData = objectMapper.writeValueAsString(request.getQuestionData());
//
//        QuestionBank newQuestion = QuestionBank.builder()
//                .unit(unit)
//                .questionType(request.getQuestionType())
//                .questionData(jsonStringData)
//                .explanation(request.getExplanation())
//                .build();
//
//        questionBankRepository.save(newQuestion);
//    }
}
