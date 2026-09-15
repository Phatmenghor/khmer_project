package com.emenu.features.bakong.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BakongConfigResponse {

    private UUID id;
    private String configName;
    private String apiUrl;
    private String email;
    private int dailyRateLimit;
    private boolean enabled;

    private Integer usedCount;
    private Integer remainingQuota;
    private Double usagePercentage;
    private Boolean limitReached;
    private Boolean active;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
