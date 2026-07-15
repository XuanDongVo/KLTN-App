package com.example.englishapp_server.admin;

import com.example.englishapp_server.entity.AdminAuditLog;
import com.example.englishapp_server.repository.jpa.AdminAuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.example.englishapp_server.admin.AdminOperationsModels.AuditView;

@Service
public class AdminAuditService {
    private final AdminAuditLogRepository repository;

    public AdminAuditService(AdminAuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void record(UUID adminUserId, String action, String targetType, String targetId, String details) {
        repository.save(AdminAuditLog.builder()
                .adminUserId(adminUserId)
                .actionCode(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Transactional(readOnly = true)
    public List<AuditView> recent() {
        return repository.findTop20ByOrderByCreatedAtDesc().stream().map(this::view).toList();
    }

    private AuditView view(AdminAuditLog log) {
        return new AuditView(log.getId(), log.getAdminUserId(), log.getActionCode(), log.getTargetType(),
                log.getTargetId(), log.getDetails(), log.getCreatedAt());
    }
}
