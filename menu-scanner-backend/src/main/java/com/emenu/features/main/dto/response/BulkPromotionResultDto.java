package com.emenu.features.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPromotionResultDto {

    private Integer successCount;
    private Integer failedCount;
    private List<UUID> failedProductIds;
    private String message;
    private LocalDateTime timestamp;
}
