package com.example.englishapp_server.curriculum.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "learning_activities", uniqueConstraints =
        @UniqueConstraint(name = "uk_activity_lesson_code", columnNames = {"lesson_id", "code"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false, length = 100)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 40)
    private LearningActivityType activityType;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_stage", nullable = false, length = 20)
    private ActivityStage activityStage;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(name = "prompt_text", nullable = false, length = 1000)
    private String promptText;

    @Column(name = "instruction_text", length = 1000)
    private String instructionText;

    @Lob
    @Column(name = "content_json", nullable = false, columnDefinition = "LONGTEXT")
    private String contentJson;

    @Lob
    @Column(name = "answer_json", nullable = false, columnDefinition = "LONGTEXT")
    private String answerJson;

    @Lob
    @Column(name = "source_refs_json", nullable = false, columnDefinition = "LONGTEXT")
    private String sourceRefsJson;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward;
}
