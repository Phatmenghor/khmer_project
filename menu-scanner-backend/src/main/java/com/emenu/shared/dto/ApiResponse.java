package com.emenu.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.emenu.shared.logging.RequestIdUtils;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String status;
    private String message;
    private T data;
    private String requestId;
    private LocalDateTime timestamp;
    private String code;
    private String path;
    private String method;

    public ApiResponse(String status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.requestId = RequestIdUtils.getCurrentRequestId();
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> response = new ApiResponse<>("success", message, data);
        response.setCode("SUCCESS");
        return response;
    }

    public static <T> ApiResponse<T> success(String message, T data, String code) {
        ApiResponse<T> response = new ApiResponse<>("success", message, data);
        response.setCode(code);
        return response;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>("error", message, null);
        response.setCode("ERROR");
        return response;
    }

    public static <T> ApiResponse<T> error(String message, T errorData) {
        ApiResponse<T> response = new ApiResponse<>("error", message, errorData);
        response.setCode("ERROR");
        return response;
    }

    public static <T> ApiResponse<T> error(String message, T errorData, String code) {
        ApiResponse<T> response = new ApiResponse<>("error", message, errorData);
        response.setCode(code);
        return response;
    }
}