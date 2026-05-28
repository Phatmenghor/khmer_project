package com.emenu.features.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardRecentOwnersResponse {
    private List<RecentOwner> data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOwner {
        private String ownerId;
        private String ownerName;
        private String businessName;
        private String planName;
        private String subscriptionStatus;
        private Long daysRemaining;
        private LocalDateTime joinedAt;
        private String logoUrl;
    }
}
