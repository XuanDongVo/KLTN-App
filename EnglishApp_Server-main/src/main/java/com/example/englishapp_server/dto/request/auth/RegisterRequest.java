package com.example.englishapp_server.dto.request.auth;

public record RegisterRequest(
        String email,
        String username,
        String password
) {
}
