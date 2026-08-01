package com.example.englishapp_server.entity;

import com.example.englishapp_server.common.enums.ChallengeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_challenges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserChallenge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "target_xp", nullable = false)
    private Integer targetXp;

    @Column(name = "target_days", nullable = false)
    private Integer targetDays;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ChallengeStatus status;

    @PrePersist
    void prePersist() {
        if (this.status == null) {
            this.status = ChallengeStatus.ACTIVE;
        }
        if (this.startDate == null) {
            this.startDate = LocalDateTime.now();
        }
        if (this.endDate == null && this.targetDays != null) {
            this.endDate = this.startDate.plusDays(this.targetDays);
        }
    }
}
