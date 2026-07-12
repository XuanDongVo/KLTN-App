package com.example.englishapp_server.dto.request.unit;

import lombok.Data;

@Data
public class UnitRequest {
    private String title;
    private String description;
    private String imageUrl; // Nhận từ Frontend sau khi đã up lên Cloudinary
}