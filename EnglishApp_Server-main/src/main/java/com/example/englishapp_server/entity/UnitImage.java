package com.example.englishapp_server.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "unit_images", indexes = {
        @Index(name = "idx_unit_id", columnList = "unit_id"),
        @Index(name = "idx_is_approved", columnList = "is_approved")
})
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class UnitImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(nullable = false, columnDefinition = "VARCHAR(512)")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String finalCaption;

    private String grammarStructure;

    @Column(nullable = false)
    private Boolean isApproved = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime editedAt;

    @Column(nullable = false)
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;

    // list vocabularies
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "unitImage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnitVocabulary> vocabularies = new ArrayList<>();
}