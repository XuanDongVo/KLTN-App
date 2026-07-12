package com.example.englishapp_server.dto.response.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardResponse {
    private long totalUnits;
    private long totalUsers;
}
