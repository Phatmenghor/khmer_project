package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSessionResponse {

    private UUID id;

    private UUID userId;
    private String userIdentifier;
    private String userFullName;
    private String userType;

    private String deviceId;
    private String deviceName;
    private String deviceType;
    private String deviceDisplayName;
    private String browser;
    private String operatingSystem;

    private String ipAddress;
    private String location;

    private String status;
    private LocalDateTime loginAt;
    private LocalDateTime lastActiveAt;
    private LocalDateTime expiresAt;
    private LocalDateTime loggedOutAt;
    private String logoutReason;
    private Boolean isCurrentSession;
}
