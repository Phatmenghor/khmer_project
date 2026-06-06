package com.emenu.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Standard API response envelope used by all endpoints.
 *
 * Success shape:  { "success": true,  "message": "...", "data": {...}, "timestamp": "..." }
 * Failure shape:  { "success": false, "message": "...", "data": {...}, "timestamp": "..." }
 *
 * data is omitted (null-suppressed) when empty.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    @Builder.Default
    private Instant timestamp = Instant.now();

    // ─── Success factories ───────────────────────────────────────────────────

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        return success(message, null);
    }

    // ─── Failure factories ───────────────────────────────────────────────────

    public static <T> ApiResponse<T> failure(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> failure(String message, T details) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(details)
                .timestamp(Instant.now())
                .build();
    }

    // ─── Deprecated: kept for backward compatibility during migration ────────

    /** @deprecated Use {@link #failure(String)} */
    @Deprecated(since = "2.0", forRemoval = true)
    public static <T> ApiResponse<T> error(String message) {
        return failure(message);
    }

    /** @deprecated Use {@link #failure(String, Object)} */
    @Deprecated(since = "2.0", forRemoval = true)
    public static <T> ApiResponse<T> error(String message, T errorData) {
        return failure(message, errorData);
    }
}
