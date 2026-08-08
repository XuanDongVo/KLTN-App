package com.example.englishapp_server.curriculum.api;

import com.example.englishapp_server.curriculum.api.LearnerApiModels.AttemptRequest;
import com.example.englishapp_server.curriculum.domain.LevelCode;
import com.example.englishapp_server.curriculum.service.LearnerCurriculumService;
import com.example.englishapp_server.curriculum.service.LessonSessionService;
import com.example.englishapp_server.curriculum.service.ReviewSessionService;
import com.example.englishapp_server.document.LearnerHistory;
import com.example.englishapp_server.service.ImageCaptionService;
import com.example.englishapp_server.service.LearnerProfileService;
import com.example.englishapp_server.dto.response.learner.LearnerProfileResponse;
import com.example.englishapp_server.dto.response.ServerResponse;
import com.example.englishapp_server.repository.mongo.LearnerHistoryRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.englishapp_server.entity.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class LearnerCurriculumController {
    private final LearnerCurriculumService curriculumService;
    private final LessonSessionService sessionService;
    private final ImageCaptionService imageCaptionService;
    private final ReviewSessionService reviewSessionService;
    private final LearnerProfileService profileService;
    private final LearnerHistoryRepository historyRepository;

    public LearnerCurriculumController(LearnerCurriculumService curriculumService,
                                       LessonSessionService sessionService,
                                       ImageCaptionService imageCaptionService,
                                       ReviewSessionService reviewSessionService,
                                       LearnerProfileService profileService,
                                       LearnerHistoryRepository historyRepository) {
        this.curriculumService = curriculumService;
        this.sessionService = sessionService;
        this.imageCaptionService = imageCaptionService;
        this.reviewSessionService = reviewSessionService;
        this.profileService = profileService;
        this.historyRepository = historyRepository;
    }

    @GetMapping("/learner/levels")
    public ResponseEntity<?> levels(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(ServerResponse.success(curriculumService.getLevels(UUID.fromString(userId))));
    }

    @GetMapping("/learner/profile")
    public ResponseEntity<?> profile(@RequestAttribute("userId") String userId) {
        User user = profileService.getProfileAndRefresh(UUID.fromString(userId));
        return ResponseEntity.ok(ServerResponse.success(LearnerProfileResponse.builder()
                .totalScore(user.getTotalScore() != null ? user.getTotalScore() : 0)
                .dailyGoal(user.getDailyGoal())
                .dailyXp(user.getDailyXp())
                .streak(user.getStreak())
                .hearts(user.getHearts())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .build()));
    }

    @PostMapping("/learner/profile/update")
    public ResponseEntity<?> updateProfile(@RequestAttribute("userId") String userId, @RequestBody LearnerApiModels.UpdateProfileRequest request) {
        try {
            profileService.updateProfile(UUID.fromString(userId), request.username(), request.avatarUrl());
            return ResponseEntity.ok(ServerResponse.success("Profile updated successfully"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, "Username đã tồn tại. Vui lòng chọn tên khác."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, "Không thể cập nhật thông tin: " + e.getMessage()));
        }
    }

    @GetMapping("/learner/history")
    public ResponseEntity<?> history(
            @RequestAttribute("userId") String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.ZonedDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.ZonedDateTime endDate) {
        
        java.time.LocalDateTime localStart = startDate.withZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime();
        java.time.LocalDateTime localEnd = endDate.withZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime();
        List<LearnerHistory> history = historyRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, localStart, localEnd);
        return ResponseEntity.ok(ServerResponse.success(history));
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

    @PostMapping("/learner/photo-mission/save")
    public ResponseEntity<?> savePhotoMissionLog(@RequestAttribute("userId") String userId, @RequestBody LearnerApiModels.PhotoMissionSaveRequest request) {
        imageCaptionService.savePhotoMissionLog(UUID.fromString(userId), request);
        return ResponseEntity.ok(ServerResponse.success("Saved successfully"));
    }

    @PostMapping("/learner/review/start")
    public ResponseEntity<?> startReviewSession(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(ServerResponse.success(reviewSessionService.startReview(UUID.fromString(userId))));
    }

    @PostMapping("/learner/profile/push-token")
    public ResponseEntity<?> updatePushToken(@RequestAttribute("userId") String userId, @RequestBody LearnerApiModels.PushTokenRequest request) {
        profileService.updatePushToken(UUID.fromString(userId), request.expoPushToken());
        return ResponseEntity.ok(ServerResponse.success("Push token updated successfully"));
    }
}