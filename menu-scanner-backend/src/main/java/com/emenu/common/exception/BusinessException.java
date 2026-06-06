package com.emenu.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Single unified exception for all business-layer errors.
 * Use factory methods instead of constructing directly.
 *
 * Migration guide: replace all custom exceptions with these factories:
 *   NotFoundException / UserNotFoundException  → BusinessException.notFound(msg)
 *   ValidationException                        → BusinessException.badRequest(msg)
 *   ConflictException / duplicate errors       → BusinessException.conflict(msg)
 *   AccountLockedException                     → BusinessException.forbidden(msg, "ACCOUNT_LOCKED")
 *   CustomException                            → BusinessException.of(msg, status, code)
 */
@Getter
public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;
    private final Object details;

    private BusinessException(String message, HttpStatus status, String errorCode, Object details) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = details;
    }

    // ─── 404 Not Found ──────────────────────────────────────────────────────────

    public static BusinessException notFound(String message) {
        return new BusinessException(message, HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", null);
    }

    public static BusinessException notFound(String message, String errorCode) {
        return new BusinessException(message, HttpStatus.NOT_FOUND, errorCode, null);
    }

    // ─── 400 Bad Request ────────────────────────────────────────────────────────

    public static BusinessException badRequest(String message) {
        return new BusinessException(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", null);
    }

    public static BusinessException badRequest(String message, Object details) {
        return new BusinessException(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", details);
    }

    public static BusinessException badRequest(String message, String errorCode, Object details) {
        return new BusinessException(message, HttpStatus.BAD_REQUEST, errorCode, details);
    }

    // ─── 409 Conflict ───────────────────────────────────────────────────────────

    public static BusinessException conflict(String message) {
        return new BusinessException(message, HttpStatus.CONFLICT, "CONFLICT", null);
    }

    public static BusinessException conflict(String message, String errorCode) {
        return new BusinessException(message, HttpStatus.CONFLICT, errorCode, null);
    }

    // ─── 403 Forbidden ──────────────────────────────────────────────────────────

    public static BusinessException forbidden(String message) {
        return new BusinessException(message, HttpStatus.FORBIDDEN, "FORBIDDEN", null);
    }

    public static BusinessException forbidden(String message, String errorCode) {
        return new BusinessException(message, HttpStatus.FORBIDDEN, errorCode, null);
    }

    // ─── 401 Unauthorized ───────────────────────────────────────────────────────

    public static BusinessException unauthorized(String message) {
        return new BusinessException(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", null);
    }

    public static BusinessException unauthorized(String message, String errorCode) {
        return new BusinessException(message, HttpStatus.UNAUTHORIZED, errorCode, null);
    }

    // ─── 422 Unprocessable ──────────────────────────────────────────────────────

    public static BusinessException unprocessable(String message) {
        return new BusinessException(message, HttpStatus.UNPROCESSABLE_ENTITY, "UNPROCESSABLE", null);
    }

    // ─── Generic factory ────────────────────────────────────────────────────────

    public static BusinessException of(String message, HttpStatus status, String errorCode) {
        return new BusinessException(message, status, errorCode, null);
    }

    public static BusinessException of(String message, HttpStatus status, String errorCode, Object details) {
        return new BusinessException(message, status, errorCode, details);
    }
}
