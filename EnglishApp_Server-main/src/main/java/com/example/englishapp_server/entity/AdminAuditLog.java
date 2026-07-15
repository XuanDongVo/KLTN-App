package com.example.englishapp_server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_audit_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_user_id", nullable = false)
    private UUID adminUserId;

    @Column(name = "action_code", nullable = false, length = 80)
    private String actionCode;

    @Column(name = "target_type", nullable = false, length = 80)
    private String targetType;

    @Column(name = "target_id", length = 100)
    private String targetId;

    @Column(length = 1000)
    private String details;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
