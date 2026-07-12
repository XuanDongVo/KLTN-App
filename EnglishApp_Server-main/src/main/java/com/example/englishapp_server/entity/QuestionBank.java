package com.example.englishapp_server.entity;

import com.example.englishapp_server.common.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "question_banks", indexes = {
        @Index(name = "idx_qb_unit_id", columnList = "unit_id")
})
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class QuestionBank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType;

    @Column(nullable = false, columnDefinition = "JSON")
    private String questionData;

    private String explanation;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}