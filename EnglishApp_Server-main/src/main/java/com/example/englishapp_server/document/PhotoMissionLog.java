package com.example.englishapp_server.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "photo_mission_logs")
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class PhotoMissionLog {
    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private java.util.UUID userId;

    @Field("image_url")
    private String imageUrl;

    @Field("caption")
    private String caption;

    @Field("discovered_vocabularies")
    private java.util.List<String> discoveredVocabularies;

    @Field("confidence_score")
    private Double confidenceScore;

    @Field("raw_api_response")
    private Map<String, Object> rawApiResponse;

    @Field("created_at")
    private LocalDateTime createdAt;
}