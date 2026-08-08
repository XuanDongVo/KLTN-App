package com.example.englishapp_server.dto.request.contributor;

public record CreateContributorRequest(
    String certificateUrl,
    String note
) {}
