package com.example.englishapp_server.admin;

import com.example.englishapp_server.entity.AdminMediaAsset;
import com.example.englishapp_server.repository.jpa.AdminMediaAssetRepository;
import com.example.englishapp_server.service.CloudinaryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static com.example.englishapp_server.admin.AdminOperationsModels.*;

@Service
public class AdminMediaService {
    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private final CloudinaryService cloudinaryService;
    private final AdminMediaAssetRepository repository;
    private final AdminAuditService auditService;

    public AdminMediaService(CloudinaryService cloudinaryService, AdminMediaAssetRepository repository,
                             AdminAuditService auditService) {
        this.cloudinaryService = cloudinaryService;
        this.repository = repository;
        this.auditService = auditService;
    }

    public MediaSignature signature(MediaSignatureRequest request) {
        if (request == null || blank(request.fileName()) || blank(request.contentType())) {
            throw new IllegalArgumentException("Thiếu tên file hoặc định dạng ảnh");
        }
        return new MediaSignature(cloudinaryService.generateAdminImageSignature(request.fileName(), request.contentType()));
    }

    @Transactional
    public MediaAssetView register(UUID adminUserId, MediaAssetRequest request) {
        validate(request);
        if (repository.existsByPublicId(request.publicId())) {
            throw new IllegalStateException("Ảnh này đã được lưu trong thư viện");
        }
        AdminMediaAsset asset = repository.save(AdminMediaAsset.builder()
                .publicId(request.publicId().trim())
                .secureUrl(request.secureUrl().trim())
                .originalFileName(request.originalFileName().trim())
                .contentType(request.contentType().trim())
                .width(request.width())
                .height(request.height())
                .bytes(request.bytes())
                .createdBy(adminUserId)
                .createdAt(LocalDateTime.now())
                .build());
        auditService.record(adminUserId, "MEDIA_UPLOAD", "MEDIA", asset.getId().toString(), asset.getSecureUrl());
        return view(asset);
    }

    @Transactional(readOnly = true)
    public List<MediaAssetView> list() {
        return repository.findTop100ByOrderByCreatedAtDesc().stream().map(this::view).toList();
    }

    private void validate(MediaAssetRequest request) {
        if (request == null || blank(request.publicId()) || blank(request.secureUrl()) || blank(request.originalFileName())) {
            throw new IllegalArgumentException("Thông tin ảnh chưa đầy đủ");
        }
        if (!request.secureUrl().startsWith("https://res.cloudinary.com/")) {
            throw new IllegalArgumentException("URL ảnh không thuộc Cloudinary");
        }
        if (!request.publicId().startsWith("english-app/curriculum/")) {
            throw new IllegalArgumentException("Ảnh không thuộc thư mục curriculum");
        }
        if (!ALLOWED_TYPES.contains(request.contentType())) {
            throw new IllegalArgumentException("Định dạng ảnh không hợp lệ");
        }
        if (request.width() <= 0 || request.height() <= 0) throw new IllegalArgumentException("Kích thước ảnh không hợp lệ");
        if (request.bytes() <= 0 || request.bytes() > MAX_BYTES) throw new IllegalArgumentException("Ảnh phải nhỏ hơn 5 MB");
    }

    private MediaAssetView view(AdminMediaAsset asset) {
        return new MediaAssetView(asset.getId(), asset.getPublicId(), asset.getSecureUrl(), asset.getOriginalFileName(),
                asset.getContentType(), asset.getWidth(), asset.getHeight(), asset.getBytes(), asset.getCreatedAt());
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
