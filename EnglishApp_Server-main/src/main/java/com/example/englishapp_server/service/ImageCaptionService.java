package com.example.englishapp_server.service;

import com.example.englishapp_server.dto.response.learner.ImageCaptionResponse;
import com.example.englishapp_server.document.PhotoMissionLog;
import com.example.englishapp_server.repository.mongo.PhotoMissionLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class ImageCaptionService {
    private static final long MAX_IMAGE_SIZE = 8 * 1024 * 1024;

    private final RestClient restClient;
    private final String captionServiceUrl;
    private final PhotoMissionLogRepository logRepository;

    public ImageCaptionService(@Value("${ai.caption-service-url:}") String captionServiceUrl,
                               PhotoMissionLogRepository logRepository) {
        this.restClient = RestClient.create();
        this.captionServiceUrl = captionServiceUrl == null ? "" : captionServiceUrl.trim();
        this.logRepository = logRepository;
    }


    public void savePhotoMissionLog(UUID userId, com.example.englishapp_server.curriculum.api.LearnerApiModels.PhotoMissionSaveRequest request) {
        logRepository.save(PhotoMissionLog.builder()
                .userId(userId)
                .imageUrl(request.imageUrl() != null ? request.imageUrl() : "")
                .caption(request.caption() != null ? request.caption() : "")
                .discoveredVocabularies(request.vocabularies() != null ? request.vocabularies() : List.of())
                .confidenceScore(request.confidenceScore())
                .createdAt(LocalDateTime.now())
                .build());
    }
}
