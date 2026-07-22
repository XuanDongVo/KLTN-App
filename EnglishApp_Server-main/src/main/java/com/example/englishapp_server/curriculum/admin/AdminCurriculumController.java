package com.example.englishapp_server.curriculum.admin;

import com.example.englishapp_server.admin.AdminAuditService;
import com.example.englishapp_server.curriculum.admin.AdminCurriculumModels.*;
import com.example.englishapp_server.curriculum.domain.LevelCode;
import com.example.englishapp_server.dto.response.ServerResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/curriculum")
public class AdminCurriculumController {
    private final AdminCurriculumService service;
    private final AdminAuditService auditService;

    public AdminCurriculumController(AdminCurriculumService service, AdminAuditService auditService) {
        this.service = service;
        this.auditService = auditService;
    }

    @GetMapping("/levels")
    public ResponseEntity<?> levels() {
        return ok(service.getLevels());
    }

    @GetMapping("/versions/{versionId}")
    public ResponseEntity<?> version(@PathVariable Long versionId) {
        return ok(service.getTree(versionId));
    }

    @PostMapping("/levels/{levelCode}/drafts")
    public ResponseEntity<?> createDraft(@PathVariable LevelCode levelCode, @RequestBody(required = false) DraftRequest request) {
        return ok(service.createDraft(levelCode, request));
    }

    @PutMapping("/versions/{versionId}")
    public ResponseEntity<?> updateVersion(@PathVariable Long versionId, @RequestBody VersionUpdateRequest request) {
        return ok(service.updateVersion(versionId, request));
    }

    @PostMapping("/versions/{versionId}/units")
    public ResponseEntity<?> createUnit(@PathVariable Long versionId, @RequestBody UnitRequest request) {
        return ok(service.createUnit(versionId, request));
    }

    @PutMapping("/units/{unitId}")
    public ResponseEntity<?> updateUnit(@PathVariable Long unitId, @RequestBody UnitRequest request) {
        return ok(service.updateUnit(unitId, request));
    }

    @DeleteMapping("/units/{unitId}")
    public ResponseEntity<?> deleteUnit(@PathVariable Long unitId) {
        return ok(service.deleteUnit(unitId));
    }

    @PostMapping("/versions/{versionId}/units/reorder")
    public ResponseEntity<?> reorderUnits(@PathVariable Long versionId, @RequestBody ReorderRequest request) {
        return ok(service.reorderUnits(versionId, request));
    }

    @PostMapping("/units/{unitId}/lessons")
    public ResponseEntity<?> createLesson(@PathVariable Long unitId, @RequestBody LessonRequest request) {
        return ok(service.createLesson(unitId, request));
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<?> updateLesson(@PathVariable Long lessonId, @RequestBody LessonRequest request) {
        return ok(service.updateLesson(lessonId, request));
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long lessonId) {
        return ok(service.deleteLesson(lessonId));
    }

    @PostMapping("/units/{unitId}/lessons/reorder")
    public ResponseEntity<?> reorderLessons(@PathVariable Long unitId, @RequestBody ReorderRequest request) {
        return ok(service.reorderLessons(unitId, request));
    }

    @PostMapping("/lessons/{lessonId}/activities")
    public ResponseEntity<?> createActivity(@PathVariable Long lessonId, @RequestBody ActivityRequest request) {
        return ok(service.createActivity(lessonId, request));
    }

    @PutMapping("/activities/{activityId}")
    public ResponseEntity<?> updateActivity(@PathVariable Long activityId, @RequestBody ActivityRequest request) {
        return ok(service.updateActivity(activityId, request));
    }

    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<?> deleteActivity(@PathVariable Long activityId) {
        return ok(service.deleteActivity(activityId));
    }

    @PostMapping("/lessons/{lessonId}/activities/reorder")
    public ResponseEntity<?> reorderActivities(@PathVariable Long lessonId, @RequestBody ReorderRequest request) {
        return ok(service.reorderActivities(lessonId, request));
    }

    @PostMapping("/versions/{versionId}/validate")
    public ResponseEntity<?> validate(@PathVariable Long versionId) {
        return ok(service.validate(versionId));
    }

    @GetMapping("/versions/{versionId}/preview")
    public ResponseEntity<?> preview(@PathVariable Long versionId) {
        return ok(service.getTree(versionId));
    }

    @PostMapping("/versions/{versionId}/publish")
    public ResponseEntity<?> publish(@RequestAttribute("userId") String adminUserId, @PathVariable Long versionId) {
        CurriculumTree published = service.publish(versionId);
        auditService.record(UUID.fromString(adminUserId), "CURRICULUM_PUBLISHED", "CURRICULUM_VERSION",
                published.id().toString(), published.versionCode());
        return ok(published);
    }

    @GetMapping("/versions/{versionId}/delete-check")
    public ResponseEntity<?> checkDelete(@PathVariable Long versionId) {
        return ok(service.checkVersionDelete(versionId));
    }

    @DeleteMapping("/versions/{versionId}")
    public ResponseEntity<?> deleteVersion(@RequestAttribute("userId") String adminUserId, @PathVariable Long versionId) {
        VersionDeleteResult result = service.deleteVersion(versionId);
        auditService.record(UUID.fromString(adminUserId), "CURRICULUM_VERSION_DELETED", "CURRICULUM_VERSION",
                result.versionId().toString(), result.versionCode());
        return ok(result);
    }

    private ResponseEntity<?> ok(Object data) {
        return ResponseEntity.ok(ServerResponse.success(data));
    }
}
