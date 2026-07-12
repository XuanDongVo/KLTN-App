package com.example.englishapp_server.dto.request.auth;

public record VerifyRequest(
        String email,
        String code,
        String newPassword
) {
}
