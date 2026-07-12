package com.example.englishapp_server.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_vocabularies", indexes = {
        @Index(name = "idx_saved_vocab_user", columnList = "user_id")
})
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class SavedVocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String word;

    private String type;

    @Column(nullable = false, columnDefinition = "VARCHAR(512)")
    private String imageUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime savedAt;
}
