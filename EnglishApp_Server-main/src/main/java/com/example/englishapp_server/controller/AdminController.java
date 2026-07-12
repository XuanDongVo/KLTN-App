package com.example.englishapp_server.controller;


import com.example.englishapp_server.dto.request.unit.QuestionRequest;
import com.example.englishapp_server.dto.request.unit.UnitContentRequest;
import com.example.englishapp_server.dto.request.unit.UnitRequest;
import com.example.englishapp_server.dto.response.admin.DashboardResponse;
import com.example.englishapp_server.dto.response.ServerResponse;
import com.example.englishapp_server.dto.response.unit.QuestionResponse;
import com.example.englishapp_server.dto.response.unit.UnitContentResponse;
import com.example.englishapp_server.dto.response.unit.UnitResponse;
import com.example.englishapp_server.repository.jpa.unit.UnitRepository;

import com.example.englishapp_server.repository.jpa.UserRepository;
import com.example.englishapp_server.service.unit.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("admin")
@RequiredArgsConstructor
public class AdminController {

    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final UnitService unitService;

    @GetMapping("/dashboard")
    public ResponseEntity<ServerResponse<DashboardResponse>> getDashboardStats() {
        long totalUnits = unitRepository.count();
        long totalUsers = userRepository.count();

        DashboardResponse stats = DashboardResponse.builder()
                .totalUnits(totalUnits)
                .totalUsers(totalUsers)
                .build();

        return ResponseEntity.ok(ServerResponse.success(stats));
    }

    @GetMapping("/units")
    public ResponseEntity<ServerResponse<List<UnitResponse>>> getAllUnits() {
        return ResponseEntity.ok(ServerResponse.success(unitService.getAllActiveUnits()));
    }

    @PostMapping("/units")
    public ResponseEntity<ServerResponse<UnitResponse>> createUnit(@RequestBody UnitRequest request) {
        return ResponseEntity.ok(ServerResponse.success(unitService.createUnit(request)));
    }

    @PutMapping("/units/{id}")
    public ResponseEntity<ServerResponse<UnitResponse>> updateUnit(@PathVariable Long id, @RequestBody UnitRequest request) {
        return ResponseEntity.ok(ServerResponse.success(unitService.updateUnit(id, request)));
    }

    @PostMapping("/units/{unitId}/contents")
    public ResponseEntity<ServerResponse<UnitContentResponse>> addUnitContent(
                                                                               @PathVariable Long unitId,
                                                                               @RequestBody UnitContentRequest request) {
        return ResponseEntity.ok(ServerResponse.success(unitService.addUnitContent(unitId, request)));
    }

    @GetMapping("/units/{unitId}/contents")
    public ResponseEntity<ServerResponse<List<UnitContentResponse>>> getUnitContents(@PathVariable Long unitId) {
        return ResponseEntity.ok(ServerResponse.success(unitService.getUnitContents(unitId)));
    }
    @GetMapping("/contents/{contentId}")
    public ResponseEntity<ServerResponse<UnitContentResponse>> getUnitContentById(@PathVariable Long contentId) {
        return ResponseEntity.ok(ServerResponse.success(unitService.getUnitContentById(contentId)));
    }

    @PutMapping("/contents/{contentId}")
    public ResponseEntity<ServerResponse<UnitContentResponse>> updateUnitContent(
            @PathVariable Long contentId,
            @RequestBody UnitContentRequest request) {
        UnitContentResponse response = unitService.updateUnitContent(contentId, request);
        return ResponseEntity.ok(ServerResponse.success(response));
    }
    @GetMapping("/units/{unitId}/questions")
    public ResponseEntity<ServerResponse<List<QuestionResponse>>> getQuestionsByUnit(@PathVariable Long unitId) {
        List<QuestionResponse> questions = unitService.getQuestionsByUnit(unitId);
        return ResponseEntity.ok(ServerResponse.success(questions));
    }

    @PostMapping("/units/{unitId}/questions")
    public ResponseEntity<ServerResponse<QuestionResponse>> addQuestion(@PathVariable Long unitId,
                                                                         @RequestBody QuestionRequest request) {
        QuestionResponse savedQuestion = unitService.addQuestion(unitId, request);
        return ResponseEntity.ok(ServerResponse.success(savedQuestion));
    }
    @GetMapping("/questions/{questionId}")
    public ResponseEntity<ServerResponse<QuestionResponse>> getQuestionById(@PathVariable Long questionId) {
        return ResponseEntity.ok(ServerResponse.success(unitService.getQuestionById(questionId)));
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<ServerResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody QuestionRequest request) {
        QuestionResponse response = unitService.updateQuestion(questionId, request);
        return ResponseEntity.ok(ServerResponse.success(response));
    }
}