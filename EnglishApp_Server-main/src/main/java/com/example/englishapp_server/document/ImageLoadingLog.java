package com.example.englishapp_server.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "image_loading_logs")
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class ImageLoadingLog {
    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private Long userId;

    @Field("captured_image_url")
    private String capturedImageUrl;

    // FastAPI return a JSON when upload image
    @Field("raw_payload")
    private Map<String, Object> rawPayload;

    @Field("created_at")
    private LocalDateTime createdAt;
}