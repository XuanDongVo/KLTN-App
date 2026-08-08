package com.example.englishapp_server.curriculum.api;

import com.example.englishapp_server.dto.request.contributor.CreateContributorRequest;
import com.example.englishapp_server.dto.response.ServerResponse;
import com.example.englishapp_server.service.ContributorRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/learner/contributor")
public class LearnerContributorController {

    private final ContributorRequestService requestService;

    public LearnerContributorController(ContributorRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> submitRequest(
            @RequestAttribute("userId") String userId,
            @RequestBody CreateContributorRequest request) {
        try {
            return ResponseEntity.ok(ServerResponse.success(requestService.submitRequest(UUID.fromString(userId), request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, e.getMessage()));
        }
    }

    @GetMapping("/request/current")
    public ResponseEntity<?> getCurrentRequest(@RequestAttribute("userId") String userId) {
        return requestService.getCurrentRequest(UUID.fromString(userId))
                .map(req -> ResponseEntity.ok(ServerResponse.success(req)))
                .orElse(ResponseEntity.ok(ServerResponse.success(null)));
    }

    @GetMapping("/requests/all")
    public ResponseEntity<?> getAllUserRequests(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(ServerResponse.success(requestService.getUserRequests(UUID.fromString(userId))));
    }
}
