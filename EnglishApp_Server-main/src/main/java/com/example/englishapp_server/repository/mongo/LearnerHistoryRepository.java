package com.example.englishapp_server.repository.mongo;

import com.example.englishapp_server.document.LearnerHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LearnerHistoryRepository extends MongoRepository<LearnerHistory, String> {
    List<LearnerHistory> findByUserIdAndTimestampBetweenOrderByTimestampDesc(String userId, LocalDateTime start, LocalDateTime end);
}