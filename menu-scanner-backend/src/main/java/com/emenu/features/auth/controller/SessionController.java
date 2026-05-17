package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.SessionFilterRequest;
import com.emenu.features.auth.dto.response.AdminSessionResponse;
import com.emenu.features.auth.dto.response.UserSessionResponse;
import com.emenu.features.auth.service.UserSessionService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
@Slf4j
public class SessionController {

    private final UserSessionService sessionService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserSessionResponse>>> getAllSessions() {
        log.info("Endpoint: all - user sessions list retrieval request received");
        UUID currentUserId = securityUtils.getCurrentUserId();
        List<UserSessionResponse> userSessions = sessionService.getAllSessions(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved successfully", userSessions));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<AdminSessionResponse>> getSessionById(@PathVariable UUID sessionId) {
        log.info("Endpoint: getSessionById - session details retrieval request received: session_id={}", sessionId);
        AdminSessionResponse sessionResponse = sessionService.getSessionById(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session retrieved successfully", sessionResponse));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<UserSessionResponse>> logoutSession(@PathVariable UUID sessionId) {
        log.info("Endpoint: logoutSession - session logout request received: session_id={}", sessionId);
        UUID currentUserId = securityUtils.getCurrentUserId();
        UserSessionResponse logoutResponse = sessionService.logoutSession(sessionId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Session logged out successfully", logoutResponse));
    }

    @PostMapping("/logout-others")
    public ResponseEntity<ApiResponse<List<UserSessionResponse>>> logoutOtherSessions(@RequestParam UUID currentSessionId) {
        log.info("Endpoint: logout-others - logout other sessions request received: current_session_id={}", currentSessionId);
        UUID currentUserId = securityUtils.getCurrentUserId();
        List<UserSessionResponse> loggedOutSessionList = sessionService.logoutOtherSessions(currentUserId, currentSessionId);
        return ResponseEntity.ok(ApiResponse.success("Other sessions logged out successfully", loggedOutSessionList));
    }

    @PostMapping("/admin/all")
    public ResponseEntity<ApiResponse<PaginationResponse<AdminSessionResponse>>> getAllSessionsAdmin(
            @RequestBody SessionFilterRequest filterRequestData) {
        log.info("Endpoint: admin/all - admin sessions list retrieval request received: page={}", filterRequestData.getPageNo());
        PaginationResponse<AdminSessionResponse> sessionsResponse = sessionService.getAllSessionsAdmin(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved successfully", sessionsResponse));
    }

    @DeleteMapping("/admin/{sessionId}")
    public ResponseEntity<ApiResponse<AdminSessionResponse>> logoutSessionAdmin(@PathVariable UUID sessionId) {
        log.info("Endpoint: admin - admin session logout request received: session_id={}", sessionId);
        AdminSessionResponse adminLogoutResponse = sessionService.logoutSessionAdmin(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session logged out successfully", adminLogoutResponse));
    }

    @PostMapping("/admin/logout-all/{userId}")
    public ResponseEntity<ApiResponse<List<AdminSessionResponse>>> logoutAllSessionsAdmin(@PathVariable UUID userId) {
        log.info("Endpoint: admin/logout-all - logout all user sessions request received: user_id={}", userId);
        List<AdminSessionResponse> allLoggedOutSessions = sessionService.logoutAllSessionsAdmin(userId);
        return ResponseEntity.ok(ApiResponse.success("All sessions logged out successfully", allLoggedOutSessions));
    }
}
