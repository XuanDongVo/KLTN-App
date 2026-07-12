package com.example.englishapp_server.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "unit_progresses", indexes = {
        @Index(name = "idx_user_progress", columnList = "user_id, is_completed")
})
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class UnitProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "unit_id", nullable = false)
    private Long unitId;

    @Column(nullable = false)
    private Boolean isCompleted = false;

    @Column
    private LocalDateTime completedAt;
}