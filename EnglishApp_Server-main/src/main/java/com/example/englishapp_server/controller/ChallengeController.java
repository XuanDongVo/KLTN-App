package com.example.englishapp_server.controller;

import com.example.englishapp_server.dto.request.CreateChallengeRequest;
import com.example.englishapp_server.dto.response.ServerResponse;
import com.example.englishapp_server.service.ChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @PostMapping
    public ResponseEntity<?> createChallenge(@RequestAttribute("userId") String userId, @RequestBody CreateChallengeRequest request) {
        try {
            var response = challengeService.createChallenge(UUID.fromString(userId), request);
            return ResponseEntity.ok(ServerResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, e.getMessage()));
        }
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentChallenge(@RequestAttribute("userId") String userId) {
        var response = challengeService.getCurrentChallenge(UUID.fromString(userId));
        return ResponseEntity.ok(ServerResponse.success(response)); // response can be null if no active challenge
    }
}
