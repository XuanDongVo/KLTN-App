package com.example.englishapp_server.curriculum.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "learning_units", uniqueConstraints =
        @UniqueConstraint(name = "uk_learning_unit_version_code", columnNames = {"curriculum_version_id", "code"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curriculum_version_id", nullable = false)
    private CurriculumVersion curriculumVersion;

    @Column(nullable = false, length = 80)
    private String code;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 1000)
    private String description;

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
}
