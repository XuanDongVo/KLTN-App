package com.example.englishapp_server.curriculum.api;

import com.example.englishapp_server.curriculum.api.LearnerApiModels.AttemptRequest;
import com.example.englishapp_server.curriculum.domain.LevelCode;
import com.example.englishapp_server.curriculum.service.LearnerCurriculumService;
import com.example.englishapp_server.curriculum.service.LessonSessionService;
import com.example.englishapp_server.dto.response.ServerResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class LearnerCurriculumController {
    private final LearnerCurriculumService curriculumService;
    private final LessonSessionService sessionService;

    public LearnerCurriculumController(LearnerCurriculumService curriculumService,
                                       LessonSessionService sessionService) {
        this.curriculumService = curriculumService;
        this.sessionService = sessionService;
    }

    @GetMapping("/learner/levels")
    public ResponseEntity<?> levels(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(ServerResponse.success(curriculumService.getLevels(UUID.fromString(userId))));
    }

    @GetMapping("/learner/path")
    public ResponseEntity<?> path(@RequestAttribute("userId") String userId,
                                  @RequestParam(defaultValue = "PRE_A1_STARTERS") LevelCode level) {
        return ResponseEntity.ok(ServerResponse.success(curriculumService.getPath(UUID.fromString(userId), level)));
    }

    @PostMapping("/lessons/{lessonId}/sessions")
    public ResponseEntity<?> start(@RequestAttribute("userId") String userId, @PathVariable Long lessonId) {
        return ResponseEntity.ok(ServerResponse.success(sessionService.start(UUID.fromString(userId), lessonId)));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<?> session(@RequestAttribute("userId") String userId, @PathVariable UUID sessionId) {
        return ResponseEntity.ok(ServerResponse.success(sessionService.get(UUID.fromString(userId), sessionId)));
    }

    @PostMapping("/sessions/{sessionId}/attempts")
    public ResponseEntity<?> attempt(@RequestAttribute("userId") String userId,
                                     @PathVariable UUID sessionId,
                                     @RequestBody AttemptRequest request) {
        return ResponseEntity.ok(ServerResponse.success(
                sessionService.submitAttempt(UUID.fromString(userId), sessionId, request)));
    }

    @PostMapping("/sessions/{sessionId}/finish")
    public ResponseEntity<?> finish(@RequestAttribute("userId") String userId, @PathVariable UUID sessionId) {
        return ResponseEntity.ok(ServerResponse.success(sessionService.finish(UUID.fromString(userId), sessionId)));
    }
}
