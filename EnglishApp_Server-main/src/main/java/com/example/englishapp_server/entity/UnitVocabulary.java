package com.example.englishapp_server.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "unit_vocabularies", indexes = {
        @Index(name = "idx_unit_img_id", columnList = "unit_img_id")
})
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class UnitVocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_img_id", nullable = false)
    private UnitImage unitImage;

    @Column(nullable = false)
    private String word;

    private String type;

    private String example;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
