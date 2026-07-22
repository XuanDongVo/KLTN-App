package com.example.englishapp_server.controller;

import com.example.englishapp_server.document.PhotoMissionLog;
import com.example.englishapp_server.repository.mongo.PhotoMissionLogRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("learner/photo-mission")
public class PhotoMissionController {

    private final PhotoMissionLogRepository logRepository;

    @Autowired
    public PhotoMissionController(PhotoMissionLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @PostMapping("/save")
    public ResponseEntity<PhotoMissionLog> saveLog(
            @RequestAttribute("userId") String userIdStr,
            @RequestBody SaveLogRequest request
    ) {
        UUID userId = UUID.fromString(userIdStr);

        PhotoMissionLog log = PhotoMissionLog.builder()
                .userId(userId)
                .imageUrl(request.getImageUrl())
                .caption(request.getCaption())
                .discoveredVocabularies(request.getDiscoveredVocabularies())
                .createdAt(LocalDateTime.now())
                .build();

        PhotoMissionLog saved = logRepository.save(log);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<PhotoMissionLog>> getLogs(
            @RequestAttribute("userId") String userIdStr
    ) {
        UUID userId = UUID.fromString(userIdStr);
        List<PhotoMissionLog> logs = logRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(logs);
    }

    @Data
    public static class SaveLogRequest {
        private String imageUrl;
        private String caption;
        private List<String> discoveredVocabularies;
    }
}
