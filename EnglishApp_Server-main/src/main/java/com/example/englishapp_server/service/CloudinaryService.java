package com.example.englishapp_server.service;


import com.cloudinary.Cloudinary;
import com.example.englishapp_server.config.CloudinaryConfig.CloudinaryProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CloudinaryService {
    private static final Set<String> ADMIN_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private final Cloudinary cloudinary;
    private final CloudinaryProperties props;

    @Autowired
    public CloudinaryService(Cloudinary cloudinary, CloudinaryProperties props) {
        this.cloudinary = cloudinary;
        this.props = props;
    }

    public Map<String, Object> generateSignature(String folderName, String fileName, String contentType) {
        try {
            if (folderName == null) return null;

            Map<String, Object> listUrlParams = new HashMap<>(Map.of(
                    "timestamp", System.currentTimeMillis() / 1000L,
                    "folder", folderName,
                    "public_id", fileName)
            );

            /**
             * Signature Version param value:
             *  1 = SHA-1
             *  2 = SHA-256
             */
            String signature = cloudinary.apiSignRequest(listUrlParams, props.getSecret(), 2);
            listUrlParams.put("signature", signature);
            listUrlParams.put("api_key", props.getApiKey());

            return listUrlParams;
        }
        catch (Exception e) {
            return null;
        }
    }

    public Map<String, Object> generateAdminImageSignature(String fileName, String contentType) {
        if (!ADMIN_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP");
        }
        String safeName = fileName == null ? "image" : fileName.replaceAll("[^a-zA-Z0-9_-]", "-");
        String publicId = safeName + "-" + UUID.randomUUID();
        long timestamp = System.currentTimeMillis() / 1000L;
        Map<String, Object> signedParams = new HashMap<>();
        signedParams.put("timestamp", timestamp);
        signedParams.put("folder", "english-app/curriculum");
        signedParams.put("public_id", publicId);
        signedParams.put("signature", cloudinary.apiSignRequest(signedParams, props.getSecret(), 2));
        signedParams.put("api_key", props.getApiKey());
        signedParams.put("cloud_name", props.getName());
        signedParams.put("upload_url", "https://api.cloudinary.com/v1_1/" + props.getName() + "/image/upload");
        return signedParams;
    }
}
