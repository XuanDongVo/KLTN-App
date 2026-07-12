package com.example.englishapp_server.service.unit;


import com.example.englishapp_server.dto.request.unit.QuestionRequest;
import com.example.englishapp_server.dto.request.unit.UnitContentRequest;
import com.example.englishapp_server.dto.request.unit.UnitRequest;
import com.example.englishapp_server.dto.request.unit.VocabRequest;
import com.example.englishapp_server.dto.response.unit.QuestionResponse;
import com.example.englishapp_server.dto.response.unit.UnitContentResponse;
import com.example.englishapp_server.dto.response.unit.UnitResponse;
import com.example.englishapp_server.dto.response.unit.VocabResponse;
import com.example.englishapp_server.entity.QuestionBank;
import com.example.englishapp_server.entity.Unit;
import com.example.englishapp_server.entity.UnitImage;
import com.example.englishapp_server.entity.UnitVocabulary;
import com.example.englishapp_server.repository.jpa.unit.QuestionBankRepository;
import com.example.englishapp_server.repository.jpa.unit.UnitImageRepository;
import com.example.englishapp_server.repository.jpa.unit.UnitRepository;
import com.example.englishapp_server.repository.jpa.unit.UnitVocabularyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

//    @Autowired
    private final UnitRepository unitRepository;
    private final UnitImageRepository unitImageRepository;
    private final UnitVocabularyRepository unitVocabularyRepository;
    private final QuestionBankRepository questionBankRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<UnitResponse> getAllActiveUnits() {
        // 1. Lấy danh sách entity thô từ Database lên
        List<Unit> units = unitRepository.findAll();

        return units.stream().map(u -> UnitResponse.builder()
                .id(u.getId())
                .title(u.getTitle())
                .description(u.getDescription())
                .imageUrl(u.getImageUrl())
                .isDeleted(u.isDeleted())
                .deletedAt(u.getDeletedAt())
                .build()
        ).toList();
    }

    @Override
    @Transactional
    public UnitResponse createUnit(UnitRequest request) {
        Unit unit = Unit.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .isDeleted(false)
                .build();

        Unit savedUnit = unitRepository.save(unit);

        return UnitResponse.builder()
                .id(savedUnit.getId())
                .title(savedUnit.getTitle())
                .description(savedUnit.getDescription())
                .imageUrl(savedUnit.getImageUrl())
                .isDeleted(savedUnit.isDeleted())
                .build();
    }

    @Override
    @Transactional
    public UnitResponse updateUnit(Long id, UnitRequest request) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học id: " + id));

        unit.setTitle(request.getTitle());
        unit.setDescription(request.getDescription());
        unit.setImageUrl(request.getImageUrl());

        Unit updatedUnit = unitRepository.save(unit);

        return UnitResponse.builder()
                .id(updatedUnit.getId())
                .title(updatedUnit.getTitle())
                .description(updatedUnit.getDescription())
                .imageUrl(updatedUnit.getImageUrl())
                .isDeleted(updatedUnit.isDeleted())
                .build();
    }

    @Override
    @Transactional
    public UnitContentResponse addUnitContent(Long unitId, UnitContentRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học id: " + unitId));

        UnitImage unitImage = UnitImage.builder()
                .imageUrl(request.getImageUrl())
                .finalCaption(request.getFinalCaption())
                .grammarStructure(request.getGrammarStructure())
                .isApproved(true)
                .isDeleted(false)
                .unit(unit)
                .createdAt(LocalDateTime.now())
                .build();

        UnitImage savedImage = unitImageRepository.save(unitImage);

        List<UnitVocabulary> vocabList = new ArrayList<>();
        if (request.getVocabularies() != null && !request.getVocabularies().isEmpty()) {
            for (VocabRequest vDto : request.getVocabularies()) {
                UnitVocabulary vocab = UnitVocabulary.builder()
                        .word(vDto.getWord())
                        .type(vDto.getType())
                        .example(vDto.getExample())
                        .unitImage(savedImage)
                        .createdAt(LocalDateTime.now())
                        .build();
                vocabList.add(vocab);
            }
            vocabList = unitVocabularyRepository.saveAll(vocabList);
        }

        return mapToContentResponse(savedImage, vocabList);
    }

    @Override
    public List<UnitContentResponse> getUnitContents(Long unitId) {
        List<UnitImage> images = unitImageRepository.findByUnitIdAndIsDeletedFalse(unitId);

        return images.stream().map(img -> {
            List<UnitVocabulary> vocabs = img.getVocabularies();
            if (vocabs == null) vocabs = new ArrayList<>(); // Đề phòng null

            return mapToContentResponse(img, vocabs);
        }).toList();
    }
    @Override
    @Transactional
    public UnitContentResponse updateUnitContent(Long contentId, UnitContentRequest request) {
        // 1. Tìm bản ghi nội dung cũ (UnitImage)
        UnitImage existingImage = unitImageRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nội dung bài học với id: " + contentId));

        existingImage.setImageUrl(request.getImageUrl());
        existingImage.setFinalCaption(request.getFinalCaption());
        existingImage.setGrammarStructure(request.getGrammarStructure());
         existingImage.setEditedAt(LocalDateTime.now());

        UnitImage savedImage = unitImageRepository.save(existingImage);

        unitVocabularyRepository.deleteByUnitImageId(contentId);

        List<UnitVocabulary> newVocabList = new ArrayList<>();
        if (request.getVocabularies() != null && !request.getVocabularies().isEmpty()) {
            for (VocabRequest vDto : request.getVocabularies()) {
                UnitVocabulary vocab = UnitVocabulary.builder()
                        .word(vDto.getWord())
                        .type(vDto.getType())
                        .example(vDto.getExample())
                        .unitImage(savedImage)
                        .createdAt(LocalDateTime.now())
                        .build();
                newVocabList.add(vocab);
            }
            newVocabList = unitVocabularyRepository.saveAll(newVocabList);
        }
        return mapToContentResponse(savedImage, newVocabList);
    }
    @Override
    public UnitContentResponse getUnitContentById(Long contentId) {
        UnitImage image = unitImageRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nội dung: " + contentId));
        return mapToContentResponse(image, image.getVocabularies());
    }
    @Override
    public List<QuestionResponse> getQuestionsByUnit(Long unitId) {
        if (!unitRepository.existsById(unitId)) {
            throw new RuntimeException("Không tìm thấy bài học id: " + unitId);
        }

        List<QuestionBank> questions = questionBankRepository.findByUnitId(unitId);

        return questions.stream().map(q -> {
            try {
                Object parsedData = objectMapper.readValue(q.getQuestionData(), Object.class);

                return QuestionResponse.builder()
                        .id(q.getId())
                        .questionType(q.getQuestionType())
                        .explanation(q.getExplanation())
                        .questionData(parsedData)
                        .unitId(unitId)
                        .unitTitle(q.getUnit().getTitle())
                        .build();
            } catch (Exception e) {
                throw new RuntimeException("Lỗi xử lý dữ liệu câu hỏi ID " + q.getId() + ": " + e.getMessage());
            }
        }).toList();
    }

    @Override
    @Transactional
    public QuestionResponse addQuestion(Long unitId, QuestionRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học id: " + unitId));

        try {
            String jsonString = objectMapper.writeValueAsString(request.getQuestionData());

            QuestionBank questionBank = QuestionBank.builder()
                    .questionType(request.getQuestionType())
                    .explanation(request.getExplanation())
                    .questionData(jsonString)
                    .unit(unit)
                    .build();

            QuestionBank savedQuestion = questionBankRepository.save(questionBank);

            Object parsedData = objectMapper.readValue(savedQuestion.getQuestionData(), Object.class);

            return QuestionResponse.builder()
                    .id(savedQuestion.getId())
                    .questionType(savedQuestion.getQuestionType())
                    .explanation(savedQuestion.getExplanation())
                    .questionData(parsedData)
                    .unitId(unit.getId())
                    .unitTitle(unit.getTitle())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi chuyển đổi dữ liệu cấu trúc câu hỏi JSON: " + e.getMessage());
        }
    }

    @Override
    public QuestionResponse getQuestionById(Long questionId) {
        QuestionBank question = questionBankRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với id: " + questionId));
        return mapToQuestionResponse(question);
    }

    @Override
    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionRequest request) {
        QuestionBank existingQuestion = questionBankRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với id: " + questionId));

        existingQuestion.setQuestionType(request.getQuestionType());

        // Chuyển đổi Map<String, Object> thành JSON String
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonString = objectMapper.writeValueAsString(request.getQuestionData());
            existingQuestion.setQuestionData(jsonString);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi chuyển đổi dữ liệu câu hỏi thành JSON", e);
        }

        QuestionBank savedQuestion = questionBankRepository.save(existingQuestion);
        return mapToQuestionResponse(savedQuestion);
    }

    private UnitContentResponse mapToContentResponse(UnitImage image, List<UnitVocabulary> vocabs) {
        List<VocabResponse> vocabResponses = vocabs.stream().map(v -> VocabResponse.builder()
                .id(v.getId())
                .word(v.getWord())
                .type(v.getType())
                .example(v.getExample())
                .build()).toList();

        return UnitContentResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .finalCaption(image.getFinalCaption())
                .grammarStructure(image.getGrammarStructure())
                .vocabularies(vocabResponses)
                .build();
    }
    private QuestionResponse mapToQuestionResponse(QuestionBank question) {
        Object parsedData = null;

        if (question.getQuestionData() != null && !question.getQuestionData().isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                parsedData = objectMapper.readValue(question.getQuestionData(), Object.class);
            } catch (JsonProcessingException e) {
                System.err.println("Lỗi parse JSON questionData: " + e.getMessage());
                parsedData = null;
            }
        }

        return QuestionResponse.builder()
                .id(question.getId())
                .questionType(question.getQuestionType())
                .explanation(question.getExplanation())
                .unitId(question.getUnit() != null ? question.getUnit().getId() : null)
                .unitTitle(question.getUnit() != null ? question.getUnit().getTitle() : null)
                .questionData(parsedData)
                .build();
    }

}