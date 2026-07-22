package com.example.englishapp_server.admin;

import com.example.englishapp_server.common.enums.AccountStatus;
import com.example.englishapp_server.dto.response.ServerResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static com.example.englishapp_server.admin.AdminOperationsModels.*;

@RestController
@RequestMapping("/api/admin")
public class AdminOperationsController {
    private final AdminUserService userService;
    private final AdminMediaService mediaService;

    public AdminOperationsController(AdminUserService userService, AdminMediaService mediaService) {
        this.userService = userService;
        this.mediaService = mediaService;
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


    @PostMapping("/media")
    public ResponseEntity<?> registerMedia(@RequestAttribute("userId") String adminUserId,
                                           @RequestBody MediaAssetRequest request) {
        return ok(mediaService.register(UUID.fromString(adminUserId), request));
    }

    @GetMapping("/media")
    public ResponseEntity<?> media() {
        return ok(mediaService.list());
    }

    private ResponseEntity<?> ok(Object data) {
        return ResponseEntity.ok(ServerResponse.success(data));
    }
}
