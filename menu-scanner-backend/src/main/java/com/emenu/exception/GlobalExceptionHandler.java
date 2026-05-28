package com.emenu.exception;

import com.emenu.exception.custom.*;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.constants.ErrorCodes;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.ErrorResponse;
import com.emenu.shared.logging.RequestIdUtils;
import jakarta.persistence.OptimisticLockException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
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
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.security.auth.login.AccountLockedException;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final SecurityUtils securityUtils;

    // ================================
    // AUTHENTICATION & AUTHORIZATION ERRORS
    // ================================

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(
            BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Authentication failed - Invalid credentials from IP: {}", getClientIP(request));

        ApiResponse<Object> response = buildErrorResponse("Invalid email or password",
            ErrorCodes.INVALID_CREDENTIALS, request);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        log.warn("Authentication failed: {} from IP: {}", ex.getMessage(), getClientIP(request));

        ApiResponse<Object> response = buildErrorResponse("Authentication failed. Please check your credentials.",
            ErrorCodes.INVALID_CREDENTIALS, request);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // Account Status Exception Handlers
    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccountLockedException(
            AccountLockedException ex, HttpServletRequest request) {
        log.warn("Login blocked - Account locked: {}", ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse(ex.getMessage(),
            ErrorCodes.ACCOUNT_LOCKED, request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AccountEndWorkException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccountEndWorkException(
            AccountEndWorkException ex, HttpServletRequest request) {
        log.warn("Login blocked - Account ended: {}", ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse(ex.getMessage(),
            ErrorCodes.ACCOUNT_DISABLED, request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Object>> handleDisabledException(
            DisabledException ex, HttpServletRequest request) {
        log.warn("Login blocked - Account disabled: {}", ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse("Your account has been disabled. Please contact support.",
            ErrorCodes.ACCOUNT_DISABLED, request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiResponse<Object>> handleLockedException(
            LockedException ex, HttpServletRequest request) {
        log.warn("Login blocked - Account locked by Spring Security: {}", ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse("Your account has been locked. Please contact support.",
            ErrorCodes.ACCOUNT_LOCKED, request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied for request to {}: {}", request.getRequestURI(), ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse("Access denied. You don't have permission to perform this action.",
            ErrorCodes.INSUFFICIENT_PERMISSIONS, request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // ================================
    // VALIDATION ERRORS
    // ================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, Object> fieldErrors = new HashMap<>();
        List<String> missingFields = new ArrayList<>();
        List<String> invalidFields = new ArrayList<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            Object rejectedValue = ((FieldError) error).getRejectedValue();

            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("message", errorMessage != null ? errorMessage : "Validation failed");
            errorInfo.put("rejectedValue", rejectedValue);
            errorInfo.put("field", fieldName);
            fieldErrors.put(fieldName, errorInfo);

            // Categorize errors
            if (errorMessage.toLowerCase().contains("required") ||
                    errorMessage.toLowerCase().contains("must not be null") ||
                    errorMessage.toLowerCase().contains("must not be blank")) {
                missingFields.add(fieldName);
            } else {
                invalidFields.add(fieldName);
            }
        });

        log.warn("Validation failed for request to {}: {} field errors", request.getRequestURI(), fieldErrors.size());

        String message = String.format("Validation failed for %d field(s). Required fields: %s",
                fieldErrors.size(),
                missingFields.isEmpty() ? "none" : String.join(", ", missingFields));

        ApiResponse<Object> response = buildErrorResponse(message, ErrorCodes.VALIDATION_ERROR, request);
        response.setData(Map.of(
            "fieldErrors", fieldErrors,
            "missingFields", missingFields,
            "invalidFields", invalidFields,
            "totalErrors", fieldErrors.size()
        ));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> violations = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage
                ));

        log.warn("Constraint violation for request to {}: {}", request.getRequestURI(), violations);

        ApiResponse<Object> response = buildErrorResponse("Data validation failed. Please check the constraints.",
            ErrorCodes.VALIDATION_ERROR, request);
        response.setData(violations);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex, HttpServletRequest request) {
        log.error("Runtime exception in request to {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        String message = "An unexpected error occurred while processing your request.";
        String errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
        Map<String, Object> errorData = new HashMap<>();

        if (ex.getMessage() != null) {
            String exMessage = ex.getMessage().toLowerCase();
            if (exMessage.contains("subdomain")) {
                if (exMessage.contains("already taken") || exMessage.contains("not available")) {
                    message = "The subdomain you chose is not available. Please select a different subdomain.";
                    errorData.put("field", "subdomain");
                    errorData.put("type", "duplicate");
                } else if (exMessage.contains("invalid") || exMessage.contains("format")) {
                    message = "Invalid subdomain format. Please use only lowercase letters, numbers, and hyphens.";
                    errorData.put("field", "subdomain");
                    errorData.put("type", "format");
                }
            } else if (exMessage.contains("business name")) {
                message = "The business name you chose is not available. Please select a different name.";
                errorData.put("field", "businessName");
                errorData.put("type", "duplicate");
            } else if (exMessage.contains("email")) {
                message = "The email address is already in use. Please use a different email.";
                errorData.put("field", "email");
                errorData.put("type", "duplicate");
            } else if (exMessage.contains("timeout")) {
                message = "The request timed out. Please try again.";
            } else if (exMessage.contains("connection")) {
                message = "A connection error occurred. Please try again later.";
            } else if (exMessage.contains("not found")) {
                message = "The requested resource could not be found.";
            }
        }

        ApiResponse<Object> response = buildErrorResponse(message, errorCode, request);
        if (!errorData.isEmpty()) {
            response.setData(errorData);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(
            ValidationException ex, HttpServletRequest request) {
        log.warn("Business validation error: {}", ex.getMessage());

        String message = ex.getMessage();
        Map<String, Object> errorData = new HashMap<>();

        // Extract specific field information from error message
        String msgLower = message.toLowerCase();

        if (msgLower.contains("email")) {
            errorData.put("field", "email");
            if (message.contains("already registered") || message.contains("already taken") || message.contains("already exists")) {
                errorData.put("type", "duplicate");
                message = "This email address is already registered. Please use a different email or try signing in.";
            } else if (message.contains("format") || message.contains("invalid")) {
                errorData.put("type", "format");
                message = "Please enter a valid email address (e.g., user@example.com).";
            }
        } else if (msgLower.contains("phone")) {
            errorData.put("field", "phoneNumber");
            errorData.put("type", "format");
            errorData.put("example", "070 411260");
            message = "Please enter a valid phone number.";
        } else if (msgLower.contains("username")) {
            errorData.put("field", "ownerUserIdentifier");
            errorData.put("type", "duplicate");
            message = "This username is already taken. Please choose a different username.";
        } else if (msgLower.contains("business name")) {
            errorData.put("field", "businessName");
            errorData.put("type", "duplicate");
            message = "This business name is already registered. Please use a different name.";
        } else if (msgLower.contains("subdomain")) {
            errorData.put("field", "subdomain");
            if (message.contains("already taken") || message.contains("not available")) {
                errorData.put("type", "duplicate");
                message = "This subdomain is not available. Please choose a different subdomain.";
            } else if (message.contains("reserved")) {
                errorData.put("type", "reserved");
                message = "This subdomain is reserved. Please choose a different one.";
            } else if (message.contains("format") || message.contains("invalid")) {
                errorData.put("type", "format");
                message = "Subdomain must contain only lowercase letters, numbers, and hyphens (3-63 characters).";
            }
        } else if (msgLower.contains("user identifier")) {
            errorData.put("field", "userIdentifier");
            errorData.put("type", "duplicate");
            message = "This username is already taken. Please choose a different username.";
        } else if (msgLower.contains("plan")) {
            errorData.put("field", "plan");
            errorData.put("type", "not_found");
            message = "The selected subscription plan is not available. Please choose a different plan.";
        }

        ApiResponse<Object> response = buildErrorResponse(message, ErrorCodes.VALIDATION_ERROR, request);
        if (!errorData.isEmpty()) {
            response.setData(errorData);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ================================
    // NOT FOUND ERRORS
    // ================================

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleUserNotFoundException(
            UserNotFoundException ex, HttpServletRequest request) {
        log.warn("User not found: {}", ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse(ex.getMessage(), ErrorCodes.USER_NOT_FOUND, request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFoundException(
            NotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse(ex.getMessage(), ErrorCodes.USER_NOT_FOUND, request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNoHandlerFoundException(
            NoHandlerFoundException ex, HttpServletRequest request) {
        log.warn("No handler found for {} {}", ex.getHttpMethod(), ex.getRequestURL());

        ApiResponse<Object> response = buildErrorResponse("The requested endpoint was not found.",
            "ENDPOINT_NOT_FOUND", request);
        response.setData(Map.of(
            "method", ex.getHttpMethod(),
            "availableEndpoints", "Check API documentation for available endpoints"
        ));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // ================================
    // HTTP METHOD & REQUEST ERRORS
    // ================================

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        log.warn("Method not supported: {} for {}", ex.getMethod(), request.getRequestURI());

        String message = String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod());
        ApiResponse<Object> response = buildErrorResponse(message, "METHOD_NOT_SUPPORTED", request);
        response.setData(Map.of(
            "supportedMethods", ex.getSupportedHttpMethods(),
            "requestedMethod", ex.getMethod()
        ));
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Invalid JSON request body: {}", ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse("Invalid request body. Please check your JSON format.",
            "INVALID_REQUEST_BODY", request);
        response.setData(Map.of("hint", "Please check your JSON format and data types"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingParameterException(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        log.warn("Missing required parameter: {}", ex.getParameterName());

        String message = String.format("Required parameter '%s' is missing", ex.getParameterName());
        ApiResponse<Object> response = buildErrorResponse(message, "MISSING_PARAMETER", request);
        response.setData(Map.of(
            "field", ex.getParameterName(),
            "parameterType", ex.getParameterType(),
            "missingFields", List.of(ex.getParameterName())
        ));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        log.warn("Type mismatch for parameter: {}", ex.getName());

        String message = String.format("Invalid value for parameter '%s'. Expected %s.",
            ex.getName(),
            ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "different type");
        ApiResponse<Object> response = buildErrorResponse(message, "TYPE_MISMATCH", request);
        response.setData(Map.of(
            "parameterName", ex.getName(),
            "expectedType", ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "Unknown",
            "providedValue", ex.getValue()
        ));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ================================
    // DATABASE ERRORS
    // ================================

    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ApiResponse<Object>> handleOptimisticLockException(
            OptimisticLockException ex, HttpServletRequest request) {
        log.warn("Optimistic lock conflict for request to {}: {}", request.getRequestURI(), ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse("The data was modified by another request. Please try again.",
            "CONFLICT", request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {

        String message = "Data validation failed";
        String errorCode = ErrorCodes.VALIDATION_ERROR;
        Map<String, Object> errorData = new HashMap<>();

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        String rootCauseMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage().toLowerCase() : "";
        String fullMessage = (exceptionMessage + " " + rootCauseMessage).toLowerCase();

        // Enhanced duplicate detection patterns
        if (containsPattern(fullMessage, new String[]{"email", "unique.*email", "users_email"})) {
            message = "Email address is already registered. Please use a different email or sign in if you already have an account.";
            errorCode = ErrorCodes.EMAIL_ALREADY_EXISTS;
            errorData.put("field", "email");
            errorData.put("type", "duplicate");
            errorData.put("constraint", "UNIQUE_EMAIL");
        } else if (containsPattern(fullMessage, new String[]{"phone", "unique.*phone", "users_phone_number"})) {
            message = "Phone number is already registered. Please use a different phone number.";
            errorCode = ErrorCodes.PHONE_ALREADY_EXISTS;
            errorData.put("field", "phoneNumber");
            errorData.put("type", "duplicate");
            errorData.put("constraint", "UNIQUE_PHONE");
        } else if (containsPattern(fullMessage, new String[]{"business.*email", "businesses_email"})) {
            message = "Business email is already registered. Please use a different email for your business.";
            errorCode = ErrorCodes.EMAIL_ALREADY_EXISTS;
            errorData.put("field", "businessEmail");
            errorData.put("type", "duplicate");
            errorData.put("constraint", "UNIQUE_BUSINESS_EMAIL");
        } else if (containsPattern(fullMessage, new String[]{"subdomain", "unique.*subdomain", "subdomains_subdomain"})) {
            message = "Subdomain is already taken. Please choose a different subdomain name.";
            errorData.put("field", "subdomain");
            errorData.put("type", "duplicate");
            errorData.put("constraint", "UNIQUE_SUBDOMAIN");
            errorData.put("suggestion", "Try adding numbers or modify the name (e.g., myrestaurant2, myrestaurant-kh)");
        } else if (containsPattern(fullMessage, new String[]{"business.*name", "businesses_name"})) {
            message = "Business name is already registered. Please choose a different business name.";
            errorData.put("field", "businessName");
            errorData.put("type", "duplicate");
            errorData.put("constraint", "UNIQUE_BUSINESS_NAME");
        } else if (containsPattern(fullMessage, new String[]{"user_identifier", "users_user_identifier"})) {
            message = "User identifier is already taken. Please choose a different identifier.";
            errorData.put("field", "userIdentifier");
            errorData.put("type", "duplicate");
            errorData.put("constraint", "UNIQUE_USER_IDENTIFIER");
        } else if (fullMessage.contains("foreign key")) {
            message = "Referenced data does not exist. Please check your input and try again.";
            errorData.put("constraint", "FOREIGN_KEY");
            errorData.put("type", "reference");
        } else if (fullMessage.contains("not null")) {
            message = "Required field is missing. Please provide all mandatory information.";
            errorData.put("constraint", "NOT_NULL");
            errorData.put("type", "required");
        } else {
            message = "Data constraint violation. Please check your input and try again.";
            errorData.put("constraint", "UNKNOWN");
            errorData.put("type", "validation");
        }

        log.warn("Data integrity violation: {} - Parsed message: {}", fullMessage, message);

        ApiResponse<Object> response = buildErrorResponse(message, errorCode, request);
        response.setData(errorData);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataAccessException(
            DataAccessException ex, HttpServletRequest request) {
        log.error("Database access error in request to {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ApiResponse<Object> response = buildErrorResponse("Database operation failed. Please try again.",
            ErrorCodes.DATABASE_ERROR, request);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(SQLException.class)
    public ResponseEntity<ApiResponse<Object>> handleSQLException(
            SQLException ex, HttpServletRequest request) {
        log.error("SQL error in request to {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ApiResponse<Object> response = buildErrorResponse("Database query failed. Please try again.",
            ErrorCodes.DATABASE_ERROR, request);
        response.setData(Map.of("sqlState", ex.getSQLState()));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // ================================
    // CUSTOM BUSINESS EXCEPTIONS
    // ================================

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Object>> handleCustomException(
            CustomException ex, HttpServletRequest request) {
        log.error("Custom exception occurred: {} - Path: {}", ex.getMessage(), request.getRequestURI());

        ApiResponse<Object> response = buildErrorResponse(ex.getMessage(), ex.getErrorCode(), request);
        return ResponseEntity.status(ex.getHttpStatus()).body(response);
    }

    // ================================
    // GENERIC EXCEPTION HANDLER
    // ================================

    @ExceptionHandler(org.springframework.dao.IncorrectResultSizeDataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleIncorrectResultSizeDataAccessException(
            org.springframework.dao.IncorrectResultSizeDataAccessException ex, HttpServletRequest request) {
        log.error("Database query returned multiple results when one was expected: {}", ex.getMessage());

        ApiResponse<Object> response = buildErrorResponse(
            "There is a data integrity issue. Please contact support to resolve this problem.",
            ErrorCodes.INTERNAL_SERVER_ERROR, request);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        log.error("Unexpected exception in request to {} [TraceId: {}]: {}",
            request.getRequestURI(), traceId, ex.getMessage(), ex);

        ApiResponse<Object> response = buildErrorResponse("An unexpected error occurred. Our team has been notified.",
            ErrorCodes.INTERNAL_SERVER_ERROR, request);
        response.setData(Map.of(
            "traceId", traceId,
            "supportMessage", "Please contact support with the trace ID if the problem persists"
        ));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // ================================
    // HELPER METHODS
    // ================================

    private boolean containsPattern(String text, String[] patterns) {
        for (String pattern : patterns) {
            if (text.contains(pattern)) {
                return true;
            }
        }
        return false;
    }

    private String getSuggestionForConstraint(String errorCode) {
        return switch (errorCode) {
            case ErrorCodes.EMAIL_ALREADY_EXISTS -> "Please use a different email address or sign in if you already have an account";
            case ErrorCodes.PHONE_ALREADY_EXISTS -> "Please use a different phone number or update your existing account";
            default -> "Please check your input and try again";
        };
    }

    private ApiResponse<Object> buildErrorResponse(String message, String code, HttpServletRequest request) {
        ApiResponse<Object> response = new ApiResponse<>();
        response.setStatus("error");
        response.setMessage(message);
        response.setPath(request.getRequestURI());
        response.setMethod(request.getMethod());
        return response;
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

}