package com.example.englishapp_server.curriculum.admin;

import com.example.englishapp_server.admin.AdminAuditService;
import com.example.englishapp_server.curriculum.admin.AdminAiModels.*;
import com.example.englishapp_server.dto.response.ServerResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/curriculum/ai")
public class AdminAiController {
    
    private final AdminAiService aiService;
    private final AdminAuditService auditService;

    public AdminAiController(AdminAiService aiService, AdminAuditService auditService) {
        this.aiService = aiService;
        this.auditService = auditService;
    }

    @PostMapping("/image-caption")
    public ResponseEntity<?> generateImageCaption(
            @RequestAttribute("userId") String adminUserId,
            @RequestBody ImageCaptionRequest request) {
        try {
            ImageCaptionResponse result = aiService.generateCaption(request);
            String url = request.getImageUrl();
            auditService.record(UUID.fromString(adminUserId), "AI_GENERATE_CAPTION", "IMAGE", "IMAGE_URL", "Generated caption for image: " + url);
            return ResponseEntity.ok(ServerResponse.success(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ServerResponse.error(500, "Failed to generate caption: " + e.getMessage()));
        }
    }
}
