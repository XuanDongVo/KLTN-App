package com.example.englishapp_server.service;

import com.example.englishapp_server.common.enums.ActivityType;
import com.example.englishapp_server.document.LearnerHistory;
import com.example.englishapp_server.dto.request.user.QuizSubmitRequest;
import com.example.englishapp_server.dto.response.unit.QuestionResponse;
import com.example.englishapp_server.entity.QuestionBank;
import com.example.englishapp_server.entity.Unit;
import com.example.englishapp_server.entity.UnitProgress;
import com.example.englishapp_server.entity.User;
import com.example.englishapp_server.repository.jpa.UnitProgressRepository;
import com.example.englishapp_server.repository.jpa.UserRepository;
import com.example.englishapp_server.repository.jpa.unit.QuestionBankRepository;
import com.example.englishapp_server.repository.jpa.unit.UnitRepository;
import com.example.englishapp_server.repository.mongo.LearnerHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LearnerService {

    private final UnitRepository unitRepository;
    private final UnitProgressRepository progressRepository;
    private final QuestionBankRepository questionRepository;
    private final UserRepository userRepository;
    private final LearnerHistoryRepository learnerHistoryRepository;
    private final ObjectMapper objectMapper;

//    @Autowired
//    public LearnerService(UnitRepository unitRepository,
//                          UnitProgressRepository progressRepository,
//                          QuestionBankRepository questionRepository,
//                          UserRepository userRepository) {
//        this.unitRepository = unitRepository;
//        this.progressRepository = progressRepository;
//        this.questionRepository = questionRepository;
//        this.userRepository = userRepository;
//    }

    public Map<String, Object> getDashboard(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Unit> units = unitRepository.findAll();
        List<Map<String, Object>> responseList = new ArrayList<>();

        for (Unit u : units) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("title", u.getTitle());
            map.put("description", u.getDescription());
            map.put("imageUrl", u.getImageUrl());

            Optional<UnitProgress> prog = progressRepository.findByUserIdAndUnitId(userId, u.getId());
            map.put("isCompleted", prog.isPresent() && prog.get().getIsCompleted());

            responseList.add(map);
        }

        // Trả về cả Điểm tổng và Danh sách Unit
        return Map.of(
                "totalScore", user.getTotalScore() == null ? 0 : user.getTotalScore(),
                "units", responseList
        );
    }

    public List<QuestionResponse> getRandomQuestions(Long unitId) {
        List<QuestionBank> entities = questionRepository.findRandom5ByUnitId(unitId);
        List<QuestionResponse> responses = new ArrayList<>();

        for (QuestionBank q : entities) {
            Object parsedData = null;
            try {
                // Parse String JSON từ DB thành Object
                if (q.getQuestionData() != null) {
                    parsedData = objectMapper.readValue(q.getQuestionData(), Object.class);
                }
            } catch (Exception e) {
                System.err.println("Lỗi Parse JSON ở câu hỏi ID " + q.getId() + ": " + e.getMessage());
                parsedData = new HashMap<>(); // Fallback nếu DB bị lỗi
            }

            QuestionResponse dto = QuestionResponse.builder()
                    .id(q.getId())
                    .questionType(q.getQuestionType())
                    .explanation(q.getExplanation())
                    .questionData(parsedData)
                    .unitId(q.getUnit().getId())
                    .unitTitle(q.getUnit().getTitle())
                    .build();
            responses.add(dto);
        }
        return responses;
    }
//    @Transactional
//    public Map<String, Object> submitQuiz(UUID userId, QuizSubmitRequest req) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng này"));
//
//        long currentScore = user.getTotalScore() == null ? 0 : user.getTotalScore();
//        long scoreDelta = (req.getCorrectCount() * 5L) - (req.getWrongCount() * 5L);
//        long newScore = Math.max(0, currentScore + scoreDelta);
//
//        user.setTotalScore(newScore);
//        userRepository.save(user);
//
//        UnitProgress progress = progressRepository.findByUserIdAndUnitId(userId, req.getUnitId())
//                .orElse(UnitProgress.builder()
//                        .userId(userId)
//                        .unitId(req.getUnitId())
//                        .isCompleted(false)
//                        .build());
//
//        progress.setIsCompleted(true);
//        progress.setCompletedAt(LocalDateTime.now());
//        progressRepository.save(progress);
//
//        return Map.of(
//                "message", "Nộp bài thành công",
//                "newScore", newScore,
//                "correct", req.getCorrectCount(),
//                "wrong", req.getWrongCount()
//        );
//    }
    @Transactional
    public Map<String, Object> submitQuiz(UUID userId, QuizSubmitRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng này"));

        long currentScore = user.getTotalScore() == null ? 0 : user.getTotalScore();
        long scoreDelta = (req.getCorrectCount() * 5L) - (req.getWrongCount() * 5L);
        long newScore = Math.max(0, currentScore + scoreDelta);

        user.setTotalScore(newScore);
        userRepository.save(user);

        Optional<UnitProgress> existingProgress = progressRepository.findByUserIdAndUnitId(userId, req.getUnitId());
        boolean isReviewing = existingProgress.isPresent() && existingProgress.get().getIsCompleted();

        UnitProgress progress = existingProgress.orElse(UnitProgress.builder()
                .userId(userId)
                .unitId(req.getUnitId())
                .isCompleted(false)
                .build());

        progress.setIsCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progressRepository.save(progress);

        LearnerHistory history = LearnerHistory.builder()
                .userId(userId)
                .unitId(req.getUnitId())
                .activityType(isReviewing ? ActivityType.REVIEW : ActivityType.UNIT_LEARNING)
                .stats(Map.of(
                        "correctAnswers", req.getCorrectCount(),
                        "wrongAnswers", req.getWrongCount(),
                        "scoreDelta", scoreDelta,
                        "totalScoreAfter", newScore
                ))
                .timestamp(LocalDateTime.now())
                .build();

        learnerHistoryRepository.save(history);

        return Map.of(
                "message", "Nộp bài thành công",
                "newScore", newScore,
                "correct", req.getCorrectCount(),
                "wrong", req.getWrongCount()
        );
    }
}