package com.example.englishapp_server.dto.response.auth;

public record AuthResponse(
        boolean result,
        String message,
        AuthDto authDto
) { }
