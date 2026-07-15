package com.example.englishapp_server.curriculum.repository;

import com.example.englishapp_server.curriculum.domain.LessonSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LessonSessionRepository extends JpaRepository<LessonSession, UUID> {
}
