package com.emenu.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private String requestId;
    private String errorCode;
    private String errorType;
    private String message;
    private String description;
    private LocalDateTime timestamp;
    private String path;
    private String method;
    private Integer statusCode;
    private Map<String, Object> details;
    private String suggestion;
    private String supportContact;

    public static ErrorResponse of(String requestId, String errorCode, String errorType,
                                   String message, Integer statusCode, String path, String method) {
        return ErrorResponse.builder()
                .requestId(requestId)
                .errorCode(errorCode)
                .errorType(errorType)
                .message(message)
                .statusCode(statusCode)
                .path(path)
                .method(method)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponseBuilder builder() {
        return new ErrorResponseBuilder();
    }

    public static class ErrorResponseBuilder {
        private String requestId;
        private String errorCode;
        private String errorType;
        private String message;
        private String description;
        private LocalDateTime timestamp;
        private String path;
        private String method;
        private Integer statusCode;
        private Map<String, Object> details;
        private String suggestion;
        private String supportContact;

        public ErrorResponseBuilder requestId(String requestId) {
            this.requestId = requestId;
            return this;
        }

        public ErrorResponseBuilder errorCode(String errorCode) {
            this.errorCode = errorCode;
            return this;
        }

        public ErrorResponseBuilder errorType(String errorType) {
            this.errorType = errorType;
            return this;
        }

        public ErrorResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public ErrorResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public ErrorResponseBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public ErrorResponseBuilder path(String path) {
            this.path = path;
            return this;
        }

        public ErrorResponseBuilder method(String method) {
            this.method = method;
            return this;
        }

        public ErrorResponseBuilder statusCode(Integer statusCode) {
            this.statusCode = statusCode;
            return this;
        }

        public ErrorResponseBuilder details(Map<String, Object> details) {
            this.details = details;
            return this;
        }

        public ErrorResponseBuilder suggestion(String suggestion) {
            this.suggestion = suggestion;
            return this;
        }

        public ErrorResponseBuilder supportContact(String supportContact) {
            this.supportContact = supportContact;
            return this;
        }

        public ErrorResponse build() {
            return new ErrorResponse(requestId, errorCode, errorType, message, description,
                                    timestamp != null ? timestamp : LocalDateTime.now(),
                                    path, method, statusCode, details, suggestion, supportContact);
        }
    }
}
