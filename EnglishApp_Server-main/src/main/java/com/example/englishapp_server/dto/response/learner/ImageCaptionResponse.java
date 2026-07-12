package com.example.englishapp_server.dto.response.learner;

import java.util.List;

public record ImageCaptionResponse(
        String jobId,
        String status,
        String caption,
        Double confidence,
        List<String> objects,
        String moderationStatus,
        String source
) {
}
