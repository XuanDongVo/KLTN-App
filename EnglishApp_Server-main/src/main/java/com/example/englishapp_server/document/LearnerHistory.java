package com.example.englishapp_server.document;

import com.example.englishapp_server.common.enums.ActivityType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Document(collection = "learner_histories")
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class LearnerHistory {
    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private UUID userId;

    @Field("activity_type")
    private ActivityType activityType;

    @Field("unit_id")
    private Long unitId;

    @Field("stats")
    private Map<String, Object> stats;
    @Field("details")
    private List<Map<String, Object>> details;
    @Field("timestamp")
    private LocalDateTime timestamp;
}
