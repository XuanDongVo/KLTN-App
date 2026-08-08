package com.example.englishapp_server.controller.admin;

import com.example.englishapp_server.dto.request.admin.ReviewContributorRequest;
import com.example.englishapp_server.dto.response.ServerResponse;
import com.example.englishapp_server.service.ContributorRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/contributor/requests")
public class AdminContributorController {

    private final ContributorRequestService requestService;

    public AdminContributorController(ContributorRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(ServerResponse.success(requestService.getAllRequests()));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<?> reviewRequest(@PathVariable Long id, @RequestBody ReviewContributorRequest review) {
        try {
            return ResponseEntity.ok(ServerResponse.success(requestService.reviewRequest(id, review)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, e.getMessage()));
        }
    }
}
