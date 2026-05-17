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

    // ========== User Endpoints ==========

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserSessionResponse>>> getAllSessions() {
        UUID userId = securityUtils.getCurrentUserId();
        log.debug("Retrieving all sessions for user: {}", userId);
        List<UserSessionResponse> allSessions = sessionService.getAllSessions(userId);
        log.info("Retrieved {} sessions for user: {}", allSessions.size(), userId);
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved successfully", allSessions));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<AdminSessionResponse>> getSessionById(
            @PathVariable UUID sessionId) {
        log.debug("Retrieving session details: {}", sessionId);
        AdminSessionResponse response = sessionService.getSessionById(sessionId);
        log.info("Session details retrieved: {}", sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session retrieved successfully", response));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<UserSessionResponse>> logoutSession(@PathVariable UUID sessionId) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Logging out session: {} for user: {}", sessionId, userId);
        UserSessionResponse response = sessionService.logoutSession(sessionId, userId);
        log.info("Session logged out successfully: {}", sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session logged out successfully", response));
    }

    @PostMapping("/logout-others")
    public ResponseEntity<ApiResponse<List<UserSessionResponse>>> logoutOtherSessions(@RequestParam UUID currentSessionId) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Logging out all other sessions for user: {}", userId);
        List<UserSessionResponse> loggedOutSessions = sessionService.logoutOtherSessions(userId, currentSessionId);
        log.info("Logged out {} other sessions for user: {}", loggedOutSessions.size(), userId);
        return ResponseEntity.ok(ApiResponse.success("Other sessions logged out successfully", loggedOutSessions));
    }

    @PostMapping("/admin/all")
    public ResponseEntity<ApiResponse<PaginationResponse<AdminSessionResponse>>> getAllSessionsAdmin(
            @RequestBody SessionFilterRequest request) {
        log.debug("Retrieving all sessions with filters - page: {}, size: {}", request.getPageNo(), request.getPageSize());
        PaginationResponse<AdminSessionResponse> response = sessionService.getAllSessionsAdmin(request);
        log.info("Retrieved {} sessions (page {}/{})", response.getContent().size(), response.getPageNo(), response.getTotalPages());
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved successfully", response));
    }

    @DeleteMapping("/admin/{sessionId}")
    public ResponseEntity<ApiResponse<AdminSessionResponse>> logoutSessionAdmin(@PathVariable UUID sessionId) {
        log.info("Admin logging out session: {}", sessionId);
        AdminSessionResponse response = sessionService.logoutSessionAdmin(sessionId);
        log.info("Session logged out by admin: {}", sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session logged out successfully", response));
    }

    @PostMapping("/admin/logout-all/{userId}")
    public ResponseEntity<ApiResponse<List<AdminSessionResponse>>> logoutAllSessionsAdmin(@PathVariable UUID userId) {
        log.info("Admin logging out all sessions for user: {}", userId);
        List<AdminSessionResponse> loggedOutSessions = sessionService.logoutAllSessionsAdmin(userId);
        log.info("Logged out {} sessions for user: {} by admin", loggedOutSessions.size(), userId);
        return ResponseEntity.ok(ApiResponse.success("All sessions logged out successfully", loggedOutSessions));
    }
}
