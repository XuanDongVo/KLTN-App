package com.example.englishapp_server.curriculum.admin;

import com.example.englishapp_server.curriculum.admin.AdminAiModels.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
public class AdminAiService {

    @Value("${ai.caption-service-url:}")
    private String aiCaptionServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public ImageCaptionResponse generateCaption(ImageCaptionRequest request) {
        String imageUrl = request.getImageUrl();
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Image URL is required");
        }

        if (!imageUrl.startsWith("http") || (!imageUrl.contains("cloudinary.com") && !imageUrl.matches(".*\\.(jpg|jpeg|png|webp)($|\\?.*)"))) {
            throw new IllegalArgumentException("Invalid image URL");
        }

        if (aiCaptionServiceUrl == null || aiCaptionServiceUrl.trim().isEmpty()) {
            // Mock response if AI service is not configured
            ImageCaptionResponse mock = new ImageCaptionResponse();
            mock.setCaption("This is a mock generated caption.");
            mock.setConfidence(0.99);
            mock.setObjects(java.util.Arrays.asList("mock", "test"));
            mock.setSource("mock");
            return mock;
        }

        try {
            // 1. Download image
            ResponseEntity<byte[]> imageResponse = restTemplate.getForEntity(imageUrl, byte[].class);
            if (!imageResponse.getStatusCode().is2xxSuccessful() || imageResponse.getBody() == null) {
                throw new RuntimeException("Failed to download image from URL");
            }
            byte[] imageBytes = imageResponse.getBody();

            // 2. Prepare multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return "image.jpg";
                }
            };
            body.add("file", resource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. Call AI service
            String url = aiCaptionServiceUrl;
            if (url.endsWith("/")) {
                url = url.substring(0, url.length() - 1);
            }
            url += "/v1/predict";

            ResponseEntity<ImageCaptionResponse> aiResponse = restTemplate.postForEntity(url, requestEntity, ImageCaptionResponse.class);
            
            if (aiResponse.getStatusCode().is2xxSuccessful() && aiResponse.getBody() != null) {
                ImageCaptionResponse res = aiResponse.getBody();
                res.setSource("backend");
                return res;
            } else {
                throw new RuntimeException("AI service returned error: " + aiResponse.getStatusCode());
            }

        } catch (Exception e) {
            throw new RuntimeException("Error processing AI request: " + e.getMessage(), e);
        }
    }
}
