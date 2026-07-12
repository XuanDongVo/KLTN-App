package com.example.englishapp_server.service;

import com.example.englishapp_server.dto.response.learner.ImageCaptionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageCaptionService {
    private static final long MAX_IMAGE_SIZE = 8 * 1024 * 1024;

    private final RestClient restClient;
    private final String captionServiceUrl;

    public ImageCaptionService(@Value("${ai.caption-service-url:}") String captionServiceUrl) {
        this.restClient = RestClient.create();
        this.captionServiceUrl = captionServiceUrl == null ? "" : captionServiceUrl.trim();
    }

    public ImageCaptionResponse createCaption(MultipartFile image) {
        validateImage(image);
        String jobId = UUID.randomUUID().toString();

        if (captionServiceUrl.isBlank()) {
            return new ImageCaptionResponse(
                    jobId,
                    "COMPLETED",
                    "This is a school object.",
                    0.92,
                    List.of("school object"),
                    "SAFE",
                    "mock"
            );
        }

        MultipartBodyBuilder body = new MultipartBodyBuilder();
        body.part("image", image.getResource())
                .filename(image.getOriginalFilename() == null ? "photo-mission.jpg" : image.getOriginalFilename())
                .contentType(MediaType.parseMediaType(image.getContentType()));
        body.part("language", "en");

        @SuppressWarnings("unchecked")
        Map<String, Object> result = restClient.post()
                .uri(captionServiceUrl)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body.build())
                .retrieve()
                .body(Map.class);

        if (result == null || !(result.get("caption") instanceof String caption) || caption.isBlank()) {
            throw new IllegalStateException("Caption service returned an invalid response");
        }

        Double confidence = result.get("confidence") instanceof Number value ? value.doubleValue() : null;
        List<String> objects = result.get("objects") instanceof List<?> values
                ? values.stream().map(String::valueOf).toList()
                : List.of();

        return new ImageCaptionResponse(jobId, "COMPLETED", caption, confidence, objects, "SAFE", "external");
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("An image is required");
        }
        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image must be smaller than 8 MB");
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are supported");
        }
    }
}
