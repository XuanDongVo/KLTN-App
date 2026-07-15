package com.example.englishapp_server.curriculum.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "curriculum_versions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "level_code", nullable = false, length = 40)
    private LevelCode levelCode;

    @Column(name = "version_code", nullable = false, unique = true, length = 80)
    private String versionCode;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "lifecycle_status", nullable = false, length = 20)
    private LifecycleStatus lifecycleStatus;

    @Column(nullable = false, length = 64)
    private String checksum;

    @Lob
    @Column(name = "source_manifest_json", nullable = false, columnDefinition = "LONGTEXT")
    private String sourceManifestJson;

    @Column(name = "imported_at", nullable = false)
    private LocalDateTime importedAt;
}
