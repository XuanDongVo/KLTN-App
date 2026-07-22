package com.example.englishapp_server.curriculum.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lesson_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonSession {
    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_status", nullable = false, length = 20)
    private SessionStatus sessionStatus;

    @Column(name = "current_activity_index", nullable = false)
    private int currentActivityIndex;

    @Column(name = "total_attempts", nullable = false)
    private int totalAttempts;

    @Column(name = "correct_attempts", nullable = false)
    private int correctAttempts;

    @Column(name = "hearts_started", nullable = false)
    private int heartsStarted;

    @Column(name = "hearts_remaining", nullable = false)
    private int heartsRemaining;

    @Column(name = "xp_earned", nullable = false)
    private int xpEarned;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "selected_activity_ids_json", columnDefinition = "TEXT")
    private String selectedActivityIdsJson;

    @Column(name = "dynamic_activities_json", columnDefinition = "TEXT")
    private String dynamicActivitiesJson;
}
