package com.emenu.features.bakong.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.InstantDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.InstantSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BakongMonitoringStatusResponse {

    private DailyQuotaInfo quota;
    private TokenStatusInfo token;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyQuotaInfo {
        private String activeEmail;
        private String email;
        private String date;
        private int usedCount;
        private int maxLimit;
        private int remainingQuota;
        private double usagePercentage;
        private String resetTimezone;
        private List<AccountQuotaDetail> accounts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountQuotaDetail {
        private String configName;
        private String email;
        private int usedCount;
        private int maxLimit;
        private int remainingQuota;
        private double usagePercentage;
        private boolean active;
        private boolean limitReached;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenStatusInfo {
        private String email;
        private boolean active;

        @JsonSerialize(using = InstantSerializer.class)
        @JsonDeserialize(using = InstantDeserializer.class)
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
        private Instant expiresAt;

        private Long remainingSeconds;
        private String tokenSource;
    }
}

