package com.example.englishapp_server.repository.jpa;

import com.example.englishapp_server.entity.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
    List<AdminAuditLog> findTop20ByOrderByCreatedAtDesc();
}
