package com.example.englishapp_server.repository.mongo;

import com.example.englishapp_server.document.PhotoMissionLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.UUID;

public interface PhotoMissionLogRepository extends MongoRepository<PhotoMissionLog, String> {
    List<PhotoMissionLog> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
