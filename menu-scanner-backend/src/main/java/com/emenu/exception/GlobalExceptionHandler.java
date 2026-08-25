package com.emenu.exception;

import com.emenu.exception.custom.*;
import com.emenu.shared.dto.ApiResponse;
import jakarta.persistence.OptimisticLockException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import java.util.concurrent.CancellationException;
import org.apache.catalina.connector.ClientAbortException;

import org.slf4j.MDC;

import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /** Put message into MDC so RequestIdFilter can append it to the access log line. */
    private static void tagResponse(String message) {
        if (message != null) MDC.put("responseMessage", message);
    }

    // =========================================================================
    // PRIMARY: BusinessException — handles all domain errors
    // =========================================================================

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(
            BusinessException ex, HttpServletRequest request) {
        log.warn("[{}] {} — {}", ex.getErrorCode(), request.getRequestURI(), ex.getMessage());
        tagResponse(ex.getMessage());

        Object responseData = ex.getDetails() != null
                ? Map.of("errorCode", ex.getErrorCode(), "details", ex.getDetails())
                : Map.of("errorCode", ex.getErrorCode());

        return ResponseEntity.status(ex.getStatus())
                .body(ApiResponse.failure(ex.getMessage(), responseData));
    }

    // =========================================================================
    // SPRING SECURITY exceptions
    // =========================================================================

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Auth failed from ip={}", clientIp(request));
        tagResponse("Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.failure("Invalid email or password",
                        Map.of("errorCode", "INVALID_CREDENTIALS")));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {
        log.warn("Authentication failed: {} from ip={}", ex.getMessage(), clientIp(request));
        tagResponse("Authentication failed. Please check your credentials.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.failure("Authentication failed. Please check your credentials.",
                        Map.of("errorCode", "INVALID_CREDENTIALS")));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied: {} — {}", request.getRequestURI(), ex.getMessage());
        tagResponse("Access denied. You don't have permission to perform this action.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.failure("Access denied. You don't have permission to perform this action.",
                        Map.of("errorCode", "INSUFFICIENT_PERMISSIONS")));
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Object>> handleDisabled(
            DisabledException ex, HttpServletRequest request) {
        log.warn("Disabled account login attempt: {}", ex.getMessage());
        tagResponse("Your account has been disabled. Please contact support.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.failure("Your account has been disabled. Please contact support.",
                        Map.of("errorCode", "ACCOUNT_DISABLED")));
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiResponse<Object>> handleLocked(
            LockedException ex, HttpServletRequest request) {
        log.warn("Locked account login attempt: {}", ex.getMessage());
        tagResponse("Your account has been locked. Please contact support.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.failure("Your account has been locked. Please contact support.",
                        Map.of("errorCode", "ACCOUNT_LOCKED")));
    }

    // =========================================================================
    // LEGACY custom exceptions — kept until callers migrate to BusinessException
    // =========================================================================

    @ExceptionHandler({NotFoundException.class, UserNotFoundException.class, ResourceNotFoundException.class})
    public ResponseEntity<ApiResponse<Object>> handleNotFound(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Not found: {}", ex.getMessage());
        tagResponse(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.failure(ex.getMessage(),
                        Map.of("errorCode", "RESOURCE_NOT_FOUND")));
    }

    @ExceptionHandler({ValidationException.class, BusinessValidationException.class})
    public ResponseEntity<ApiResponse<Object>> handleLegacyValidation(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Validation error: {}", ex.getMessage());
        tagResponse(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure(ex.getMessage(),
                        Map.of("errorCode", "VALIDATION_ERROR")));
    }

    @ExceptionHandler({AccountLockedException.class, AccountEndWorkException.class})
    public ResponseEntity<ApiResponse<Object>> handleAccountStatus(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Account status error: {}", ex.getMessage());
        tagResponse(ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.failure(ex.getMessage(),
                        Map.of("errorCode", "ACCOUNT_LOCKED")));
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Object>> handleCustom(
            CustomException ex, HttpServletRequest request) {
        log.warn("Custom exception [{}]: {}", ex.getErrorCode(), ex.getMessage());
        tagResponse(ex.getMessage());
        return ResponseEntity.status(ex.getHttpStatus())
                .body(ApiResponse.failure(ex.getMessage(),
                        Map.of("errorCode", ex.getErrorCode())));
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidOperation(
            InvalidOperationException ex, HttpServletRequest request) {
        log.warn("Invalid operation: {}", ex.getMessage());
        tagResponse(ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.failure(ex.getMessage(),
                        Map.of("errorCode", "INVALID_OPERATION")));
    }

    // =========================================================================
    // VALIDATION errors (Spring framework)
    // =========================================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, Object> fieldErrors = new LinkedHashMap<>();
        List<String> missingFields  = new ArrayList<>();
        List<String> invalidFields  = new ArrayList<>();

        for (var error : ex.getBindingResult().getAllErrors()) {
            String field   = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            Object rejected = ((FieldError) error).getRejectedValue();

            fieldErrors.put(field, Map.of(
                "message",       message != null ? message : "Validation failed",
                "rejectedValue", rejected != null ? rejected : "null"
            ));

            if (message != null && (message.contains("required") ||
                    message.contains("must not be null") || message.contains("must not be blank"))) {
                missingFields.add(field);
            } else {
                invalidFields.add(field);
            }
        }

        log.warn("Validation failed for {} — {} field error(s): {}", request.getRequestURI(), fieldErrors.size(), fieldErrors);
        tagResponse(String.format("Validation failed: %s", String.join(", ", invalidFields.isEmpty() ? missingFields : invalidFields)));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.failure(
                        String.format("Validation failed for %d field(s)", fieldErrors.size()),
                        Map.of(
                                "errorCode",     "VALIDATION_ERROR",
                                "fieldErrors",   fieldErrors,
                                "missingFields", missingFields,
                                "invalidFields", invalidFields
                        )
                )
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> violations = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        v -> v.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        log.warn("Constraint violation for {}: {}", request.getRequestURI(), violations);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure("Data validation failed.",
                        Map.of("errorCode", "VALIDATION_ERROR", "violations", violations)));
    }

    // =========================================================================
    // HTTP protocol errors
    // =========================================================================

    @ExceptionHandler({NoHandlerFoundException.class, org.springframework.web.servlet.resource.NoResourceFoundException.class})
    public ResponseEntity<ApiResponse<Object>> handleNoHandler(
            Exception ex, HttpServletRequest request) {
        log.warn("Resource/endpoint not found for URI: {}", request.getRequestURI());
        tagResponse("Resource not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.failure(
                        String.format("Endpoint or resource '%s' was not found", request.getRequestURI()),
                        Map.of("errorCode", "NOT_FOUND",
                                "method", request.getMethod())));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {
        List<String> supported = ex.getSupportedHttpMethods() != null
                ? ex.getSupportedHttpMethods().stream().map(org.springframework.http.HttpMethod::name).collect(Collectors.toList())
                : List.of();
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.failure(
                        String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod()),
                        Map.of("errorCode", "METHOD_NOT_SUPPORTED",
                               "supportedMethods", supported)));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotReadable(
            HttpMessageNotReadableException ex) {
        log.warn("Invalid JSON body: {}", ex.getMessage());
        if (ex.getCause() instanceof com.fasterxml.jackson.databind.JsonMappingException jme) {
            String path = jme.getPath().stream()
                    .map(ref -> {
                        if (ref.getFieldName() != null) {
                            return ref.getFieldName();
                        } else {
                            return "[" + ref.getIndex() + "]";
                        }
                    })
                    .collect(Collectors.joining(" -> "));
            log.warn("JSON Deserialization failed at path: {}", path);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure("Invalid request body. Please check your JSON format.",
                        Map.of("errorCode", "INVALID_REQUEST_BODY")));
    }

    // Per-file cap is enforced by Spring; tell the user in MB instead of bytes.
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleUploadTooLarge(
            MaxUploadSizeExceededException ex) {
        long maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
        log.warn("Upload rejected — file exceeds per-file cap of {}MB", maxMb);
        String message = String.format(
                "Your file is too big. Each file can be at most %dMB.", maxMb);
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.failure(message,
                        Map.of(
                                "errorCode", "FILE_TOO_LARGE",
                                "maxFileSizeBytes", MAX_FILE_SIZE_BYTES,
                                "maxFileSizeMb", maxMb)));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingParameter(
            MissingServletRequestParameterException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure(
                        String.format("Required parameter '%s' is missing", ex.getParameterName()),
                        Map.of("errorCode", "MISSING_PARAMETER", "field", ex.getParameterName())));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        String expected = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure(
                        String.format("Invalid value for parameter '%s'. Expected %s.", ex.getName(), expected),
                        Map.of("errorCode", "TYPE_MISMATCH", "field", ex.getName())));
    }

    // =========================================================================
    // DATABASE errors
    // =========================================================================

    @ExceptionHandler({OptimisticLockException.class, ObjectOptimisticLockingFailureException.class})
    public ResponseEntity<ApiResponse<Object>> handleOptimisticLock(
            Exception ex, HttpServletRequest request) {
        log.warn("Optimistic lock conflict for {}: {}", request.getRequestURI(), ex.getMessage());
        tagResponse("The data was modified by another request. Please try again.");
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.failure("The data was modified by another request. Please try again.",
                        Map.of("errorCode", "CONFLICT")));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        String full = ((ex.getMessage() != null ? ex.getMessage() : "") + " " +
                       (ex.getRootCause() != null && ex.getRootCause().getMessage() != null
                               ? ex.getRootCause().getMessage() : "")).toLowerCase();

        String message;
        String errorCode;
        Map<String, Object> detail = new LinkedHashMap<>();

        if (matches(full, "email", "unique.*email", "users_email")) {
            message   = "Email address is already registered.";
            errorCode = "EMAIL_ALREADY_EXISTS";
            detail.put("field", "email");
        } else if (matches(full, "phone", "users_phone_number")) {
            message   = "Phone number is already registered.";
            errorCode = "PHONE_ALREADY_EXISTS";
            detail.put("field", "phoneNumber");
        } else if (matches(full, "subdomain", "subdomains_subdomain")) {
            message   = "Subdomain is already taken. Please choose a different name.";
            errorCode = "CONFLICT";
            detail.put("field", "subdomain");
        } else if (matches(full, "user_identifier", "users_user_identifier")) {
            message   = "Username is already taken.";
            errorCode = "CONFLICT";
            detail.put("field", "userIdentifier");
        } else if (matches(full, "foreign key")) {
            message   = "Referenced data does not exist.";
            errorCode = "VALIDATION_ERROR";
        } else {
            message   = "Data constraint violation. Please check your input.";
            errorCode = "VALIDATION_ERROR";
        }

        log.warn("Data integrity violation [{}]: {}", errorCode, full);
        tagResponse(message);
        detail.put("errorCode", errorCode);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure(message, detail));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataAccess(
            DataAccessException ex, HttpServletRequest request) {
        log.error("DB access error for {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        tagResponse("Database operation failed. Please try again.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("Database operation failed. Please try again.",
                        Map.of("errorCode", "DATABASE_ERROR")));
    }

    @ExceptionHandler(SQLException.class)
    public ResponseEntity<ApiResponse<Object>> handleSQL(
            SQLException ex, HttpServletRequest request) {
        log.error("SQL error for {} [state={}]: {}", request.getRequestURI(), ex.getSQLState(), ex.getMessage(), ex);
        tagResponse("Database query failed. Please try again.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("Database query failed. Please try again.",
                        Map.of("errorCode", "DATABASE_ERROR")));
    }

    @ExceptionHandler(org.springframework.dao.IncorrectResultSizeDataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleIncorrectResultSize(
            org.springframework.dao.IncorrectResultSizeDataAccessException ex, HttpServletRequest request) {
        log.error("Data integrity issue — multiple results for single query: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("Data integrity issue. Please contact support.",
                        Map.of("errorCode", "INTERNAL_SERVER_ERROR")));
    }

    // =========================================================================
    // CANCELLATION & CLIENT DISCONNECT exceptions
    // =========================================================================

    @ExceptionHandler(CancellationException.class)
    public ResponseEntity<ApiResponse<Object>> handleCancellation(
            CancellationException ex, HttpServletRequest request) {
        log.warn("Request cancelled on {} — {}", request.getRequestURI(), ex.getMessage());
        tagResponse(ex.getMessage());
        return ResponseEntity.status(499)
                .body(ApiResponse.failure("Request cancelled: " + ex.getMessage(),
                        Map.of("errorCode", "REQUEST_CANCELLED")));
    }

    @ExceptionHandler(ClientAbortException.class)
    public void handleClientAbort(ClientAbortException ex, HttpServletRequest request) {
        log.warn("Client connection aborted on {} — {}", request.getRequestURI(), ex.getMessage());
        tagResponse("Client connection aborted");
    }

    // =========================================================================
    // CATCH-ALL — last resort, generates trace ID for support
    // =========================================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(
            Exception ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        log.error("Unhandled exception [traceId={}] for {}: {}", traceId, request.getRequestURI(), ex.getMessage(), ex);
        tagResponse("An unexpected error occurred. [" + traceId + "]");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("An unexpected error occurred. Our team has been notified.",
                        Map.of("errorCode", "INTERNAL_SERVER_ERROR", "traceId", traceId)));
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private boolean matches(String text, String... patterns) {
        for (String p : patterns) {
            if (text.contains(p)) return true;
        }
        return false;
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return xff != null ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
