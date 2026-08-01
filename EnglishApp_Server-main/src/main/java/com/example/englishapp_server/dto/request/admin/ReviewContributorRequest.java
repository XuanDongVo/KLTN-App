package com.example.englishapp_server.dto.request.admin;

public record ReviewContributorRequest(
    boolean approve,
    String feedback
) {}
