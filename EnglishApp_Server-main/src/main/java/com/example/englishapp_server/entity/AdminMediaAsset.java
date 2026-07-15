package com.example.englishapp_server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_media_assets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMediaAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true)
    private String publicId;

    @Column(name = "secure_url", nullable = false, length = 700)
    private String secureUrl;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "content_type", nullable = false, length = 80)
    private String contentType;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int height;

    @Column(nullable = false)
    private long bytes;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
