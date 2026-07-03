package com.emenu.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchImportResponse<T> {
    private int successCount;
    private int errorCount;
    private List<RowResult<T>> results;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RowResult<T> {
        private int index;
        private boolean success;
        private String error;
        private T data;
    }
}
