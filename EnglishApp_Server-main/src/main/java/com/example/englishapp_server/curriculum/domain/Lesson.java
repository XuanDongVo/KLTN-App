package com.example.englishapp_server.curriculum.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons", uniqueConstraints =
        @UniqueConstraint(name = "uk_lesson_unit_code", columnNames = {"learning_unit_id", "code"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learning_unit_id", nullable = false)
    private LearningUnit learningUnit;

    @Column(nullable = false, length = 80)
    private String code;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 1000)
    private String objective;

    @Column(name = "cover_image_path", length = 500)
    private String coverImagePath;

    @Column(name = "cover_image_width")
    private Integer coverImageWidth;

    @Column(name = "cover_image_height")
    private Integer coverImageHeight;

    @Column(name = "cover_image_alt", length = 300)
    private String coverImageAlt;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(name = "estimated_minutes", nullable = false)
    private int estimatedMinutes;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward;
}
