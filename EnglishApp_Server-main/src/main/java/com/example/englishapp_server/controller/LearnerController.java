package com.example.englishapp_server.controller;

import com.example.englishapp_server.dto.request.user.QuizSubmitRequest;
import com.example.englishapp_server.service.LearnerService;
import com.example.englishapp_server.service.ImageCaptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.UUID;

@RestController
@RequestMapping("learner")
public class LearnerController {

    private final LearnerService learnerService;
    private final ImageCaptionService imageCaptionService;

    @Autowired
    public LearnerController(LearnerService learnerService, ImageCaptionService imageCaptionService) {
        this.learnerService = learnerService;
        this.imageCaptionService = imageCaptionService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getUnitsWithProgress(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(learnerService.getDashboard(UUID.fromString(userId)));
    }

    @GetMapping("/path")
    public ResponseEntity<?> getLearningPath(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(learnerService.getLearningPath(UUID.fromString(userId)));
    }

    @GetMapping("/units/{unitId}/quiz")
    public ResponseEntity<?> getQuiz(@PathVariable Long unitId) {
        return ResponseEntity.ok(learnerService.getRandomQuestions(unitId));
    }

    @PostMapping("/quiz/submit")
    public ResponseEntity<?> submitQuiz(@RequestAttribute("userId") String userId,
                                        @RequestBody QuizSubmitRequest req) {
        return ResponseEntity.ok(learnerService.submitQuiz(UUID.fromString(userId), req));
    }

    @PostMapping(value = "/image-caption", consumes = "multipart/form-data")
    public ResponseEntity<?> createImageCaption(@RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(imageCaptionService.createCaption(image));
    }
}
