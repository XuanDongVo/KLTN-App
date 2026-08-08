package com.example.englishapp_server.admin;

import com.example.englishapp_server.common.enums.AccountStatus;
import com.example.englishapp_server.dto.response.ServerResponse;
import com.example.englishapp_server.service.ChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static com.example.englishapp_server.admin.AdminOperationsModels.*;

@RestController
@RequestMapping("/api/admin")
public class AdminOperationsController {
    private final AdminUserService userService;
    private final AdminMediaService mediaService;
    private final ChallengeService challengeService;

    public AdminOperationsController(AdminUserService userService, AdminMediaService mediaService, com.example.englishapp_server.service.ChallengeService challengeService) {
        this.userService = userService;
        this.mediaService = mediaService;
        this.challengeService = challengeService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        return ok(userService.dashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<?> users(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ok(userService.users(search, status, page, size));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> user(@PathVariable UUID userId) {
        return ok(userService.user(userId));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateStatus(@RequestAttribute("userId") String adminUserId,
                                          @PathVariable UUID userId,
                                          @RequestBody StatusRequest request) {
        return ok(userService.updateStatus(UUID.fromString(adminUserId), userId, request));
    }


    @PostMapping("/media/signature")
    public ResponseEntity<?> signature(@RequestBody MediaSignatureRequest request) {
        return ok(mediaService.signature(request));
    }

    @PostMapping("/media")
    public ResponseEntity<?> registerMedia(@RequestAttribute("userId") String adminUserId,
                                           @RequestBody MediaAssetRequest request) {
        return ok(mediaService.register(UUID.fromString(adminUserId), request));
    }

    @GetMapping("/media")
    public ResponseEntity<?> media() {
        return ok(mediaService.list());
    }

    @PostMapping("/reports/challenges/trigger")
    public ResponseEntity<?> triggerChallengeEvaluation() {
        challengeService.evaluateExpiredChallenges();
        return ok("Triggered successfully");
    }

    @GetMapping("/challenges/stats")
    public ResponseEntity<?> getChallengeStats() {
        return ok(challengeService.getChallengeStats());
    }

    private ResponseEntity<?> ok(Object data) {
        return ResponseEntity.ok(ServerResponse.success(data));
    }
}
