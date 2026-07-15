package com.example.englishapp_server.repository.jpa;

import com.example.englishapp_server.entity.AdminMediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminMediaAssetRepository extends JpaRepository<AdminMediaAsset, Long> {
    List<AdminMediaAsset> findTop100ByOrderByCreatedAtDesc();
    boolean existsByPublicId(String publicId);
}
