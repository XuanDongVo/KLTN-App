package com.example.englishapp_server.curriculum.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "learner_lesson_progress", uniqueConstraints =
        @UniqueConstraint(name = "uk_progress_user_lesson", columnNames = {"user_id", "lesson_code"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearnerLessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "lesson_code", nullable = false, length = 80)
    private String lessonCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_status", nullable = false, length = 20)
    private ProgressStatus progressStatus;

    @Column(name = "best_score", nullable = false)
    private int bestScore;

    @Column(nullable = false)
    private int stars;

    @Column(name = "completion_count", nullable = false)
    private int completionCount;

    @Column(name = "first_completed_at")
    private LocalDateTime firstCompletedAt;

    @Column(name = "last_completed_at")
    private LocalDateTime lastCompletedAt;
}
